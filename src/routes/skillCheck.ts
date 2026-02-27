import { v4 as uuidv4 } from "uuid";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";
import { getSkillCheckQuote, runSkillCheck } from "../services/skillCheck.js";
import type { SkillCheckMode } from "../services/skillCheckProviders.js";
import { holdForRef, settleRef } from "../services/billing.js";
import { pool } from "../db.js";
import { config } from "../config.js";

const modeSchema = z.enum(["free", "paid", "hybrid"]);

const quoteSchema = z
  .object({
    title: z.string().max(160).optional(),
    skillText: z.string().min(80).max(12000),
    mode: modeSchema.default("hybrid")
  })
  .strict();

const runSchema = z
  .object({
    title: z.string().max(160).optional(),
    skillText: z.string().min(80).max(12000),
    mode: modeSchema.default("hybrid")
  })
  .strict();

function validateMode(mode: SkillCheckMode): string | null {
  if (mode === "paid" && !config.SKILLCHECK_PAID_SEARCH_API_KEY) {
    return "Paid mode requires SKILLCHECK_PAID_SEARCH_API_KEY";
  }
  return null;
}

export const skillCheckRouter = Router();

skillCheckRouter.post("/quote", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const modeError = validateMode(parsed.data.mode);
  if (modeError) {
    res.status(400).json({ error: modeError });
    return;
  }

  const quote = getSkillCheckQuote({
    skillText: parsed.data.skillText,
    mode: parsed.data.mode
  });

  res.json({
    mode: parsed.data.mode,
    quote,
    policy: {
      purpose: "uniqueness_check_only",
      chatMode: false,
      allowedInput: ["title", "skillText", "mode"]
    }
  });
});

skillCheckRouter.post("/run", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = runSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const modeError = validateMode(parsed.data.mode);
  if (modeError) {
    res.status(400).json({ error: modeError });
    return;
  }

  const checkId = uuidv4();
  const userId = req.user!.id;
  const quote = getSkillCheckQuote({
    skillText: parsed.data.skillText,
    mode: parsed.data.mode
  });

  let holdApplied = false;

  try {
    await pool.query(
      `INSERT INTO skill_checks (
        id, user_id, title, skill_text, mode, status, estimated_stars
      ) VALUES ($1, $2, $3, $4, $5, 'queued', $6)`,
      [
        checkId,
        userId,
        parsed.data.title ?? null,
        parsed.data.skillText,
        parsed.data.mode,
        quote.estimatedTotalCredits
      ]
    );

    await holdForRef({
      userId,
      refType: "skill_check",
      refId: checkId,
      amountStars: quote.estimatedTotalCredits
    });
    holdApplied = true;

    await pool.query(
      "UPDATE skill_checks SET status = 'running' WHERE id = $1",
      [checkId]
    );

    const result = await runSkillCheck({
      skillText: parsed.data.skillText,
      mode: parsed.data.mode
    });

    const finalActual = Math.min(result.actualTotalCredits, quote.estimatedTotalCredits);

    await settleRef({
      userId,
      refType: "skill_check",
      refId: checkId,
      holdStars: quote.estimatedTotalCredits,
      actualStars: finalActual
    });

    await pool.query(
      `UPDATE skill_checks
       SET status = 'done',
           actual_stars = $2,
           uniqueness_score = $3,
           risk_level = $4,
           provider_used = $5,
           queries = $6::jsonb,
           sources = $7::jsonb,
           report = $8::jsonb,
           finished_at = NOW()
       WHERE id = $1`,
      [
        checkId,
        finalActual,
        result.report.uniquenessScore,
        result.report.riskLevel,
        result.providerUsed,
        JSON.stringify(result.queries),
        JSON.stringify(result.sources),
        JSON.stringify(result.report)
      ]
    );

    res.json({
      checkId,
      status: "done",
      pricing: {
        estimated: quote.pricing,
        actual: {
          ...quote.pricing,
          baseStars: result.actualBaseCredits,
          totalStars: finalActual
        }
      },
      providerUsed: result.providerUsed,
      report: result.report,
      sources: result.sources,
      queries: result.queries
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Skill check failed";

    if (holdApplied) {
      try {
        await settleRef({
          userId,
          refType: "skill_check",
          refId: checkId,
          holdStars: quote.estimatedTotalCredits,
          actualStars: 0
        });
      } catch {
        // Best-effort release of held funds.
      }
    }

    await pool.query(
      `UPDATE skill_checks
       SET status = 'failed', error_text = $2, finished_at = NOW()
       WHERE id = $1`,
      [checkId, message]
    );

    if (message.includes("Insufficient")) {
      res.status(402).json({ error: message });
      return;
    }

    res.status(500).json({ error: "Skill check failed", details: message });
  }
});

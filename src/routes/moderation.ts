import { Router } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";

const leakReportSchema = z
  .object({
    suspectTelegramUserId: z.string().regex(/^\d+$/).optional(),
    suspectRole: z.enum(["buyer", "seller", "unknown"]).default("unknown"),
    skillRef: z.string().max(120).optional(),
    evidence: z.string().min(10).max(4000),
    metadata: z.record(z.string(), z.unknown()).optional()
  })
  .strict();

export const moderationRouter = Router();

moderationRouter.post("/leak-report", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = leakReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  let suspectUserId: number | null = null;
  if (parsed.data.suspectTelegramUserId) {
    const userLookup = await pool.query<{ id: string }>(
      `SELECT id
       FROM users
       WHERE telegram_user_id = $1
       LIMIT 1`,
      [parsed.data.suspectTelegramUserId]
    );
    if (userLookup.rows[0]) {
      suspectUserId = Number(userLookup.rows[0].id);
    }
  }

  const reportId = uuidv4();
  await pool.query(
    `INSERT INTO leak_reports (
      id, reporter_user_id, suspect_user_id, suspect_role, skill_ref, evidence, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [
      reportId,
      req.user!.id,
      suspectUserId,
      parsed.data.suspectRole,
      parsed.data.skillRef ?? null,
      parsed.data.evidence,
      JSON.stringify(parsed.data.metadata ?? {})
    ]
  );

  res.status(201).json({ ok: true, reportId });
});

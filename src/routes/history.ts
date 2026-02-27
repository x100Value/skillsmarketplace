import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";
import { pool } from "../db.js";

const querySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 50))
    .pipe(z.number().int().min(1).max(100))
});

export const historyRouter = Router();

historyRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
    return;
  }

  const limit = parsed.data.limit;
  const userId = req.user!.id;

  try {
    const [ledgerResult, tasksResult, checksResult] = await Promise.all([
      pool.query<{
        id: string;
        type: string;
        amount_stars: string;
        ref_type: string;
        ref_id: string;
        created_at: string;
      }>(
        `SELECT id, type, amount_stars, ref_type, ref_id, created_at
         FROM ledger_entries
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      ),
      pool.query<{
        id: string;
        status: string;
        estimated_stars: string;
        actual_stars: string;
        created_at: string;
        finished_at: string | null;
      }>(
        `SELECT id, status, estimated_stars, actual_stars, created_at, finished_at
         FROM llm_tasks
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      ),
      pool.query<{
        id: string;
        status: string;
        estimated_stars: string;
        actual_stars: string;
        uniqueness_score: number | null;
        risk_level: string | null;
        created_at: string;
        finished_at: string | null;
      }>(
        `SELECT id, status, estimated_stars, actual_stars, uniqueness_score, risk_level, created_at, finished_at
         FROM skill_checks
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      )
    ]);

    res.json({
      ledger: ledgerResult.rows.map((r) => ({
        id: r.id,
        type: r.type,
        amountStars: Number(r.amount_stars),
        refType: r.ref_type,
        refId: r.ref_id,
        createdAt: r.created_at
      })),
      tasks: tasksResult.rows.map((r) => ({
        id: r.id,
        status: r.status,
        estimatedStars: Number(r.estimated_stars),
        actualStars: Number(r.actual_stars),
        createdAt: r.created_at,
        finishedAt: r.finished_at
      })),
      skillChecks: checksResult.rows.map((r) => ({
        id: r.id,
        status: r.status,
        estimatedStars: Number(r.estimated_stars),
        actualStars: Number(r.actual_stars),
        uniquenessScore: r.uniqueness_score,
        riskLevel: r.risk_level,
        createdAt: r.created_at,
        finishedAt: r.finished_at
      }))
    });
  } catch {
    res.status(500).json({ error: "Cannot load history" });
  }
});

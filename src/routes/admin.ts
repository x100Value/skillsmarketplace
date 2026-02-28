import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/admin.js";
import { pool } from "../db.js";
import { decideWithdrawal, listWithdrawals } from "../services/billing.js";

export const adminRouter = Router();

const rejectSchema = z.object({
  reason: z.string().min(2).max(500)
});

const leakReviewSchema = z
  .object({
    status: z.enum(["reviewed", "actioned", "rejected"]),
    note: z.string().min(2).max(1000).optional()
  })
  .strict();

const banSchema = z
  .object({
    reason: z.string().min(2).max(1000)
  })
  .strict();

adminRouter.use(requireAdmin);

adminRouter.get("/withdrawals", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const rows = await listWithdrawals(status);
  res.json({ items: rows });
});

adminRouter.post("/withdrawals/:id/approve", async (req, res) => {
  try {
    await decideWithdrawal({
      withdrawalId: req.params.id,
      decision: "approve",
      adminId: "admin"
    });
    res.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Approve failed";
    res.status(400).json({ error: msg });
  }
});

adminRouter.post("/withdrawals/:id/reject", async (req, res) => {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  try {
    await decideWithdrawal({
      withdrawalId: req.params.id,
      decision: "reject",
      adminId: "admin",
      reason: parsed.data.reason
    });
    res.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Reject failed";
    res.status(400).json({ error: msg });
  }
});

adminRouter.get("/leak-reports", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const params: unknown[] = [];
  let where = "";
  if (status) {
    params.push(status);
    where = "WHERE lr.status = $1";
  }

  const rows = await pool.query<{
    id: string;
    reporter_user_id: string;
    suspect_user_id: string | null;
    suspect_role: "buyer" | "seller" | "unknown";
    skill_ref: string | null;
    evidence: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
    review_note: string | null;
  }>(
    `SELECT lr.id, lr.reporter_user_id, lr.suspect_user_id, lr.suspect_role, lr.skill_ref,
            lr.evidence, lr.status, lr.created_at, lr.reviewed_at, lr.reviewed_by, lr.review_note
     FROM leak_reports lr
     ${where}
     ORDER BY lr.created_at DESC
     LIMIT 200`,
    params
  );

  res.json({ items: rows.rows });
});

adminRouter.post("/leak-reports/:id/review", async (req, res) => {
  const parsed = leakReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const result = await pool.query(
    `UPDATE leak_reports
     SET status = $2,
         reviewed_at = NOW(),
         reviewed_by = $3,
         review_note = $4
     WHERE id = $1`,
    [req.params.id, parsed.data.status, "admin", parsed.data.note ?? null]
  );
  if (result.rowCount === 0) {
    res.status(404).json({ error: "Leak report not found" });
    return;
  }
  res.json({ ok: true });
});

adminRouter.post("/users/:telegramUserId/ban", async (req, res) => {
  const parsed = banSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const result = await pool.query(
    `UPDATE users
     SET moderation_status = 'banned',
         moderation_reason = $2,
         moderated_at = NOW()
     WHERE telegram_user_id = $1`,
    [req.params.telegramUserId, parsed.data.reason]
  );
  if (result.rowCount === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ ok: true });
});

adminRouter.post("/users/:telegramUserId/unban", async (req, res) => {
  const result = await pool.query(
    `UPDATE users
     SET moderation_status = 'active',
         moderation_reason = NULL,
         moderated_at = NOW()
     WHERE telegram_user_id = $1`,
    [req.params.telegramUserId]
  );
  if (result.rowCount === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ ok: true });
});

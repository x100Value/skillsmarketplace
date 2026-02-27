import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/admin.js";
import { decideWithdrawal, listWithdrawals } from "../services/billing.js";

export const adminRouter = Router();

const rejectSchema = z.object({
  reason: z.string().min(2).max(500)
});

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

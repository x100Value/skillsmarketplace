import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { createWithdrawalRequest } from "../services/billing.js";
import type { AuthedRequest } from "../types.js";

const requestSchema = z.object({
  amountStars: z.number().int().positive()
});

export const withdrawalsRouter = Router();

withdrawalsRouter.post("/request", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  try {
    const output = await createWithdrawalRequest({
      userId: req.user!.id,
      amountStars: parsed.data.amountStars
    });
    res.status(201).json({
      ok: true,
      withdrawalId: output.withdrawalId
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Withdrawal failed";
    if (msg.includes("Insufficient")) {
      res.status(402).json({ error: msg });
      return;
    }
    res.status(500).json({ error: msg });
  }
});

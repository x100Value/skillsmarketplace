import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";
import { config } from "../config.js";
import { adminGrantStars, getBalance, purchaseDemoSkill } from "../services/billing.js";

export const meRouter = Router();

const devTopupSchema = z
  .object({
    amountStars: z.number().int().positive().max(100000),
    reason: z.string().max(120).optional()
  })
  .strict();

const demoPurchaseSchema = z
  .object({
    skillId: z.string().min(1).max(64),
    amountStars: z.number().int().positive().max(100000)
  })
  .strict();

function isAppAdmin(req: AuthedRequest): boolean {
  const telegramUserId = req.user?.telegramUserId ?? "";
  return !!telegramUserId && config.ADMIN_TELEGRAM_IDS.includes(telegramUserId);
}

meRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!;
  const balance = await getBalance(user.id);
  const appAdmin = isAppAdmin(req);
  res.json({
    user: {
      ...user,
      isAppAdmin: appAdmin
    },
    balance,
    features: {
      withdrawalsEnabled: config.WITHDRAWALS_ENABLED,
      skillsPublishingEnabled: true
    }
  });
});

meRouter.post("/dev/topup", requireAuth, async (req: AuthedRequest, res) => {
  if (!isAppAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = devTopupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await adminGrantStars({
      userId: req.user!.id,
      amountStars: parsed.data.amountStars,
      adminActorId: req.user!.telegramUserId,
      reason: parsed.data.reason
    });
    res.status(201).json({ ok: true, creditedStars: result.amountStars });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Top up failed";
    res.status(400).json({ error: msg });
  }
});

meRouter.post("/dev/purchase", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = demoPurchaseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await purchaseDemoSkill({
      userId: req.user!.id,
      skillId: parsed.data.skillId,
      amountStars: parsed.data.amountStars
    });
    res.status(201).json({ ok: true, chargedStars: result.chargedStars });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Purchase failed";
    if (msg.includes("Insufficient")) {
      res.status(402).json({ error: msg });
      return;
    }
    if (msg.includes("already purchased")) {
      res.status(409).json({ error: msg });
      return;
    }
    res.status(400).json({ error: msg });
  }
});

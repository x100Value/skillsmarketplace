import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { quoteStarsCharge, usdtToStars, type PaymentRail } from "../services/pricing.js";
import { getSurface } from "../services/surface.js";

const quoteSchema = z.object({
  rail: z.enum(["stars", "ton_usdt"]),
  baseStars: z.number().int().positive().optional(),
  amountUsdt: z.number().positive().optional()
});

export const pricingRouter = Router();

pricingRouter.get("/rails", (req, res) => {
  const surface = getSurface(req);
  res.json({
    primary: "stars",
    rails: [
      {
        id: "stars",
        enabled: true,
        feePercent: config.STARS_PLATFORM_FEE_PERCENT
      },
      {
        id: "ton_usdt",
        enabled: config.TON_USDT_ENABLED && surface === "web",
        feePercent: 0
      }
    ]
  });
});

pricingRouter.post("/quote", (req, res) => {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const rail = parsed.data.rail as PaymentRail;
  const surface = getSurface(req);
  if (surface === "telegram" && rail === "ton_usdt") {
    res.status(403).json({ error: "TON/USDT quote is available only in external web dashboard" });
    return;
  }

  if (rail === "ton_usdt" && !config.TON_USDT_ENABLED) {
    res.status(403).json({ error: "TON USDT payments disabled" });
    return;
  }

  let baseStars = parsed.data.baseStars ?? 0;
  if (rail === "ton_usdt") {
    if (!parsed.data.amountUsdt) {
      res.status(400).json({ error: "amountUsdt is required for ton_usdt quote" });
      return;
    }
    baseStars = usdtToStars(parsed.data.amountUsdt);
  }

  if (baseStars <= 0) {
    res.status(400).json({ error: "baseStars must be > 0" });
    return;
  }

  const quote = quoteStarsCharge(baseStars, rail);
  res.json({
    quote
  });
});

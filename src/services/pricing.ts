import { config } from "../config.js";

export type PaymentRail = "stars" | "ton_usdt";

export type Quote = {
  rail: PaymentRail;
  baseStars: number;
  feePercent: number;
  feeStars: number;
  totalStars: number;
};

export function quoteStarsCharge(baseStars: number, rail: PaymentRail): Quote {
  const normalized = Math.max(0, Math.floor(baseStars));
  const feePercent = rail === "stars" ? config.STARS_PLATFORM_FEE_PERCENT : 0;
  const feeStars = Math.ceil((normalized * feePercent) / 100);
  const totalStars = normalized + feeStars;

  return {
    rail,
    baseStars: normalized,
    feePercent,
    feeStars,
    totalStars
  };
}

export function usdtToStars(amountUsdt: number): number {
  return Math.ceil(amountUsdt * config.USDT_TO_STARS_RATE);
}

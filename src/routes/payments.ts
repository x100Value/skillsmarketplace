import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config.js";
import { creditFromPayment } from "../services/billing.js";
import { ensureBalanceRow, upsertUser } from "../services/users.js";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";
import { quoteStarsCharge, usdtToStars } from "../services/pricing.js";
import { getSurface } from "../services/surface.js";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

const webhookSchema = z.object({
  event_id: z.string().min(1),
  telegram_payment_charge_id: z.string().optional(),
  user_id: z.union([z.string(), z.number()]),
  amount_stars: z.number().int().nonnegative(),
  status: z.string().min(1)
});

export const paymentsRouter = Router();

paymentsRouter.post("/telegram/webhook", async (req, res) => {
  const secret = req.header("x-telegram-bot-api-secret-token");
  if (!secret || !safeCompare(secret, config.WEBHOOK_SECRET_TOKEN)) {
    res.status(403).json({ error: "Invalid webhook secret" });
    return;
  }

  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid webhook payload", details: parsed.error.flatten() });
    return;
  }

  const payload = parsed.data;
  if (payload.status !== "paid") {
    res.json({ ok: true, ignored: true });
    return;
  }

  const telegramUserId = String(payload.user_id);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const user = await upsertUser(
      {
        telegramUserId,
        username: null,
        firstName: null,
        lastName: null,
        locale: null
      },
      client
    );
    await ensureBalanceRow(user.id, client);
    await client.query("COMMIT");

    const result = await creditFromPayment({
      providerEventId: payload.event_id,
      telegramPaymentChargeId: payload.telegram_payment_charge_id ?? null,
      telegramUserId,
      userId: user.id,
      amountStars: payload.amount_stars,
      status: payload.status,
      payload: req.body
    });

    res.json({ ok: true, applied: result.applied });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Webhook processing failed" });
  } finally {
    client.release();
  }
});

const createIntentSchema = z.object({
  amountUsdt: z.number().positive().max(100000)
});

paymentsRouter.post(
  "/ton-usdt/create-intent",
  requireAuth,
  async (req: AuthedRequest, res) => {
    if (getSurface(req) === "telegram") {
      res
        .status(403)
        .json({ error: "TON/USDT is available only in external web dashboard" });
      return;
    }

    if (!config.TON_USDT_ENABLED) {
      res.status(403).json({ error: "TON USDT payments disabled" });
      return;
    }

    const parsed = createIntentSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const amountUsdt = parsed.data.amountUsdt;
    const baseStars = usdtToStars(amountUsdt);
    const quote = quoteStarsCharge(baseStars, "ton_usdt");
    const intentId = uuidv4();
    const paymentMemo = `tonusdt:${intentId}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    try {
      await pool.query(
        `INSERT INTO crypto_payment_intents (
          id, user_id, rail, amount_usdt, amount_stars, payment_memo, destination_address, status, expires_at
        ) VALUES ($1, $2, 'ton_usdt', $3, $4, $5, $6, 'pending', $7)`,
        [
          intentId,
          req.user!.id,
          amountUsdt.toFixed(6),
          quote.totalStars,
          paymentMemo,
          config.TON_USDT_WALLET,
          expiresAt
        ]
      );

      res.status(201).json({
        intentId,
        rail: "ton_usdt",
        amountUsdt: Number(amountUsdt.toFixed(6)),
        creditStars: quote.totalStars,
        destinationAddress: config.TON_USDT_WALLET,
        paymentMemo,
        expiresAt: expiresAt.toISOString()
      });
    } catch {
      res.status(500).json({ error: "Cannot create TON USDT intent" });
    }
  }
);

const confirmIntentSchema = z.object({
  intentId: z.string().uuid(),
  txHash: z.string().min(10),
  rawPayload: z.record(z.unknown()).optional()
});

paymentsRouter.post("/ton-usdt/confirm", async (req, res) => {
  if (getSurface(req) === "telegram") {
    res
      .status(403)
      .json({ error: "TON/USDT is available only in external web dashboard" });
    return;
  }

  const token = req.header("x-admin-token");
  if (!token || !safeCompare(token, config.BILLING_ADMIN_TOKEN)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = confirmIntentSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const row = await client.query<{
      id: string;
      user_id: string;
      amount_usdt: string;
      amount_stars: string;
      status: string;
      tx_hash: string | null;
      expires_at: string;
    }>(
      `SELECT id, user_id, amount_usdt, amount_stars, status, tx_hash, expires_at
       FROM crypto_payment_intents
       WHERE id = $1
       FOR UPDATE`,
      [parsed.data.intentId]
    );

    const intent = row.rows[0];
    if (!intent) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Intent not found" });
      return;
    }
    if (intent.status !== "pending") {
      await client.query("ROLLBACK");
      if (intent.status === "confirmed") {
        if (intent.tx_hash && intent.tx_hash !== parsed.data.txHash) {
          res.status(409).json({ error: "Intent already confirmed with another txHash" });
          return;
        }
        const existingCredit = await creditFromPayment({
          providerEventId: `ton_usdt:${parsed.data.txHash}`,
          telegramPaymentChargeId: parsed.data.txHash,
          telegramUserId: "ton_usdt",
          userId: Number(intent.user_id),
          amountStars: Number(intent.amount_stars),
          status: "paid",
          payload: {
            rail: "ton_usdt",
            intentId: intent.id,
            txHash: parsed.data.txHash,
            amountUsdt: Number(intent.amount_usdt)
          }
        });
        res.json({
          ok: true,
          applied: existingCredit.applied,
          creditedStars: Number(intent.amount_stars),
          idempotent: true
        });
        return;
      }
      res.status(409).json({ error: "Intent already processed" });
      return;
    }
    if (new Date(intent.expires_at).getTime() < Date.now()) {
      await client.query(
        "UPDATE crypto_payment_intents SET status = 'expired' WHERE id = $1",
        [intent.id]
      );
      await client.query("COMMIT");
      res.status(409).json({ error: "Intent expired" });
      return;
    }

    await client.query(
      `UPDATE crypto_payment_intents
       SET status = 'confirmed',
           tx_hash = $2,
           raw_payload = $3::jsonb,
           confirmed_at = NOW()
       WHERE id = $1`,
      [
        intent.id,
        parsed.data.txHash,
        JSON.stringify(parsed.data.rawPayload ?? {})
      ]
    );

    await client.query("COMMIT");

    const credit = await creditFromPayment({
      providerEventId: `ton_usdt:${parsed.data.txHash}`,
      telegramPaymentChargeId: parsed.data.txHash,
      telegramUserId: "ton_usdt",
      userId: Number(intent.user_id),
      amountStars: Number(intent.amount_stars),
      status: "paid",
      payload: {
        rail: "ton_usdt",
        intentId: intent.id,
        txHash: parsed.data.txHash,
        amountUsdt: Number(intent.amount_usdt)
      }
    });

    res.json({
      ok: true,
      applied: credit.applied,
      creditedStars: Number(intent.amount_stars)
    });
  } catch {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Cannot confirm TON USDT payment" });
  } finally {
    client.release();
  }
});

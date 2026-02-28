import { Router } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config.js";
import { creditFromPayment } from "../services/billing.js";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";
import { quoteStarsCharge, usdtToStars } from "../services/pricing.js";
import { getSurface } from "../services/surface.js";
import { hmacSha256Hex, safeCompareText } from "../utils/crypto.js";

const TELEGRAM_INVOICE_TTL_MS = 30 * 60 * 1000;
const TELEGRAM_INVOICE_PAYLOAD_PREFIX = "sm1";

const starsInvoiceSchema = z
  .object({
    amountStars: z.number().int().positive().max(100000),
    title: z.string().min(1).max(64).optional(),
    description: z.string().min(1).max(255).optional()
  })
  .strict();

const webhookSchema = z
  .object({
    event_id: z.string().min(1).optional(),
    telegram_payment_charge_id: z.string().min(1),
    invoice_payload: z.string().min(1).max(128),
    user_id: z.union([z.string().regex(/^\d+$/), z.number().int().positive()]),
    amount_stars: z.number().int().positive(),
    status: z.string().min(1)
  })
  .strict();

function buildSignedInvoicePayload(
  orderId: string,
  amountStars: number,
  expiresAt: Date
): string {
  const expTs = Math.floor(expiresAt.getTime() / 1000);
  const payloadCore = `${orderId}:${amountStars}:${expTs}`;
  const signature = hmacSha256Hex(config.WEBHOOK_SECRET_TOKEN, payloadCore);
  const payload = `${TELEGRAM_INVOICE_PAYLOAD_PREFIX}:${payloadCore}:${signature}`;

  if (payload.length > 128) {
    throw new Error("Invoice payload too long");
  }
  return payload;
}

function parseSignedInvoicePayload(payload: string): {
  orderId: string;
  amountStars: number;
  expTs: number;
} | null {
  const parts = payload.split(":");
  if (parts.length !== 5) {
    return null;
  }
  const prefix = parts[0];
  const orderId = parts[1];
  const amountRaw = parts[2];
  const expRaw = parts[3];
  const signature = parts[4];
  if (!prefix || !orderId || !amountRaw || !expRaw || !signature) {
    return null;
  }
  if (prefix !== TELEGRAM_INVOICE_PAYLOAD_PREFIX) {
    return null;
  }

  const parsedOrderId = z.string().uuid().safeParse(orderId);
  if (!parsedOrderId.success) {
    return null;
  }

  const amountStars = Number(amountRaw);
  const expTs = Number(expRaw);
  if (
    !Number.isSafeInteger(amountStars) ||
    amountStars <= 0 ||
    !Number.isSafeInteger(expTs) ||
    expTs <= 0
  ) {
    return null;
  }

  const payloadCore = `${orderId}:${amountStars}:${expTs}`;
  const expected = hmacSha256Hex(config.WEBHOOK_SECRET_TOKEN, payloadCore);
  if (!safeCompareText(signature, expected)) {
    return null;
  }

  return {
    orderId,
    amountStars,
    expTs
  };
}

async function createTelegramStarsInvoiceLink(input: {
  title: string;
  description: string;
  payload: string;
  amountStars: number;
}): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.OUTBOUND_HTTP_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/createInvoiceLink`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          payload: input.payload,
          currency: "XTR",
          prices: [{ label: "SkillsMarketplace Top Up", amount: input.amountStars }]
        }),
        signal: controller.signal
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok !== true || typeof data?.result !== "string") {
      throw new Error("Telegram createInvoiceLink failed");
    }

    return data.result;
  } finally {
    clearTimeout(timer);
  }
}

export const paymentsRouter = Router();

paymentsRouter.post(
  "/stars/invoice",
  requireAuth,
  async (req: AuthedRequest, res): Promise<void> => {
    if (getSurface(req) !== "telegram") {
      res
        .status(403)
        .json({ error: "Stars top up is available only in Telegram Mini App" });
      return;
    }

    const parsed = starsInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }

    const amountStars = parsed.data.amountStars;
    const expiresAt = new Date(Date.now() + TELEGRAM_INVOICE_TTL_MS);
    const orderId = uuidv4();
    const invoicePayload = buildSignedInvoicePayload(orderId, amountStars, expiresAt);

    try {
      await pool.query(
        `INSERT INTO stars_topup_orders (
          id, user_id, telegram_user_id, amount_stars, invoice_payload, status, expires_at
        ) VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
        [
          orderId,
          req.user!.id,
          req.user!.telegramUserId,
          amountStars,
          invoicePayload,
          expiresAt
        ]
      );

      const invoiceLink = await createTelegramStarsInvoiceLink({
        title: parsed.data.title ?? "SkillsMarketplace Top Up",
        description:
          parsed.data.description ??
          `Balance top up: ${amountStars} Telegram Stars`,
        payload: invoicePayload,
        amountStars
      });

      res.status(201).json({
        ok: true,
        orderId,
        amountStars,
        invoiceLink,
        expiresAt: expiresAt.toISOString()
      });
    } catch {
      await pool.query(
        `UPDATE stars_topup_orders
         SET status = 'canceled', updated_at = NOW()
         WHERE id = $1 AND status = 'pending'`,
        [orderId]
      );

      res.status(502).json({ error: "Cannot create Telegram Stars invoice" });
    }
  }
);

paymentsRouter.post("/telegram/webhook", async (req, res) => {
  const secret = req.header("x-telegram-bot-api-secret-token");
  if (!secret || !safeCompareText(secret, config.WEBHOOK_SECRET_TOKEN)) {
    res.status(403).json({ error: "Invalid webhook secret" });
    return;
  }

  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid webhook payload", details: parsed.error.flatten() });
    return;
  }

  const payload = parsed.data;
  if (payload.status !== "paid") {
    res.json({ ok: true, ignored: true });
    return;
  }

  const signed = parseSignedInvoicePayload(payload.invoice_payload);
  if (!signed) {
    res.status(400).json({ error: "Invalid signed invoice payload" });
    return;
  }
  if (signed.amountStars !== payload.amount_stars) {
    res.status(409).json({ error: "Amount mismatch in invoice payload" });
    return;
  }

  const nowTs = Math.floor(Date.now() / 1000);
  if (signed.expTs + 24 * 60 * 60 < nowTs) {
    res.status(409).json({ error: "Invoice payload expired" });
    return;
  }

  const telegramUserId = String(payload.user_id);
  const providerEventId =
    payload.event_id ?? `tg_charge:${payload.telegram_payment_charge_id}`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderQuery = await client.query<{
      id: string;
      user_id: string;
      telegram_user_id: string;
      amount_stars: string;
      invoice_payload: string;
      status: string;
      provider_event_id: string | null;
      telegram_payment_charge_id: string | null;
    }>(
      `SELECT id, user_id, telegram_user_id, amount_stars, invoice_payload, status,
              provider_event_id, telegram_payment_charge_id
       FROM stars_topup_orders
       WHERE id = $1
       FOR UPDATE`,
      [signed.orderId]
    );

    const order = orderQuery.rows[0];
    if (!order) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Top up order not found" });
      return;
    }

    const orderAmount = Number(order.amount_stars);
    if (order.invoice_payload !== payload.invoice_payload) {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "Invoice payload mismatch" });
      return;
    }
    if (String(order.telegram_user_id) !== telegramUserId) {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "Telegram user mismatch" });
      return;
    }
    if (orderAmount !== payload.amount_stars) {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "Order amount mismatch" });
      return;
    }

    if (order.status === "paid") {
      const sameEvent =
        order.provider_event_id === providerEventId ||
        order.telegram_payment_charge_id === payload.telegram_payment_charge_id;
      await client.query("COMMIT");
      if (sameEvent) {
        res.json({ ok: true, applied: false, idempotent: true, orderId: order.id });
      } else {
        res.status(409).json({ error: "Order already paid by another event" });
      }
      return;
    }

    if (order.status !== "pending") {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "Order already processed" });
      return;
    }

    await client.query(
      `INSERT INTO balances (user_id, total_stars, held_stars)
       VALUES ($1, 0, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [order.user_id]
    );

    const credit = await creditFromPayment({
      providerEventId,
      telegramPaymentChargeId: payload.telegram_payment_charge_id,
      telegramUserId,
      userId: Number(order.user_id),
      amountStars: payload.amount_stars,
      status: payload.status,
      payload: req.body,
      client
    });

    if (!credit.applied) {
      const existingPayment = await client.query<{
        telegram_payment_charge_id: string | null;
      }>(
        `SELECT telegram_payment_charge_id
         FROM payment_events
         WHERE provider_event_id = $1`,
        [providerEventId]
      );
      const existingCharge = existingPayment.rows[0]?.telegram_payment_charge_id ?? null;
      if (
        existingCharge !== null &&
        existingCharge !== payload.telegram_payment_charge_id
      ) {
        await client.query("ROLLBACK");
        res.status(409).json({ error: "Conflicting payment event id" });
        return;
      }
    }

    await client.query(
      `UPDATE stars_topup_orders
       SET status = 'paid',
           provider_event_id = $2,
           telegram_payment_charge_id = $3,
           paid_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND status = 'pending'`,
      [order.id, providerEventId, payload.telegram_payment_charge_id]
    );

    await client.query("COMMIT");

    res.json({
      ok: true,
      applied: credit.applied,
      idempotent: !credit.applied,
      orderId: order.id
    });
  } catch {
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
  if (!config.TON_USDT_ENABLED) {
    res.status(403).json({ error: "TON USDT payments disabled" });
    return;
  }

  if (getSurface(req) === "telegram") {
    res
      .status(403)
      .json({ error: "TON/USDT is available only in external web dashboard" });
    return;
  }

  const token = req.header("x-admin-token");
  if (!token || !safeCompareText(token, config.BILLING_ADMIN_TOKEN)) {
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
          res
            .status(409)
            .json({ error: "Intent already confirmed with another txHash" });
          return;
        }
        const existingCredit = await creditFromPayment({
          providerEventId: `ton_usdt:${parsed.data.txHash}`,
          telegramPaymentChargeId: parsed.data.txHash,
          telegramUserId: "0",
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
      [intent.id, parsed.data.txHash, JSON.stringify(parsed.data.rawPayload ?? {})]
    );

    await client.query("COMMIT");

    const credit = await creditFromPayment({
      providerEventId: `ton_usdt:${parsed.data.txHash}`,
      telegramPaymentChargeId: parsed.data.txHash,
      telegramUserId: "0",
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

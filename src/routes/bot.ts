import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { upsertUser, ensureBalanceRow } from "../services/users.js";
import { pool } from "../db.js";
import { applyReferralCode } from "../services/referral.js";
import { hmacSha256Hex, safeCompareText } from "../utils/crypto.js";

const APP_URL = "https://skillsmarketplace.ru";
const TELEGRAM_INVOICE_PAYLOAD_PREFIX = "sm1";

type SuccessfulPayment = {
  telegram_payment_charge_id: string;
  provider_payment_charge_id: string;
  total_amount: number;
  currency: string;
  invoice_payload?: string;
};

function isRu(languageCode?: string): boolean {
  return Boolean(languageCode?.startsWith("ru"));
}

function parseSignedInvoicePayload(payload: string): {
  orderId: string;
  amountStars: number;
  expTs: number;
} | null {
  const parts = payload.split(":");
  if (parts.length !== 5) return null;
  const prefix = parts[0];
  const orderId = parts[1];
  const amountRaw = parts[2];
  const expRaw = parts[3];
  const signature = parts[4];
  if (!prefix || !orderId || !amountRaw || !expRaw || !signature) return null;
  if (prefix !== TELEGRAM_INVOICE_PAYLOAD_PREFIX) return null;
  if (!z.string().uuid().safeParse(orderId).success) return null;

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
  if (!safeCompareText(signature, expected)) return null;

  return { orderId, amountStars, expTs };
}

async function callTelegramApi(
  method: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(
    `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) logger.warn({ method, json }, "Telegram API error");
  return json;
}

async function sendMessage(
  chatId: number,
  text: string,
  extra: Record<string, unknown> = {}
): Promise<void> {
  await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    disable_notification: true,
    ...extra
  });
}

async function handleStart(
  chatId: number,
  userId: number,
  firstName: string,
  username: string | undefined,
  lang: string | undefined,
  startParam: string
): Promise<void> {
  let dbUserId: number | null = null;

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const user = await upsertUser(
        {
          telegramUserId: String(userId),
          username: username ?? null,
          firstName: firstName ?? null,
          lastName: null,
          locale: lang ?? null
        },
        client
      );
      await ensureBalanceRow(user.id, client);
      await client.query("COMMIT");
      dbUserId = user.id;
    } catch {
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  } catch (err) {
    logger.warn({ err }, "upsertUser on /start failed");
  }

  if (dbUserId && startParam && startParam.length >= 4) {
    try {
      await applyReferralCode(dbUserId, startParam);
    } catch (err) {
      logger.warn({ err }, "applyReferralCode on /start failed");
    }
  }

  const ru = isRu(lang);
  const name = firstName || username || (ru ? "Привет" : "Hello");

  const text = ru
    ? `👋 ${name}, добро пожаловать в SkillsMarketplace!\n\nНажмите кнопку ниже, чтобы открыть приложение:`
    : `👋 Hey ${name}, welcome to SkillsMarketplace!\n\nTap the button below to open the app:`;

  await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    disable_notification: true,
    reply_markup: {
      inline_keyboard: [
        [{ text: ru ? "Открыть приложение" : "Open App", web_app: { url: APP_URL } }]
      ]
    }
  });
}

async function handleUnknown(chatId: number, lang: string | undefined): Promise<void> {
  const ru = isRu(lang);
  const text = ru
    ? "Этот бот работает как Telegram Mini App.\n\nНажмите /start, чтобы открыть приложение."
    : "This bot works as a Telegram Mini App.\n\nSend /start to open the app.";
  await sendMessage(chatId, text);
}

async function validatePreCheckout(input: {
  userId: number;
  totalAmount: number;
  invoicePayload: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const signed = parseSignedInvoicePayload(input.invoicePayload);
  if (!signed) {
    return { ok: false, error: "Invalid invoice payload" };
  }
  if (signed.amountStars !== input.totalAmount) {
    return { ok: false, error: "Amount mismatch" };
  }

  const row = await pool.query<{
    telegram_user_id: string;
    amount_stars: string;
    invoice_payload: string;
    status: string;
    expires_at: string;
  }>(
    `SELECT telegram_user_id, amount_stars, invoice_payload, status, expires_at
     FROM stars_topup_orders
     WHERE id = $1`,
    [signed.orderId]
  );

  const order = row.rows[0];
  if (!order) {
    return { ok: false, error: "Order not found" };
  }
  if (order.status !== "pending") {
    return { ok: false, error: "Order already processed" };
  }
  if (String(order.telegram_user_id) !== String(input.userId)) {
    return { ok: false, error: "User mismatch" };
  }
  if (Number(order.amount_stars) !== input.totalAmount) {
    return { ok: false, error: "Order amount mismatch" };
  }
  if (order.invoice_payload !== input.invoicePayload) {
    return { ok: false, error: "Payload mismatch" };
  }
  if (new Date(order.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "Order expired" };
  }

  return { ok: true };
}

async function forwardSuccessfulPayment(
  userId: number,
  payment: SuccessfulPayment
): Promise<void> {
  const invoicePayload = payment.invoice_payload?.trim();
  if (!invoicePayload) {
    throw new Error("Missing invoice_payload in successful_payment");
  }

  const res = await fetch(`http://127.0.0.1:${config.PORT}/api/payments/telegram/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-telegram-bot-api-secret-token": config.WEBHOOK_SECRET_TOKEN
    },
    body: JSON.stringify({
      event_id: `bot_update:${payment.telegram_payment_charge_id}`,
      telegram_payment_charge_id: payment.telegram_payment_charge_id,
      invoice_payload: invoicePayload,
      user_id: userId,
      amount_stars: payment.total_amount,
      status: "paid"
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Webhook forward failed: ${res.status} ${body}`.trim());
  }
}

async function handleSuccessfulPayment(
  chatId: number,
  userId: number,
  payment: SuccessfulPayment,
  lang: string | undefined
): Promise<void> {
  if (payment.currency !== "XTR") {
    logger.warn({ payment }, "Unexpected payment currency");
    return;
  }

  await forwardSuccessfulPayment(userId, payment);

  const amountStars = payment.total_amount;
  const ru = isRu(lang);
  const text = ru
    ? `✅ Оплата принята! Начислено ${amountStars} ⭐\n\nОткройте приложение, чтобы использовать баланс.`
    : `✅ Payment received! ${amountStars} ⭐ added to your balance.\n\nOpen the app to use your balance.`;

  await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    disable_notification: true,
    reply_markup: {
      inline_keyboard: [
        [{ text: ru ? "Открыть приложение" : "Open App", web_app: { url: APP_URL } }]
      ]
    }
  });
}

export const botRouter = Router();

botRouter.post("/webhook", async (req, res) => {
  const secret = req.header("x-telegram-bot-api-secret-token");
  if (!secret || !safeCompareText(secret, config.WEBHOOK_SECRET_TOKEN)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json({ ok: true });

  const update = req.body as {
    message?: {
      chat: { id: number };
      from?: { id: number; first_name?: string; username?: string; language_code?: string };
      text?: string;
      successful_payment?: SuccessfulPayment;
    };
    pre_checkout_query?: {
      id: string;
      from: { id: number };
      currency: string;
      total_amount: number;
      invoice_payload: string;
    };
  };

  try {
    if (update.pre_checkout_query) {
      const pre = update.pre_checkout_query;
      const validation = await validatePreCheckout({
        userId: pre.from.id,
        totalAmount: pre.total_amount,
        invoicePayload: pre.invoice_payload
      });

      await callTelegramApi("answerPreCheckoutQuery", validation.ok
        ? { pre_checkout_query_id: pre.id, ok: true }
        : {
            pre_checkout_query_id: pre.id,
            ok: false,
            error_message: "Payment validation failed. Please refresh and retry."
          });
      return;
    }

    const msg = update.message;
    if (!msg) return;

    const chatId = msg.chat.id;
    const from = msg.from;
    const lang = from?.language_code;
    const userId = from?.id ?? 0;

    if (msg.successful_payment) {
      await handleSuccessfulPayment(chatId, userId, msg.successful_payment, lang);
      return;
    }

    const text = msg.text?.trim() ?? "";
    if (text.startsWith("/start")) {
      const startParam = text.split(" ")[1]?.trim() ?? "";
      await handleStart(
        chatId,
        userId,
        from?.first_name ?? "",
        from?.username,
        lang,
        startParam
      );
    } else {
      await handleUnknown(chatId, lang);
    }
  } catch (err) {
    logger.error({ err }, "Bot webhook handler error");
  }
});

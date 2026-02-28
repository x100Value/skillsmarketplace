import { v4 as uuidv4 } from "uuid";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";
import { getReferralStats } from "../services/referral.js";

const promoRequestSchema = z
  .object({
    audienceSummary: z.string().min(20).max(600),
    telegramUrl: z.string().url().max(300).optional(),
    youtubeUrl: z.string().url().max(300).optional(),
    instagramUrl: z.string().url().max(300).optional(),
    extraNote: z.string().max(500).optional()
  })
  .strict();

type PromoRequestRow = {
  id: string;
  status: string;
  audience_summary: string;
  channels: Record<string, string>;
  extra_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

async function notifyPromoRequest(input: {
  telegramUserId: string;
  requestId: string;
  audienceSummary: string;
  channels: Record<string, string>;
}): Promise<void> {
  const adminChatId = config.PROMO_REQUEST_NOTIFY_CHAT_ID?.trim();
  if (!adminChatId) {
    return;
  }

  const channelsText = Object.entries(input.channels)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const text =
    `New promo request\n` +
    `requestId: ${input.requestId}\n` +
    `telegramUserId: ${input.telegramUserId}\n` +
    `audience: ${input.audienceSummary}\n` +
    `${channelsText || "- channels: not provided"}`;

  await fetch(`https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: adminChatId,
      text,
      disable_notification: true
    })
  }).catch(() => undefined);
}

export const referralRouter = Router();

referralRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const stats = await getReferralStats(req.user!.id);
  res.json(stats);
});

referralRouter.get("/promo-request/mine", requireAuth, async (req: AuthedRequest, res) => {
  const result = await pool.query<PromoRequestRow>(
    `SELECT id, status, audience_summary, channels, extra_note, created_at, reviewed_at
     FROM influencer_promo_requests
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [req.user!.id]
  );

  res.json({
    items: result.rows.map((r) => ({
      id: r.id,
      status: r.status,
      audienceSummary: r.audience_summary,
      channels: r.channels,
      extraNote: r.extra_note,
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at
    }))
  });
});

referralRouter.post("/promo-request", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = promoRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const channels: Record<string, string> = {};
  if (parsed.data.telegramUrl) channels.telegram = parsed.data.telegramUrl;
  if (parsed.data.youtubeUrl) channels.youtube = parsed.data.youtubeUrl;
  if (parsed.data.instagramUrl) channels.instagram = parsed.data.instagramUrl;

  if (Object.keys(channels).length === 0) {
    res.status(400).json({
      error: "At least one channel link is required (Telegram, YouTube or Instagram)"
    });
    return;
  }

  const existing = await pool.query<{ id: string }>(
    `SELECT id
     FROM influencer_promo_requests
     WHERE user_id = $1 AND status = 'pending'
     LIMIT 1`,
    [req.user!.id]
  );
  if (existing.rows[0]) {
    res.status(409).json({
      error: "You already have a pending promo request",
      requestId: existing.rows[0].id
    });
    return;
  }

  const requestId = uuidv4();
  await pool.query(
    `INSERT INTO influencer_promo_requests (
      id, user_id, telegram_user_id, audience_summary, channels, extra_note, status
    ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, 'pending')`,
    [
      requestId,
      req.user!.id,
      req.user!.telegramUserId,
      parsed.data.audienceSummary,
      JSON.stringify(channels),
      parsed.data.extraNote ?? null
    ]
  );

  await notifyPromoRequest({
    telegramUserId: req.user!.telegramUserId,
    requestId,
    audienceSummary: parsed.data.audienceSummary,
    channels
  });

  res.status(201).json({
    ok: true,
    requestId,
    status: "pending"
  });
});

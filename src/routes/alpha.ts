import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";
import { config } from "../config.js";
import { logger } from "../logger.js";

export const alphaRouter = Router();

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const applySchema = z
  .object({
    role: z.enum(["creator", "buyer", "both"]).default("both"),
    note: z.string().max(500).optional().default("")
  })
  .strict();

async function notifyAdmins(text: string): Promise<void> {
  for (const adminId of config.ADMIN_TELEGRAM_IDS) {
    try {
      const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: Number(adminId), text, parse_mode: "HTML" })
      });
      if (!resp.ok) {
        logger.warn({ adminId, status: resp.status }, "alpha notify failed");
      }
    } catch (e) {
      logger.error({ adminId, e }, "alpha notify error");
    }
  }
}

alphaRouter.post("/apply", requireAuth, async (req: AuthedRequest, res) => {
  const parse = applySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { role, note } = parse.data;
  const user = req.user!;

  const handle = user.username ? `@${user.username}` : `—`;
  const roleLabel = { creator: "🎨 Creator", buyer: "🛒 Buyer", both: "🎭 Both (Creator + Buyer)" }[role] ?? role;
  const time = new Date().toISOString().replace("T", " ").slice(0, 16);
  const safeHandle = escapeHtml(handle);
  const safeNote = escapeHtml(note);

  const lines: string[] = [
    `🚀 <b>Alpha Application</b>`,
    ``,
    `🔖 <b>Handle:</b> ${safeHandle}`,
    `🆔 <b>Telegram ID:</b> <code>${user.telegramUserId}</code>`,
    `🎯 <b>Role:</b> ${roleLabel}`,
    ...(safeNote ? [`💬 <b>Note:</b> ${safeNote}`] : []),
    `⏰ <b>Time:</b> ${time} UTC`,
    ``,
    `<i>via SkillsMarket Alpha Mini App</i>`
  ];

  await notifyAdmins(lines.join("\n"));
  res.json({ ok: true });
});

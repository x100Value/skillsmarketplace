import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { verifyTelegramInitData, type VerifiedInitData } from "../telegram.js";
import { ensureBalanceRow, upsertUser } from "../services/users.js";
import { createSession } from "../services/sessions.js";
import { writeAuditLog } from "../services/audit.js";

const bodySchema = z.object({
  initData: z.string().min(1)
});

export const authRouter = Router();

authRouter.post("/telegram", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  let verified: VerifiedInitData;
  try {
    verified = verifyTelegramInitData(parsed.data.initData);
  } catch (error) {
    res.status(401).json({
      error: "Invalid initData",
      details: error instanceof Error ? error.message : "unknown"
    });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const user = await upsertUser(
      {
        telegramUserId: String(verified.user.id),
        username: verified.user.username ?? null,
        firstName: verified.user.first_name ?? null,
        lastName: verified.user.last_name ?? null,
        locale: verified.user.language_code ?? null
      },
      client
    );

    await ensureBalanceRow(user.id, client);
    const token = await createSession(user.id, client);

    await writeAuditLog(client, {
      actorType: "user",
      actorId: String(user.id),
      action: "auth_success",
      entityType: "session",
      entityId: token.slice(0, 12),
      metadata: { telegramUserId: user.telegram_user_id }
    });

    await client.query("COMMIT");

    res.json({
      token,
      user: {
        id: user.id,
        telegramUserId: user.telegram_user_id,
        username: user.username
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Auth failed" });
  } finally {
    client.release();
  }
});

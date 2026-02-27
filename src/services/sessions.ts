import { v4 as uuidv4 } from "uuid";
import type { PoolClient } from "pg";
import { pool } from "../db.js";
import { config } from "../config.js";
import type { SessionUser } from "../types.js";

export async function createSession(
  userId: number,
  client?: PoolClient
): Promise<string> {
  const db = client ?? pool;
  const id = uuidv4();
  const token = uuidv4() + uuidv4();
  const expiresAt = new Date(
    Date.now() + config.SESSION_TTL_HOURS * 60 * 60 * 1000
  );

  await db.query(
    `INSERT INTO sessions (id, user_id, token, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [id, userId, token, expiresAt]
  );

  return token;
}

export async function getUserBySessionToken(
  token: string
): Promise<SessionUser | null> {
  const result = await pool.query<{
    id: string;
    telegram_user_id: string;
    username: string | null;
  }>(
    `SELECT u.id, u.telegram_user_id, u.username
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1
       AND s.expires_at > NOW()
     LIMIT 1`,
    [token]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    telegramUserId: row.telegram_user_id,
    username: row.username
  };
}

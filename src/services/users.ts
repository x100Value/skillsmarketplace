import type { PoolClient } from "pg";
import { pool } from "../db.js";

type UpsertUserInput = {
  telegramUserId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  locale: string | null;
};

export type UserRow = {
  id: number;
  telegram_user_id: string;
  username: string | null;
};

type UserDbRow = {
  id: string;
  telegram_user_id: string;
  username: string | null;
};

export async function upsertUser(
  input: UpsertUserInput,
  client?: PoolClient
): Promise<UserRow> {
  const db = client ?? pool;
  const result = await db.query<UserDbRow>(
    `INSERT INTO users (
      telegram_user_id, username, first_name, last_name, locale
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (telegram_user_id)
    DO UPDATE SET
      username = EXCLUDED.username,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      locale = EXCLUDED.locale,
      updated_at = NOW()
    RETURNING id, telegram_user_id, username`,
    [
      input.telegramUserId,
      input.username,
      input.firstName,
      input.lastName,
      input.locale
    ]
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to upsert user");
  }
  return {
    id: Number(row.id),
    telegram_user_id: row.telegram_user_id,
    username: row.username
  };
}

export async function ensureBalanceRow(
  userId: number,
  client?: PoolClient
): Promise<void> {
  const db = client ?? pool;
  await db.query(
    `INSERT INTO balances (user_id, total_stars, held_stars)
     VALUES ($1, 0, 0)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

import { v4 as uuidv4 } from "uuid";
import type { PoolClient } from "pg";
import { pool } from "../db.js";
import { writeAuditLog } from "./audit.js";

type BalanceRow = {
  total_stars: string;
  held_stars: string;
};

export type BillingRefType = "task" | "skill_check";

export async function getBalance(userId: number): Promise<{
  total: number;
  held: number;
  available: number;
}> {
  const result = await pool.query<BalanceRow>(
    "SELECT total_stars, held_stars FROM balances WHERE user_id = $1",
    [userId]
  );
  if (!result.rows[0]) {
    return { total: 0, held: 0, available: 0 };
  }
  const total = Number(result.rows[0].total_stars);
  const held = Number(result.rows[0].held_stars);
  return { total, held, available: total - held };
}

async function lockBalance(client: PoolClient, userId: number): Promise<{
  total: number;
  held: number;
}> {
  const result = await client.query<BalanceRow>(
    "SELECT total_stars, held_stars FROM balances WHERE user_id = $1 FOR UPDATE",
    [userId]
  );
  if (!result.rows[0]) {
    throw new Error("Balance row not found");
  }
  return {
    total: Number(result.rows[0].total_stars),
    held: Number(result.rows[0].held_stars)
  };
}

export async function creditFromPayment(input: {
  providerEventId: string;
  telegramPaymentChargeId?: string | null;
  telegramUserId: string;
  userId: number;
  amountStars: number;
  status: string;
  payload: unknown;
}): Promise<{ applied: boolean }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const inserted = await client.query(
      `INSERT INTO payment_events (
        provider_event_id, telegram_payment_charge_id, telegram_user_id, amount_stars, status, payload
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      ON CONFLICT (provider_event_id) DO NOTHING`,
      [
        input.providerEventId,
        input.telegramPaymentChargeId ?? null,
        input.telegramUserId,
        input.amountStars,
        input.status,
        JSON.stringify(input.payload ?? {})
      ]
    );

    if (inserted.rowCount === 0) {
      await client.query("ROLLBACK");
      return { applied: false };
    }

    await lockBalance(client, input.userId);

    await client.query(
      `UPDATE balances
       SET total_stars = total_stars + $2,
           updated_at = NOW()
       WHERE user_id = $1`,
      [input.userId, input.amountStars]
    );

    await client.query(
      `INSERT INTO ledger_entries (user_id, type, amount_stars, ref_type, ref_id, metadata)
       VALUES ($1, 'credit', $2, 'payment_event', $3, $4::jsonb)`,
      [input.userId, input.amountStars, input.providerEventId, JSON.stringify(input.payload ?? {})]
    );

    await writeAuditLog(client, {
      actorType: "system",
      actorId: "telegram_webhook",
      action: "payment_credited",
      entityType: "user",
      entityId: String(input.userId),
      metadata: {
        providerEventId: input.providerEventId,
        amountStars: input.amountStars
      }
    });

    await client.query("COMMIT");
    return { applied: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function holdForRef(input: {
  userId: number;
  refType: BillingRefType;
  refId: string;
  amountStars: number;
}): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const balance = await lockBalance(client, input.userId);
    const available = balance.total - balance.held;
    if (available < input.amountStars) {
      throw new Error("Insufficient available balance");
    }

    await client.query(
      `UPDATE balances
       SET held_stars = held_stars + $2,
           updated_at = NOW()
       WHERE user_id = $1`,
      [input.userId, input.amountStars]
    );

    await client.query(
      `INSERT INTO ledger_entries (user_id, type, amount_stars, ref_type, ref_id, metadata)
       VALUES ($1, 'hold', $2, $3, $4, '{}'::jsonb)`,
      [input.userId, input.amountStars, input.refType, input.refId]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function settleRef(input: {
  userId: number;
  refType: BillingRefType;
  refId: string;
  holdStars: number;
  actualStars: number;
}): Promise<void> {
  if (input.actualStars > input.holdStars) {
    throw new Error("Actual cost cannot exceed hold amount in MVP");
  }

  const releaseStars = input.holdStars - input.actualStars;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await lockBalance(client, input.userId);

    await client.query(
      `UPDATE balances
       SET held_stars = held_stars - $2,
           total_stars = total_stars - $3,
           updated_at = NOW()
       WHERE user_id = $1`,
      [input.userId, input.holdStars, input.actualStars]
    );

    await client.query(
      `INSERT INTO ledger_entries (user_id, type, amount_stars, ref_type, ref_id, metadata)
       VALUES ($1, 'debit', $2, $3, $4, '{}'::jsonb)`,
      [input.userId, input.actualStars, input.refType, input.refId]
    );

    if (releaseStars > 0) {
      await client.query(
        `INSERT INTO ledger_entries (user_id, type, amount_stars, ref_type, ref_id, metadata)
         VALUES ($1, 'release', $2, $3, $4, '{}'::jsonb)`,
        [input.userId, releaseStars, input.refType, input.refId]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function holdForTask(input: {
  userId: number;
  taskId: string;
  amountStars: number;
}): Promise<void> {
  await holdForRef({
    userId: input.userId,
    refType: "task",
    refId: input.taskId,
    amountStars: input.amountStars
  });
}

export async function settleTask(input: {
  userId: number;
  taskId: string;
  holdStars: number;
  actualStars: number;
}): Promise<void> {
  await settleRef({
    userId: input.userId,
    refType: "task",
    refId: input.taskId,
    holdStars: input.holdStars,
    actualStars: input.actualStars
  });
}

export async function createWithdrawalRequest(input: {
  userId: number;
  amountStars: number;
}): Promise<{ withdrawalId: string }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const balance = await lockBalance(client, input.userId);
    const available = balance.total - balance.held;
    if (available < input.amountStars) {
      throw new Error("Insufficient available balance");
    }

    const withdrawalId = uuidv4();

    await client.query(
      `UPDATE balances
       SET held_stars = held_stars + $2,
           updated_at = NOW()
       WHERE user_id = $1`,
      [input.userId, input.amountStars]
    );

    await client.query(
      `INSERT INTO withdrawals (id, user_id, amount_stars, status)
       VALUES ($1, $2, $3, 'pending')`,
      [withdrawalId, input.userId, input.amountStars]
    );

    await client.query(
      `INSERT INTO ledger_entries (user_id, type, amount_stars, ref_type, ref_id, metadata)
       VALUES ($1, 'withdraw_hold', $2, 'withdrawal', $3, '{}'::jsonb)`,
      [input.userId, input.amountStars, withdrawalId]
    );

    await writeAuditLog(client, {
      actorType: "user",
      actorId: String(input.userId),
      action: "withdrawal_requested",
      entityType: "withdrawal",
      entityId: withdrawalId,
      metadata: { amountStars: input.amountStars }
    });

    await client.query("COMMIT");
    return { withdrawalId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listWithdrawals(status?: string): Promise<
  Array<{
    id: string;
    userId: string;
    amountStars: number;
    status: string;
    requestedAt: string;
  }>
> {
  const params: unknown[] = [];
  let where = "";
  if (status) {
    params.push(status);
    where = "WHERE w.status = $1";
  }

  const result = await pool.query<{
    id: string;
    user_id: string;
    amount_stars: string;
    status: string;
    requested_at: string;
  }>(
    `SELECT w.id, w.user_id, w.amount_stars, w.status, w.requested_at
     FROM withdrawals w
     ${where}
     ORDER BY requested_at DESC
     LIMIT 100`,
    params
  );

  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    amountStars: Number(row.amount_stars),
    status: row.status,
    requestedAt: row.requested_at
  }));
}

export async function decideWithdrawal(input: {
  withdrawalId: string;
  decision: "approve" | "reject";
  adminId: string;
  reason?: string;
}): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const withdrawal = await client.query<{
      id: string;
      user_id: string;
      amount_stars: string;
      status: string;
    }>(
      `SELECT id, user_id, amount_stars, status
       FROM withdrawals
       WHERE id = $1
       FOR UPDATE`,
      [input.withdrawalId]
    );
    const row = withdrawal.rows[0];
    if (!row) {
      throw new Error("Withdrawal not found");
    }
    if (row.status !== "pending") {
      throw new Error("Withdrawal already decided");
    }

    const userId = Number(row.user_id);
    const amountStars = Number(row.amount_stars);

    await lockBalance(client, userId);

    if (input.decision === "approve") {
      await client.query(
        `UPDATE balances
         SET held_stars = held_stars - $2,
             total_stars = total_stars - $2,
             updated_at = NOW()
         WHERE user_id = $1`,
        [userId, amountStars]
      );

      await client.query(
        `INSERT INTO ledger_entries (user_id, type, amount_stars, ref_type, ref_id, metadata)
         VALUES ($1, 'withdraw_debit', $2, 'withdrawal', $3, '{}'::jsonb)`,
        [userId, amountStars, input.withdrawalId]
      );
    } else {
      await client.query(
        `UPDATE balances
         SET held_stars = held_stars - $2,
             updated_at = NOW()
         WHERE user_id = $1`,
        [userId, amountStars]
      );

      await client.query(
        `INSERT INTO ledger_entries (user_id, type, amount_stars, ref_type, ref_id, metadata)
         VALUES ($1, 'withdraw_release', $2, 'withdrawal', $3, '{}'::jsonb)`,
        [userId, amountStars, input.withdrawalId]
      );
    }

    await client.query(
      `UPDATE withdrawals
       SET status = $2,
           decided_at = NOW(),
           decided_by = $3,
           decision_reason = $4
       WHERE id = $1`,
      [input.withdrawalId, input.decision === "approve" ? "approved" : "rejected", input.adminId, input.reason ?? null]
    );

    await writeAuditLog(client, {
      actorType: "admin",
      actorId: input.adminId,
      action: input.decision === "approve" ? "withdrawal_approved" : "withdrawal_rejected",
      entityType: "withdrawal",
      entityId: input.withdrawalId,
      metadata: { reason: input.reason ?? null }
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

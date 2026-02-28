import { pool } from "../db.js";
import { config } from "../config.js";
import { logger } from "../logger.js";

const BOT_USERNAME = "SkillsMarketplacebot";

export function referralLink(code: string): string {
  return `https://t.me/${BOT_USERNAME}?start=${code}`;
}

export async function ensureReferralCode(userId: number): Promise<string> {
  const existing = await pool.query<{ referral_code: string }>(
    "SELECT referral_code FROM users WHERE id = $1",
    [userId]
  );
  if (existing.rows[0]?.referral_code) return existing.rows[0].referral_code;

  const code =
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase();

  await pool.query(
    "UPDATE users SET referral_code = $1 WHERE id = $2 AND referral_code IS NULL",
    [code, userId]
  );
  const fresh = await pool.query<{ referral_code: string }>(
    "SELECT referral_code FROM users WHERE id = $1",
    [userId]
  );
  return fresh.rows[0]!.referral_code;
}

export async function applyReferralCode(
  newUserId: number,
  code: string
): Promise<boolean> {
  if (!code || code.length < 4) return false;

  const ref = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE upper(referral_code) = upper($1) AND id != $2",
    [code, newUserId]
  );
  if (!ref.rows[0]) return false;

  const referrerId = ref.rows[0].id;

  await pool.query(
    `UPDATE users SET referred_by = $1
     WHERE id = $2 AND referred_by IS NULL`,
    [referrerId, newUserId]
  );
  return true;
}

type ChainEntry = { userId: number; level: number };

export async function getReferralChain(userId: number): Promise<ChainEntry[]> {
  const chain: ChainEntry[] = [];
  let current = userId;

  for (let level = 1; level <= 3; level++) {
    const row = await pool.query<{ referred_by: number | null }>(
      "SELECT referred_by FROM users WHERE id = $1",
      [current]
    );
    const parent = row.rows[0]?.referred_by;
    if (!parent) break;
    chain.push({ userId: parent, level });
    current = parent;
  }

  return chain;
}

export async function payReferralEarnings(
  sourceUserId: number,
  amountStars: number,
  eventId: string
): Promise<void> {
  const chain = await getReferralChain(sourceUserId);
  if (!chain.length) return;

  const pcts: Record<number, number> = {
    1: config.REFERRAL_L1_PCT,
    2: config.REFERRAL_L2_PCT,
    3: config.REFERRAL_L3_PCT
  };

  for (const { userId, level } of chain) {
    const pct = pcts[level] ?? 0;
    const earn = Math.floor((amountStars * pct) / 100);
    if (earn <= 0) continue;

    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        await client.query(
          `UPDATE balances SET total_stars = total_stars + $1, updated_at = NOW()
           WHERE user_id = $2`,
          [earn, userId]
        );

        await client.query(
          `INSERT INTO ledger_entries (user_id, type, amount_stars, ref_type, ref_id, metadata)
           VALUES ($1, 'referral_credit', $2, 'referral', $3, $4::jsonb)`,
          [userId, earn, eventId, JSON.stringify({ sourceUserId, level, pct })]
        );

        await client.query(
          `INSERT INTO referral_earnings
             (user_id, source_user_id, source_event_id, level, amount_stars)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, sourceUserId, eventId, level, earn]
        );

        await client.query("COMMIT");
        logger.info({ userId, level, earn, eventId }, "Referral earning paid");
      } catch (err) {
        await client.query("ROLLBACK");
        logger.error({ err, userId, level }, "Referral earning failed");
      } finally {
        client.release();
      }
    } catch (err) {
      logger.error({ err }, "Referral pool error");
    }
  }
}

export async function getReferralStats(userId: number): Promise<{
  code: string;
  link: string;
  totalReferred: number;
  totalEarned: number;
  levels: Array<{ level: number; count: number; earned: number; pct: number }>;
}> {
  const code = await ensureReferralCode(userId);

  const stats = await pool.query<{
    level: number;
    cnt: string;
    earned: string;
  }>(
    `SELECT level, count(*) as cnt, coalesce(sum(amount_stars),0) as earned
     FROM referral_earnings WHERE user_id = $1 GROUP BY level`,
    [userId]
  );

  const referred = await pool.query<{ cnt: string }>(
    "SELECT count(*) as cnt FROM users WHERE referred_by = $1",
    [userId]
  );

  const byLevel = new Map(stats.rows.map((r) => [r.level, r]));
  const levels = [1, 2, 3].map((level) => ({
    level,
    count: Number(byLevel.get(level)?.cnt ?? 0),
    earned: Number(byLevel.get(level)?.earned ?? 0),
    pct: [
      config.REFERRAL_L1_PCT,
      config.REFERRAL_L2_PCT,
      config.REFERRAL_L3_PCT
    ][level - 1]!
  }));

  return {
    code,
    link: referralLink(code),
    totalReferred: Number(referred.rows[0]?.cnt ?? 0),
    totalEarned: levels.reduce((s, l) => s + l.earned, 0),
    levels
  };
}

import crypto from "node:crypto";
import { config } from "./config.js";

type TelegramInitDataUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
};

export type VerifiedInitData = {
  authDate: number;
  user: TelegramInitDataUser;
  raw: Record<string, string>;
};

function timingSafeEqualHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]{64}$/i.test(a) || !/^[0-9a-f]{64}$/i.test(b)) {
    return false;
  }
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function verifyTelegramInitData(initData: string): VerifiedInitData {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    throw new Error("Missing hash");
  }

  const map: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key !== "hash") {
      map[key] = value;
    }
  }

  const dataCheckString = Object.keys(map)
    .sort()
    .map((k) => `${k}=${map[k]}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(config.TELEGRAM_BOT_TOKEN)
    .digest();

  const calculated = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!timingSafeEqualHex(calculated, hash)) {
    throw new Error("Invalid initData signature");
  }

  const authDate = Number(map.auth_date ?? "0");
  if (!Number.isFinite(authDate) || authDate <= 0) {
    throw new Error("Invalid auth_date");
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > config.AUTH_MAX_AGE_SECONDS) {
    throw new Error("initData expired");
  }
  if (authDate - now > 30) {
    throw new Error("Invalid auth_date");
  }

  const userRaw = map.user;
  if (!userRaw) {
    throw new Error("Missing user in initData");
  }

  let user: TelegramInitDataUser;
  try {
    user = JSON.parse(userRaw) as TelegramInitDataUser;
  } catch {
    throw new Error("Cannot parse user payload");
  }

  if (!user.id) {
    throw new Error("Missing user id");
  }

  return {
    authDate,
    user,
    raw: map
  };
}

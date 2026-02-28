import crypto from "node:crypto";

export function safeCompareText(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function hashSha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function hmacSha256Hex(secret: string, input: string): string {
  return crypto.createHmac("sha256", secret).update(input, "utf8").digest("hex");
}

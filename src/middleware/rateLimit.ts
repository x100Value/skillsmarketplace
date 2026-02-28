import { NextFunction, Request, Response } from "express";

type Bucket = {
  hits: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

type RateLimitOptions = {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
};

let nextCleanupAt = 0;

function cleanupExpired(now: number): void {
  if (now < nextCleanupAt) {
    return;
  }
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
  nextCleanupAt = now + 30_000;
}

export function rateLimit(opts: RateLimitOptions) {
  return function limiter(req: Request, res: Response, next: NextFunction): void {
    const key = opts.key?.(req) ?? `${req.path}:${req.ip ?? "unknown"}`;
    const now = Date.now();
    cleanupExpired(now);
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      const resetAt = now + opts.windowMs;
      buckets.set(key, { hits: 1, resetAt });
      res.setHeader("RateLimit-Limit", String(opts.max));
      res.setHeader("RateLimit-Remaining", String(Math.max(0, opts.max - 1)));
      res.setHeader("RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
      next();
      return;
    }

    if (current.hits >= opts.max) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      res.setHeader("RateLimit-Limit", String(opts.max));
      res.setHeader("RateLimit-Remaining", "0");
      res.setHeader("RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    current.hits += 1;
    buckets.set(key, current);
    res.setHeader("RateLimit-Limit", String(opts.max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, opts.max - current.hits)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));
    next();
  };
}

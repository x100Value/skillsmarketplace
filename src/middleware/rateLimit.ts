import { NextFunction, Request, Response } from "express";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(opts: { windowMs: number; max: number }) {
  return function limiter(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip ?? "unknown";
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
      next();
      return;
    }

    if (current.count >= opts.max) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    current.count += 1;
    buckets.set(key, current);
    next();
  };
}

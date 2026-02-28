import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { safeCompareText } from "../utils/crypto.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("x-admin-token");
  if (!token || !safeCompareText(token, config.BILLING_ADMIN_TOKEN)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

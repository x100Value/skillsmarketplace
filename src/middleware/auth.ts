import { NextFunction, Response } from "express";
import { getUserBySessionToken } from "../services/sessions.js";
import type { AuthedRequest } from "../types.js";

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const user = await getUserBySessionToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid session" });
    return;
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

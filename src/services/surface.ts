import type { Request } from "express";

export type AppSurface = "telegram" | "web";

export function getSurface(req: Request): AppSurface {
  const raw = String(req.header("x-client-surface") ?? "").toLowerCase();
  return raw === "telegram" ? "telegram" : "web";
}

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../types.js";
import { getBalance } from "../services/billing.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!;
  const balance = await getBalance(user.id);
  res.json({
    user,
    balance
  });
});

import { v4 as uuidv4 } from "uuid";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { holdForTask, settleTask } from "../services/billing.js";
import { runBlackBoxTask } from "../services/llm.js";
import type { AuthedRequest } from "../types.js";
import { pool } from "../db.js";
import { quoteStarsCharge } from "../services/pricing.js";

const runTaskSchema = z.object({
  prompt: z.string().min(1).max(4000),
  estimatedCostStars: z.number().int().positive().max(100000)
});

export const tasksRouter = Router();

tasksRouter.post("/run", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = runTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }

  const { prompt, estimatedCostStars } = parsed.data;
  const userId = req.user!.id;
  const taskId = uuidv4();
  const estimatedQuote = quoteStarsCharge(estimatedCostStars, "stars");
  let holdApplied = false;

  try {
    await pool.query(
      `INSERT INTO llm_tasks (id, user_id, prompt, status, estimated_stars)
       VALUES ($1, $2, $3, 'queued', $4)`,
      [taskId, userId, prompt, estimatedQuote.totalStars]
    );

    await holdForTask({
      userId,
      taskId,
      amountStars: estimatedQuote.totalStars
    });
    holdApplied = true;

    await pool.query(
      "UPDATE llm_tasks SET status = 'running' WHERE id = $1",
      [taskId]
    );

    const resultText = await runBlackBoxTask(prompt);
    const actualBaseStars = Math.max(1, Math.ceil(prompt.length / 300));
    const cappedBaseStars = Math.min(actualBaseStars, estimatedCostStars);
    const actualQuote = quoteStarsCharge(cappedBaseStars, "stars");

    await settleTask({
      userId,
      taskId,
      holdStars: estimatedQuote.totalStars,
      actualStars: actualQuote.totalStars
    });

    await pool.query(
      `UPDATE llm_tasks
       SET status = 'done',
           actual_stars = $2,
           result_text = $3,
           finished_at = NOW()
       WHERE id = $1`,
      [taskId, actualQuote.totalStars, resultText]
    );

    res.json({
      taskId,
      status: "done",
      actualStars: actualQuote.totalStars,
      pricing: {
        estimated: estimatedQuote,
        actual: actualQuote
      },
      resultText
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Task failed";
    if (holdApplied) {
      try {
        await settleTask({
          userId,
          taskId,
          holdStars: estimatedQuote.totalStars,
          actualStars: 0
        });
      } catch {
        // Best-effort rollback of locked funds.
      }
    }

    if (message.includes("Insufficient")) {
      await pool.query(
        `UPDATE llm_tasks
         SET status = 'failed', error_text = $2, finished_at = NOW()
         WHERE id = $1`,
        [taskId, message]
      );
      res.status(402).json({ error: message });
      return;
    }

    await pool.query(
      `UPDATE llm_tasks
       SET status = 'failed', error_text = $2, finished_at = NOW()
       WHERE id = $1`,
      [taskId, message]
    );
    res.status(500).json({ error: "Task execution failed", details: message });
  }
});

import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { authRouter } from "./routes/auth.js";
import { paymentsRouter } from "./routes/payments.js";
import { meRouter } from "./routes/me.js";
import { tasksRouter } from "./routes/tasks.js";
import { withdrawalsRouter } from "./routes/withdrawals.js";
import { adminRouter } from "./routes/admin.js";
import { pricingRouter } from "./routes/pricing.js";
import { historyRouter } from "./routes/history.js";
import { skillCheckRouter } from "./routes/skillCheck.js";

const app = express();

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, env: config.NODE_ENV });
});

app.use("/api/auth", authRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/me", meRouter);
app.use("/api/history", historyRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/skill-check", skillCheckRouter);
app.use("/api/withdrawals", withdrawalsRouter);
app.use("/api/admin", adminRouter);

const webPath = path.resolve(process.cwd(), "web");
const docsPath = path.resolve(process.cwd(), "docs");

app.use("/docs", express.static(docsPath));
app.use(express.static(webPath));

app.get("/pro", (_req, res) => {
  res.sendFile(path.join(webPath, "pro.html"));
});

app.get("/legal", (_req, res) => {
  res.sendFile(path.join(webPath, "legal.html"));
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(webPath, "index.html"));
});

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "Server started");
});

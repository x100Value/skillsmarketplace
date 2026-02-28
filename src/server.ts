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
import { moderationRouter } from "./routes/moderation.js";

const app = express();
const allowedOrigins = new Set(config.CORS_ALLOW_ORIGINS);

app.disable("x-powered-by");
app.set("trust proxy", config.TRUST_PROXY);

app.use(pinoHttp({ logger }));
app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "https://telegram.org"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        imgSrc: ["'self'", "https:", "data:"],
        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "https://api.openai.com"],
        frameAncestors: [
          "'self'",
          "https://web.telegram.org",
          "https://webk.telegram.org",
          "https://*.telegram.org"
        ],
        upgradeInsecureRequests: []
      }
    }
  })
);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.has(origin)) {
        cb(null, true);
        return;
      }
      cb(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    maxAge: 86400
  })
);
app.use(express.json({ limit: "1mb", strict: true }));

app.use(
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX
  })
);
app.use(
  "/api/auth/telegram",
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_AUTH_MAX
  })
);
app.use(
  "/api/payments/telegram/webhook",
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_WEBHOOK_MAX,
    key: (req) =>
      `webhook:${req.ip ?? "unknown"}:${String(req.header("x-telegram-bot-api-secret-token") ?? "").slice(0, 12)}`
  })
);
app.use(
  "/api/admin",
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_ADMIN_MAX
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
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
app.use("/api/moderation", moderationRouter);

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

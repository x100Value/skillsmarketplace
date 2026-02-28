import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.x-admin-token",
      "req.headers.x-telegram-bot-api-secret-token",
      "req.body.initData",
      "res.headers.set-cookie"
    ],
    censor: "[REDACTED]"
  }
});

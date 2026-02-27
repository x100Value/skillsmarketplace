import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  WEBHOOK_SECRET_TOKEN: z.string().min(1),
  BILLING_ADMIN_TOKEN: z.string().min(1),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(48),
  AUTH_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(300),
  WITHDRAW_HOLD_DAYS: z.coerce.number().int().positive().default(21),
  STARS_PLATFORM_FEE_PERCENT: z.coerce.number().min(0).max(100).default(30),
  TON_USDT_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  TON_USDT_WALLET: z.string().min(1),
  USDT_TO_STARS_RATE: z.coerce.number().positive().default(100),
  SKILLCHECK_BASE_CREDITS: z.coerce.number().int().min(1).default(6),
  SKILLCHECK_PER_1K_CHARS_CREDITS: z.coerce.number().int().min(0).default(2),
  SKILLCHECK_PER_QUERY_CREDITS: z.coerce.number().int().min(0).default(1),
  SKILLCHECK_MAX_QUERIES: z.coerce.number().int().min(1).max(8).default(4),
  SKILLCHECK_PAID_SEARCH_ENDPOINT: z
    .string()
    .url()
    .default("https://google.serper.dev/search"),
  SKILLCHECK_PAID_SEARCH_API_KEY: z.string().optional(),
  SKILLCHECK_FREE_SEARCH_ENDPOINT: z
    .string()
    .url()
    .default("https://api.duckduckgo.com/"),
  SKILLCHECK_LLM_API_KEY: z.string().optional(),
  SKILLCHECK_LLM_MODEL: z.string().default("gpt-4o-mini")
});

export const config = schema.parse(process.env);

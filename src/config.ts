import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function parseCsvList(value: string): string[] {
  return [...new Set(value.split(",").map((v) => v.trim()).filter(Boolean))];
}

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(8080),
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(1),
    CORS_ALLOW_ORIGINS: z
      .string()
      .default(
        [
          "https://skillsmarketplace.ru",
          "https://www.skillsmarketplace.ru",
          "http://localhost:8080",
          "http://127.0.0.1:8080"
        ].join(",")
      )
      .transform(parseCsvList),
    DATABASE_URL: z.string().min(1),
    TELEGRAM_BOT_TOKEN: z.string().min(20),
    WEBHOOK_SECRET_TOKEN: z.string().min(16),
    BILLING_ADMIN_TOKEN: z.string().min(24),
    ADMIN_TELEGRAM_IDS: z.string().default("").transform(parseCsvList),
    PROMO_REQUEST_NOTIFY_CHAT_ID: z.string().optional(),
    SESSION_TTL_HOURS: z.coerce.number().int().positive().default(48),
    AUTH_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(300),
    WITHDRAW_HOLD_DAYS: z.coerce.number().int().positive().default(22),
    WITHDRAWALS_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    OUTBOUND_HTTP_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(12000),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).max(3600000).default(60000),
    RATE_LIMIT_MAX: z.coerce.number().int().min(10).max(5000).default(240),
    RATE_LIMIT_AUTH_MAX: z.coerce.number().int().min(3).max(500).default(25),
    RATE_LIMIT_WEBHOOK_MAX: z.coerce.number().int().min(10).max(5000).default(120),
    RATE_LIMIT_ADMIN_MAX: z.coerce.number().int().min(3).max(500).default(40),
    STARS_PLATFORM_FEE_PERCENT: z.coerce.number().min(0).max(100).default(30),
    TON_USDT_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    TON_USDT_WALLET: z.string().default(""),
    USDT_TO_STARS_RATE: z.coerce.number().positive().default(100),
    REFERRAL_L1_PCT: z.coerce.number().min(0).max(100).default(3),
    REFERRAL_L2_PCT: z.coerce.number().min(0).max(100).default(2),
    REFERRAL_L3_PCT: z.coerce.number().min(0).max(100).default(1),
    SKILLCHECK_LLM_QUEUE_DELAY_MS: z.coerce.number().int().min(0).default(0),
    SKILLCHECK_LLM_BASE_URL: z
      .string()
      .url()
      .default("https://api.groq.com/openai/v1"),
    SKILLCHECK_LLM_FALLBACK_MODEL: z.string().default(""),
    SKILLCHECK_LLM_FALLBACK_API_KEY: z.string().default(""),
    SKILLCHECK_LLM_FALLBACK_BASE_URL: z
      .string()
      .url()
      .default("https://openrouter.ai/api/v1"),
    SKILLCHECK_LLM_FALLBACK2_MODEL: z.string().default(""),
    SKILLCHECK_LLM_FALLBACK2_API_KEY: z.string().default(""),
    SKILLCHECK_LLM_FALLBACK2_BASE_URL: z
      .string()
      .url()
      .default("https://openrouter.ai/api/v1"),
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
  })
  .superRefine((value, ctx) => {
    if (value.TON_USDT_ENABLED && !value.TON_USDT_WALLET.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["TON_USDT_WALLET"],
        message: "TON_USDT_WALLET is required when TON_USDT_ENABLED=true"
      });
    }
  });

export const config = schema.parse(process.env);

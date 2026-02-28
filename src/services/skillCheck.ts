import { config } from "../config.js";
import { quoteStarsCharge } from "./pricing.js";
import {
  searchSourcesByMode,
  type SkillCheckMode,
  type SkillSource
} from "./skillCheckProviders.js";

export type SkillCheckQuoteInput = {
  skillText: string;
  mode: SkillCheckMode;
};

export type SkillCheckQuote = {
  mode: SkillCheckMode;
  textLength: number;
  estimatedQueries: number;
  estimatedBaseCredits: number;
  estimatedTotalCredits: number;
  pricing: ReturnType<typeof quoteStarsCharge>;
};

type SimilaritySource = SkillSource & {
  similarity: number;
};

type SkillCheckReport = {
  summary: string;
  uniquenessScore: number;
  riskLevel: "low" | "medium" | "high";
  topSignals: string[];
  recommendations: string[];
  topMatches: Array<{
    title: string;
    url: string;
    similarity: number;
    provider: "free" | "paid";
  }>;
};

export type SkillCheckRunOutput = {
  report: SkillCheckReport;
  queries: string[];
  sources: SkillSource[];
  providerUsed: "free" | "paid" | "mixed";
  actualBaseCredits: number;
  actualTotalCredits: number;
};

const wordRegex = /[a-zа-я0-9_-]{3,}/gi;

function tokenize(input: string): string[] {
  return (input.toLowerCase().match(wordRegex) ?? []).slice(0, 1200);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function buildSkillCheckQueries(skillText: string): string[] {
  const normalized = skillText.replace(/\s+/g, " ").trim();
  const words = tokenize(normalized);
  const uniqueWords = unique(words);
  const topWords = uniqueWords.slice(0, 30);

  const firstChunk = normalized.slice(0, 120);
  const secondChunk = normalized.slice(120, 260);

  const candidates = [
    `telegram skill prompt ${topWords.slice(0, 8).join(" ")}`.trim(),
    `ai automation prompt ${topWords.slice(8, 16).join(" ")}`.trim(),
    `site:github.com ${topWords.slice(0, 6).join(" ")}`.trim(),
    `\"${firstChunk}\"`,
    secondChunk ? `\"${secondChunk}\"` : ""
  ].filter((q) => q.length > 8);

  return unique(candidates).slice(0, config.SKILLCHECK_MAX_QUERIES);
}

export function getSkillCheckQuote(input: SkillCheckQuoteInput): SkillCheckQuote {
  const textLength = input.skillText.trim().length;
  const queries = buildSkillCheckQueries(input.skillText);
  const estimatedQueries = queries.length;

  const lengthCredits =
    Math.ceil(textLength / 1000) * config.SKILLCHECK_PER_1K_CHARS_CREDITS;
  const queryCredits = estimatedQueries * config.SKILLCHECK_PER_QUERY_CREDITS;
  const modeMultiplier = input.mode === "paid" ? 2 : input.mode === "hybrid" ? 2 : 1;

  const estimatedBaseCredits = Math.max(
    1,
    config.SKILLCHECK_BASE_CREDITS + lengthCredits + queryCredits * modeMultiplier
  );
  const pricing = quoteStarsCharge(estimatedBaseCredits, "stars");

  return {
    mode: input.mode,
    textLength,
    estimatedQueries,
    estimatedBaseCredits,
    estimatedTotalCredits: pricing.totalStars,
    pricing
  };
}

function calcSimilarity(skillTokens: Set<string>, source: SkillSource): number {
  const sourceTokens = tokenize(`${source.title} ${source.snippet}`);
  if (!sourceTokens.length || !skillTokens.size) {
    return 0;
  }

  let overlap = 0;
  for (const token of sourceTokens) {
    if (skillTokens.has(token)) {
      overlap += 1;
    }
  }

  const ratio = overlap / Math.max(skillTokens.size, 1);
  return Math.min(1, ratio);
}

async function generateSummaryWithModel(input: {
  skillText: string;
  topMatches: SimilaritySource[];
  heuristic: SkillCheckReport;
}): Promise<SkillCheckReport> {
  if (!config.SKILLCHECK_LLM_API_KEY) {
    return input.heuristic;
  }

  const payload = {
    model: config.SKILLCHECK_LLM_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a strict uniqueness checker. Output JSON only with keys summary,topSignals,recommendations,riskLevel,uniquenessScore."
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "uniqueness_check",
          skillText: input.skillText.slice(0, 4000),
          topMatches: input.topMatches.slice(0, 5).map((m) => ({
            title: m.title,
            url: m.url,
            snippet: m.snippet.slice(0, 300),
            similarity: Number(m.similarity.toFixed(3))
          })),
          heuristic: input.heuristic
        })
      }
    ]
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(config.OUTBOUND_HTTP_TIMEOUT_MS),
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.SKILLCHECK_LLM_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return input.heuristic;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return input.heuristic;
  }

  try {
    const parsed = JSON.parse(content) as {
      summary?: string;
      topSignals?: string[];
      recommendations?: string[];
      riskLevel?: "low" | "medium" | "high";
      uniquenessScore?: number;
    };

    const uniqueness = Math.max(
      0,
      Math.min(100, Math.floor(parsed.uniquenessScore ?? input.heuristic.uniquenessScore))
    );

    return {
      ...input.heuristic,
      summary: parsed.summary ?? input.heuristic.summary,
      topSignals: Array.isArray(parsed.topSignals)
        ? parsed.topSignals.slice(0, 4)
        : input.heuristic.topSignals,
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.slice(0, 4)
        : input.heuristic.recommendations,
      riskLevel: parsed.riskLevel ?? input.heuristic.riskLevel,
      uniquenessScore: uniqueness
    };
  } catch {
    return input.heuristic;
  }
}

export async function runSkillCheck(input: {
  skillText: string;
  mode: SkillCheckMode;
}): Promise<SkillCheckRunOutput> {
  const queries = buildSkillCheckQueries(input.skillText);
  const { sources, providerUsed } = await searchSourcesByMode(queries, input.mode);

  const skillTokens = new Set(tokenize(input.skillText));
  const scored: SimilaritySource[] = sources
    .map((source) => ({
      ...source,
      similarity: calcSimilarity(skillTokens, source)
    }))
    .sort((a, b) => b.similarity - a.similarity);

  const topMatches = scored.slice(0, 5);
  const maxSimilarity = topMatches[0]?.similarity ?? 0;
  const avgSimilarity =
    topMatches.reduce((sum, item) => sum + item.similarity, 0) /
    Math.max(topMatches.length, 1);

  const uniquenessScore = Math.max(
    0,
    Math.min(100, Math.round(100 - maxSimilarity * 62 - avgSimilarity * 38))
  );
  const riskLevel =
    uniquenessScore >= 70 ? "low" : uniquenessScore >= 40 ? "medium" : "high";

  const heuristicReport: SkillCheckReport = {
    summary:
      uniquenessScore >= 70
        ? "High uniqueness probability. Strong direct duplicates were not found."
        : uniquenessScore >= 40
        ? "Medium uniqueness risk. There are partially similar public materials."
        : "High similarity risk. Multiple close matches were detected.",
    uniquenessScore,
    riskLevel,
    topSignals: [
      `Top match similarity: ${(maxSimilarity * 100).toFixed(1)}%`,
      `Average top-5 similarity: ${(avgSimilarity * 100).toFixed(1)}%`,
      `Checked sources: ${sources.length}`
    ],
    recommendations: [
      "Add domain-specific constraints and unique execution steps.",
      "Introduce proprietary examples and output format.",
      "Avoid generic prompt templates copied from public sources."
    ],
    topMatches: topMatches.map((m) => ({
      title: m.title,
      url: m.url,
      similarity: Number((m.similarity * 100).toFixed(2)),
      provider: m.provider
    }))
  };

  const finalReport = await generateSummaryWithModel({
    skillText: input.skillText,
    topMatches,
    heuristic: heuristicReport
  });

  const actualBaseCredits = Math.max(
    1,
    config.SKILLCHECK_BASE_CREDITS +
      Math.ceil(input.skillText.length / 1400) * config.SKILLCHECK_PER_1K_CHARS_CREDITS +
      Math.ceil(sources.length / 4)
  );
  const actualTotalCredits = quoteStarsCharge(actualBaseCredits, "stars").totalStars;

  return {
    report: finalReport,
    queries,
    sources,
    providerUsed,
    actualBaseCredits,
    actualTotalCredits
  };
}

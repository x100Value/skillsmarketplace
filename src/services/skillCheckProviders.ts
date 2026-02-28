import { config } from "../config.js";

export type SkillCheckMode = "free" | "paid" | "hybrid";

export type SkillSource = {
  title: string;
  url: string;
  snippet: string;
  provider: "free" | "paid";
};

function dedupeSources(sources: SkillSource[]): SkillSource[] {
  const seen = new Set<string>();
  const unique: SkillSource[] = [];

  for (const source of sources) {
    const key = `${source.url}|${source.title}`.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(source);
  }

  return unique;
}

async function fetchWithTimeout(
  input: string | URL,
  init: RequestInit
): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(config.OUTBOUND_HTTP_TIMEOUT_MS)
  });
}

export async function freeSearch(query: string): Promise<SkillSource[]> {
  const url = new URL(config.SKILLCHECK_FREE_SEARCH_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("no_html", "1");
  url.searchParams.set("skip_disambig", "1");

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Free search failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    AbstractText?: string;
    AbstractURL?: string;
    Heading?: string;
    RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
  };

  const results: SkillSource[] = [];

  if (data.AbstractText && data.AbstractURL) {
    results.push({
      title: data.Heading ?? "Result",
      url: data.AbstractURL,
      snippet: data.AbstractText,
      provider: "free"
    });
  }

  for (const item of data.RelatedTopics ?? []) {
    if (!item.FirstURL || !item.Text) {
      continue;
    }
    results.push({
      title: item.Text.slice(0, 90),
      url: item.FirstURL,
      snippet: item.Text,
      provider: "free"
    });
    if (results.length >= 5) {
      break;
    }
  }

  return results;
}

export async function paidSearch(query: string): Promise<SkillSource[]> {
  if (!config.SKILLCHECK_PAID_SEARCH_API_KEY) {
    throw new Error("Paid search API key is missing");
  }

  const response = await fetchWithTimeout(config.SKILLCHECK_PAID_SEARCH_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": config.SKILLCHECK_PAID_SEARCH_API_KEY
    },
    body: JSON.stringify({ q: query, num: 6 })
  });

  if (!response.ok) {
    throw new Error(`Paid search failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    organic?: Array<{ title?: string; link?: string; snippet?: string }>;
  };

  return (data.organic ?? [])
    .filter((r) => Boolean(r.link && r.title))
    .map((r) => ({
      title: String(r.title),
      url: String(r.link),
      snippet: String(r.snippet ?? ""),
      provider: "paid" as const
    }))
    .slice(0, 6);
}

export async function searchSourcesByMode(
  queries: string[],
  mode: SkillCheckMode
): Promise<{ sources: SkillSource[]; providerUsed: "free" | "paid" | "mixed" }> {
  const aggregate: SkillSource[] = [];
  let usedFree = false;
  let usedPaid = false;

  for (const query of queries) {
    if (mode === "paid") {
      const paid = await paidSearch(query);
      aggregate.push(...paid);
      usedPaid = true;
      continue;
    }

    if (mode === "free") {
      const free = await freeSearch(query);
      aggregate.push(...free);
      usedFree = true;
      continue;
    }

    try {
      const paid = await paidSearch(query);
      aggregate.push(...paid);
      usedPaid = true;
    } catch {
      const free = await freeSearch(query);
      aggregate.push(...free);
      usedFree = true;
    }
  }

  const providerUsed =
    usedFree && usedPaid ? "mixed" : usedPaid ? "paid" : "free";

  return {
    sources: dedupeSources(aggregate).slice(0, 20),
    providerUsed
  };
}

// GDELT 2.0 client.
// Docs: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/

import { KvCache, stableKey } from "./cache";

export interface GdeltEnv {
  CACHE: KVNamespace;
  GDELT_BASE: string;                 // https://api.gdeltproject.org/api/v2
}

export interface GdeltArticle {
  url: string;
  url_mobile?: string;
  title: string;
  seendate: string;                   // YYYYMMDDTHHMMSSZ → we normalize to ISO
  socialimage?: string;
  domain: string;
  language?: string;
  sourcecountry?: string;
  tone?: number;
}

export interface ToneRow {
  date: string;        // ISO
  tone: number;        // -10..+10
  articles: number;
}

export class GdeltClient {
  private cache: KvCache;
  constructor(private env: GdeltEnv) { this.cache = new KvCache(env.CACHE, "gd"); }

  async searchArticles(opts: {
    query: string;
    country?: string;
    domain?: string;
    timespan?: string;        // e.g. "1d", "7d", "1m"
    maxRecords?: number;
  }): Promise<GdeltArticle[]> {
    const params = new URLSearchParams({
      query: this.composeQuery(opts.query, opts.country, opts.domain),
      mode: "ArtList",
      format: "json",
      maxrecords: String(Math.min(opts.maxRecords ?? 25, 250)),
      timespan: opts.timespan ?? "1d",
    });
    const key = `art:${stableKey(opts)}`;
    const json: any = await this.cache.memoize(key, 60 * 15, () => this.get(`/doc/doc?${params}`));
    return (json?.articles ?? []).map(normalizeArticle);
  }

  async toneTimeseries(opts: {
    query: string;
    country?: string;
    timespan?: string;
    granularity?: "hour" | "day";
  }): Promise<ToneRow[]> {
    const params = new URLSearchParams({
      query: this.composeQuery(opts.query, opts.country),
      mode: "TimelineTone",
      format: "json",
      timespan: opts.timespan ?? "7d",
    });
    const key = `tone:${stableKey(opts)}`;
    const json: any = await this.cache.memoize(key, 60 * 60, () => this.get(`/doc/doc?${params}`));
    const series = json?.timeline?.[0]?.data ?? [];
    return series.map((row: any) => ({
      date: parseGdeltDate(row.date),
      tone: typeof row.value === "number" ? row.value : parseFloat(row.value),
      articles: typeof row.norm === "number" ? row.norm : 0,
    }));
  }

  async trendingActors(opts: { country: string; window?: string; limit?: number }): Promise<Array<{ name: string; mentions: number }>> {
    // GDELT exposes top-actor timelines; we approximate via the "tone" + articles.
    // For demo purposes, build a simple aggregation from a country query.
    const arts = await this.searchArticles({
      query: "*", country: opts.country, timespan: opts.window ?? "1d", maxRecords: 250,
    });
    const tally = new Map<string, number>();
    for (const a of arts) {
      // Crude actor extraction: non-overlapping 2-word capitalized pairs.
      // (More accurate NER lives in the private repo.)
      const matches = a.title.matchAll(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g);
      for (const m of matches) {
        tally.set(m[1], (tally.get(m[1]) ?? 0) + 1);
      }
    }
    return [...tally.entries()]
      .map(([name, mentions]) => ({ name, mentions }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, opts.limit ?? 20);
  }

  async compareQueries(qA: string, qB: string, opts: { timespan?: string; country?: string }): Promise<{
    a: { query: string; timeseries: ToneRow[] };
    b: { query: string; timeseries: ToneRow[] };
  }> {
    const [a, b] = await Promise.all([
      this.toneTimeseries({ query: qA, country: opts.country, timespan: opts.timespan }),
      this.toneTimeseries({ query: qB, country: opts.country, timespan: opts.timespan }),
    ]);
    return { a: { query: qA, timeseries: a }, b: { query: qB, timeseries: b } };
  }

  private composeQuery(q: string, country?: string, domain?: string): string {
    const parts: string[] = [q];
    if (country) parts.push(`sourcecountry:${country.toUpperCase()}`);
    if (domain)  parts.push(`domain:${domain}`);
    return parts.join(" ");
  }

  private async get(path: string): Promise<any> {
    const r = await fetch(`${this.env.GDELT_BASE}${path}`);
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`GDELT ${r.status}: ${txt.slice(0, 200)}`);
    }
    return r.json();
  }
}

// ── Helpers (exported for tests) ─────────────────────────────────────────────

export function normalizeArticle(a: any): GdeltArticle {
  return {
    url: a.url,
    url_mobile: a.url_mobile,
    title: a.title,
    seendate: parseGdeltDate(a.seendate),
    socialimage: a.socialimage,
    domain: a.domain,
    language: a.language,
    sourcecountry: a.sourcecountry,
    tone: a.tone !== undefined ? parseFloat(a.tone) : undefined,
  };
}

/** GDELT uses YYYYMMDDTHHMMSSZ — normalize to ISO. */
export function parseGdeltDate(s: string): string {
  if (!s) return "";
  // YYYYMMDDTHHMMSSZ → YYYY-MM-DDTHH:MM:SSZ
  const m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
  // Already ISO? return as-is.
  if (s.includes("-") && s.includes("T")) return s;
  // Date only: YYYYMMDD
  const d = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (d) return `${d[1]}-${d[2]}-${d[3]}`;
  return s;
}

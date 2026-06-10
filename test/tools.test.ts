import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GdeltClient, parseGdeltDate, normalizeArticle } from "../src/gdelt";
import { McpServer, ToolContext } from "../src/mcp-server";
import { buildTools } from "../src/tools";

class FakeKv {
  store = new Map<string, string>();
  async get(key: string, type?: "text" | "json"): Promise<any> {
    const v = this.store.get(key); if (v === undefined) return null;
    if (type === "json") return JSON.parse(v); return v;
  }
  async put(key: string, value: string): Promise<void> { this.store.set(key, value); }
  async delete(key: string): Promise<void> { this.store.delete(key); }
}

const env = { CACHE: new FakeKv() as unknown as KVNamespace, USAGE: new FakeKv() as unknown as KVNamespace, GDELT_BASE: "https://api.gdeltproject.org/api/v2", UPGRADE_URL: "x" };

const fixArticles = {
  articles: [
    { url: "https://example.com/a", title: "Modi Government Announces Budget", seendate: "20260605T120000Z", domain: "example.com", sourcecountry: "IN", language: "English", tone: "1.2" },
    { url: "https://example.com/b", title: "Rahul Gandhi Criticizes Move", seendate: "20260605T130000Z", domain: "example.com", sourcecountry: "IN", language: "English", tone: "-2.4" },
    { url: "https://example.com/c", title: "Modi Government Holds Press Conference", seendate: "20260605T140000Z", domain: "example.com", sourcecountry: "IN", language: "English", tone: "0.5" },
  ],
};

const fixTone = {
  timeline: [{
    data: [
      { date: "20260601", value: 0.3, norm: 100 },
      { date: "20260602", value: -1.2, norm: 80 },
      { date: "20260603", value: 1.5, norm: 120 },
    ]
  }],
};

beforeEach(() => {
  (env.CACHE as any).store = new Map();
  vi.stubGlobal("fetch", async (url: string | URL) => {
    const u = typeof url === "string" ? url : url.toString();
    if (u.includes("mode=ArtList") || u.includes("mode=artlist"))    return new Response(JSON.stringify(fixArticles), { status: 200 });
    if (u.includes("mode=TimelineTone")) return new Response(JSON.stringify(fixTone), { status: 200 });
    return new Response(JSON.stringify({}), { status: 200 });
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("parseGdeltDate", () => {
  it("normalizes YYYYMMDDTHHMMSSZ", () => {
    expect(parseGdeltDate("20260605T120000Z")).toBe("2026-06-05T12:00:00Z");
  });
  it("normalizes date-only YYYYMMDD", () => {
    expect(parseGdeltDate("20260605")).toBe("2026-06-05");
  });
  it("passes through ISO unchanged", () => {
    expect(parseGdeltDate("2026-06-05T12:00:00Z")).toBe("2026-06-05T12:00:00Z");
  });
});

describe("normalizeArticle", () => {
  it("parses tone as number and normalizes date", () => {
    const a = normalizeArticle({ url: "x", title: "y", seendate: "20260605T120000Z", domain: "x", tone: "-1.5" });
    expect(a.tone).toBe(-1.5);
    expect(a.seendate).toBe("2026-06-05T12:00:00Z");
  });
});

describe("GdeltClient", () => {
  it("searches articles and parses dates/tones", async () => {
    const c = new GdeltClient(env as any);
    const out = await c.searchArticles({ query: "modi", country: "IN", timespan: "1d" });
    expect(out.length).toBe(3);
    expect(out[1].tone).toBe(-2.4);
    expect(out[0].seendate).toBe("2026-06-05T12:00:00Z");
  });

  it("returns tone timeseries normalized", async () => {
    const c = new GdeltClient(env as any);
    const ts = await c.toneTimeseries({ query: "rupee", timespan: "7d" });
    expect(ts.length).toBe(3);
    expect(ts[0].date).toBe("2026-06-01");
    expect(ts[1].tone).toBe(-1.2);
  });

  it("trending actors aggregates capitalized 2-word groups from titles", async () => {
    const c = new GdeltClient(env as any);
    const actors = await c.trendingActors({ country: "IN", window: "1d" });
    const modi = actors.find((a) => a.name === "Modi Government");
    expect(modi?.mentions).toBe(2);
  });
});

describe("MCP protocol", () => {
  const server = new McpServer({ name: "gdelt-events-mcp", version: "0.1.0" });
  for (const t of buildTools()) server.register(t);
  const ctx: ToolContext = { env: env as any, apiKey: null, tier: "free", callsRemaining: 100 };

  it("free tier hides gdelt_compare", async () => {
    const r = await server.handle({ jsonrpc: "2.0", id: 1, method: "tools/list" }, ctx);
    const names = (r!.result as any).tools.map((t: any) => t.name) as string[];
    expect(names).not.toContain("gdelt_compare");
  });

  it("gdelt_search_events end-to-end", async () => {
    const r = await server.handle(
      { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "gdelt_search_events", arguments: { query: "modi" } } }, ctx
    );
    const out = JSON.parse((r!.result as any).content[0].text);
    expect(out.count).toBe(3);
  });
});

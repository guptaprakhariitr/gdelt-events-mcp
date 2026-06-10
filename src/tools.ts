import { Tool } from "./mcp-server";
import { GdeltClient, GdeltEnv } from "./gdelt";

export function buildTools(): Tool[] {
  return [
    {
      name: "gdelt_search_events",
      description:
        "Search global news for events matching a query. Optionally filter by source country (ISO 2-letter) or domain. Returns recent articles with title, URL, source, language, country, tone.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "GDELT search query, supports operators like quotes and OR." },
          country: { type: "string", description: "Source-country filter (ISO 2-letter, e.g. 'IN', 'US')." },
          domain: { type: "string", description: "Filter to one publishing domain." },
          timespan: { type: "string", description: "e.g. '1d', '7d', '1m'. Default '1d'.", default: "1d" },
          max_records: { type: "integer", default: 25, minimum: 1, maximum: 250 },
        },
        required: ["query"],
      },
      handler: async (args, ctx) => {
        const c = new GdeltClient(ctx.env as unknown as GdeltEnv);
        const out = await c.searchArticles({
          query: args.query, country: args.country, domain: args.domain,
          timespan: args.timespan ?? "1d", maxRecords: args.max_records ?? 25,
        });
        return { count: out.length, articles: out };
      },
    },

    {
      name: "gdelt_tone_timeseries",
      description:
        "Sentiment-tone timeseries for a query. Returns one row per time step (hourly or daily) with the average tone (-10 most negative, +10 most positive) and article volume.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          country: { type: "string" },
          timespan: { type: "string", default: "7d" },
          granularity: { type: "string", enum: ["hour", "day"], default: "day" },
        },
        required: ["query"],
      },
      handler: async (args, ctx) => {
        const c = new GdeltClient(ctx.env as unknown as GdeltEnv);
        const ts = await c.toneTimeseries({
          query: args.query, country: args.country,
          timespan: args.timespan ?? "7d", granularity: args.granularity ?? "day",
        });
        return { count: ts.length, timeseries: ts };
      },
    },

    {
      name: "gdelt_trending_actors",
      description:
        "Top mentioned named entities (people, organizations, places) in news for a country in the last N hours. Returns name + mentions count.",
      inputSchema: {
        type: "object",
        properties: {
          country: { type: "string", description: "Source-country ISO 2-letter." },
          window: { type: "string", default: "1d" },
          limit: { type: "integer", default: 20, minimum: 1, maximum: 100 },
        },
        required: ["country"],
      },
      handler: async (args, ctx) => {
        const c = new GdeltClient(ctx.env as unknown as GdeltEnv);
        const out = await c.trendingActors({ country: args.country, window: args.window, limit: args.limit ?? 20 });
        return { count: out.length, actors: out };
      },
    },

    {
      name: "gdelt_compare",
      description:
        "Side-by-side tone timeseries for two queries — useful for 'how is the press treating X vs Y?'. Premium tool.",
      inputSchema: {
        type: "object",
        properties: {
          query_a: { type: "string" },
          query_b: { type: "string" },
          country: { type: "string" },
          timespan: { type: "string", default: "7d" },
        },
        required: ["query_a", "query_b"],
      },
      premium: true,
      handler: async (args, ctx) => {
        const c = new GdeltClient(ctx.env as unknown as GdeltEnv);
        return await c.compareQueries(args.query_a, args.query_b, { country: args.country, timespan: args.timespan ?? "7d" });
      },
    },
  ];
}

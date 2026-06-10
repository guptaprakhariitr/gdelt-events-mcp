# Tools Reference — gdelt-events-mcp

Per-tool reference for AI agents. The descriptions below are what the LLM reads to decide whether to call your tool — verbatim from `src/tools.ts`.

## `gdelt_search_events`

Search global news for events matching a query. Optionally filter by source country (ISO 2-letter) or domain. Returns recent articles with title, URL, source, language, country, tone.

See `src/tools.ts` for the JSON Schema input.

## `gdelt_tone_timeseries`

Sentiment-tone timeseries for a query. Returns one row per time step (hourly or daily) with the average tone (-10 most negative, +10 most positive) and article volume.

See `src/tools.ts` for the JSON Schema input.

## `gdelt_trending_actors`

Top mentioned named entities (people, organizations, places) in news for a country in the last N hours. Returns name + mentions count.

See `src/tools.ts` for the JSON Schema input.

## `gdelt_compare`

Side-by-side tone timeseries for two queries — useful for 'how is the press treating X vs Y?'. Premium tool.

See `src/tools.ts` for the JSON Schema input.

## Client setup

### Cursor / Claude Desktop / Cline
```json
{
  "mcpServers": {
    "gdelt-events-mcp": {
      "url": "https://gdelt-events-mcp.atlasword.workers.dev/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

Anonymous requests get the free tier (100 calls/month, 10/min). Upgrade at `/upgrade?tier=solo|team|pro`.
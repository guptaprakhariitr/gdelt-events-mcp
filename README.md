# gdelt-events-mcp — SCAFFOLD

> Macro / geopolitical event detection. Wraps the **GDELT 2.0** project — real-time event extraction from world news, with actor/location/sentiment metadata. Free underlying data; most people don't know GDELT exists.

**Status:** scaffolded. Idea #24 in [`../../../ai-as-customer-ideas.md`](../../../ai-as-customer-ideas.md).

---

## What GDELT is

- A free, ongoing project that ingests global news every 15 minutes, runs entity / event / sentiment extraction, and publishes the results as queryable APIs + bulk dumps.
- Schema includes: actors (Country, organization, person), event type (CAMEO codes), date, location, tone (-10 to +10), URL.
- Endpoint: `https://api.gdeltproject.org/api/v2/`.
- Bulk: 15-minute CSV files going back to 2015 (~500GB total, but daily slice is small).

## Planned tools

| Tool | What it returns |
|---|---|
| `gdelt_search_events(query, country?, actor?, date_range, tone_range?)` | Events matching filter; sorted by recency or relevance. |
| `gdelt_trending_actors(country, window?)` | Most-mentioned actors in a country in last N hours. |
| `gdelt_tone_timeseries(query, granularity, range)` | Sentiment timeseries for a topic (e.g. "How has news tone about <company> trended?"). |
| `gdelt_geographic_heatmap(query, date_range)` | Premium: geographic distribution of an event. |
| `gdelt_compare(query_a, query_b, range)` | Premium: side-by-side volume + tone comparison. |

## Audience

- Macro / hedge fund agents tracking geopolitical risk.
- Investor agents doing sentiment analysis on companies/countries.
- Newsroom agents finding "where is this story being covered?".
- ESG / impact agents tracking events in regions of interest.

## Open / closed split

- **Open**: thin GDELT API wrapper, query builder.
- **Closed**: precomputed actor and topic indexes (the GDELT bulk data is overwhelming raw; the moat is preprocessing it).

## Notes

- GDELT's own query syntax is quirky; abstracting it into a clean MCP surface is the value add.
- This product is **niche but high-margin** — small audience, but each customer pays well (macro funds, journalism teams).
- Easy to ship — GDELT API is REST/JSON, well-documented.

## See also

- [`../sec-edgar-mcp/`](../sec-edgar-mcp/) — reference implementation; macro audience overlap.
- [`../README.md`](../README.md) — Category 1 pipeline.


---

## Sister MCPs

All from the same operator, all live on `<product>.prakhar-cognizance.workers.dev`, all free-tier friendly:

| Group | Products |
|---|---|
| **Research** | [sec-edgar](https://github.com/guptaprakhariitr/sec-edgar-mcp) · [arxiv](https://github.com/guptaprakhariitr/arxiv-mcp) · [world-bank-economic](https://github.com/guptaprakhariitr/world-bank-economic-mcp) · [uspto-patents](https://github.com/guptaprakhariitr/uspto-patents-mcp) · [fda-approvals](https://github.com/guptaprakhariitr/fda-approvals-mcp) |
| **Verification + Utility** | [verification](https://github.com/guptaprakhariitr/verification-mcp) ⭐ · [unit-converter](https://github.com/guptaprakhariitr/unit-converter-mcp) |
| **India** | [indic-normalize](https://github.com/guptaprakhariitr/indic-normalize-mcp) · [indian-regulatory](https://github.com/guptaprakhariitr/indian-regulatory-mcp) |
| **Real-time** | [hn-trending](https://github.com/guptaprakhariitr/hn-trending-mcp) · [wikipedia-recent-changes](https://github.com/guptaprakhariitr/wikipedia-recent-changes-mcp) · [gdelt-events](https://github.com/guptaprakhariitr/gdelt-events-mcp) · [crypto-prices](https://github.com/guptaprakhariitr/crypto-prices-mcp) |
| **Healthcare** | [drug-interaction](https://github.com/guptaprakhariitr/drug-interaction-mcp) |
| **Logistics** | [multi-carrier-tracking](https://github.com/guptaprakhariitr/multi-carrier-tracking-mcp) |

Full catalog: https://github.com/guptaprakhariitr · ⭐ = empty-quadrant / highest-conviction pick.


# Registry Submission Checklist — gdelt-events-mcp

Pre-filled values for every MCP registry. Each submission takes 1–3 minutes in a browser.

## ✅ Already automatic

### Glama — `glama.ai`
Auto-crawls GitHub by repo topic `mcp-server`. Already tagged. Indexes within 24 hours.
- https://glama.ai/mcp/servers?q=gdelt-events-mcp

### Official MCP Registry
- The `server.json` at this repo's root is the registry manifest.
- Submit via: `mcp-publisher publish server.json` (after `make publisher` and `mcp-publisher login github` in the registry repo).
- Downstream registries (PulseMCP, mcp.so) ingest from here weekly.

## 🌐 Manual browser submission

### PulseMCP — single URL field
- https://www.pulsemcp.com/submit
- **Paste:** `https://github.com/guptaprakhariitr/gdelt-events-mcp`

### mcp.so — multi-field form
- https://mcp.so/submit
- **Name:** `gdelt-events-mcp`
- **Display name:** `GDELT Global Events`
- **Description:** `Real-time geopolitical event detection, tone timeseries, actor trends — wraps GDELT 2.0.`
- **GitHub URL:** `https://github.com/guptaprakhariitr/gdelt-events-mcp`
- **Endpoint URL:** `https://gdelt-events-mcp.prakhar-cognizance.workers.dev/mcp`
- **Tags:** gdelt, news, sentiment, geopolitics, macro, events
- **License:** MIT
- **Transport:** HTTP (remote)

### mcp.directory
- https://mcp.directory/submit
- Same values as mcp.so. Include a demo GIF if you can.

### Smithery (paid — $30/mo)
- https://smithery.ai/new
- Worth it if you have ≥6 paid subscribers.

### Cursor Marketplace
- Submit from Cursor → Settings → Marketplace → Submit. Curated; 1–2 weeks for approval.

## Social

### Show HN
- Title: `Show HN: gdelt-events-mcp — GDELT Global Events as an MCP for Claude / Cursor`
- URL: `https://github.com/guptaprakhariitr/gdelt-events-mcp`

### Twitter / X thread template
> Just shipped gdelt-events-mcp — Model Context Protocol server: real-time geopolitical event detection, tone timeseries, actor trends — wraps gdelt 2.
>
> Endpoint: https://gdelt-events-mcp.prakhar-cognizance.workers.dev/mcp
> GitHub: https://github.com/guptaprakhariitr/gdelt-events-mcp
>
> Free tier available. Paid from $9/mo.

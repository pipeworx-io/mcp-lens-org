# @pipeworx/lens-org

[The Lens](https://www.lens.org) MCP — global patent + scholarly search platform. Free academic API key required (Lens authorisation token).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Auth

- Platform key: `PLATFORM_LENS_KEY` (Bearer token from https://www.lens.org/lens/user/subscriptions).
- BYO: pass `?_apiKey=<token>` on the gateway URL.

## Tools

- `patents_search(query, size?, from?)` — patent search (Lucene-style query against the Lens patent index)
- `scholarly_search(query, size?, from?)` — scholarly works search
- `patent(lens_id)` — single patent record
- `scholarly(lens_id)` — single scholarly work

## Data source

`https://api.lens.org/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "lens-org": {
      "url": "https://gateway.pipeworx.io/lens-org/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Lens Org data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

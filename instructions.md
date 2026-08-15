# OpenSERP

OpenSERP provides a self-hosted API for web search, image search, multi-engine
search, and web-page extraction.

## Getting Started

1. Start OpenSERP and wait for the **API** and **MCP** health checks to become
   healthy.
2. Open the **API** interface. StartOS opens OpenSERP's interactive Swagger
   documentation at `/docs`.
3. Use the service address shown by StartOS as your API base URL. The assigned
   external port may differ from 7000.

For example, append this path to the service address to query DuckDuckGo:

```text
/duckduckgo/search?text=StartOS&limit=5
```

Useful endpoints include:

- `/mega/search?text=privacy` for multi-engine web search
- `/bing/image?text=StartOS` for image search
- `/extract?url=https://example.com&format=markdown` for page extraction
- `/health` and `/ready` for service status
- `/openapi.yaml` for the machine-readable API specification

## Access Warning

The open-source OpenSERP server has no built-in authentication. Anyone who can
reach an enabled OpenSERP interface address can use all API endpoints. Only
enable interface addresses for clients you trust, or place a separate
authenticating proxy in front of the service.

Search caches, cookies, browser sessions, and proxy health are memory-only and
reset when the service restarts. OpenSERP stores no user data that needs backup.

## Connect Hermes Agent

The MCP server is intentionally not shown as a user-facing StartOS interface.
Hermes should connect through StartOS service-to-service networking.

The Hermes StartOS package should declare OpenSERP as a running dependency and
resolve this binding instead of hard-coding an address:

```text
package ID: openserp
host ID:    mcp
port:       3333
protocol:   HTTP
path:       /mcp
```

Its resulting Hermes configuration is:

```yaml
mcp_servers:
  openserp:
    url: "http://<resolved-bridge-address>/mcp"
    connect_timeout: 30
    timeout: 120
    supports_parallel_tool_calls: true
```

Restart Hermes or run `/reload-mcp` after changing its MCP configuration. Hermes
registers tools with names such as `mcp_openserp_search`,
`mcp_openserp_mega_search`, and `mcp_openserp_extract`.

The bridge address and assigned port are selected by StartOS and can change.
Do not use `localhost`, a `.startos` hostname, or assume external port 3333 from
the Hermes package. Hermes package code should use `sdk.host.getBridgeAddress`
with the contract above.

## Documentation

- [OpenSERP documentation](https://openserp.org/docs/) covers endpoints,
  parameters, formats, extraction, and client examples.
- [OpenSERP MCP](https://github.com/openserpapi/mcp) documents the available
  agent tools and MCP transports.
- [Interactive API reference](https://openserp.org/docs/#api-docs) explains the
  Swagger and OpenAPI endpoints included in the running service.
- [Architecture](https://openserp.org/docs/architecture/) describes browser and
  raw HTTP modes, resilience, caching, and proxy behavior.

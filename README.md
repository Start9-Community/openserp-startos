<p align="center">
  <img src="icon.svg" alt="OpenSERP Logo" width="40%">
</p>

# OpenSERP on StartOS

> Everything not listed here should behave the same as upstream OpenSERP.

OpenSERP is a self-hosted HTTP API and CLI for structured web and image search
across Google, Yandex, Baidu, Bing, DuckDuckGo, and Ecosia. The StartOS package
exposes the API and its interactive OpenAPI documentation, and provides an MCP
server for AI agents running as other StartOS services.

## Image and Container Runtime

The package uses the upstream `karust/openserp` image declared in
`startos/manifest/index.ts`. That multi-architecture image includes the Go
server and Chromium headless shell and runs as its non-root `chrome` user.

The daemon preserves the upstream `openserp` entrypoint and supplies
`serve -a 0.0.0.0 -p 7000`. It runs as `runAsInit`, making the server PID 1 in
its own PID namespace — when the server exits, the kernel tears down the
namespace, so orphaned Chromium children are cleaned up rather than leaking
under a non-reaping init. This mirrors the cleanup upstream gets from Compose's
`init: true` / `docker run --init`.

The package builds a second, non-root image from `mcp/Dockerfile`. It pins Node,
`@openserp/mcp`, and the complete npm dependency graph. StartOS runs the adapter
as a separate daemon after the OpenSERP health check succeeds. The adapter uses
the shared package network namespace to call `http://127.0.0.1:7000` and serves
Streamable HTTP MCP at `/mcp` on port 3333.

The wrapper applies conservative fixed settings:

- invalid upstream TLS certificates are rejected;
- request-supplied proxy URLs are disabled;
- browser concurrency is capped at two processes;
- leakless browser cleanup is enabled;
- CORS is disabled because this is an API interface, not a browser application.

## Volume and Data Layout

OpenSERP has no database or durable result store. Search cache, cookies, proxy
health, browser lanes, and circuit-breaker state are held in memory and reset
when the service restarts. The StartOS SDK requires a package volume, so the
declared `main` volume is intentionally not mounted into the container.

## Network Access and Interfaces

The `api` interface forwards HTTP to container port 7000. StartOS handles the
external address and TLS. The interface opens `/docs`, while clients use the
root service address for API requests.

The `mcp` host binds port 3333 as plaintext HTTP without exporting a user-facing
interface. A consumer such as Hermes must resolve package `openserp`, host ID
`mcp`, internal port `3333`, and connect to
`http://<resolved-bridge-address>/mcp`. The preferred external port is not a
stable address and must not be hard-coded by a consuming package.

The missing interface export keeps MCP out of the StartOS address UI and
prevents configured LAN/Tor gateway addresses. On the tested StartOS 0.4.0.1
host, a bound-but-unexported port is not reachable on the server's LAN IP: the
binding is effectively bridge-only and `http://<server-lan-ip>:3333` is refused.
This differs from the earlier StartOS 0.4.0 beta.9 host, where the raw port was
still LAN-reachable despite the missing export — recheck on each supported OS
version.

OpenSERP OSS does not implement authentication. Every client that can reach an
enabled interface address can use search, extraction, statistics, docs, and
health endpoints. Interface exposure is chosen by the StartOS administrator;
do not enable an address for untrusted clients without a separate authenticating
proxy.

The MCP transport also has no authentication. Other installed services with
bridge access can connect to it; the unexported binding has no StartOS interface
address, so nothing in the address UI exposes it, and on the tested 0.4.0.1 host
it is not reachable on the server's LAN IP. Web content returned by search and
extraction is untrusted input for any connected agent.

## Actions

None. This first package revision intentionally uses hardened static settings.

## Backups and Restore

The required empty `main` volume participates in StartOS backups. There is no
application state to preserve or restore.

## Health Checks

The OpenSERP daemon calls `GET /health` after a 30-second grace period. Upstream
returns success when at least one engine is available and reports engine and
runtime status in the response. The MCP daemon starts only after that check and
then calls its own `GET /health`. The adapter health endpoint only proves that
the MCP transport is listening; backend health remains covered by the OpenSERP
daemon check.

## Dependencies

None. OpenSERP requires outbound DNS and HTTP/HTTPS access to search engines and
extraction targets. Proxy services and 2Captcha are optional upstream features
and are not configured by this package revision.

## Limitations and Differences

- OpenSERP remains unauthenticated; StartOS interface type is metadata, not an
  authorization control.
- The MCP endpoint has no transport authentication or Origin allowlist. The
  unexported binding is bridge-only on the tested StartOS 0.4.0.1 host (the raw
  port is not LAN-reachable), but there is no package-level mechanism enforcing
  that isolation, so recheck it after OS/runtime changes and on each supported
  host.
- StartOS provides the subcontainer with a 2 GiB `/dev/shm`, matching
  upstream Compose. The SDK has no package declaration for this setting, so
  it must be rechecked after OS/runtime changes and on each supported host.
- Custom proxy pools, 2Captcha, engine rate limits, and other advanced config
  are not exposed as StartOS actions yet.
- Runtime caches and cookies intentionally do not survive a restart.

## What Is Unchanged from Upstream

Search and image endpoints, megasearch, URL extraction, output formats,
OpenAPI documentation, health/readiness endpoints, response caching, resilience,
and bundled Chromium behavior come directly from upstream. MCP tool schemas and
transport behavior come from the official `@openserp/mcp` package.

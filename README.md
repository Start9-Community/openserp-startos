<p align="center">
  <img src="icon.svg" alt="OpenSERP Logo" width="21%">
</p>

# OpenSERP on StartOS

> Everything not listed in this document should behave the same as upstream
> OpenSERP. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

OpenSERP is a self-hosted API that returns structured results from Google,
Yandex, Baidu, Bing, DuckDuckGo, and Ecosia, and extracts the pages it finds.
This package runs the upstream server with a hardened fixed configuration and
adds a second container running the official MCP adapter, so AI agents can use
the same search backend as tools.

- **Upstream repo:** <https://github.com/karust/openserp>
- **Wrapper repo:** <https://github.com/Start9-Community/openserp-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Two images: the upstream server, and a small one this repository builds.

| Property      | Value                                                     |
| ------------- | --------------------------------------------------------- |
| Images        | `karust/openserp` (upstream), plus `mcp` built from `mcp/` |
| Architectures | x86_64, aarch64                                            |
| Commands      | both images' own entrypoints, with arguments               |

| Subcontainer | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| `openserp`   | The search server and its bundled headless Chromium       |
| `mcp`        | The MCP adapter, which calls the server over loopback     |

The upstream image carries the Go server and a Chromium headless shell and runs
as its unprivileged `chrome` user. The server is launched with `runAsInit` so
it becomes PID 1 of its own namespace: OpenSERP does not reap the browser
processes it spawns, and this makes the kernel do it when the server exits —
the cleanup upstream gets from Compose's `init: true`. Shutdown is given 45
seconds, because a search in flight can take 30 to drain.

The `mcp` image pins Node, `@openserp/mcp`, and the full dependency graph in
`mcp/package-lock.json`. It runs as the base image's `node` user. Both
containers share one network namespace, so the adapter reaches the server on
loopback.

The wrapper fixes the server's settings rather than exposing them:

- invalid upstream TLS certificates are rejected;
- request-supplied proxy URLs are refused;
- browser concurrency is capped at two processes;
- leakless browser cleanup is on;
- CORS is off, since nothing here is a browser application.

## Volume and Data Layout

Nothing is persisted.

| Volume | Mount Point | Purpose                                     |
| ------ | ----------- | ------------------------------------------- |
| `main` | not mounted | Declared to satisfy the SDK; holds nothing  |

Search cache, cookies, proxy health, browser lanes, and circuit-breaker state
live in memory and are gone at restart. That is upstream's design, not a
packaging choice — there is no database and no result store to keep.

## File Models

One model, and it holds nothing OpenSERP itself reads.

| Model        | File                          | Format |
| ------------ | ----------------------------- | ------ |
| `store.json` | `store.json` on `main`'s root | JSON   |

It holds one key, `apiPassword`, written only by the **Set API Password**
action. `setupInterfaces` reads it reactively and hands it to the OS reverse
proxy, so rotating it re-arms the gate without a restart. An empty value leaves
the addresses ungated, which is why the critical task keeps the service stopped
until one is set.

Everything OpenSERP itself reads is delivered as an environment variable at
launch, and the image's own `config.yml` is left as shipped — there is no
application configuration on disk to inspect or correct.

## Dependencies

None. OpenSERP does need outbound DNS and HTTPS to reach the search engines and
the pages it extracts; a server with no egress will start and pass its health
check but fail every query.

## Network Access and Interfaces

Two interfaces, both plain HTTP terminated by StartOS.

| Interface | Id    | Type | Port | Description                                          |
| --------- | ----- | ---- | ---- | ---------------------------------------------------- |
| API       | `api` | api  | 7000 | Search, extraction, statistics, and the Swagger docs |
| MCP       | `mcp` | api  | 3333 | Streamable HTTP transport for agent tools            |

The API interface opens at `/docs`; callers use the root of the address as
their base URL. The MCP interface opens at `/mcp`, which is also the path an
agent connects to.

**OpenSERP has no authentication of its own**, so this package has StartOS
supply it. Both bindings carry `addSsl.auth`, an HTTP basic gate the OS reverse
proxy enforces before a request reaches the container: every address answers
`401` with `WWW-Authenticate: Basic realm="OpenSERP"` until the caller presents
the username `admin` and the stored password. Nothing inside the container
changes — the gate is entirely at the edge.

The gate rides on the TLS variant, which is every address a person can reach:
LAN, mDNS, private and public domains. The plaintext binding is bridge and
loopback only, and stays open, so **a sibling service resolving this package's
host and internal port — `openserp` / `mcp` / `3333` for the adapter — needs no
credential.** That is deliberate: service-to-service traffic never leaves the
box. The external port is assigned by StartOS and must not be hard-coded.

What the gate does not cover: web content returned by a search is still
untrusted input for whatever agent consumes it.

## Installation and First-Run Flow

**The service will not start until an API password is set.** A `critical` task
raised at install points at the action that sets one, and StartOS refuses
`start` while it stands. That ordering is the point: OpenSERP will happily serve
an open search-and-fetch API to anyone who can reach it, so the package never
lets it listen before the gate exists.

Nothing else is configured. Once the password is set the server starts, and the
MCP adapter follows once the server's health check passes.

## Actions

One action, used once for setup and thereafter for rotation.

**Set API Password** (`set-password`)

- **When to run it** — at install, when the critical task asks for it; later,
  whenever the password should be rotated or has been lost.
- **What it changes** — `apiPassword` in `store.json`, and through it the
  credential the OS reverse proxy enforces. Nothing inside the container.
- **Cost** — seconds, with no restart: the interfaces re-arm reactively.
- **Repeat safety** — safe to repeat; each run replaces the credential, and
  every client still using the old one starts getting `401`.
- **Outputs** — the username (always `admin`) and the password, masked and
  copyable. The form pre-fills with the current password, so it doubles as a
  way to look it up.

## Tasks

One task, and it blocks startup by design.

| Task             | Severity   | Raised by                            | Cleared by         |
| ---------------- | ---------- | ------------------------------------ | ------------------ |
| Set API Password | `critical` | Init, whenever no password is stored | Running the action |

Being `critical`, it suspends the service's ordinary controls until satisfied —
correct here, because starting without it would publish an unauthenticated
search API. The condition is re-evaluated reactively, so setting the password
clears the task without a restart.

## Health Checks

Two checks, one per container, ordered.

| Check      | Displayed | Method                                        | Grace |
| ---------- | --------- | --------------------------------------------- | ----- |
| `openserp` | "API"     | `GET /health` run inside the server container | 30 s  |
| `mcp`      | "MCP"     | `GET /health` on the adapter                  | 5 s   |

Upstream's `/health` succeeds when at least one search engine is available and
reports per-engine status in its body, so a failure after the grace period
usually means egress is blocked or every engine is rate-limiting — check the
body before suspecting the container. The adapter's check only proves its
transport is listening; the server's check is what covers the backend. The
adapter does not start until the server is ready, so an `mcp` failure with
`openserp` green points at the adapter itself.

## Backups and Restore

The declared `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`
— and it is empty. There is no application state to preserve, and a restored
instance is immediately equivalent to a fresh one.

## Limitations and Differences

1. **The authentication is StartOS's, not OpenSERP's.** Upstream ships no login
   at all; this package gates both addresses with HTTP basic at the OS reverse
   proxy. Every client therefore needs the credential, including MCP clients,
   which must be able to send an `Authorization` header or accept it in the URL.
   A sibling service on this server reaches the bridge address and is exempt.
2. **No proxy pool, no 2Captcha, no engine tuning.** Upstream supports all
   three; this package ships fixed settings and exposes no action to change
   them.
3. **Caches and cookies do not survive a restart.** Held in memory by design, so
   the first query after a restart pays full latency.
4. **Search depends on the engines cooperating.** Rate limiting and CAPTCHAs at
   the far end surface as failed queries against a healthy service.

---

## Quick Reference for AI Consumers

```yaml
package_id: openserp
image: karust/openserp # plus a locally built `mcp` image
architectures:
  - x86_64
  - aarch64
subcontainers:
  - openserp # the search server
  - mcp # the MCP adapter
volumes:
  main: null # declared, never mounted
file_models:
  - store.json
startos_managed_env_vars:
  - OPENSERP_SERVER_HOST
  - OPENSERP_SERVER_PORT
  - OPENSERP_SERVER_INSECURE
  - OPENSERP_PROXIES_ALLOW_REQUEST_PROXY_URL
  - OPENSERP_CORS_ENABLED
  - OPENSERP_APP_BROWSER_PATH
  - OPENSERP_APP_MAX_PROCESSES
  - OPENSERP_APP_LEAKLESS
  - OPENSERP_APP_LOG_FORMAT
  - OPENSERP_BACKEND
  - OPENSERP_BASE_URL
  - OPENSERP_TIMEOUT_MS
dependencies: []
interfaces: # both gated by proxy-enforced HTTP basic, user `admin`
  api: { type: api, port: 7000 }
  mcp: { type: api, port: 3333 }
actions:
  - set-password
tasks:
  - { action: set-password, severity: critical }
health_checks:
  - openserp # displayed "API"
  - mcp # displayed "MCP"
```

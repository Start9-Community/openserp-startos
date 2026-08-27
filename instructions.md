# OpenSERP

OpenSERP has no login of its own, so StartOS puts one in front of it. Setting
that password is the first thing you do, and the service will not start until
you have.

## Documentation

- [OpenSERP documentation](https://openserp.org/docs/) — endpoints, parameters, output formats, and client examples.
- [Interactive API reference](https://openserp.org/docs/#api-docs) — the Swagger and OpenAPI endpoints the running service serves.
- [Architecture](https://openserp.org/docs/architecture/) — browser and raw-HTTP modes, caching, resilience, and proxy behavior.
- [OpenSERP MCP](https://github.com/openserpapi/mcp) — the agent tools the MCP endpoint exposes.

## What you get on StartOS

- **A search API** that returns structured results from Google, Yandex, Baidu,
  Bing, DuckDuckGo, and Ecosia, and extracts the text of pages it finds. It
  opens on its own interactive documentation.
- **An MCP endpoint** on a second address, so an AI assistant can use the same
  search as a tool without you writing any glue.
- **A password on both of them**, which StartOS checks before anything reaches
  the service.
- **Nothing to configure and nothing stored.** No accounts, no database, no
  results kept between restarts.

## Getting set up

1. Open the service. It will be showing a **Set API Password** task — run it.
   Use the generate button, or type your own.
2. **Save the username and password.** The username is always `admin`. You will
   need both for every request, and for your browser the first time it opens
   either address.
3. Start the service and wait for the **API** and **MCP** health checks to go
   green.
4. Open the **API** interface. Your browser asks for the username and password,
   then lands on the interactive documentation where you can try any endpoint.
5. Use the address itself — without the documentation path — as the base URL for
   your own requests. For example:

   ```bash
   curl -u admin:<your-password> \
     "<address>/duckduckgo/search?text=StartOS&limit=5"
   ```

Endpoints worth knowing:

- `/mega/search?text=privacy` — search several engines at once
- `/bing/image?text=StartOS` — image search
- `/extract?url=https://example.com&format=markdown` — pull a page's text
- `/health` and `/ready` — what the service thinks of itself
- `/openapi.yaml` — the machine-readable specification

## Using OpenSERP

### Connecting an AI assistant

The **MCP** interface is a Model Context Protocol endpoint. Point any MCP client
at that address and it gains search and extraction as tools, named `search`,
`mega_search`, and `extract`.

Your client has to send the same username and password. Most accept either a
custom `Authorization` header or credentials in the URL
(`https://admin:<your-password>@<host>:<port>/mcp`). A client that can do
neither cannot use this endpoint.

**Another service on this same server does not need the password.** Services
talk to each other over an internal address that never leaves the machine, and
that address is not behind the gate. Only addresses reachable from outside the
server ask for credentials.

### If you lose the password

Run **Actions → Set API Password** again. The form shows the current password,
so it doubles as a way to look it up, and saving a new one takes effect
immediately. Anything still using the old password will start getting rejected.

### Searches that fail on a healthy service

The engines OpenSERP queries push back on automated traffic. A query that
returns nothing, or an error, while the health check stays green usually means
an engine is rate-limiting or serving a CAPTCHA — try another engine, or
`/mega/search` to spread the load. Nothing on the StartOS side needs restarting.

### Actions

- **Set API Password** — sets or rotates the password guarding both addresses,
  and shows you the one currently in effect.

## Limitations

- Proxy pools, 2Captcha, and per-engine tuning are supported upstream but not
  exposed here.
- Search results are whatever the web returned. An assistant reading them is
  reading untrusted text; treat its conclusions accordingly.

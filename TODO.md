# OpenSERP Release Checklist

## Publication Metadata

- [ ] Create the package repository and replace the temporary upstream URL in
      `manifest.packageRepo` with its verified final URL.

## Runtime Verification

- [x] Install corrected package revision `0.8.12:2` and repeat API, MCP,
      cross-service bridge, LAN exposure, and restart checks. API and MCP recover
      after restart; bridge access works; the unauthenticated raw LAN port remains
      reachable as documented below.

- [x] Install package revision `0.8.12:1` on the x86_64 StartOS beta.9 test host
      and confirm the API and MCP processes become healthy.
- [x] Connect from another installed service through the `mcp` bridge binding,
      initialize MCP 2025-11-25, discover all nine tools, list six engines, and
      run a DuckDuckGo search.
- [x] Restart revision `0.8.12:1` and confirm both processes recover, all six
      engines are ready, and MCP search succeeds again.
- [ ] Add transport authentication or confirm a StartOS mechanism that prevents
      the raw MCP binding from listening on the LAN. On beta.9,
      `http://<server-lan-ip>:3333/health` is reachable despite no exported MCP
      interface addresses.

- [x] Install the x86_64 package revision `0.8.12:0` on the StartOS beta.9 test
      host.
- [x] On revision `0.8.12:0`, confirm the API interface opens `/docs` and
      `/health` becomes healthy.
- [x] On revision `0.8.12:0`, run browser-backed web and image searches through
      the StartOS proxy.
- [x] On revision `0.8.12:0`, run rendered URL extraction through the StartOS
      proxy. Fast extraction
      returned upstream HTTP 502 `extract_failed` for `example.com`; rendered
      mode returned Markdown successfully.
- [ ] Exercise repeated and concurrent searches while checking Chromium cleanup,
      memory use, shared-memory failures, and stop latency. Basic stop/start and
      cleanup passed; an upstream Google request returned HTTP 429 during the
      load probe, so broader load testing remains.
- [x] On revision `0.8.12:0`, restart and confirm the API and a browser-backed
      search recover cleanly; no stale Chromium processes remain after restart.
- [ ] Complete backup, uninstall, restore, and startup verification.
- [ ] Repeat browser acceptance tests on native aarch64 hardware before release.

## Future Configuration

- [ ] Consider typed StartOS configuration for proxy pools, 2Captcha, engine
      rates, extraction limits, cache settings, and browser concurrency.
- [ ] Consider an authenticating sidecar if a well-maintained, multi-arch option
      can protect every route without breaking streaming or SDK clients.

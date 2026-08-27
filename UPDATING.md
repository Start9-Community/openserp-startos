# Updating the upstream version

This package pins two things independently: the upstream
[OpenSERP](https://github.com/karust/openserp) image, and the MCP adapter built
from `mcp/`.

## Determining the upstream version

- **openserp** ([karust/openserp](https://github.com/karust/openserp)) — pick a
  stable numeric tag from Docker Hub; never `latest` or a floating minor:

  ```sh
  docker buildx imagetools inspect karust/openserp:<new version> \
    --format '{{range .Manifest.Manifests}}{{.Platform.OS}}/{{.Platform.Architecture}} {{end}}'
  ```

  Both `linux/amd64` and `linux/arm64` must be present. The current pin lives in
  `startos/manifest/index.ts` at `images.openserp.source.dockerTag`.

- **@openserp/mcp** ([openserpapi/mcp](https://github.com/openserpapi/mcp)) —
  the adapter is pinned in `mcp/package.json`, its graph in
  `mcp/package-lock.json`, and its Node base by digest in `mcp/Dockerfile`.

## Applying the bump

- Bump `dockerTag` in `startos/manifest/index.ts`.
- Set `version` in `startos/versions/current.ts` to `<new version>:0` and
  rewrite `releaseNotes` in every locale.
- Compare the tagged Dockerfile, Compose file, config sample, and OpenAPI spec
  against what this package assumes: the entrypoint and its `serve` flags, the
  `chrome` user, the browser path in `OPENSERP_APP_BROWSER_PATH`, the internal
  port, and the `OPENSERP_*` variable names the wrapper sets.
- Check for new defaults around CORS, TLS verification, and request-supplied
  proxy URLs — the package turns all three off, and a rename silently restores
  upstream's default.
- Browser-backed search behaves differently per architecture. Exercise a real
  web search, an image search, and an extraction on native x86_64 and aarch64
  before publishing both.

## Bumping the MCP adapter

1. Confirm the release supports amd64 and arm64.
2. Regenerate the lock in `mcp/` with
   `npm install --package-lock-only --ignore-scripts`, read the dependency diff,
   and run `npm audit --omit=dev`.
3. Update the Node base digest in `mcp/Dockerfile` and verify it with
   `docker buildx imagetools inspect`.
4. Build both architectures and check `/health`, MCP initialization,
   `tools/list`, one real search through a tool call, and a graceful restart.
5. Re-read the transport for changes to its route, protocol version, or
   authentication — the endpoint is exported as a user-facing interface, so a
   change in what it accepts is a change in this package's exposure.

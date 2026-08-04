# Updating OpenSERP

## Upstream Sources

- Releases: <https://github.com/karust/openserp/releases>
- Container images: <https://hub.docker.com/r/karust/openserp/tags>
- Dockerfile: <https://github.com/karust/openserp/blob/main/Dockerfile>
- Compose: <https://github.com/karust/openserp/blob/main/docker-compose.yaml>
- Configuration: <https://github.com/karust/openserp/blob/main/config.yaml>
- MCP releases: <https://www.npmjs.com/package/@openserp/mcp>
- MCP source: <https://github.com/openserpapi/mcp>

The currently packaged OCI index digest is
`sha256:9f5c5736fc7434862fa23dd0955e53d4003ffe42f151a5e1297085decf3100b7`.
The image tag is used in the SDK manifest because SDK 1.5.3 does not accept a
digest-qualified source; packing embeds the image resolved at build time.

## Procedure

1. Select a stable tagged release. Do not use `latest` or a floating minor tag.
2. Verify the tag exists for `linux/amd64` and `linux/arm64` with
   `docker buildx imagetools inspect karust/openserp:<version>`.
3. Pull and inspect the image entrypoint, user, environment, health check,
   browser path, and labels. Replace the recorded OCI index digest above.
4. Compare the tagged Dockerfile, Compose file, config sample, OpenAPI spec,
   and release notes against this package's runtime assumptions.
5. Update `dockerTag` in `startos/manifest/index.ts` and set
   `startos/versions/current.ts` to `<upstream-version>:0`.
6. Re-run type checking, bundling, packing, manifest/file-tree inspection, and
   installation on the StartOS test host.
7. Verify `/health`, `/ready`, `/docs`, one browser-backed web search, one image
   search, URL extraction, repeated searches, restart, stop, and backup/restore.
8. Repeat browser tests on native x86_64 and aarch64 hosts before publishing
   both architectures.

## MCP Runtime

The MCP adapter and its Node base are independently pinned in `mcp/package.json`,
`mcp/package-lock.json`, and `mcp/Dockerfile`. When updating either one:

1. Confirm the MCP release and Node image support amd64 and arm64.
2. Regenerate the lock with `npm install --package-lock-only --ignore-scripts`
   in `mcp/`, inspect dependency changes, and run `npm audit --omit=dev`.
3. Update the Node OCI index digest in the Dockerfile and verify it with
   `docker buildx imagetools inspect`.
4. Build both architectures and verify `/health`, MCP initialization,
   `tools/list`, a real search tool call, and graceful restart.
5. Recheck the HTTP transport for authentication, Origin validation, route, and
   protocol changes. The bridge-only binding must not be exported unless an
   authentication layer is added.

Pay particular attention to `/dev/shm`, Chromium ownership/path changes,
authentication changes, persistence paths, new ports, proxy defaults, CORS,
TLS verification, request-supplied proxy controls, and graceful shutdown.

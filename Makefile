# overrides to s9pk.mk must precede the include statement
ARCHES := x86 arm
# The `mcp` image is built via `docker buildx build`, which needs a
# docker-container driver (the default docker driver can't export the image).
# One-time setup: docker buildx create --name openserp-startos-builder
export BUILDX_BUILDER ?= openserp-startos-builder
include node_modules/@start9labs/start-sdk/s9pk.mk

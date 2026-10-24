ARG OPENSERP
ARG HEADLESS_SHELL
FROM ${OPENSERP} AS openserp

FROM ${HEADLESS_SHELL}

WORKDIR /usr/src/app

# The base image's CA store is only as current as its last release.
RUN apt-get update \
 && apt-get install -y --no-install-recommends wget ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr /etc/ssl/certs/ca-certificates.crt \
 && useradd --create-home --uid 1001 --shell /bin/bash chrome \
 && chown chrome:chrome /usr/src/app

COPY --from=openserp /usr/local/bin/openserp /usr/local/bin/openserp
COPY --from=openserp --chown=chrome:chrome /usr/src/app/config.yaml ./config.yaml

USER chrome

ENTRYPOINT ["openserp"]

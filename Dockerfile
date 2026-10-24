ARG OPENSERP
ARG HEADLESS_SHELL
FROM ${OPENSERP} AS openserp

FROM ${HEADLESS_SHELL}

WORKDIR /usr/src/app

RUN apt-get update \
 && apt-get install -y --no-install-recommends wget ca-certificates libnss3-tools \
 && rm -rf /var/lib/apt/lists/* \
 && ! grep -q MIICTjCCAdOgAwIBAgIKPPYHqWhwDtqLhDAKBggqhkjOPQQDAzBr /etc/ssl/certs/ca-certificates.crt \
 && useradd --create-home --uid 1001 --shell /bin/bash chrome \
 && chown chrome:chrome /usr/src/app

COPY --from=openserp /usr/local/bin/openserp /usr/local/bin/openserp
COPY --from=openserp --chown=chrome:chrome /usr/src/app/config.yaml ./config.yaml
COPY assets/emsign-ecc-root-ca-g3.pem /usr/local/share/openserp/emsign-ecc-root-ca-g3.pem

USER chrome
ENV HOME=/home/chrome

# Chromium's compiled root store still trusts G3; NSS distrust overrides it.
RUN mkdir -p "$HOME/.pki/nssdb" \
 && certutil -N --empty-password -d "sql:$HOME/.pki/nssdb" \
 && certutil -A -d "sql:$HOME/.pki/nssdb" -n 'emSign ECC Root CA - G3' \
      -t 'p,,' -a -i /usr/local/share/openserp/emsign-ecc-root-ca-g3.pem \
 && certutil -L -d "sql:$HOME/.pki/nssdb" | grep -Eq '[[:space:]]p,,[[:space:]]*$'

ENTRYPOINT ["openserp"]

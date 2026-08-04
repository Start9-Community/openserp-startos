FROM node:22.22.0-bookworm-slim@sha256:dd9d21971ec4395903fa6143c2b9267d048ae01ca6d3ea96f16cb30df6187d94

ENV NODE_ENV=production
WORKDIR /opt/openserp-mcp

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

USER node

ENTRYPOINT ["node", "node_modules/@openserp/mcp/dist/index.js"]
CMD ["--http", "--host", "0.0.0.0", "--port", "3333"]

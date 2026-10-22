FROM node:22.23.4-bookworm-slim@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d

ENV NODE_ENV=production
WORKDIR /opt/openserp-mcp

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

USER node

ENTRYPOINT ["node", "node_modules/@openserp/mcp/dist/index.js"]
CMD ["--http", "--host", "0.0.0.0", "--port", "3333"]

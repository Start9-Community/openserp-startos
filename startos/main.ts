import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, mcpPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting OpenSERP'))
  const openserpSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'openserp' },
    sdk.Mounts.of(),
    'openserp',
  )
  const mcpSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'mcp' },
    sdk.Mounts.of(),
    'mcp',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('openserp', {
      subcontainer: openserpSub,
      exec: {
        command: sdk.useEntrypoint([
          'serve',
          '-a',
          '0.0.0.0',
          '-p',
          String(apiPort),
        ]),
        // Matches upstream `docker run --init` for Chromium child reaping.
        runAsInit: true,
        // OpenSERP can spend up to 30 seconds draining active requests.
        sigtermTimeout: 45_000,
        env: {
          OPENSERP_SERVER_HOST: '0.0.0.0',
          OPENSERP_SERVER_PORT: String(apiPort),
          OPENSERP_SERVER_INSECURE: 'false',
          OPENSERP_PROXIES_ALLOW_REQUEST_PROXY_URL: 'false',
          OPENSERP_CORS_ENABLED: 'false',
          OPENSERP_APP_BROWSER_PATH: '/headless-shell/headless-shell',
          OPENSERP_APP_MAX_PROCESSES: '2',
          OPENSERP_APP_LEAKLESS: 'true',
          OPENSERP_APP_LOG_FORMAT: 'text',
        },
      },
      ready: {
        display: i18n('API'),
        gracePeriod: 30_000,
        fn: () =>
          sdk.healthCheck.runHealthScript(
            [
              'wget',
              '--quiet',
              '--output-document=-',
              `http://127.0.0.1:${apiPort}/health`,
            ],
            openserpSub,
            {
              message: () => i18n('The API is ready'),
              errorMessage: i18n('The API is not ready'),
            },
          ),
      },
      requires: [],
    })
    .addDaemon('mcp', {
      subcontainer: mcpSub,
      exec: {
        command: sdk.useEntrypoint([
          '--http',
          '--host',
          '0.0.0.0',
          '--port',
          String(mcpPort),
        ]),
        env: {
          OPENSERP_BACKEND: 'oss',
          OPENSERP_BASE_URL: `http://127.0.0.1:${apiPort}`,
          OPENSERP_TIMEOUT_MS: '120000',
        },
      },
      ready: {
        display: i18n('MCP'),
        gracePeriod: 5_000,
        fn: () =>
          sdk.healthCheck.checkWebUrl(
            effects,
            `http://127.0.0.1:${mcpPort}/health`,
            {
              successMessage: i18n('The MCP server is ready'),
              errorMessage: i18n('The MCP server is not ready'),
            },
          ),
      },
      requires: ['openserp'],
    })
})

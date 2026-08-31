import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, apiUsername, mcpHostId, mcpPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // OpenSERP itself has no authentication, so the OS reverse proxy supplies it.
  // Only the TLS addresses carry the gate; the plaintext bridge address stays
  // open, which is what a sibling service resolves.
  const password = await storeJson.read((s) => s?.apiPassword).const(effects)
  const addSsl = password
    ? {
        auth: {
          type: 'basic' as const,
          credentials: [{ username: apiUsername, password }],
          realm: 'OpenSERP',
        },
      }
    : undefined

  const apiHost = sdk.MultiHost.of(effects, 'api')
  const apiOrigin = await apiHost.bindPort(apiPort, {
    protocol: 'http',
    preferredExternalPort: apiPort,
    addSsl,
  })
  const api = sdk.createInterface(effects, {
    name: i18n('API'),
    id: 'api',
    description: i18n(
      'Search, extraction, health, statistics, and interactive API documentation.',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '/docs',
    query: {},
  })

  const mcpHost = sdk.MultiHost.of(effects, mcpHostId)
  const mcpOrigin = await mcpHost.bindPort(mcpPort, {
    protocol: 'http',
    preferredExternalPort: mcpPort,
    addSsl,
  })
  const mcp = sdk.createInterface(effects, {
    name: i18n('MCP'),
    id: 'mcp',
    description: i18n(
      'Streamable HTTP endpoint that exposes search and extraction as agent tools.',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '/mcp',
    query: {},
  })

  return [await apiOrigin.export([api]), await mcpOrigin.export([mcp])]
})

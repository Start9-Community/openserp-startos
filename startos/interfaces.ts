import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, mcpHostId, mcpPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  await sdk.MultiHost.of(effects, mcpHostId).bindPort(mcpPort, {
    protocol: null,
    preferredExternalPort: mcpPort,
    addSsl: null,
    secure: { ssl: false },
  })

  const host = sdk.MultiHost.of(effects, 'api')
  const origin = await host.bindPort(apiPort, {
    protocol: 'http',
    preferredExternalPort: 7000,
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
  return [await origin.export([api])]
})

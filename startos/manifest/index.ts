import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'openserp',
  title: 'OpenSERP',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/openserp-startos',
  upstreamRepo: 'https://github.com/karust/openserp',
  marketingUrl: 'https://openserp.org',
  donationUrl: null,
  description: { short, long },
  // OpenSERP is stateless; this volume is declared to satisfy the SDK and is
  // never mounted.
  volumes: ['main'],
  images: {
    openserp: {
      source: { dockerTag: 'karust/openserp:0.8.12' },
      arch: ['x86_64', 'aarch64'],
    },
    mcp: {
      source: {
        dockerBuild: {
          workdir: 'mcp',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  hardwareRequirements: { ram: 2 * 1024 ** 3 },
  dependencies: {},
})

import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'openserp',
  title: 'OpenSERP',
  license: 'MIT',
  // The SDK requires this field before the new package repository exists.
  // Replace it with the final package repository URL before publication.
  packageRepo: 'https://github.com/karust/openserp',
  upstreamRepo: 'https://github.com/karust/openserp',
  marketingUrl: 'https://openserp.org',
  donationUrl: null,
  description: { short, long },
  // SDK 1.5.3 requires a volume. OpenSERP is stateless, so it is not mounted.
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

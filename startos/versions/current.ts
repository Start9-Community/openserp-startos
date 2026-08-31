import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.8.12:0',
  releaseNotes: {
    en_US: 'Initial release of OpenSERP for StartOS.',
    es_ES: 'Versión inicial de OpenSERP para StartOS.',
    de_DE: 'Erstveröffentlichung von OpenSERP für StartOS.',
    pl_PL: 'Pierwsze wydanie OpenSERP dla StartOS.',
    fr_FR: 'Version initiale de OpenSERP pour StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.8.14:0',
  releaseNotes: {
    en_US:
      'Updates OpenSERP to 0.8.14 and its bundled Chromium. Stops trusting certificates from a compromised certificate authority (eMudhra).',
    es_ES:
      'Actualiza OpenSERP a 0.8.14 y su Chromium integrado. Deja de confiar en los certificados de una autoridad de certificación comprometida (eMudhra).',
    de_DE:
      'Aktualisiert OpenSERP auf 0.8.14 und das mitgelieferte Chromium. Vertraut Zertifikaten einer kompromittierten Zertifizierungsstelle (eMudhra) nicht mehr.',
    pl_PL:
      'Aktualizuje OpenSERP do wersji 0.8.14 wraz z dołączonym Chromium. Przestaje ufać certyfikatom przejętego urzędu certyfikacji (eMudhra).',
    fr_FR: `Met à jour OpenSERP vers 0.8.14 et son Chromium intégré. Ne fait plus confiance aux certificats d'une autorité de certification compromise (eMudhra).`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

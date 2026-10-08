import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.8.12:1',
  releaseNotes: {
    en_US:
      '- Set API Password asks for confirmation only when it replaces an existing password.',
    es_ES:
      '- Definir contraseña de la API pide confirmación solo cuando reemplaza una contraseña existente.',
    de_DE:
      '- „API-Passwort festlegen“ fragt nur dann nach einer Bestätigung, wenn es ein bestehendes Passwort ersetzt.',
    pl_PL:
      '- „Ustaw hasło API” prosi o potwierdzenie tylko wtedy, gdy zastępuje istniejące hasło.',
    fr_FR:
      "- Définir le mot de passe de l'API demande une confirmation uniquement lorsqu'il remplace un mot de passe existant.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

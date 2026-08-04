import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.8.12:2',
  releaseNotes: {
    en_US: 'Add an MCP server for AI agents and document its access boundary',
    es_ES: 'Añade un servidor MCP para agentes de IA y documenta sus límites de acceso',
    de_DE: 'Fügt einen MCP-Server für KI-Agenten hinzu und dokumentiert dessen Zugriffsgrenzen',
    pl_PL: 'Dodaje serwer MCP dla agentów AI i dokumentuje granice dostępu',
    fr_FR: 'Ajoute un serveur MCP pour les agents IA et documente ses limites d’accès',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting OpenSERP': 0,
  API: 1,
  'The API is ready': 2,
  'The API is not ready': 3,
  'Search, extraction, health, statistics, and interactive API documentation.': 4,
  MCP: 5,
  'The MCP server is ready': 6,
  'The MCP server is not ready': 7,
  'Streamable HTTP endpoint that exposes search and extraction as agent tools.': 8,
  // actions/setPassword.ts
  'Set API Password': 9,
  'Set or rotate the password protecting the API and MCP addresses. OpenSERP has no login of its own, so StartOS enforces this one at the edge.': 10,
  'Every client using the old password stops working.': 11,
  'The password for signing in as "admin". Use the generate button for a strong random one, or type your own.': 12,
  'API Password': 13,
  'Send these with every request to an OpenSERP address, as HTTP basic authentication.': 14,
  Username: 15,
  Password: 16,
  // init/watchPassword.ts
  'OpenSERP has no login of its own. Set a password before starting it, or anyone who can reach its address can search and fetch pages through your server.': 17,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

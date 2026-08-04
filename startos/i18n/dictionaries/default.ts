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
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

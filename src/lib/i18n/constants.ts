/**
 * Constants for internationalization
 */

export const SUPPORTED_LOCALES = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt'] as const
export const DEFAULT_LOCALE = 'en' as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number] 
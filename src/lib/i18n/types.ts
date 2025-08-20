/**
 * Types et utilitaires pour internationalisation
 * Centralise les constantes et les fonctions utilitaires pour l'i18n
 */

export type SupportedLanguage = 'en' | 'fr' | 'it' | 'es' | 'de' | 'nl' | 'pt'

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt']
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

export const ENABLED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'it', 'es', 'de']

export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  enabled: boolean
  isDefault: boolean
  sortOrder: number
  direction: 'ltr' | 'rtl'
  flag: string
}

export const LANGUAGES_CONFIG: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    enabled: true,
    isDefault: true,
    sortOrder: 1,
    direction: 'ltr',
    flag: '🇺🇸'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    enabled: true,
    isDefault: false,
    sortOrder: 2,
    direction: 'ltr',
    flag: '🇫🇷'
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    enabled: true,
    isDefault: false,
    sortOrder: 3,
    direction: 'ltr',
    flag: '🇮🇹'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    enabled: true,
    isDefault: false,
    sortOrder: 4,
    direction: 'ltr',
    flag: '🇪🇸'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    enabled: true,
    isDefault: false,
    sortOrder: 5,
    direction: 'ltr',
    flag: '🇩🇪'
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    enabled: false,
    isDefault: false,
    sortOrder: 6,
    direction: 'ltr',
    flag: '🇳🇱'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    enabled: false,
    isDefault: false,
    sortOrder: 7,
    direction: 'ltr',
    flag: '🇵🇹'
  }
}

// Headers pour informations i18n
export const I18N_HEADERS = {
  LANGUAGE: 'x-language',
  FALLBACK_USED: 'x-fallback-used',
  CACHE_STATUS: 'x-cache-status'
}

/**
 * Valide si un code de langue est supporté
 */
export function validateLanguageParam(lang: string | null | undefined): SupportedLanguage {
  if (!lang || !SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    return DEFAULT_LANGUAGE
  }
  return lang as SupportedLanguage
}

/**
 * Valide et normalise le paramètre de page
 */
export function validatePageParam(page: string | null | undefined): number {
  const parsedPage = parseInt(page || '1')
  if (isNaN(parsedPage) || parsedPage < 1) {
    return 1 // Default page
  }
  return parsedPage
}

/**
 * Valide et normalise le paramètre de limite
 */
export function validateLimitParam(limit: string, max: number = 100): number {
  const parsedLimit = parseInt(limit)
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    return 10 // Default limit
  }
  return Math.min(parsedLimit, max) // Capped at max
}

/**
 * Interface pour les traductions
 */
export interface Translation {
  languageCode: SupportedLanguage
  translationSource?: string
  quality_score?: number
  humanReviewed?: boolean
}

/**
 * Interface pour un résultat multilingue
 */
export interface MultilingualResult<T> {
  data: T
  meta: {
    language: SupportedLanguage
    fallbackCount: number
    originalLanguageCount: number
    cacheHit: boolean
    queryTime?: number
  }
}
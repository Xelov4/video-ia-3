/**
 * Types et Utilitaires pour le Système Multilingue
 * 
 * Définit les types partagés, validateurs et helpers pour
 * le système i18n de Video-IA.net
 * 
 * @author Video-IA.net Development Team
 */

// Types de base
export type SupportedLanguage = 'en' | 'fr' | 'it' | 'es' | 'de' | 'nl' | 'pt'

export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  flagEmoji: string
  fallbackLanguage?: SupportedLanguage
  enabled: boolean
  sortOrder: number
}

export interface TranslationMeta {
  resolvedLanguage: SupportedLanguage
  translationSource: 'exact' | 'fallback' | 'original'
  translationQuality: number
  isTranslated: boolean
}

// Configuration des langues
export const LANGUAGES_CONFIG: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flagEmoji: '🇺🇸',
    enabled: true,
    sortOrder: 1
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flagEmoji: '🇫🇷',
    fallbackLanguage: 'en',
    enabled: true,
    sortOrder: 2
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flagEmoji: '🇮🇹',
    fallbackLanguage: 'en',
    enabled: true,
    sortOrder: 3
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flagEmoji: '🇪🇸',
    fallbackLanguage: 'en',
    enabled: true,
    sortOrder: 4
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flagEmoji: '🇩🇪',
    fallbackLanguage: 'en',
    enabled: true,
    sortOrder: 5
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flagEmoji: '🇳🇱',
    fallbackLanguage: 'en',
    enabled: true,
    sortOrder: 6
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flagEmoji: '🇵🇹',
    fallbackLanguage: 'en',
    enabled: true,
    sortOrder: 7
  }
}

// Constantes utiles
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES_CONFIG) as SupportedLanguage[]
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'
export const ENABLED_LANGUAGES = SUPPORTED_LANGUAGES.filter(lang => LANGUAGES_CONFIG[lang].enabled)

// Validateurs
export function isValidLanguage(language: string): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
}

export function isEnabledLanguage(language: string): language is SupportedLanguage {
  return ENABLED_LANGUAGES.includes(language as SupportedLanguage)
}

// Utilitaires
export function getLanguageConfig(language: SupportedLanguage): LanguageConfig {
  return LANGUAGES_CONFIG[language]
}

export function getLanguageName(language: SupportedLanguage, inNative = false): string {
  const config = LANGUAGES_CONFIG[language]
  return inNative ? config.nativeName : config.name
}

export function getLanguageFlag(language: SupportedLanguage): string {
  return LANGUAGES_CONFIG[language].flagEmoji
}

export function getFallbackLanguage(language: SupportedLanguage): SupportedLanguage {
  return LANGUAGES_CONFIG[language].fallbackLanguage || DEFAULT_LANGUAGE
}

export function getLanguagesOrderedBySortOrder(): SupportedLanguage[] {
  return SUPPORTED_LANGUAGES.sort((a, b) => 
    LANGUAGES_CONFIG[a].sortOrder - LANGUAGES_CONFIG[b].sortOrder
  )
}

// Détection de langue basée sur Accept-Language header
export function detectLanguageFromHeader(acceptLanguageHeader: string | null): SupportedLanguage {
  if (!acceptLanguageHeader) {
    return DEFAULT_LANGUAGE
  }

  const languages = acceptLanguageHeader
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=')
      return {
        code: code.toLowerCase().substring(0, 2),
        quality: parseFloat(q)
      }
    })
    .sort((a, b) => b.quality - a.quality)

  for (const { code } of languages) {
    if (isEnabledLanguage(code)) {
      return code
    }
  }

  return DEFAULT_LANGUAGE
}

// Validation des paramètres de requête
export interface ValidationError extends Error {
  code: string
  field: string
}

export function validateLanguageParam(language: unknown): SupportedLanguage {
  if (typeof language !== 'string') {
    const error = new Error('Language must be a string') as ValidationError
    error.code = 'INVALID_TYPE'
    error.field = 'language'
    throw error
  }

  if (!isValidLanguage(language)) {
    const error = new Error(`Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`) as ValidationError
    error.code = 'INVALID_LANGUAGE'
    error.field = 'language'
    throw error
  }

  if (!isEnabledLanguage(language)) {
    const error = new Error(`Language not enabled: ${language}`) as ValidationError
    error.code = 'LANGUAGE_DISABLED'
    error.field = 'language'
    throw error
  }

  return language
}

export function validatePageParam(page: unknown): number {
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : page
  
  if (typeof pageNum !== 'number' || isNaN(pageNum) || pageNum < 1) {
    const error = new Error('Page must be a positive integer') as ValidationError
    error.code = 'INVALID_PAGE'
    error.field = 'page'
    throw error
  }

  return pageNum
}

export function validateLimitParam(limit: unknown, max = 100): number {
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit
  
  if (typeof limitNum !== 'number' || isNaN(limitNum) || limitNum < 1 || limitNum > max) {
    const error = new Error(`Limit must be between 1 and ${max}`) as ValidationError
    error.code = 'INVALID_LIMIT'
    error.field = 'limit'
    throw error
  }

  return limitNum
}

// Types pour les réponses API
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    language: SupportedLanguage
    timestamp: string
    version: string
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Headers spécialisés
export const I18N_HEADERS = {
  LANGUAGE: 'X-Language',
  FALLBACK_USED: 'X-Fallback-Used',
  TRANSLATION_QUALITY: 'X-Translation-Quality',
  CACHE_STATUS: 'X-Cache-Status'
} as const
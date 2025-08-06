/**
 * Context API pour Internationalisation
 * 
 * Fournit un state global pour l'état i18n de l'application.
 * Inclut langue courante, méthodes de navigation et préférences.
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import React, { createContext, useContext, useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SupportedLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/middleware'

// Types du context
interface I18nContextValue {
  // État actuel
  currentLanguage: SupportedLocale
  isDefaultLanguage: boolean
  supportedLanguages: readonly SupportedLocale[]
  defaultLanguage: SupportedLocale
  
  // Actions
  changeLanguage: (targetLanguage: SupportedLocale) => void
  getLocalizedPath: (path: string, language?: SupportedLocale) => string
  navigateToLocalized: (path: string, language?: SupportedLocale) => void
  
  // Métadonnées
  alternateUrls: Record<SupportedLocale, string>
  canonicalUrl: string
  
  // Utilitaires
  isLanguageSupported: (language: string) => boolean
  formatLanguageName: (language: SupportedLocale) => string
}

// Contexte
const I18nContext = createContext<I18nContextValue | null>(null)

// Configuration des langues avec métadonnées
const LANGUAGE_METADATA: Record<SupportedLocale, {
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
}> = {
  'en': { name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr' },
  'fr': { name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  'it': { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
  'es': { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  'de': { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  'nl': { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', direction: 'ltr' },
  'pt': { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', direction: 'ltr' },
}

// Props du provider
interface I18nProviderProps {
  children: React.ReactNode
  currentLanguage: SupportedLocale
}

/**
 * Provider du contexte i18n
 */
export function I18nProvider({ children, currentLanguage }: I18nProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Calculer si c'est la langue par défaut
  const isDefaultLanguage = currentLanguage === DEFAULT_LOCALE

  /**
   * Construire path localisé
   */
  const getLocalizedPath = useCallback((
    path: string,
    targetLanguage: SupportedLocale = currentLanguage
  ) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    
    return targetLanguage === DEFAULT_LOCALE 
      ? cleanPath
      : `/${targetLanguage}${cleanPath}`
  }, [currentLanguage])

  /**
   * Naviguer vers route localisée
   */
  const navigateToLocalized = useCallback((
    path: string,
    targetLanguage: SupportedLocale = currentLanguage
  ) => {
    const localizedPath = getLocalizedPath(path, targetLanguage)
    router.push(localizedPath)
  }, [router, getLocalizedPath, currentLanguage])

  /**
   * Changer de langue en préservant la route
   */
  const changeLanguage = useCallback((targetLanguage: SupportedLocale) => {
    if (targetLanguage === currentLanguage) return
    
    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'language_change', {
        from_language: currentLanguage,
        to_language: targetLanguage,
        page_path: pathname
      })
    }

    // Extraire path sans langue actuelle
    let pathWithoutLang = pathname
    const currentPrefix = currentLanguage === DEFAULT_LOCALE ? '' : `/${currentLanguage}`
    
    if (currentPrefix && pathWithoutLang.startsWith(currentPrefix)) {
      pathWithoutLang = pathWithoutLang.substring(currentPrefix.length) || '/'
    }

    // Construire nouvelle URL avec préservation des paramètres
    const newPath = getLocalizedPath(pathWithoutLang, targetLanguage)
    const params = searchParams.toString()
    const fullPath = params ? `${newPath}?${params}` : newPath

    // Sauvegarder préférence utilisateur
    document.cookie = `preferred-language=${targetLanguage}; max-age=${365 * 24 * 60 * 60}; path=/; ${
      process.env.NODE_ENV === 'production' ? 'secure; ' : ''
    }samesite=lax`

    // Navigation
    router.push(fullPath)
  }, [currentLanguage, pathname, searchParams, getLocalizedPath, router])

  /**
   * Générer URLs alternatives pour toutes les langues
   */
  const alternateUrls = useMemo(() => {
    // Extraire path sans langue
    let pathWithoutLang = pathname
    const currentPrefix = currentLanguage === DEFAULT_LOCALE ? '' : `/${currentLanguage}`
    
    if (currentPrefix && pathWithoutLang.startsWith(currentPrefix)) {
      pathWithoutLang = pathWithoutLang.substring(currentPrefix.length) || '/'
    }

    // Paramètres de recherche
    const params = searchParams.toString()
    const paramsSuffix = params ? `?${params}` : ''

    // Base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'

    // URLs pour chaque langue
    return SUPPORTED_LOCALES.reduce((acc, lang) => {
      const localizedPath = lang === DEFAULT_LOCALE 
        ? pathWithoutLang
        : `/${lang}${pathWithoutLang}`
      
      acc[lang] = `${baseUrl}${localizedPath}${paramsSuffix}`
      return acc
    }, {} as Record<SupportedLocale, string>)
  }, [pathname, searchParams, currentLanguage])

  /**
   * URL canonique pour la langue courante
   */
  const canonicalUrl = alternateUrls[currentLanguage]

  /**
   * Vérifier si une langue est supportée
   */
  const isLanguageSupported = useCallback((language: string): boolean => {
    return SUPPORTED_LOCALES.includes(language as SupportedLocale)
  }, [])

  /**
   * Formater nom de langue
   */
  const formatLanguageName = useCallback((language: SupportedLocale): string => {
    return LANGUAGE_METADATA[language]?.nativeName || language
  }, [])

  // Valeur du contexte
  const contextValue: I18nContextValue = useMemo(() => ({
    // État
    currentLanguage,
    isDefaultLanguage,
    supportedLanguages: SUPPORTED_LOCALES,
    defaultLanguage: DEFAULT_LOCALE,
    
    // Actions
    changeLanguage,
    getLocalizedPath,
    navigateToLocalized,
    
    // Métadonnées
    alternateUrls,
    canonicalUrl,
    
    // Utilitaires
    isLanguageSupported,
    formatLanguageName,
  }), [
    currentLanguage,
    isDefaultLanguage,
    changeLanguage,
    getLocalizedPath,
    navigateToLocalized,
    alternateUrls,
    canonicalUrl,
    isLanguageSupported,
    formatLanguageName
  ])

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * Hook pour utiliser le contexte i18n
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  
  return context
}

/**
 * Hook pour métadonnées de langue
 */
export function useLanguageMetadata(language: SupportedLocale = DEFAULT_LOCALE) {
  return useMemo(() => {
    const metadata = LANGUAGE_METADATA[language]
    
    if (!metadata) {
      throw new Error(`Language metadata not found for: ${language}`)
    }
    
    return {
      ...metadata,
      code: language,
      isSupported: SUPPORTED_LOCALES.includes(language),
      isDefault: language === DEFAULT_LOCALE
    }
  }, [language])
}

// Export des types et constantes
export type { I18nContextValue }
export { LANGUAGE_METADATA, SUPPORTED_LOCALES, DEFAULT_LOCALE }
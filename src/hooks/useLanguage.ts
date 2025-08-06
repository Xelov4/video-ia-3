/**
 * Custom Hooks pour Internationalisation
 * 
 * Collection de hooks React pour gérer l'état et les actions i18n.
 * Fournit une API simple et type-safe pour les composants.
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { SupportedLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/middleware'

/**
 * Hook principal pour gérer la langue courante
 */
export function useLanguage() {
  const pathname = usePathname()
  
  // Extraire langue de l'URL
  const currentLanguage = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0] as SupportedLocale
    
    return SUPPORTED_LOCALES.includes(firstSegment) 
      ? firstSegment 
      : DEFAULT_LOCALE
  }, [pathname])

  // Vérifier si c'est la langue par défaut
  const isDefaultLanguage = currentLanguage === DEFAULT_LOCALE

  return {
    currentLanguage,
    isDefaultLanguage,
    supportedLanguages: SUPPORTED_LOCALES,
    defaultLanguage: DEFAULT_LOCALE
  }
}

/**
 * Hook pour navigation localisée
 */
export function useLocalizedRouting() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { currentLanguage } = useLanguage()

  /**
   * Naviguer vers une route localisée
   */
  const navigateToLocalized = useCallback((
    path: string, 
    targetLanguage: SupportedLocale = currentLanguage,
    preserveSearchParams: boolean = true
  ) => {
    // Nettoyer le path
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    
    // Construire URL localisée
    const localizedPath = targetLanguage === DEFAULT_LOCALE 
      ? cleanPath
      : `/${targetLanguage}${cleanPath}`
    
    // Ajouter paramètres de recherche si demandé
    const params = preserveSearchParams ? searchParams.toString() : ''
    const fullPath = params ? `${localizedPath}?${params}` : localizedPath
    
    router.push(fullPath)
  }, [router, currentLanguage, searchParams])

  /**
   * Obtenir URL localisée sans naviguer
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
   * Changer de langue en préservant la route actuelle
   */
  const changeLanguage = useCallback((targetLanguage: SupportedLocale) => {
    if (targetLanguage === currentLanguage) return
    
    // Extraire path sans langue actuelle
    let pathWithoutLang = pathname
    const currentPrefix = currentLanguage === DEFAULT_LOCALE ? '' : `/${currentLanguage}`
    
    if (currentPrefix && pathWithoutLang.startsWith(currentPrefix)) {
      pathWithoutLang = pathWithoutLang.substring(currentPrefix.length) || '/'
    }
    
    // Construire nouvelle URL
    const newPath = getLocalizedPath(pathWithoutLang, targetLanguage)
    const params = searchParams.toString()
    const fullPath = params ? `${newPath}?${params}` : newPath
    
    // Sauvegarder préférence
    document.cookie = `preferred-language=${targetLanguage}; max-age=${365 * 24 * 60 * 60}; path=/; ${
      process.env.NODE_ENV === 'production' ? 'secure; ' : ''
    }samesite=lax`
    
    router.push(fullPath)
  }, [pathname, currentLanguage, searchParams, getLocalizedPath, router])

  return {
    navigateToLocalized,
    getLocalizedPath,
    changeLanguage,
    currentLanguage
  }
}

/**
 * Hook pour URLs alternatives (hreflang)
 */
export function useAlternateUrls() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { currentLanguage } = useLanguage()

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

    // Générer URLs pour toutes les langues
    return SUPPORTED_LOCALES.reduce((acc, lang) => {
      const localizedPath = lang === DEFAULT_LOCALE 
        ? pathWithoutLang
        : `/${lang}${pathWithoutLang}`
      
      acc[lang] = `${baseUrl}${localizedPath}${paramsSuffix}`
      return acc
    }, {} as Record<SupportedLocale, string>)
  }, [pathname, searchParams, currentLanguage])

  return alternateUrls
}

/**
 * Hook pour détection langue préférée utilisateur
 */
export function useLanguagePreferences() {
  const detectPreferredLanguage = useCallback((): SupportedLocale => {
    // 1. Cookie utilisateur
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const langCookie = cookies.find(c => c.trim().startsWith('preferred-language='))
      
      if (langCookie) {
        const lang = langCookie.split('=')[1].trim() as SupportedLocale
        if (SUPPORTED_LOCALES.includes(lang)) {
          return lang
        }
      }
    }

    // 2. Langue navigateur
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0] as SupportedLocale
      if (SUPPORTED_LOCALES.includes(browserLang)) {
        return browserLang
      }
    }

    return DEFAULT_LOCALE
  }, [])

  return { detectPreferredLanguage }
}

/**
 * Hook pour métadonnées i18n
 */
export function useI18nMetadata() {
  const { currentLanguage } = useLanguage()
  const alternateUrls = useAlternateUrls()

  const metadata = useMemo(() => ({
    currentLanguage,
    alternateUrls,
    hreflangTags: Object.entries(alternateUrls).map(([lang, url]) => ({
      hreflang: lang,
      href: url
    })),
    canonicalUrl: alternateUrls[currentLanguage],
    defaultUrl: alternateUrls[DEFAULT_LOCALE]
  }), [currentLanguage, alternateUrls])

  return metadata
}
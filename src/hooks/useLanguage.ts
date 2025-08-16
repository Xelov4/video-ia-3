/**
 * Custom Hooks pour Internationalisation
 * 
 * Collection de hooks React pour gérer l'état et les actions i18n.
 * Fournit une API simple et type-safe pour les composants.
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
  supportedLocales, 
  defaultLocale, 
  type SupportedLocale 
} from '../middleware'

/**
 * Hook pour accéder à la langue courante
 */
export function useLanguage() {
  const pathname = usePathname()
  
  // Extraire la langue depuis l'URL
  const currentLanguage = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0]
    
    if (supportedLocales.includes(firstSegment as SupportedLocale)) {
      return firstSegment as SupportedLocale
    }
    
    return defaultLocale
  }, [pathname])

  return {
    currentLanguage,
    isDefaultLanguage: currentLanguage === defaultLocale
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
    const localizedPath = targetLanguage === defaultLocale 
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
    
    return targetLanguage === defaultLocale 
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
    const currentPrefix = currentLanguage === defaultLocale ? '' : `/${currentLanguage}`
    
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
    const currentPrefix = currentLanguage === defaultLocale ? '' : `/${currentLanguage}`
    
    if (currentPrefix && pathWithoutLang.startsWith(currentPrefix)) {
      pathWithoutLang = pathWithoutLang.substring(currentPrefix.length) || '/'
    }

    // Paramètres de recherche
    const params = searchParams.toString()
    const paramsSuffix = params ? `?${params}` : ''

    // Base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'

    // Générer URLs pour toutes les langues
    return supportedLocales.reduce((acc, lang) => {
      const localizedPath = lang === defaultLocale 
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
  const detectPreferredLanguage = useCallback(() => {
    // Vérifier les cookies
    if (typeof document !== 'undefined') {
      const cookieLang = document.cookie
        .split('; ')
        .find(row => row.startsWith('preferred-language='))
        ?.split('=')[1]
      
      if (cookieLang && supportedLocales.includes(cookieLang as SupportedLocale)) {
        return cookieLang as SupportedLocale
      }
    }
    
    // Vérifier les en-têtes Accept-Language
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.substring(0, 2)
      if (supportedLocales.includes(browserLang as SupportedLocale)) {
        return browserLang as SupportedLocale
      }
    }
    
    return defaultLocale
  }, [])

  return {
    detectPreferredLanguage
  }
}

/**
 * Hook pour construction d'URLs avec la nouvelle structure courte
 */
export function useShortUrlConstruction() {
  const { currentLanguage } = useLanguage()

  /**
   * Construire URL pour une catégorie
   */
  const getCategoryUrl = useCallback((slug: string, lang?: SupportedLocale) => {
    const targetLang = lang || currentLanguage
    return targetLang === defaultLocale ? `/c/${slug}` : `/${targetLang}/c/${slug}`
  }, [currentLanguage])

  /**
   * Construire URL pour un public (audience)
   */
  const getAudienceUrl = useCallback((slug: string, lang?: SupportedLocale) => {
    const targetLang = lang || currentLanguage
    return targetLang === defaultLocale ? `/p/${slug}` : `/${targetLang}/p/${slug}`
  }, [currentLanguage])

  /**
   * Construire URL pour un cas d'usage
   */
  const getUseCaseUrl = useCallback((slug: string, lang?: SupportedLocale) => {
    const targetLang = lang || currentLanguage
    return targetLang === defaultLocale ? `/u/${slug}` : `/${targetLang}/u/${slug}`
  }, [currentLanguage])

  /**
   * Construire URL pour un outil
   */
  const getToolUrl = useCallback((slug: string, lang?: SupportedLocale) => {
    const targetLang = lang || currentLanguage
    return targetLang === defaultLocale ? `/t/${slug}` : `/${targetLang}/t/${slug}`
  }, [currentLanguage])

  /**
   * Construire URL pour la liste des outils (garde la structure originale)
   */
  const getToolsUrl = useCallback((lang?: SupportedLocale) => {
    const targetLang = lang || currentLanguage
    return targetLang === defaultLocale ? `/tools` : `/${targetLang}/tools`
  }, [currentLanguage])

  return {
    getCategoryUrl,
    getAudienceUrl,
    getUseCaseUrl,
    getToolUrl,
    getToolsUrl
  }
}
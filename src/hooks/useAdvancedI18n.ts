/**
 * Hooks I18n Avancés pour Video-IA.net
 * 
 * Collection de hooks spécialisés pour des cas d'usage complexes :
 * - Gestion d'état multilingue avec persistance
 * - Navigation conditionnelle selon la langue
 * - Détection intelligente de préférences utilisateur
 * - Cache et optimisations performance
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useI18n } from '@/src/lib/i18n/context'
import { useTranslation } from '@/src/hooks/useTranslation'
import { SupportedLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/middleware'

// Types pour les préférences utilisateur avancées
interface UserLanguagePreferences {
  primaryLanguage: SupportedLocale
  fallbackLanguages: SupportedLocale[]
  autoDetect: boolean
  rememberChoice: boolean
  regionOverride?: string
  timezone?: string
  lastUsed: Date
  usageCount: Record<SupportedLocale, number>
}

// Types pour le cache de traductions
interface TranslationCache {
  [key: string]: {
    value: string
    timestamp: number
    hits: number
  }
}

/**
 * Hook pour gérer les préférences utilisateur avancées
 */
export function useUserLanguagePreferences() {
  const { currentLanguage, changeLanguage } = useI18n()
  const [preferences, setPreferences] = useState<UserLanguagePreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger les préférences au mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem('video-ia-language-preferences')
        if (stored) {
          const parsed = JSON.parse(stored)
          // Valider et hydrater les dates
          const hydrated: UserLanguagePreferences = {
            ...parsed,
            lastUsed: new Date(parsed.lastUsed),
            usageCount: parsed.usageCount || {}
          }
          setPreferences(hydrated)
        } else {
          // Créer préférences par défaut
          const defaultPrefs: UserLanguagePreferences = {
            primaryLanguage: currentLanguage,
            fallbackLanguages: [DEFAULT_LOCALE],
            autoDetect: true,
            rememberChoice: true,
            lastUsed: new Date(),
            usageCount: { [currentLanguage]: 1 }
          }
          setPreferences(defaultPrefs)
          savePreferences(defaultPrefs)
        }
      } catch (error) {
        console.warn('Error loading language preferences:', error)
        // Fallback vers préférences par défaut
        const fallback: UserLanguagePreferences = {
          primaryLanguage: currentLanguage,
          fallbackLanguages: [DEFAULT_LOCALE],
          autoDetect: true,
          rememberChoice: true,
          lastUsed: new Date(),
          usageCount: { [currentLanguage]: 1 }
        }
        setPreferences(fallback)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [currentLanguage])

  /**
   * Sauvegarder les préférences
   */
  const savePreferences = useCallback((prefs: UserLanguagePreferences) => {
    try {
      localStorage.setItem('video-ia-language-preferences', JSON.stringify(prefs))
    } catch (error) {
      console.warn('Error saving language preferences:', error)
    }
  }, [])

  /**
   * Mettre à jour les préférences
   */
  const updatePreferences = useCallback((updates: Partial<UserLanguagePreferences>) => {
    if (!preferences) return

    const newPrefs = { ...preferences, ...updates }
    setPreferences(newPrefs)
    savePreferences(newPrefs)
  }, [preferences, savePreferences])

  /**
   * Changer de langue avec tracking d'usage
   */
  const changeLanguageWithTracking = useCallback((targetLanguage: SupportedLocale) => {
    if (!preferences) return

    // Incrémenter compteur d'usage
    const newUsageCount = {
      ...preferences.usageCount,
      [targetLanguage]: (preferences.usageCount[targetLanguage] || 0) + 1
    }

    // Mettre à jour préférences
    updatePreferences({
      primaryLanguage: targetLanguage,
      lastUsed: new Date(),
      usageCount: newUsageCount
    })

    // Changer la langue
    changeLanguage(targetLanguage)

    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'language_preference_update', {
        language: targetLanguage,
        usage_count: newUsageCount[targetLanguage],
        auto_detect: preferences.autoDetect
      })
    }
  }, [preferences, updatePreferences, changeLanguage])

  /**
   * Obtenir la langue recommandée basée sur l'usage
   */
  const getRecommendedLanguage = useCallback((): SupportedLocale => {
    if (!preferences) return DEFAULT_LOCALE

    // Trier par fréquence d'usage
    const sortedByUsage = Object.entries(preferences.usageCount)
      .sort(([, a], [, b]) => b - a)
      .map(([lang]) => lang as SupportedLocale)

    return sortedByUsage[0] || preferences.primaryLanguage
  }, [preferences])

  /**
   * Détection automatique de langue améliorée
   */
  const detectPreferredLanguage = useCallback((): SupportedLocale => {
    if (!preferences?.autoDetect) {
      return preferences?.primaryLanguage || DEFAULT_LOCALE
    }

    // 1. Langue de la session courante
    if (currentLanguage !== DEFAULT_LOCALE) {
      return currentLanguage
    }

    // 2. Langue la plus utilisée
    const recommended = getRecommendedLanguage()
    if (recommended !== DEFAULT_LOCALE) {
      return recommended
    }

    // 3. Détection navigateur avec filtrage intelligent
    if (typeof navigator !== 'undefined') {
      const browserLangs = navigator.languages || [navigator.language]
      
      for (const browserLang of browserLangs) {
        const lang = browserLang.split('-')[0] as SupportedLocale
        if (SUPPORTED_LOCALES.includes(lang)) {
          return lang
        }
      }
    }

    return DEFAULT_LOCALE
  }, [preferences, currentLanguage, getRecommendedLanguage])

  return {
    preferences,
    isLoading,
    updatePreferences,
    changeLanguageWithTracking,
    getRecommendedLanguage,
    detectPreferredLanguage,
    
    // Statistiques utiles
    mostUsedLanguage: preferences ? getRecommendedLanguage() : DEFAULT_LOCALE,
    totalLanguageChanges: preferences ? Object.values(preferences.usageCount).reduce((a, b) => a + b, 0) : 0,
    languageStats: preferences?.usageCount || {}
  }
}

/**
 * Hook pour navigation intelligente avec préservation d'état
 */
export function useSmartNavigation() {
  const { getLocalizedPath, currentLanguage } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // État pour tracking des navigations
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const [savedStates, setSavedStates] = useState<Record<string, any>>({})

  /**
   * Naviguer avec sauvegarde d'état
   */
  const navigateWithState = useCallback((
    path: string,
    state?: any,
    language?: SupportedLocale
  ) => {
    const targetLang = language || currentLanguage
    const localizedPath = getLocalizedPath(path, targetLang)
    
    // Sauvegarder l'état actuel si fourni
    if (state) {
      setSavedStates(prev => ({
        ...prev,
        [pathname]: state
      }))
    }
    
    // Ajouter à l'historique
    setNavigationHistory(prev => [...prev.slice(-9), localizedPath])
    
    router.push(localizedPath)
  }, [currentLanguage, getLocalizedPath, pathname, router])

  /**
   * Naviguer vers la page précédente avec état
   */
  const goBackWithState = useCallback(() => {
    if (navigationHistory.length > 1) {
      const previousPath = navigationHistory[navigationHistory.length - 2]
      router.push(previousPath)
      setNavigationHistory(prev => prev.slice(0, -1))
    } else {
      router.back()
    }
  }, [navigationHistory, router])

  /**
   * Récupérer l'état sauvegardé d'une page
   */
  const getSavedState = useCallback((path?: string) => {
    const targetPath = path || pathname
    return savedStates[targetPath] || null
  }, [savedStates, pathname])

  /**
   * Préserver les paramètres de recherche lors des navigations
   */
  const navigatePreservingSearch = useCallback((
    path: string,
    additionalParams?: Record<string, string>
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.set(key, value)
      })
    }
    
    const fullPath = params.toString() ? `${path}?${params.toString()}` : path
    navigateWithState(fullPath)
  }, [searchParams, navigateWithState])

  return {
    navigateWithState,
    goBackWithState,
    getSavedState,
    navigatePreservingSearch,
    navigationHistory,
    canGoBack: navigationHistory.length > 1,
    currentState: getSavedState()
  }
}

/**
 * Hook pour cache de traductions côté client
 */
export function useTranslationCache() {
  const cacheRef = useRef<TranslationCache>({})
  const { currentLanguage } = useI18n()
  const { t } = useTranslation()

  // Configuration du cache
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  const MAX_CACHE_SIZE = 1000

  /**
   * Obtenir une traduction avec cache
   */
  const getCachedTranslation = useCallback((
    key: string,
    variables?: Record<string, string | number>
  ): string => {
    const cacheKey = `${currentLanguage}:${key}:${JSON.stringify(variables || {})}`
    const cached = cacheRef.current[cacheKey]
    
    // Vérifier validité du cache
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      cached.hits++
      return cached.value
    }
    
    // Calculer nouvelle traduction
    const translation = t(key, variables)
    
    // Nettoyer le cache si trop grand
    if (Object.keys(cacheRef.current).length >= MAX_CACHE_SIZE) {
      // Garder seulement les entrées les plus utilisées
      const sortedEntries = Object.entries(cacheRef.current)
        .sort(([, a], [, b]) => b.hits - a.hits)
        .slice(0, MAX_CACHE_SIZE / 2)
      
      cacheRef.current = Object.fromEntries(sortedEntries)
    }
    
    // Mettre en cache
    cacheRef.current[cacheKey] = {
      value: translation,
      timestamp: Date.now(),
      hits: 1
    }
    
    return translation
  }, [currentLanguage, t])

  /**
   * Précharger des traductions
   */
  const preloadTranslations = useCallback((keys: string[]) => {
    keys.forEach(key => {
      getCachedTranslation(key)
    })
  }, [getCachedTranslation])

  /**
   * Vider le cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current = {}
  }, [])

  /**
   * Statistiques du cache
   */
  const getCacheStats = useCallback(() => {
    const entries = Object.values(cacheRef.current)
    return {
      totalEntries: entries.length,
      totalHits: entries.reduce((sum, entry) => sum + entry.hits, 0),
      averageAge: entries.length > 0 ? 
        entries.reduce((sum, entry) => sum + (Date.now() - entry.timestamp), 0) / entries.length : 0,
      hitRate: entries.length > 0 ? 
        entries.filter(entry => entry.hits > 1).length / entries.length : 0
    }
  }, [])

  // Nettoyer le cache périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const filtered = Object.fromEntries(
        Object.entries(cacheRef.current).filter(
          ([, entry]) => now - entry.timestamp < CACHE_TTL
        )
      )
      cacheRef.current = filtered
    }, CACHE_TTL)

    return () => clearInterval(interval)
  }, [])

  return {
    getCachedTranslation,
    preloadTranslations,
    clearCache,
    getCacheStats
  }
}

/**
 * Hook pour gestion de formulaires multilingues
 */
export function useMultilingualForm<T extends Record<string, any>>(initialValues: T) {
  const { currentLanguage } = useI18n()
  const { t } = useTranslation()
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>)
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)

  /**
   * Valider un champ avec messages traduits
   */
  const validateField = useCallback((
    field: keyof T,
    value: any,
    validators: Array<(value: any) => string | null>
  ) => {
    for (const validator of validators) {
      const error = validator(value)
      if (error) {
        setErrors(prev => ({ ...prev, [field]: t(error) }))
        return false
      }
    }
    
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    return true
  }, [t])

  /**
   * Mettre à jour une valeur
   */
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  /**
   * Réinitialiser le formulaire
   */
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({} as Record<keyof T, string>)
    setTouched({} as Record<keyof T, boolean>)
  }, [initialValues])

  /**
   * Obtenir le message d'erreur traduit pour un champ
   */
  const getFieldError = useCallback((field: keyof T) => {
    return touched[field] ? errors[field] : undefined
  }, [errors, touched])

  return {
    values,
    errors,
    touched,
    setValue,
    validateField,
    reset,
    getFieldError,
    isValid: Object.keys(errors).length === 0,
    isDirty: Object.keys(touched).length > 0
  }
}

/**
 * Hook pour détection de langue basée sur le contenu
 */
export function useContentLanguageDetection() {
  const [detectedLanguage, setDetectedLanguage] = useState<SupportedLocale | null>(null)
  const [confidence, setConfidence] = useState(0)

  /**
   * Détecter la langue d'un texte (algorithme simple)
   */
  const detectLanguage = useCallback((text: string): { language: SupportedLocale; confidence: number } => {
    if (!text || text.length < 10) {
      return { language: DEFAULT_LOCALE, confidence: 0 }
    }

    // Patterns simples pour détection de langue
    const patterns: Record<SupportedLocale, RegExp[]> = {
      en: [/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi, /ing\b/gi],
      fr: [/\b(le|la|les|de|du|des|et|ou|dans|sur|pour|avec|par)\b/gi, /tion\b/gi],
      es: [/\b(el|la|los|las|de|del|y|o|en|con|por|para)\b/gi, /ción\b/gi],
      it: [/\b(il|la|i|le|di|del|e|o|in|con|per|da)\b/gi, /zione\b/gi],
      de: [/\b(der|die|das|den|dem|des|und|oder|in|an|zu|mit|von)\b/gi, /ung\b/gi],
      nl: [/\b(de|het|een|van|in|op|met|voor|door|naar)\b/gi, /ing\b/gi],
      pt: [/\b(o|a|os|as|de|do|da|e|ou|em|com|por|para)\b/gi, /ção\b/gi]
    }

    let bestMatch: SupportedLocale = DEFAULT_LOCALE
    let maxScore = 0

    for (const [lang, regexes] of Object.entries(patterns) as [SupportedLocale, RegExp[]][]) {
      let score = 0
      for (const regex of regexes) {
        const matches = text.match(regex)
        score += matches ? matches.length : 0
      }
      
      if (score > maxScore) {
        maxScore = score
        bestMatch = lang
      }
    }

    const confidence = Math.min(maxScore / (text.split(/\s+/).length || 1), 1)
    
    setDetectedLanguage(bestMatch)
    setConfidence(confidence)
    
    return { language: bestMatch, confidence }
  }, [])

  return {
    detectLanguage,
    detectedLanguage,
    confidence,
    isReliable: confidence > 0.3
  }
}
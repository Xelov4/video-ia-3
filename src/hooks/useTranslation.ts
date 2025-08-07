/**
 * Hook de Traduction pour Video-IA.net
 * 
 * Hook React pour utiliser facilement les traductions dans les composants.
 * Intégré avec le système i18n et le context de langue.
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useCallback } from 'react'
import { useI18n } from '@/src/lib/i18n/context'
import { useTranslations, interpolate, t as translateFunction } from '@/src/lib/i18n/translations'
import type { UITranslations } from '@/src/lib/i18n/translations'

/**
 * Hook principal pour les traductions
 */
export function useTranslation() {
  const { currentLanguage } = useI18n()
  const translations = useTranslations(currentLanguage)

  /**
   * Fonction de traduction avec interpolation
   */
  const t = useCallback((
    key: string,
    variables: Record<string, string | number> = {}
  ): string => {
    return translateFunction(currentLanguage, key, variables)
  }, [currentLanguage])

  /**
   * Fonction pour formater les nombres avec locale
   */
  const formatNumber = useCallback((
    number: number,
    options: Intl.NumberFormatOptions = {}
  ): string => {
    return new Intl.NumberFormat(currentLanguage, options).format(number)
  }, [currentLanguage])

  /**
   * Fonction pour formater les dates avec locale
   */
  const formatDate = useCallback((
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {}
  ): string => {
    const dateObj = new Date(date)
    return new Intl.DateTimeFormat(currentLanguage, options).format(dateObj)
  }, [currentLanguage])

  /**
   * Fonction pour formater les dates relatives (il y a X temps)
   */
  const formatRelativeTime = useCallback((date: Date | string | number): string => {
    const now = new Date()
    const targetDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return t('time.just_now')
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return t('time.minutes_ago', { count: diffInMinutes })
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return t('time.hours_ago', { count: diffInHours })
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return t('time.days_ago', { count: diffInDays })
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
      return t('time.weeks_ago', { count: diffInWeeks })
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return t('time.months_ago', { count: diffInMonths })
    }

    const diffInYears = Math.floor(diffInDays / 365)
    return t('time.years_ago', { count: diffInYears })
  }, [t])

  /**
   * Fonction pour pluraliser selon la langue
   */
  const pluralize = useCallback((
    count: number,
    singularKey: string,
    pluralKey?: string
  ): string => {
    // Règles de pluralisation simples (peut être étendu)
    const shouldUsePlural = count !== 1

    if (pluralKey && shouldUsePlural) {
      return t(pluralKey, { count })
    }

    return t(singularKey, { count })
  }, [t])

  /**
   * Fonction pour obtenir le texte d'erreur localisé
   */
  const getErrorMessage = useCallback((
    errorCode: string,
    fallback: string = ''
  ): string => {
    const errorKey = `messages.error_${errorCode}`
    const translated = t(errorKey)
    
    // Si la traduction n'existe pas, utiliser le fallback ou message générique
    if (translated === errorKey) {
      return fallback || t('messages.error_generic')
    }
    
    return translated
  }, [t])

  /**
   * Fonction pour obtenir le texte de succès localisé
   */
  const getSuccessMessage = useCallback((
    successCode: string,
    fallback: string = ''
  ): string => {
    const successKey = `messages.success_${successCode}`
    const translated = t(successKey)
    
    if (translated === successKey) {
      return fallback || t('messages.success_generic')
    }
    
    return translated
  }, [t])

  return {
    // Fonction principale
    t,
    
    // Objets de traductions direct
    translations,
    
    // Fonctions de formatage
    formatNumber,
    formatDate,
    formatRelativeTime,
    pluralize,
    
    // Fonctions utilitaires
    getErrorMessage,
    getSuccessMessage,
    
    // Métadonnées
    currentLanguage,
    isRTL: ['ar', 'he', 'fa'].includes(currentLanguage), // Pour futures langues RTL
  }
}

/**
 * Hook spécialisé pour les messages de navigation
 */
export function useNavTranslation() {
  const { t } = useTranslation()
  
  return {
    home: t('nav.home'),
    tools: t('nav.tools'),
    categories: t('nav.categories'),
    about: t('nav.about'),
    searchPlaceholder: t('nav.search_placeholder'),
    menu: t('nav.menu'),
    close: t('nav.close'),
    back: t('nav.back'),
    next: t('nav.next'),
    previous: t('nav.previous')
  }
}

/**
 * Hook spécialisé pour les actions communes
 */
export function useActionTranslation() {
  const { t } = useTranslation()
  
  return {
    search: t('actions.search'),
    filter: t('actions.filter'),
    sort: t('actions.sort'),
    reset: t('actions.reset'),
    apply: t('actions.apply'),
    cancel: t('actions.cancel'),
    save: t('actions.save'),
    edit: t('actions.edit'),
    delete: t('actions.delete'),
    view: t('actions.view'),
    share: t('actions.share'),
    copy: t('actions.copy'),
    download: t('actions.download'),
    loading: t('actions.loading'),
    loadMore: t('actions.load_more')
  }
}

/**
 * Hook spécialisé pour les messages système
 */
export function useMessageTranslation() {
  const { t, getErrorMessage, getSuccessMessage } = useTranslation()
  
  return {
    loading: t('messages.loading'),
    loadingTools: t('messages.loading_tools'),
    loadingCategories: t('messages.loading_categories'),
    noResults: t('messages.no_results'),
    noToolsFound: t('messages.no_tools_found'),
    noCategoriesFound: t('messages.no_categories_found'),
    tryAgain: t('messages.try_again'),
    
    // Fonctions pour messages dynamiques
    getErrorMessage,
    getSuccessMessage
  }
}

/**
 * Hook spécialisé pour les outils et catégories
 */
export function useToolsTranslation() {
  const { t, formatNumber, pluralize } = useTranslation()
  
  return {
    tool: t('tools.tool'),
    tools: t('tools.tools'),
    aiTool: t('tools.ai_tool'),
    aiTools: t('tools.ai_tools'),
    featuredTools: t('tools.featured_tools'),
    popularTools: t('tools.popular_tools'),
    newTools: t('tools.new_tools'),
    category: t('tools.category'),
    categories: t('tools.categories'),
    viewCount: t('tools.view_count'),
    rating: t('tools.rating'),
    visitTool: t('tools.visit_tool'),
    officialWebsite: t('tools.official_website'),
    toolDetails: t('tools.tool_details'),
    similarTools: t('tools.similar_tools'),
    
    // Fonction pour compter les outils
    toolsCount: (count: number) => t('tools.tools_count', { count: formatNumber(count) })
  }
}

// Export des types
export type { UITranslations }
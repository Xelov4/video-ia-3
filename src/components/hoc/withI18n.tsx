/**
 * Higher-Order Components pour I18n - Video-IA.net
 * 
 * Collection de HOCs pour simplifier l'intégration de l'i18n :
 * - Injection automatique des traductions
 * - Gestion des états de chargement
 * - Fallback gracieux pour les erreurs
 * - Optimisations de performance
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import React, { ComponentType, useEffect, useState, useMemo } from 'react'
import { useTranslation } from '@/src/hooks/useTranslation'
import { useI18n } from '@/src/lib/i18n/context'
import { userPrefsManager } from '@/src/lib/i18n/storage'
import { ErrorBoundary } from '@/src/components/ui/FallbackUI'
import LoadingSpinner from '@/src/components/ui/LoadingSpinner'

// Types pour les props injectées
export interface WithI18nProps {
  t: (key: string, variables?: Record<string, string | number>) => string
  currentLanguage: string
  changeLanguage: (language: string) => void
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string
  isRTL: boolean
}

/**
 * HOC principal pour injecter les fonctions i18n
 */
export function withI18n<P extends object>(
  WrappedComponent: ComponentType<P & WithI18nProps>
) {
  const WithI18nComponent = (props: P) => {
    const { t, formatDate, formatNumber, currentLanguage, isRTL } = useTranslation()
    const { changeLanguage } = useI18n()

    const injectedProps: WithI18nProps = {
      t,
      currentLanguage,
      changeLanguage,
      formatDate,
      formatNumber,
      isRTL
    }

    return <WrappedComponent {...props} {...injectedProps} />
  }

  WithI18nComponent.displayName = `withI18n(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return WithI18nComponent
}

/**
 * HOC pour précharger les traductions avant le rendu
 */
export function withPreloadedTranslations<P extends object>(
  translationKeys: string[],
  LoadingComponent?: ComponentType
) {
  return function (WrappedComponent: ComponentType<P>) {
    const WithPreloadedTranslationsComponent = (props: P) => {
      const [isLoading, setIsLoading] = useState(true)
      const [error, setError] = useState<Error | null>(null)
      const { t, currentLanguage } = useTranslation()

      useEffect(() => {
        const preloadTranslations = async () => {
          try {
            setIsLoading(true)
            setError(null)

            // Précharger toutes les traductions nécessaires
            const translations = translationKeys.map(key => {
              try {
                return t(key)
              } catch (err) {
                console.warn(`Failed to preload translation for key: ${key}`, err)
                return null
              }
            })

            // Attendre un tick pour simuler le chargement async si nécessaire
            await new Promise(resolve => setTimeout(resolve, 0))

            setIsLoading(false)
          } catch (err) {
            setError(err instanceof Error ? err : new Error('Translation preload failed'))
            setIsLoading(false)
          }
        }

        preloadTranslations()
      }, [currentLanguage, t])

      if (isLoading) {
        return LoadingComponent ? (
          <LoadingComponent />
        ) : (
          <LoadingSpinner variant="default" size="md" />
        )
      }

      if (error) {
        return (
          <div className="p-4 text-center text-red-400">
            <p>Failed to load translations</p>
          </div>
        )
      }

      return <WrappedComponent {...props} />
    }

    WithPreloadedTranslationsComponent.displayName = 
      `withPreloadedTranslations(${WrappedComponent.displayName || WrappedComponent.name})`

    return WithPreloadedTranslationsComponent
  }
}

/**
 * HOC pour la persistance automatique des préférences
 */
export function withLanguagePreferences<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithLanguagePreferencesComponent = (props: P) => {
    const [prefsLoaded, setPrefsLoaded] = useState(false)
    const { currentLanguage, changeLanguage } = useI18n()

    useEffect(() => {
      const loadAndApplyPreferences = async () => {
        try {
          const prefs = await userPrefsManager.loadPreferences()
          
          // Appliquer les préférences si différentes de l'actuel
          if (prefs.language.primary !== currentLanguage && prefs.language.autoDetect) {
            changeLanguage(prefs.language.primary)
          }

          setPrefsLoaded(true)
        } catch (error) {
          console.warn('Failed to load language preferences:', error)
          setPrefsLoaded(true) // Continue même en cas d'erreur
        }
      }

      loadAndApplyPreferences()
    }, [currentLanguage, changeLanguage])

    // Sauvegarder les changements de langue
    useEffect(() => {
      if (prefsLoaded) {
        userPrefsManager.updateUsageStats(currentLanguage)
      }
    }, [currentLanguage, prefsLoaded])

    if (!prefsLoaded) {
      return (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="sm" showMessage={false} />
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }

  WithLanguagePreferencesComponent.displayName = 
    `withLanguagePreferences(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithLanguagePreferencesComponent
}

/**
 * HOC pour la détection automatique RTL
 */
export function withRTLSupport<P extends object>(
  WrappedComponent: ComponentType<P & { isRTL?: boolean; direction?: 'ltr' | 'rtl' }>
) {
  const WithRTLSupportComponent = (props: P) => {
    const { isRTL, currentLanguage } = useTranslation()

    // Classes CSS conditionnelles pour RTL
    const rtlProps = {
      isRTL,
      direction: isRTL ? 'rtl' as const : 'ltr' as const
    }

    useEffect(() => {
      // Appliquer la direction au document
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('dir', rtlProps.direction)
        document.documentElement.setAttribute('lang', currentLanguage)
      }
    }, [currentLanguage, rtlProps.direction])

    return <WrappedComponent {...props} {...rtlProps} />
  }

  WithRTLSupportComponent.displayName = 
    `withRTLSupport(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithRTLSupportComponent
}

/**
 * HOC pour l'optimisation des re-renders lors de changement de langue
 */
export function withI18nMemo<P extends object>(
  WrappedComponent: ComponentType<P>,
  translationDependencies: string[] = []
) {
  const WithI18nMemoComponent = React.memo((props: P) => {
    const { currentLanguage, t } = useTranslation()

    // Mémoriser les traductions utilisées
    const memoizedTranslations = useMemo(() => {
      return translationDependencies.reduce((acc, key) => {
        acc[key] = t(key)
        return acc
      }, {} as Record<string, string>)
    }, [currentLanguage, t, ...translationDependencies])

    return <WrappedComponent {...props} translations={memoizedTranslations} />
  }, (prevProps, nextProps) => {
    // Comparaison personnalisée pour éviter les re-renders inutiles
    return JSON.stringify(prevProps) === JSON.stringify(nextProps)
  })

  WithI18nMemoComponent.displayName = 
    `withI18nMemo(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithI18nMemoComponent
}

/**
 * HOC composite pour toutes les fonctionnalités i18n
 */
export function withFullI18n<P extends object>(
  options: {
    preloadKeys?: string[]
    enablePreferences?: boolean
    enableRTL?: boolean
    enableMemo?: boolean
    memoDependencies?: string[]
    fallbackComponent?: ComponentType
  } = {}
) {
  return function (WrappedComponent: ComponentType<P>) {
    let EnhancedComponent = WrappedComponent

    // Appliquer les HOCs dans l'ordre approprié
    if (options.enableMemo) {
      EnhancedComponent = withI18nMemo(EnhancedComponent, options.memoDependencies)
    }

    if (options.enableRTL) {
      EnhancedComponent = withRTLSupport(EnhancedComponent as any) as any
    }

    if (options.enablePreferences) {
      EnhancedComponent = withLanguagePreferences(EnhancedComponent)
    }

    if (options.preloadKeys?.length) {
      EnhancedComponent = withPreloadedTranslations(options.preloadKeys)(EnhancedComponent)
    }

    // Toujours appliquer l'injection i18n de base
    EnhancedComponent = withI18n(EnhancedComponent as any)

    // Wrapper avec ErrorBoundary
    const FinalComponent = (props: P) => (
      <ErrorBoundary fallback={options.fallbackComponent}>
        <EnhancedComponent {...props} />
      </ErrorBoundary>
    )

    FinalComponent.displayName = 
      `withFullI18n(${WrappedComponent.displayName || WrappedComponent.name})`

    return FinalComponent
  }
}

/**
 * HOC pour composants qui nécessitent une langue spécifique
 */
export function withRequiredLanguage<P extends object>(
  requiredLanguage: string,
  FallbackComponent?: ComponentType<{ requiredLanguage: string; currentLanguage: string }>
) {
  return function (WrappedComponent: ComponentType<P>) {
    const WithRequiredLanguageComponent = (props: P) => {
      const { currentLanguage } = useI18n()

      if (currentLanguage !== requiredLanguage) {
        if (FallbackComponent) {
          return <FallbackComponent requiredLanguage={requiredLanguage} currentLanguage={currentLanguage} />
        }

        return (
          <div className="p-4 text-center text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
            <p>Ce composant nécessite la langue: {requiredLanguage}</p>
            <p>Langue actuelle: {currentLanguage}</p>
          </div>
        )
      }

      return <WrappedComponent {...props} />
    }

    WithRequiredLanguageComponent.displayName = 
      `withRequiredLanguage(${WrappedComponent.displayName || WrappedComponent.name})`

    return WithRequiredLanguageComponent
  }
}

/**
 * Hook d'aide pour utiliser les HOCs de manière déclarative
 */
export function useI18nHOC() {
  return {
    withI18n,
    withPreloadedTranslations,
    withLanguagePreferences,
    withRTLSupport,
    withI18nMemo,
    withFullI18n,
    withRequiredLanguage
  }
}
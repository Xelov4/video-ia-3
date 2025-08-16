'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { SupportedLanguage } from './types'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './types'

// Type du contexte i18n
interface I18nContextType {
  currentLanguage: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  isLanguageSupported: (lang: string) => boolean
}

// Création du contexte
const I18nContext = createContext<I18nContextType>({
  currentLanguage: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  isLanguageSupported: () => false
})

// Props du provider
interface I18nProviderProps {
  children: React.ReactNode
  currentLanguage: SupportedLanguage
}

// Provider du contexte
export function I18nProvider({ children, currentLanguage }: I18nProviderProps) {
  const [language, setLanguage] = useState<SupportedLanguage>(currentLanguage || DEFAULT_LANGUAGE)

  // Vérifier si une langue est supportée
  const isLanguageSupported = (lang: string): boolean => {
    return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
  }

  // Mettre à jour le cookie de langue quand la langue change
  useEffect(() => {
    document.cookie = `preferred-language=${language}; max-age=${365 * 24 * 60 * 60}; path=/; samesite=lax`
  }, [language])

  // Valeur du contexte
  const value: I18nContextType = {
    currentLanguage: language,
    setLanguage,
    isLanguageSupported
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook pour utiliser le contexte
export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
/**
 * Language Tabs Component for Multilingual Tool Editing
 * Responsive tab navigation with language flags and indicators
 */

'use client'

import { useState } from 'react'
import { ChevronDownIcon, GlobeAltIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  enabled: boolean
  isBase?: boolean
}

interface LanguageTabsProps {
  languages: Language[]
  activeLanguage: string
  onLanguageChange: (languageCode: string) => void
  translationStatus?: Record<string, TranslationStatus>
  className?: string
}

export interface TranslationStatus {
  isComplete: boolean
  completionPercentage: number
  hasChanges: boolean
  isHumanReviewed: boolean
  qualityScore: number
}

const DEFAULT_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', enabled: true, isBase: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', enabled: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', enabled: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', enabled: true },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', enabled: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', enabled: true }
]

export function LanguageTabs({
  languages = DEFAULT_LANGUAGES,
  activeLanguage,
  onLanguageChange,
  translationStatus = {},
  className = ''
}: LanguageTabsProps) {
  const [showMobileDropdown, setShowMobileDropdown] = useState(false)

  const enabledLanguages = languages.filter(lang => lang.enabled)
  const activeLanguageObj = enabledLanguages.find(lang => lang.code === activeLanguage) || enabledLanguages[0]

  const getStatusIndicator = (languageCode: string) => {
    const status = translationStatus[languageCode]
    if (!status) return null

    if (status.isComplete && status.isHumanReviewed) {
      return (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="w-3 h-3 text-white" />
        </div>
      )
    }

    if (status.isComplete) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
      )
    }

    if (status.completionPercentage > 0) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
      )
    }

    return (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full"></div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Tabs */}
      <div className="hidden lg:block">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="flex space-x-1 px-6 pt-4" aria-label="Tabs">
            {enabledLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => onLanguageChange(language.code)}
                className={`relative group flex items-center px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 ${
                  activeLanguage === language.code
                    ? 'text-blue-600 border-blue-500 bg-blue-50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
                type="button"
              >
                <span className="text-lg mr-2">{language.flag}</span>
                <span className="mr-2">{language.nativeName}</span>
                {language.isBase && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                    Base
                  </span>
                )}
                {getStatusIndicator(language.code)}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {language.name} ({language.code.toUpperCase()})
                  {translationStatus[language.code] && (
                    <div className="text-xs mt-1">
                      {Math.round(translationStatus[language.code].completionPercentage)}% complete
                    </div>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile/Tablet Dropdown */}
      <div className="lg:hidden relative">
        <button
          onClick={() => setShowMobileDropdown(!showMobileDropdown)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          type="button"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-lg mr-2">{activeLanguageObj.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {activeLanguageObj.nativeName}
                </span>
                <span className="text-xs text-gray-500">
                  {activeLanguageObj.name} ({activeLanguageObj.code.toUpperCase()})
                  {activeLanguageObj.isBase && ' - Base Language'}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              {getStatusIndicator(activeLanguageObj.code)}
              <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform ${showMobileDropdown ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        {/* Mobile Dropdown Menu */}
        {showMobileDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {enabledLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    onLanguageChange(language.code)
                    setShowMobileDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${
                    activeLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                  type="button"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{language.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{language.nativeName}</span>
                      <span className="text-xs text-gray-500">
                        {language.name} ({language.code.toUpperCase()})
                        {language.isBase && ' - Base'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIndicator(language.code)}
                    <div className="relative">
                      {getStatusIndicator(language.code)}
                    </div>
                    {translationStatus[language.code] && (
                      <span className="text-xs text-gray-400">
                        {Math.round(translationStatus[language.code].completionPercentage)}%
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Translation Legend */}
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
              <div className="text-xs text-gray-600">
                <div className="font-medium mb-2">Status Legend:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Human Reviewed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Auto Complete</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    <span>Not Started</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Close dropdown on click outside */}
      {showMobileDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMobileDropdown(false)}
        />
      )}
    </div>
  )
}
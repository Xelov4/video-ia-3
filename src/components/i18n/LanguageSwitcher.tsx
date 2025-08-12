/**
 * Language Switcher Component - Ultra-Modern avec Drapeaux
 * 
 * Composant intelligent pour changer de langue avec préservation du contexte.
 * Features:
 * - Dropdown élégant avec drapeaux animés
 * - Préservation URL et paramètres lors changement
 * - Cookie management automatique
 * - Animation micro-interactions
 * - Support mobile optimisé
 * - Analytics tracking intégré
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline'
import { SupportedLocale, supportedLocales, defaultLocale } from '@/middleware'

// Configuration des langues avec drapeaux et labels natifs
interface LanguageConfig {
  code: SupportedLocale
  label: string
  nativeLabel: string
  flag: string
  region: string
}

const LANGUAGES: LanguageConfig[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸', region: 'US' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷', region: 'France' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', flag: '🇮🇹', region: 'Italy' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', region: 'Spain' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪', region: 'Germany' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', flag: '🇳🇱', region: 'Netherlands' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇵🇹', region: 'Portugal' },
]

interface LanguageSwitcherProps {
  currentLanguage: SupportedLocale
  variant?: 'header' | 'footer' | 'mobile'
  showLabel?: boolean
  className?: string
}

export default function LanguageSwitcher({ 
  currentLanguage, 
  variant = 'header',
  showLabel = true,
  className = ''
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0]

  /**
   * Fermer dropdown au clic extérieur
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  /**
   * Construire URL localisée en préservant le contexte
   */
  const buildLocalizedUrl = (targetLang: SupportedLocale): string => {
    // Si on clique sur la langue actuelle, ne rien faire
    if (targetLang === currentLanguage) {
      return pathname
    }
    
    // Logique simplifiée et robuste
    const segments = pathname.split('/').filter(Boolean)
    
    // Si le premier segment est une langue supportée, le remplacer
    if (supportedLocales.includes(segments[0] as SupportedLocale)) {
      segments[0] = targetLang
    } else {
      // Sinon, ajouter la langue au début
      segments.unshift(targetLang)
    }
    
    // Construire la nouvelle URL
    let newPath = `/${segments.join('/')}`
    
    // Ajouter les paramètres de recherche si présents
    const params = searchParams.toString()
    if (params) {
      newPath += `?${params}`
    }
    
    return newPath
  }

  /**
   * Gérer le changement de langue avec animations
   */
  const handleLanguageChange = async (targetLang: SupportedLocale) => {
    if (targetLang === currentLanguage || isChanging) return

    setIsChanging(true)
    setIsOpen(false)

    try {
      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'language_change', {
          from_language: currentLanguage,
          to_language: targetLang,
          page_path: pathname
        })
      }

      // Sauvegarder préférence en cookie
      document.cookie = `preferred-language=${targetLang}; max-age=${365 * 24 * 60 * 60}; path=/; ${
        process.env.NODE_ENV === 'production' ? 'secure; ' : ''
      }samesite=lax`

      // Navigation vers nouvelle URL
      const newUrl = buildLocalizedUrl(targetLang)
      
      // Petit délai pour l'animation
      await new Promise(resolve => setTimeout(resolve, 150))
      
      router.push(newUrl)
      
    } catch (error) {
      console.error('Error changing language:', error)
    } finally {
      // Reset après navigation (component sera remount)
      setTimeout(() => setIsChanging(false), 500)
    }
  }

  /**
   * Style variants
   */
  const getVariantStyles = () => {
    switch (variant) {
      case 'mobile':
        return {
          button: 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl',
          dropdown: 'w-full mt-2 bg-black/95 border border-white/20 rounded-xl'
        }
      case 'footer':
        return {
          button: 'px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm',
          dropdown: 'w-64 bottom-full mb-2 bg-gray-900/95 border border-gray-700/50 rounded-lg'
        }
      default:
        return {
          button: 'px-3 py-2 bg-white/10 border border-white/20 rounded-xl',
          dropdown: 'w-72 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Button principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`
          ${styles.button}
          flex items-center space-x-2 text-white hover:bg-white/20 
          transition-all duration-300 hover:scale-105 group
          ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-purple-400/50' : ''}
        `}
      >
        {/* Flag animé */}
        <span className="text-xl group-hover:animate-bounce">
          {isChanging ? (
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            currentLang.flag
          )}
        </span>

        {/* Label conditionnel */}
        {showLabel && (
          <span className="font-medium text-sm">
            {currentLang.nativeLabel}
          </span>
        )}

        {/* Icône dropdown */}
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={`
          absolute right-0 z-50 shadow-2xl backdrop-blur-xl
          ${styles.dropdown}
          animate-in fade-in slide-in-from-top-2 duration-200
        `}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <LanguageIcon className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">
                Choisir la langue
              </span>
            </div>
          </div>

          {/* Liste des langues */}
          <div className="py-2">
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === currentLanguage
              
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isActive || isChanging}
                  className={`
                    w-full px-4 py-3 flex items-center space-x-3 text-left
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white cursor-default'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer'
                    }
                    ${isChanging ? 'opacity-50' : ''}
                  `}
                >
                  {/* Flag */}
                  <span className="text-lg group-hover:animate-bounce">
                    {lang.flag}
                  </span>
                  
                  {/* Détails langue */}
                  <div className="flex-1">
                    <div className="font-medium">
                      {lang.nativeLabel}
                    </div>
                    <div className="text-xs opacity-75">
                      {lang.region}
                    </div>
                  </div>

                  {/* Indicateur actif */}
                  {isActive && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer info */}
          <div className="px-4 py-2 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              Votre préférence sera sauvegardée
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Export du type pour usage externe
export type { LanguageConfig }
export { LANGUAGES }
/**
 * Formulaire de Recherche Multilingue - Video-IA.net
 * 
 * Composant de recherche intelligent avec suggestions et validation.
 * Tous les messages et placeholders sont traduits.
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useTranslation, useActionTranslation } from '@/src/hooks/useTranslation'
import { useI18n } from '@/src/lib/i18n/context'

interface SearchFormProps {
  initialQuery?: string
  placeholder?: string
  onSearch?: (query: string) => void
  showSuggestions?: boolean
  className?: string
  variant?: 'header' | 'hero' | 'inline'
}

export default function SearchForm({
  initialQuery = '',
  placeholder,
  onSearch,
  showSuggestions = true,
  className = '',
  variant = 'header'
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const { t } = useTranslation()
  const actions = useActionTranslation()
  const { getLocalizedPath } = useI18n()

  // Suggestions d'exemple par langue
  const getSampleSuggestions = useCallback(() => {
    return [
      'ChatGPT',
      'Midjourney',
      'Video editing',
      'AI writing',
      'Design tools'
    ]
  }, [])

  /**
   * Gérer la soumission du formulaire
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) return
    
    setIsLoading(true)
    
    try {
      // Callback personnalisé ou navigation par défaut
      if (onSearch) {
        onSearch(query.trim())
      } else {
        const searchUrl = getLocalizedPath(`/tools?search=${encodeURIComponent(query.trim())}`)
        router.push(searchUrl)
      }
      
      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'search', {
          search_term: query.trim(),
          page_path: window.location.pathname
        })
      }
      
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [query, onSearch, getLocalizedPath, router])

  /**
   * Effacer la recherche
   */
  const handleClear = useCallback(() => {
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }, [])

  /**
   * Gérer les changements de saisie
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Afficher suggestions si activées
    if (showSuggestions && value.length > 0) {
      setSuggestions(getSampleSuggestions().filter(s => 
        s.toLowerCase().includes(value.toLowerCase())
      ))
    } else {
      setSuggestions([])
    }
  }, [showSuggestions, getSampleSuggestions])

  /**
   * Sélectionner une suggestion
   */
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion)
    setSuggestions([])
    inputRef.current?.focus()
  }, [])

  /**
   * Styles selon la variante
   */
  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          container: 'w-full max-w-2xl',
          input: 'w-full h-16 pl-6 pr-16 text-lg bg-white/10 border border-white/20 rounded-2xl',
          button: 'absolute right-3 top-3 w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-xl',
          suggestions: 'absolute top-full left-0 right-0 mt-2 bg-black/95 border border-white/20 rounded-xl'
        }
      case 'inline':
        return {
          container: 'w-full max-w-md',
          input: 'w-full h-10 pl-10 pr-10 text-sm bg-gray-800 border border-gray-600 rounded-lg',
          button: 'absolute right-2 top-2 w-6 h-6 text-purple-400 hover:text-purple-300',
          suggestions: 'absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-600 rounded-lg'
        }
      default: // header
        return {
          container: 'w-80',
          input: 'w-full h-12 pl-12 pr-12 bg-white/10 border border-white/20 rounded-2xl',
          button: 'absolute right-3 top-3 w-6 h-6 text-purple-400 hover:text-purple-300',
          suggestions: 'absolute top-full left-0 right-0 mt-2 bg-black/95 border border-white/20 rounded-xl'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <form onSubmit={handleSubmit} className={`relative ${styles.container} ${className}`}>
      <div className="relative">
        {/* Icône de recherche */}
        <MagnifyingGlassIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
          isFocused ? 'text-purple-400' : 'text-gray-400'
        } transition-colors duration-200`} />

        {/* Input de recherche */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder || t('nav.search_placeholder')}
          disabled={isLoading}
          className={`
            ${styles.input}
            focus:ring-2 focus:ring-purple-400 focus:border-purple-400/50 
            text-white placeholder-gray-400 
            transition-all duration-300 backdrop-blur-xl
            ${isFocused ? 'scale-105 shadow-2xl shadow-purple-500/20' : 'hover:bg-white/15'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        {/* Bouton clear ou loading */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Indicateurs de saisie */}
        {query && !isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && isFocused && (
        <div className={`${styles.suggestions} backdrop-blur-xl shadow-2xl z-50 py-2`}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center space-x-3"
            >
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
              <span>{suggestion}</span>
            </button>
          ))}
          
          {/* Hint */}
          <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-500">
            {t('forms.search_hint')}
          </div>
        </div>
      )}
    </form>
  )
}

/**
 * Composant de recherche simple pour usage rapide
 */
export function QuickSearch({
  onSearch,
  className = ''
}: {
  onSearch: (query: string) => void
  className?: string
}) {
  const [query, setQuery] = useState('')
  const { t } = useTranslation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex space-x-2 ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('nav.search_placeholder')}
        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
      />
      <button
        type="submit"
        disabled={!query.trim()}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        {t('actions.search')}
      </button>
    </form>
  )
}
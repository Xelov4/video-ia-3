/**
 * Loading Spinner Multilingue - Video-IA.net
 * 
 * Composant de chargement avec messages contextuels traduits.
 * Support multiple variants et animations fluides.
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useTranslation } from '@/src/hooks/useTranslation'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'tools' | 'categories' | 'search'
  message?: string
  showMessage?: boolean
  className?: string
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'default',
  message,
  showMessage = true,
  className = ''
}: LoadingSpinnerProps) {
  const { t } = useTranslation()

  // Messages par variant
  const getLoadingMessage = () => {
    if (message) return message
    
    switch (variant) {
      case 'tools':
        return t('messages.loading_tools')
      case 'categories':
        return t('messages.loading_categories')
      case 'search':
        return t('actions.search') + '...'
      default:
        return t('messages.loading')
    }
  }

  // Classes pour la taille
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-12 h-12'
      case 'xl':
        return 'w-16 h-16'
      default:
        return 'w-8 h-8'
    }
  }

  // Classes pour le texte
  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'lg':
        return 'text-lg'
      case 'xl':
        return 'text-xl'
      default:
        return 'text-sm'
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Spinner animé */}
      <div className="relative">
        {/* Cercle externe */}
        <div className={`${getSizeClasses()} border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin`} />
        
        {/* Effet de lueur */}
        <div className={`absolute inset-0 ${getSizeClasses()} border-4 border-transparent border-t-purple-400 rounded-full animate-spin opacity-60`} 
             style={{ animationDuration: '0.8s' }} />
        
        {/* Points d'animation internes pour les grandes tailles */}
        {(size === 'lg' || size === 'xl') && (
          <div className="absolute inset-2 flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Message de chargement */}
      {showMessage && (
        <div className="text-center">
          <p className={`${getTextSizeClasses()} font-medium text-gray-300 animate-pulse`}>
            {getLoadingMessage()}
          </p>
          
          {/* Points d'animation */}
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Composant de loading en ligne
 */
export function InlineLoading({ 
  text, 
  className = '' 
}: { 
  text?: string
  className?: string 
}) {
  const { t } = useTranslation()
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
      <span className="text-sm text-gray-400">
        {text || t('messages.loading')}
      </span>
    </div>
  )
}

/**
 * Composant de skeleton loading pour les cartes
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-800/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-700 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-700 rounded w-4/5" />
        <div className="h-4 bg-gray-700 rounded w-2/3" />
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
        <div className="h-3 bg-gray-700 rounded w-16" />
        <div className="h-8 bg-gray-700 rounded w-20" />
      </div>
    </div>
  )
}

/**
 * Composant de loading pour liste
 */
export function LoadingList({ 
  count = 3,
  className = '' 
}: { 
  count?: number
  className?: string 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
} 
/**
 * Composants de Messages d'État Multilingues - Video-IA.net
 * 
 * Composants pour afficher différents états : erreurs, succès, vide, etc.
 * Tous les messages sont traduits selon la langue active.
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useTranslation } from '@/src/hooks/useTranslation'
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

// Interface commune pour les props
interface StateMessageProps {
  title?: string
  message?: string
  className?: string
  onRetry?: () => void
  retryLabel?: string
  showRetry?: boolean
}

/**
 * Composant d'erreur générique
 */
export function ErrorMessage({
  title,
  message,
  className = '',
  onRetry,
  retryLabel,
  showRetry = true
}: StateMessageProps) {
  const { t, getErrorMessage } = useTranslation()

  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Icône d'erreur */}
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
        </div>

        {/* Messages */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            {title || getErrorMessage('generic')}
          </h3>
          {message && (
            <p className="text-gray-400 max-w-md">
              {message}
            </p>
          )}
        </div>

        {/* Bouton retry */}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>{retryLabel || t('messages.try_again')}</span>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Composant de succès
 */
export function SuccessMessage({
  title,
  message,
  className = ''
}: Omit<StateMessageProps, 'onRetry' | 'retryLabel' | 'showRetry'>) {
  const { t, getSuccessMessage } = useTranslation()

  return (
    <div className={`text-center py-8 px-6 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Icône de succès */}
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="w-8 h-8 text-green-400" />
        </div>

        {/* Messages */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            {title || getSuccessMessage('generic')}
          </h3>
          {message && (
            <p className="text-gray-400 max-w-md">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Composant d'information
 */
export function InfoMessage({
  title,
  message,
  className = ''
}: Omit<StateMessageProps, 'onRetry' | 'retryLabel' | 'showRetry'>) {
  return (
    <div className={`text-center py-8 px-6 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Icône d'info */}
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
          <InformationCircleIcon className="w-8 h-8 text-blue-400" />
        </div>

        {/* Messages */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          {message && (
            <p className="text-gray-400 max-w-md">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Composant pour aucun résultat trouvé
 */
export function NoResultsMessage({
  variant = 'search',
  searchQuery,
  className = '',
  onReset
}: {
  variant?: 'search' | 'tools' | 'categories'
  searchQuery?: string
  className?: string
  onReset?: () => void
}) {
  const { t } = useTranslation()

  const getIcon = () => {
    switch (variant) {
      case 'tools':
        return <MagnifyingGlassIcon className="w-12 h-12 text-gray-500" />
      case 'categories':
        return <MagnifyingGlassIcon className="w-12 h-12 text-gray-500" />
      default:
        return <MagnifyingGlassIcon className="w-12 h-12 text-gray-500" />
    }
  }

  const getTitle = () => {
    switch (variant) {
      case 'tools':
        return t('messages.no_tools_found')
      case 'categories':
        return t('messages.no_categories_found')
      default:
        return t('messages.no_results')
    }
  }

  const getMessage = () => {
    if (searchQuery) {
      return `${t('messages.no_results')} "${searchQuery}"`
    }
    return t('forms.search_hint')
  }

  return (
    <div className={`text-center py-16 px-6 ${className}`}>
      <div className="flex flex-col items-center space-y-6">
        {/* Icône */}
        <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center">
          {getIcon()}
        </div>

        {/* Messages */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">
            {getTitle()}
          </h3>
          <p className="text-gray-400 max-w-lg">
            {getMessage()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>{t('actions.reset')}</span>
            </button>
          )}

          <a
            href="/"
            className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            <span>{t('nav.home')}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * Composant d'erreur réseau
 */
export function NetworkErrorMessage({
  className = '',
  onRetry
}: {
  className?: string
  onRetry?: () => void
}) {
  const { t } = useTranslation()

  return (
    <ErrorMessage
      title={t('messages.error_network')}
      message={t('messages.try_again')}
      className={className}
      onRetry={onRetry}
      showRetry={!!onRetry}
    />
  )
}

/**
 * Composant 404 - Page non trouvée
 */
export function NotFoundMessage({
  className = ''
}: {
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div className={`text-center py-20 px-6 ${className}`}>
      <div className="flex flex-col items-center space-y-6">
        {/* 404 stylisé */}
        <div className="text-8xl font-bold text-gray-700">
          404
        </div>

        {/* Messages */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">
            {t('seo.page_not_found')}
          </h1>
          <p className="text-gray-400 max-w-md">
            {t('messages.error_not_found')}
          </p>
        </div>

        {/* Action */}
        <a
          href="/"
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <HomeIcon className="w-4 h-4" />
          <span>{t('seo.go_home')}</span>
        </a>
      </div>
    </div>
  )
}

/**
 * Toast notification multilingue
 */
export function Toast({
  type = 'info',
  message,
  onClose,
  autoClose = true,
  duration = 5000
}: {
  type?: 'success' | 'error' | 'info' | 'warning'
  message: string
  onClose: () => void
  autoClose?: boolean
  duration?: number
}) {
  const { t } = useTranslation()

  // Auto close
  if (autoClose) {
    setTimeout(onClose, duration)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div className={`
      flex items-center space-x-3 p-4 rounded-lg border backdrop-blur-xl
      ${getColorClasses()}
      animate-in slide-in-from-right-full duration-300
    `}>
      {getIcon()}
      <p className="flex-1 text-sm text-white">
        {message}
      </p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
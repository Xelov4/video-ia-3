/**
 * Composant Tooltip Multilingue - Video-IA.net
 * 
 * Tooltips intelligents avec messages traduits et positionnement automatique.
 * Support pour différents types de contenus et interactions.
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { useTranslation } from '@/src/hooks/useTranslation'

interface TooltipProps {
  content: string | ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  trigger?: 'hover' | 'click' | 'focus'
  delay?: number
  className?: string
  children: ReactNode
  disabled?: boolean
  maxWidth?: string
}

export default function Tooltip({
  content,
  position = 'auto',
  trigger = 'hover',
  delay = 500,
  className = '',
  children,
  disabled = false,
  maxWidth = '16rem'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  /**
   * Calculer la meilleure position pour le tooltip
   */
  const calculatePosition = () => {
    if (!triggerRef.current || position !== 'auto') {
      return position
    }

    const rect = triggerRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Priorité : top > bottom > right > left
    if (rect.top > 100) return 'top'
    if (rect.bottom < viewport.height - 100) return 'bottom'
    if (rect.right < viewport.width - 200) return 'right'
    return 'left'
  }

  /**
   * Afficher le tooltip avec délai
   */
  const showTooltip = () => {
    if (disabled || !content) return

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const timeout = setTimeout(() => {
      setActualPosition(calculatePosition())
      setIsVisible(true)
    }, delay)

    setTimeoutId(timeout)
  }

  /**
   * Masquer le tooltip
   */
  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  /**
   * Gérer les événements selon le trigger
   */
  const getEventHandlers = () => {
    switch (trigger) {
      case 'click':
        return {
          onClick: () => isVisible ? hideTooltip() : showTooltip(),
        }
      case 'focus':
        return {
          onFocus: showTooltip,
          onBlur: hideTooltip,
        }
      default: // hover
        return {
          onMouseEnter: showTooltip,
          onMouseLeave: hideTooltip,
          onFocus: showTooltip,
          onBlur: hideTooltip,
        }
    }
  }

  /**
   * Classes CSS pour le positionnement
   */
  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 pointer-events-none'
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
    }
  }

  /**
   * Classes CSS pour la flèche
   */
  const getArrowClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'
      case 'bottom':
        return 'absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900'
      case 'left':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900'
      case 'right':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
      default:
        return 'absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return (
    <div ref={triggerRef} className={`relative inline-block ${className}`}>
      {/* Trigger element */}
      <div {...getEventHandlers()}>
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={getPositionClasses()}
          style={{ maxWidth }}
        >
          <div className="relative">
            {/* Tooltip content */}
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-2xl border border-gray-700 backdrop-blur-sm">
              {typeof content === 'string' ? (
                <span>{content}</span>
              ) : (
                content
              )}
            </div>

            {/* Arrow */}
            <div className={getArrowClasses()} />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Tooltip avec contenu riche
 */
export function RichTooltip({
  title,
  description,
  action,
  icon,
  ...props
}: Omit<TooltipProps, 'content'> & {
  title: string
  description?: string
  action?: string
  icon?: ReactNode
}) {
  const content = (
    <div className="space-y-2 max-w-xs">
      <div className="flex items-center space-x-2">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      {description && (
        <p className="text-gray-300 text-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="pt-1 border-t border-gray-600">
          <p className="text-xs text-purple-300 font-medium">{action}</p>
        </div>
      )}
    </div>
  )

  return <Tooltip {...props} content={content} />
}

/**
 * Tooltip d'aide contextuelle
 */
export function HelpTooltip({
  helpKey,
  className = '',
  ...props
}: Omit<TooltipProps, 'content' | 'children'> & {
  helpKey: string
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <Tooltip
      content={t(`help.${helpKey}`) || helpKey}
      position="top"
      className={className}
      {...props}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors"
        aria-label="Help"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
    </Tooltip>
  )
}

/**
 * Tooltip d'information pour les fonctionnalités
 */
export function FeatureTooltip({
  feature,
  isNew = false,
  isBeta = false,
  children,
  ...props
}: Omit<TooltipProps, 'content'> & {
  feature: string
  isNew?: boolean
  isBeta?: boolean
}) {
  const { t } = useTranslation()

  const getBadge = () => {
    if (isNew) return <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">NEW</span>
    if (isBeta) return <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">BETA</span>
    return null
  }

  const content = (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-white">{feature}</span>
        {getBadge()}
      </div>
      <p className="text-xs text-gray-300">
        {t(`features.${feature.toLowerCase().replace(/\s+/g, '_')}_description`) || 
         'Cette fonctionnalité améliore votre expérience.'}
      </p>
    </div>
  )

  return (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  )
}
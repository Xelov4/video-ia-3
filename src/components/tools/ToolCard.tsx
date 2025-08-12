/**
 * Tool Card Component
 * Professional tool display card with image, rating, and actions
 */

import Link from 'next/link'
import Image from 'next/image'
import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools'
import { 
  EyeIcon, 
  HeartIcon, 
  StarIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { formatNumber } from '@/src/lib/utils/formatNumbers'

interface ToolCardProps {
  tool: ToolWithTranslation
  showCategory?: boolean
  size?: 'small' | 'medium' | 'large'
  lang?: string
}

export const ToolCard = ({ tool, showCategory = true, size = 'medium', lang = 'en' }: ToolCardProps) => {
  const qualityScore = tool.qualityScore || 0
  const rating = (qualityScore / 2) || 0
  
  const cardSizes = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  }

  // Multilingual messages
  const messages = {
    'en': {
      featured: '⭐ Featured',
      premium: 'Premium',
      viewDetails: 'View Details',
      visitSite: 'Visit Site',
      noDescription: 'No description available'
    },
    'fr': {
      featured: '⭐ Mis en avant',
      premium: 'Premium',
      viewDetails: 'Voir les détails',
      visitSite: 'Visiter le site',
      noDescription: 'Aucune description disponible'
    },
    'de': {
      featured: '⭐ Empfohlen',
      premium: 'Premium',
      viewDetails: 'Details anzeigen',
      visitSite: 'Website besuchen',
      noDescription: 'Keine Beschreibung verfügbar'
    },
    'nl': {
      featured: '⭐ Uitgelicht',
      premium: 'Premium',
      viewDetails: 'Bekijk details',
      visitSite: 'Bezoek site',
      noDescription: 'Geen beschrijving beschikbaar'
    },
    'es': {
      featured: '⭐ Destacado',
      premium: 'Premium',
      viewDetails: 'Ver detalles',
      visitSite: 'Visitar sitio',
      noDescription: 'Sin descripción disponible'
    },
    'it': {
      featured: '⭐ In evidenza',
      premium: 'Premium',
      viewDetails: 'Vedi dettagli',
      visitSite: 'Visita sito',
      noDescription: 'Nessuna descrizione disponibile'
    },
    'pt': {
      featured: '⭐ Destaque',
      premium: 'Premium',
      viewDetails: 'Ver detalhes',
      visitSite: 'Visitar site',
      noDescription: 'Nenhuma descrição disponível'
    }
  }

  const t = messages[lang as keyof typeof messages] || messages['en']

  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const imageUrl = isValidImageUrl((tool as any).logoUrl || (tool as any).screenshotUrl) 
    ? ((tool as any).logoUrl || (tool as any).screenshotUrl)! 
    : `https://picsum.photos/400/250?random=${encodeURIComponent(tool.displayName)}`

  return (
    <div className="group bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-700">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageUrl}
          alt={tool.displayName}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          {tool.featured && (
            <span className="inline-flex items-center px-2 py-1 bg-yellow-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
              {t.featured}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          {qualityScore >= 8 && (
            <span className="inline-flex items-center px-2 py-1 bg-green-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
              {t.premium}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cardSizes[size]}>
        {/* Category (if shown) */}
        {showCategory && tool.toolCategory && (
          <div className="mb-3">
            <Link
              href={`/${lang}/categories/${encodeURIComponent(tool.toolCategory.toLowerCase().replace(/\s+/g, '-'))}`}
              className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full hover:bg-blue-500/30 transition-colors"
            >
              {tool.toolCategory}
            </Link>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
          <Link href={`/${lang}/tools/${tool.slug || tool.id}`} className="hover:underline">
            {tool.displayName}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {tool.displayOverview || tool.displayDescription?.substring(0, 150) + '...' || t.noDescription}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center mr-2">
            {[...Array(5)].map((_, i) => (
              <StarSolidIcon
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-white">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400 ml-1">
            ({qualityScore}/10)
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-6">
          <div className="flex items-center">
            <EyeIcon className="w-3 h-3 mr-1" />
            {formatNumber(tool.viewCount || 0)}
          </div>
          <div className="flex items-center">
            <HeartIcon className="w-3 h-3 mr-1" />
            {formatNumber(tool.favoriteCount || 0)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            href={`/${lang}/tools/${tool.slug || tool.id}`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 px-4 rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            {t.viewDetails}
          </Link>
          {tool.toolLink && (
            <a
              href={tool.toolLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors"
              title={t.visitSite}
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
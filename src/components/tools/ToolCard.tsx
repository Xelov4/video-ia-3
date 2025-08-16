/**
 * ToolCard - Composant de carte d'outil optimisé
 * 
 * Composant lazy-loaded pour afficher les informations d'un outil
 * avec optimisations de performance et rendu conditionnel.
 */

import React, { memo } from 'react'
import { Star, Eye, Calendar, Tag } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools'

interface ToolCardProps {
  tool: ToolWithTranslation
  lang: string
}

const ToolCard = memo(({ tool, lang }: ToolCardProps) => {
  // Optimisation : calcul des valeurs une seule fois
  const qualityScore = tool.quality_score || 0
  const displayScore = (qualityScore / 2).toFixed(1)
  const viewCount = tool.view_count || 0
  const hasImage = tool.image_url && tool.image_url.length > 0
  const hasVideo = tool.video_url && tool.video_url.length > 0
  
  // Formatage des dates avec Intl pour la performance
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(dateString))
    } catch {
      return dateString
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
            {tool.displayName || tool.name}
          </CardTitle>
          {qualityScore > 0 && (
            <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{displayScore}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Image de l'outil avec lazy loading */}
        {hasImage && (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={tool.image_url}
              alt={tool.displayName || tool.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
            {hasVideo && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                <Tag className="w-3 h-3" />
              </div>
            )}
          </div>
        )}
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
          {tool.displayOverview || tool.overview || tool.description}
        </p>
        
        {/* Métadonnées */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium">{tool.category}</span>
            {tool.audience && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {tool.audience}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{viewCount.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tool.tags.split(',').slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag.trim()}
              </span>
            ))}
            {tool.tags.split(',').length > 3 && (
              <span className="text-xs text-gray-400">+{tool.tags.split(',').length - 3}</span>
            )}
          </div>
        )}
        
        {/* Date de mise à jour */}
        {tool.updated_at && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(tool.updated_at)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

ToolCard.displayName = 'ToolCard'

export default ToolCard
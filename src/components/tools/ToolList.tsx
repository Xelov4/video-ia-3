/**
 * ToolList - Composant d'affichage en liste optimisé
 * 
 * Composant lazy-loaded pour afficher les outils en format liste
 * avec optimisations de performance et rendu conditionnel.
 */

import React, { memo } from 'react'
import { Star, Eye, Calendar, Tag, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/src/components/ui/Card'
import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools'

interface ToolListProps {
  tools: ToolWithTranslation[]
  lang: string
}

const ToolList = memo(({ tools, lang }: ToolListProps) => {
  // Optimisation : formatage des dates avec Intl
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
    <div className="space-y-4">
      {tools.map((tool) => {
        const qualityScore = tool.quality_score || 0
        const displayScore = (qualityScore / 2).toFixed(1)
        const viewCount = tool.view_count || 0
        const hasImage = tool.image_url && tool.image_url.length > 0
        const hasVideo = tool.video_url && tool.video_url.length > 0

        return (
          <Card key={tool.id} className="hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Image de l'outil */}
                {hasImage && (
                  <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={tool.image_url}
                      alt={tool.displayName || tool.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                    {hasVideo && (
                      <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                        <Tag className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                )}

                {/* Contenu principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                        {tool.displayName || tool.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {tool.category}
                        {tool.audience && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {tool.audience}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Score de qualité */}
                    {qualityScore > 0 && (
                      <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0 ml-4">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{displayScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                    {tool.displayOverview || tool.overview || tool.description}
                  </p>

                  {/* Métadonnées et actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {/* Nombre de vues */}
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{viewCount.toLocaleString()}</span>
                      </div>

                      {/* Date de mise à jour */}
                      {tool.updated_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(tool.updated_at)}</span>
                        </div>
                      )}

                      {/* Tags */}
                      {tool.tags && tool.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {tool.tags.split(',').slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                          {tool.tags.split(',').length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{tool.tags.split(',').length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {tool.tool_link && (
                        <a
                          href={tool.tool_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {lang === 'fr' ? 'Visiter' : 'Visit'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})

ToolList.displayName = 'ToolList'

export default ToolList

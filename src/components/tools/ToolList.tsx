/**
 * ToolList - Composant d'affichage en liste optimisé
 *
 * Composant lazy-loaded pour afficher les outils en format liste
 * avec optimisations de performance et rendu conditionnel.
 */

import React, { memo } from 'react';
import { Star, Eye, Calendar, Tag, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools';
import { SafeImage } from '@/src/components/ui/SafeImage';

interface ToolListProps {
  tools: ToolWithTranslation[];
  lang: string;
}

const ToolList = memo(({ tools, lang }: ToolListProps) => {
  // Optimisation : formatage des dates avec Intl
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className='space-y-4'>
      {tools.map(tool => {
        const qualityScore = tool.quality_score || 0;
        const displayScore = (qualityScore / 2).toFixed(1);
        const viewCount = tool.view_count || 0;
        const hasImage = tool.image_url && tool.image_url.length > 0;
        const hasVideo = tool.video_url && tool.video_url.length > 0;

        return (
          <Card
            key={tool.id}
            className='group transition-all duration-200 hover:shadow-md'
          >
            <CardContent className='p-6'>
              <div className='flex items-start gap-4'>
                {/* Image de l'outil */}
                {hasImage && (
                  <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100'>
                    <SafeImage
                      src={tool.image_url}
                      alt={tool.displayName || tool.name}
                      fill
                      sizes='96px'
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                    {hasVideo && (
                      <div className='absolute right-1 top-1 rounded-full bg-red-500 px-1 py-0.5 text-xs text-white'>
                        <Tag className='h-2 w-2' />
                      </div>
                    )}
                  </div>
                )}

                {/* Contenu principal */}
                <div className='min-w-0 flex-1'>
                  <div className='mb-2 flex items-start justify-between'>
                    <div className='min-w-0 flex-1'>
                      <h3 className='line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white'>
                        {tool.displayName || tool.name}
                      </h3>
                      <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                        {tool.category}
                        {tool.audience && (
                          <span className='ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                            {tool.audience}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Score de qualité */}
                    {qualityScore > 0 && (
                      <div className='ml-4 flex flex-shrink-0 items-center gap-1 text-yellow-500'>
                        <Star className='h-4 w-4 fill-current' />
                        <span className='text-sm font-medium'>{displayScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className='mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                    {tool.displayOverview || tool.overview || tool.description}
                  </p>

                  {/* Métadonnées et actions */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      {/* Nombre de vues */}
                      <div className='flex items-center gap-1'>
                        <Eye className='h-3 w-3' />
                        <span>{viewCount.toLocaleString()}</span>
                      </div>

                      {/* Date de mise à jour */}
                      {tool.updated_at && (
                        <div className='flex items-center gap-1'>
                          <Calendar className='h-3 w-3' />
                          <span>{formatDate(tool.updated_at)}</span>
                        </div>
                      )}

                      {/* Tags */}
                      {tool.tags && tool.tags.length > 0 && (
                        <div className='flex items-center gap-1'>
                          {tool.tags
                            .split(',')
                            .slice(0, 2)
                            .map((tag, index) => (
                              <span
                                key={index}
                                className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-600'
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          {tool.tags.split(',').length > 2 && (
                            <span className='text-xs text-gray-400'>
                              +{tool.tags.split(',').length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className='flex items-center gap-2'>
                      {tool.tool_link && (
                        <a
                          href={tool.tool_link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1 text-sm text-blue-600 transition-colors hover:text-blue-700'
                        >
                          <ExternalLink className='h-3 w-3' />
                          {lang === 'fr' ? 'Visiter' : 'Visit'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

ToolList.displayName = 'ToolList';

export default ToolList;

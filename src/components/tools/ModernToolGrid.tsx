'use client';

import * as React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/src/components/ui/SafeImage';
import {
  Star,
  ExternalLink,
  Zap,
  Crown,
  Bookmark,
  Heart,
  Eye,
  TrendingUp,
  Clock,
} from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';

interface Tool {
  id: number;
  slug: string;
  name: string;
  displayName: string;
  overview?: string;
  description?: string;
  category: string;
  imageUrl?: string;
  featured?: boolean;
  isNew?: boolean;
  qualityScore?: number;
  views?: number;
  likes?: number;
  pricing?: 'free' | 'freemium' | 'paid' | 'enterprise';
  tags?: string[];
  lastUpdated?: string;
}

interface ModernToolGridProps {
  tools: Tool[];
  loading?: boolean;
  lang?: string;
  onToolClick?: (tool: Tool) => void;
  onBookmark?: (toolId: number) => void;
  onLike?: (toolId: number) => void;
  bookmarkedTools?: number[];
  likedTools?: number[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  totalCount?: number;
}

const PRICING_COLORS = {
  free: 'bg-green-100 text-green-800 border-green-200',
  freemium: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-purple-100 text-purple-800 border-purple-200',
  enterprise: 'bg-orange-100 text-orange-800 border-orange-200',
};

const PRICING_LABELS = {
  free: 'Gratuit',
  freemium: 'Freemium',
  paid: 'Payant',
  enterprise: 'Entreprise',
};

const LoadingSkeleton = () => (
  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
    {Array.from({ length: 12 }).map((_, i) => (
      <Card key={i} className='overflow-hidden'>
        <CardHeader className='space-y-0 pb-4'>
          <div className='flex items-start justify-between'>
            <div className='h-12 w-12 animate-pulse rounded-lg bg-muted' />
            <div className='h-6 w-16 animate-pulse rounded bg-muted' />
          </div>
          <div className='space-y-2'>
            <div className='h-6 animate-pulse rounded bg-muted' />
            <div className='h-4 w-2/3 animate-pulse rounded bg-muted' />
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='h-4 animate-pulse rounded bg-muted' />
            <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
          </div>
        </CardContent>
        <CardFooter>
          <div className='flex w-full justify-between'>
            <div className='h-8 w-20 animate-pulse rounded bg-muted' />
            <div className='flex space-x-2'>
              <div className='h-8 w-8 animate-pulse rounded bg-muted' />
              <div className='h-8 w-8 animate-pulse rounded bg-muted' />
            </div>
          </div>
        </CardFooter>
      </Card>
    ))}
  </div>
);

export default function ModernToolGrid({
  tools,
  loading = false,
  lang = 'fr',
  onToolClick,
  onBookmark,
  onLike,
  bookmarkedTools = [],
  likedTools = [],
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  totalCount,
}: ModernToolGridProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (tools.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
          <Zap className='h-8 w-8 text-muted-foreground' />
        </div>
        <h3 className='mb-2 text-lg font-semibold'>Aucun outil trouvé</h3>
        <p className='max-w-md text-muted-foreground'>
          Essayez d'ajuster vos filtres ou votre recherche pour trouver les outils IA
          qui vous intéressent.
        </p>
      </div>
    );
  }

  const getToolUrl = (tool: Tool) => {
    const basePath = lang === 'en' ? '' : `/${lang}`;
    return `${basePath}/t/${tool.slug || tool.id}`;
  };

  return (
    <div className='space-y-6'>
      {/* Results Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <h2 className='text-2xl font-bold'>Outils IA</h2>
          <Badge variant='secondary' className='text-sm'>
            {tools.length} {tools.length === 1 ? 'outil' : 'outils'}
          </Badge>
        </div>
        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <TrendingUp className='h-4 w-4' />
          <span>Triés par popularité</span>
        </div>
      </div>

      {/* Tools Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {tools.map(tool => {
          const isBookmarked = bookmarkedTools.includes(tool.id);
          const isLiked = likedTools.includes(tool.id);

          return (
            <Card
              key={tool.id}
              className='group cursor-pointer overflow-hidden border-2 border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-500 hover:shadow-xl'
              onClick={() => onToolClick?.(tool)}
            >
              {/* Image Section */}
              <div className='relative h-48 w-full overflow-hidden bg-gray-100'>
                <SafeImage
                  src={tool.imageUrl || '/images/placeholder-tool.png'}
                  alt={tool.displayName}
                  fill
                  className='object-cover transition-transform duration-300 group-hover:scale-105'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />

                {/* Badges Overlay */}
                <div className='absolute right-3 top-3 flex flex-col space-y-1'>
                  {tool.featured && (
                    <Badge className='border-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'>
                      <Crown className='mr-1 h-3 w-3' />
                      Vedette
                    </Badge>
                  )}
                  {tool.isNew && (
                    <Badge className='border-0 bg-green-500 text-white shadow-md'>
                      <Zap className='mr-1 h-3 w-3' />
                      Nouveau
                    </Badge>
                  )}
                </div>

                {/* Category Badge */}
                {tool.pricing && (
                  <div className='absolute bottom-3 left-3'>
                    <Badge
                      variant='secondary'
                      className={cn('shadow-md', PRICING_COLORS[tool.pricing])}
                    >
                      {PRICING_LABELS[tool.pricing]}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Header with title and category */}
              <CardHeader className='space-y-0 bg-white pb-4'>
                <div className='mb-3 flex items-start justify-between'>
                  <div className='flex-1'>
                    <h3 className='mb-2 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600'>
                      {tool.displayName}
                    </h3>
                    <Badge
                      variant='outline'
                      className='border-gray-300 text-xs text-gray-700'
                    >
                      {tool.category}
                    </Badge>
                  </div>
                </div>

                {/* Quality Score */}
                {tool.qualityScore && (
                  <div className='flex items-center space-x-1'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='text-sm font-medium text-gray-900'>
                      {tool.qualityScore.toFixed(1)}
                    </span>
                    <span className='text-xs text-gray-600'>/10</span>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <p className='line-clamp-3 text-sm leading-relaxed text-gray-600'>
                  {tool.overview ||
                    tool.description ||
                    'Aucune description disponible.'}
                </p>

                {/* Tags */}
                {tool.tags && tool.tags.length > 0 && (
                  <div className='mt-3 flex flex-wrap gap-1'>
                    {tool.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant='secondary' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                    {tool.tags.length > 3 && (
                      <Badge variant='secondary' className='text-xs'>
                        +{tool.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className='mt-3 flex items-center space-x-4 text-xs text-gray-500'>
                  {tool.views && (
                    <div className='flex items-center space-x-1'>
                      <Eye className='h-3 w-3' />
                      <span>{tool.views.toLocaleString()}</span>
                    </div>
                  )}
                  {tool.likes && (
                    <div className='flex items-center space-x-1'>
                      <Heart className='h-3 w-3' />
                      <span>{tool.likes}</span>
                    </div>
                  )}
                  {tool.lastUpdated && (
                    <div className='flex items-center space-x-1'>
                      <Clock className='h-3 w-3' />
                      <span>Mis à jour</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className='border-t bg-white pt-4'>
                <div className='flex w-full items-center justify-between'>
                  <Link href={getToolUrl(tool)} onClick={e => e.stopPropagation()}>
                    <Button
                      size='sm'
                      className='group bg-blue-600 text-white hover:bg-blue-700'
                    >
                      Découvrir
                      <ExternalLink className='ml-2 h-3 w-3 transition-transform group-hover:translate-x-1' />
                    </Button>
                  </Link>

                  <div className='flex items-center space-x-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation();
                        onBookmark?.(tool.id);
                      }}
                      className={cn(
                        'h-8 w-8 p-0',
                        isBookmarked && 'text-blue-600 hover:text-blue-700'
                      )}
                    >
                      <Bookmark
                        className={cn('h-4 w-4', isBookmarked && 'fill-current')}
                      />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation();
                        onLike?.(tool.id);
                      }}
                      className={cn(
                        'h-8 w-8 p-0',
                        isLiked && 'text-red-600 hover:text-red-700'
                      )}
                    >
                      <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Load More Button */}
      {tools.length > 0 && hasMore && onLoadMore && (
        <div className='flex flex-col items-center space-y-4 pt-8'>
          {totalCount && (
            <p className='text-sm text-muted-foreground'>
              {tools.length} sur {totalCount.toLocaleString()} outils affichés
            </p>
          )}
          <Button
            variant='outline'
            size='lg'
            className='px-8'
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current' />
                Chargement...
              </>
            ) : (
              <>
                Charger plus d'outils
                <TrendingUp className='ml-2 h-4 w-4' />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

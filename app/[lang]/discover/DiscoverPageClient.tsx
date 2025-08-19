/**
 * DiscoverPageClient - Composant Interactif
 *
 * Interface de découverte avancée avec filtres en temps réel,
 * gestion d'état URL, et expérience utilisateur optimisée.
 */

'use client';

import * as React from 'react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Filter, Grid as GridIcon, List, Star, Users } from 'lucide-react';
import { SupportedLocale } from '@/middleware';

import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { Container } from '@/src/components/ui/Container';
import { Grid } from '@/src/components/ui/Grid';

import {
  multilingualToolsService,
  ToolWithTranslation,
} from '@/src/lib/database/services/multilingual-tools';

interface DiscoverPageClientProps {
  lang: SupportedLocale;
  initialSearchParams: Record<string, string | undefined>;
  audiences: Array<{ name: string; count: number }>;
  useCases: Array<{ name: string; count: number }>;
  categories: Array<{ name: string; actualToolCount?: number; toolCount?: number }>;
  stats: {
    totalTools: number;
    totalCategories: number;
    totalAudiences: number;
    totalUseCases: number;
  };
}

interface Filters {
  query: string;
  audience: string;
  useCase: string;
  category: string;
  minQuality: number;
  sortBy: 'relevance' | 'name' | 'view_count' | 'quality_score';
  sortOrder: 'asc' | 'desc';
}

export default function DiscoverPageClient({
  lang,
  initialSearchParams,
  audiences,
  useCases,
  categories,
  stats: _stats,
}: DiscoverPageClientProps) {
  const router = useRouter();

  // État des filtres
  const [filters, setFilters] = useState<Filters>({
    query: initialSearchParams.q || '',
    audience: initialSearchParams.audience || '',
    useCase: initialSearchParams.useCase || '',
    category: initialSearchParams.category || '',
    minQuality: parseInt(initialSearchParams.quality || '0'),
    sortBy: (initialSearchParams.sort as Filters['sortBy']) || 'relevance',
    sortOrder: 'desc',
  });

  // État des résultats
  const [tools, setTools] = useState<ToolWithTranslation[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 24;

  // Fonction de recherche
  const searchTools = useCallback(
    async (newFilters: Filters, page: number = 1) => {
      setLoading(true);
      try {
        const result = await multilingualToolsService.searchTools({
          language: lang,
          query: newFilters.query || undefined,
          category: newFilters.category || undefined,
          tags:
            newFilters.audience || newFilters.useCase
              ? [newFilters.audience, newFilters.useCase].filter(Boolean)
              : undefined,
          minQualityScore:
            newFilters.minQuality > 0 ? newFilters.minQuality : undefined,
          sortBy: newFilters.sortBy === 'relevance' ? undefined : newFilters.sortBy,
          sortOrder: newFilters.sortOrder,
          page,
          limit: ITEMS_PER_PAGE,
        });

        if (page === 1) {
          setTools(result.tools);
        } else {
          setTools(prev => [...prev, ...result.tools]);
        }

        setTotalCount(result.pagination.totalCount);
        setCurrentPage(page);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    },
    [lang]
  );

  // Mettre à jour URL quand filtres changent
  const updateURL = useCallback(
    (newFilters: Filters) => {
      const params = new URLSearchParams();

      if (newFilters.query) params.set('q', newFilters.query);
      if (newFilters.audience) params.set('audience', newFilters.audience);
      if (newFilters.useCase) params.set('useCase', newFilters.useCase);
      if (newFilters.category) params.set('category', newFilters.category);
      if (newFilters.minQuality > 0)
        params.set('quality', newFilters.minQuality.toString());
      if (newFilters.sortBy !== 'relevance') params.set('sort', newFilters.sortBy);

      const url = `/${lang}/discover${params.toString() ? '?' + params.toString() : ''}`;
      router.replace(url, { scroll: false });
    },
    [lang, router]
  );

  // Handler pour changement de filtres
  const handleFilterChange = useCallback(
    (newFilters: Partial<Filters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      updateURL(updatedFilters);
      searchTools(updatedFilters, 1);
    },
    [filters, updateURL, searchTools]
  );

  // Charger plus de résultats
  const loadMore = useCallback(() => {
    searchTools(filters, currentPage + 1);
  }, [searchTools, filters, currentPage]);

  // Recherche initiale
  useEffect(() => {
    searchTools(filters, 1);
  }, [filters, searchTools]);

  // Réinitialiser filtres
  const resetFilters = useCallback(() => {
    const resetFilters: Filters = {
      query: '',
      audience: '',
      useCase: '',
      category: '',
      minQuality: 0,
      sortBy: 'relevance',
      sortOrder: 'desc',
    };
    setFilters(resetFilters);
    updateURL(resetFilters);
    searchTools(resetFilters, 1);
  }, [updateURL, searchTools]);

  // Textes localisés
  const getText = useCallback(
    (key: string): string => {
      const translations: Record<string, Record<string, string>> = {
        en: {
          title: 'Discover AI Tools',
          subtitle: 'Find the perfect AI tools for your needs',
          searchPlaceholder: 'Search 16,765+ AI tools...',
          filters: 'Filters',
          allAudiences: 'All Audiences',
          allUseCases: 'All Use Cases',
          allCategories: 'All Categories',
          minQuality: 'Minimum Quality',
          sortBy: 'Sort by',
          relevance: 'Relevance',
          name: 'Name',
          popularity: 'Popularity',
          quality: 'Quality',
          results: 'results',
          noResults: 'No tools found',
          noResultsDesc: 'Try adjusting your filters or search terms',
          loadMore: 'Load More',
          reset: 'Reset Filters',
          viewGrid: 'Grid View',
          viewList: 'List View',
          showFilters: 'Show Filters',
          hideFilters: 'Hide Filters',
        },
        fr: {
          title: 'Découvrir les Outils IA',
          subtitle: 'Trouvez les outils IA parfaits pour vos besoins',
          searchPlaceholder: 'Rechercher parmi 16 765+ outils IA...',
          filters: 'Filtres',
          allAudiences: 'Toutes les Audiences',
          allUseCases: "Tous les Cas d'Usage",
          allCategories: 'Toutes les Catégories',
          minQuality: 'Qualité Minimum',
          sortBy: 'Trier par',
          relevance: 'Pertinence',
          name: 'Nom',
          popularity: 'Popularité',
          quality: 'Qualité',
          results: 'résultats',
          noResults: 'Aucun outil trouvé',
          noResultsDesc: "Essayez d'ajuster vos filtres ou termes de recherche",
          loadMore: 'Charger Plus',
          reset: 'Réinitialiser',
          viewGrid: 'Vue Grille',
          viewList: 'Vue Liste',
          showFilters: 'Afficher Filtres',
          hideFilters: 'Masquer Filtres',
        },
        // Ajouter autres langues si nécessaire
      };

      return translations[lang]?.[key] || translations['en']?.[key] || key;
    },
    [lang]
  );

  const getLocalizedHref = useCallback(
    (path: string) => {
      if (lang === 'en') {
        return path === '/' ? '/' : path;
      }
      return path === '/' ? `/${lang}` : `/${lang}${path}`;
    },
    [lang]
  );

  // Calculer filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.audience) count++;
    if (filters.useCase) count++;
    if (filters.category) count++;
    if (filters.minQuality > 0) count++;
    return count;
  }, [filters]);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header Section */}
      <section className='border-b bg-white'>
        <Container size='xl'>
          <div className='py-12'>
            <div className='mb-8 text-center'>
              <h1 className='mb-4 text-4xl font-bold text-gray-900 md:text-5xl'>
                {getText('title')}
              </h1>
              <p className='mx-auto max-w-2xl text-xl text-gray-600'>
                {getText('subtitle')}
              </p>
            </div>

            {/* Barre de recherche principale */}
            <div className='mx-auto mb-8 max-w-2xl'>
              <div className='relative'>
                <Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                <input
                  type='text'
                  value={filters.query}
                  onChange={e => handleFilterChange({ query: e.target.value })}
                  placeholder={getText('searchPlaceholder')}
                  className='w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 text-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            {/* Stats et contrôles */}
            <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
              <div className='flex items-center space-x-6 text-sm text-gray-600'>
                <span>
                  {totalCount.toLocaleString()} {getText('results')}
                </span>
                {activeFiltersCount > 0 && (
                  <span className='flex items-center space-x-2'>
                    <Filter className='h-4 w-4' />
                    <span>{activeFiltersCount} active</span>
                  </span>
                )}
              </div>

              <div className='flex items-center space-x-4'>
                {/* Toggle Filtres Mobile */}
                <Button
                  variant='outline'
                  size='sm'
                  className='md:hidden'
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className='mr-2 h-4 w-4' />
                  {showFilters ? getText('hideFilters') : getText('showFilters')}
                </Button>

                {/* View Mode */}
                <div className='hidden rounded-lg border md:flex'>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                    title={getText('viewGrid')}
                  >
                    <GridIcon className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                    title={getText('viewList')}
                  >
                    <List className='h-4 w-4' />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={filters.sortBy}
                  onChange={e =>
                    handleFilterChange({ sortBy: e.target.value as Filters['sortBy'] })
                  }
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='relevance'>{getText('relevance')}</option>
                  <option value='name'>{getText('name')}</option>
                  <option value='view_count'>{getText('popularity')}</option>
                  <option value='quality_score'>{getText('quality')}</option>
                </select>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <Container size='xl'>
        <div className='py-8'>
          <div className='flex flex-col gap-8 lg:flex-row'>
            {/* Sidebar Filtres */}
            <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className='sticky top-24'>
                <Card>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='flex items-center'>
                        <Filter className='mr-2 h-5 w-5' />
                        {getText('filters')}
                      </CardTitle>
                      {activeFiltersCount > 0 && (
                        <Button variant='ghost' size='sm' onClick={resetFilters}>
                          {getText('reset')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {/* Audience Filter */}
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        {getText('allAudiences')}
                      </label>
                      <select
                        value={filters.audience}
                        onChange={e => handleFilterChange({ audience: e.target.value })}
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>{getText('allAudiences')}</option>
                        {audiences.map(audience => (
                          <option key={audience.name} value={audience.name}>
                            {audience.name} ({audience.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Use Case Filter */}
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        {getText('allUseCases')}
                      </label>
                      <select
                        value={filters.useCase}
                        onChange={e => handleFilterChange({ useCase: e.target.value })}
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>{getText('allUseCases')}</option>
                        {useCases.map(useCase => (
                          <option key={useCase.name} value={useCase.name}>
                            {useCase.name} ({useCase.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        {getText('allCategories')}
                      </label>
                      <select
                        value={filters.category}
                        onChange={e => handleFilterChange({ category: e.target.value })}
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>{getText('allCategories')}</option>
                        {categories.map(category => (
                          <option key={category.name} value={category.name}>
                            {category.name} (
                            {category.actualToolCount || category.toolCount || 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quality Filter */}
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        {getText('minQuality')}
                      </label>
                      <select
                        value={filters.minQuality}
                        onChange={e =>
                          handleFilterChange({ minQuality: parseInt(e.target.value) })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value={0}>Any Quality</option>
                        <option value={50}>5.0+ ⭐</option>
                        <option value={60}>6.0+ ⭐⭐</option>
                        <option value={70}>7.0+ ⭐⭐⭐</option>
                        <option value={80}>8.0+ ⭐⭐⭐⭐</option>
                        <option value={90}>9.0+ ⭐⭐⭐⭐⭐</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Results Area */}
            <main className='flex-1'>
              {loading && tools.length === 0 ? (
                <div className='py-12 text-center'>
                  <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
                  <p className='text-gray-600'>Searching tools...</p>
                </div>
              ) : tools.length === 0 ? (
                <div className='py-12 text-center'>
                  <div className='mx-auto mb-4 h-16 w-16 text-gray-400'>
                    <Search className='h-full w-full' />
                  </div>
                  <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                    {getText('noResults')}
                  </h3>
                  <p className='mb-4 text-gray-600'>{getText('noResultsDesc')}</p>
                  <Button variant='outline' onClick={resetFilters}>
                    {getText('reset')}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Grid Results */}
                  {viewMode === 'grid' ? (
                    <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap='md'>
                      {tools.map(tool => (
                        <Card key={tool.id} className='group h-full cursor-pointer'>
                          <a
                            href={getLocalizedHref(
                              `/t/${tool.slug || tool.toolName.toLowerCase().replace(/\s+/g, '-')}`
                            )}
                          >
                            <CardContent className='p-6'>
                              {tool.imageUrl && (
                                <div className='mb-4 h-32 w-full overflow-hidden rounded-lg bg-gray-100'>
                                  <Image
                                    src={tool.imageUrl}
                                    alt={tool.displayName}
                                    className='h-full w-full object-cover transition-transform group-hover:scale-105'
                                    width={300}
                                    height={200}
                                  />
                                </div>
                              )}

                              <div className='mb-3 flex items-center justify-between'>
                                <span className='rounded bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600'>
                                  {tool.toolCategory}
                                </span>
                                {tool.quality_score && (
                                  <div className='flex items-center'>
                                    <Star className='mr-1 h-4 w-4 text-yellow-400' />
                                    <span className='text-sm text-gray-600'>
                                      {tool.quality_score.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <h3 className='mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600'>
                                {tool.displayName}
                              </h3>

                              <p className='mb-4 line-clamp-3 text-sm text-gray-600'>
                                {tool.displayOverview || tool.displayDescription}
                              </p>

                              <div className='flex items-center justify-between'>
                                <div className='flex items-center text-sm text-gray-500'>
                                  <Users className='mr-1 h-4 w-4' />
                                  <span>{tool.viewCount || 0} users</span>
                                </div>
                                <div className='text-sm font-medium text-blue-600 group-hover:underline'>
                                  Learn More →
                                </div>
                              </div>
                            </CardContent>
                          </a>
                        </Card>
                      ))}
                    </Grid>
                  ) : (
                    /* List Results */
                    <div className='space-y-4'>
                      {tools.map(tool => (
                        <Card key={tool.id} className='group cursor-pointer'>
                          <a
                            href={getLocalizedHref(
                              `/t/${tool.slug || tool.toolName.toLowerCase().replace(/\s+/g, '-')}`
                            )}
                          >
                            <CardContent className='p-6'>
                              <div className='flex gap-6'>
                                {tool.imageUrl && (
                                  <div className='h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100'>
                                    <Image
                                      src={tool.imageUrl}
                                      alt={tool.displayName}
                                      className='h-full w-full object-cover transition-transform group-hover:scale-105'
                                      width={100}
                                      height={100}
                                    />
                                  </div>
                                )}
                                <div className='flex-1'>
                                  <div className='mb-2 flex items-start justify-between'>
                                    <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600'>
                                      {tool.displayName}
                                    </h3>
                                    <div className='flex items-center space-x-4'>
                                      {tool.quality_score && (
                                        <div className='flex items-center'>
                                          <Star className='mr-1 h-4 w-4 text-yellow-400' />
                                          <span className='text-sm text-gray-600'>
                                            {tool.quality_score.toFixed(1)}
                                          </span>
                                        </div>
                                      )}
                                      <span className='rounded bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600'>
                                        {tool.toolCategory}
                                      </span>
                                    </div>
                                  </div>
                                  <p className='mb-3 line-clamp-2 text-sm text-gray-600'>
                                    {tool.displayOverview || tool.displayDescription}
                                  </p>
                                  <div className='flex items-center justify-between'>
                                    <div className='flex items-center text-sm text-gray-500'>
                                      <Users className='mr-1 h-4 w-4' />
                                      <span>{tool.viewCount || 0} users</span>
                                    </div>
                                    <div className='text-sm font-medium text-blue-600 group-hover:underline'>
                                      Learn More →
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </a>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Load More Button */}
                  {tools.length < totalCount && (
                    <div className='mt-12 text-center'>
                      <Button
                        variant='outline'
                        size='lg'
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current'></div>
                        ) : null}
                        {getText('loadMore')} ({totalCount - tools.length} remaining)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </Container>
    </div>
  );
}

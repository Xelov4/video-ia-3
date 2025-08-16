/**
 * ToolsPageClient - Composant Interactif pour Page Tools
 * 
 * Interface de listing des outils avec filtres avancés, pagination optimisée,
 * vues multiples et gestion d'état URL pour partage et bookmarks.
 * 
 * Architecture basée sur DiscoverPageClient avec adaptations spécifiques :
 * - Pagination classique (vs pagination infinie)
 * - Filtres étendus pour outils
 * - Vues grille/liste/cartes
 * - URL state management complet
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, Grid, List, Star, Users, Zap, Calendar, Eye } from 'lucide-react'
import { SupportedLocale } from '@/middleware'

import { Container } from '@/src/components/ui/Container'
import { Button } from '@/src/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
import { Grid as GridLayout } from '@/src/components/ui/Grid'

import { multilingualToolsService, ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools'

interface ToolsPageClientProps {
  lang: SupportedLocale
  initialSearchParams: Record<string, string | undefined>
  audiences: Array<{ name: string; count: number }>
  useCases: Array<{ name: string; count: number }>
  categories: Array<{ name: string; actualToolCount?: number; toolCount?: number | null }>
  stats: {
    totalTools: number
    totalCategories: number
    totalAudiences: number
    totalUseCases: number
  }
}

interface Filters {
  query: string
  audience: string
  useCase: string
  category: string
  minQuality: number
  maxQuality: number
  sortBy: 'relevance' | 'name' | 'created_at' | 'view_count' | 'quality_score'
  sortOrder: 'asc' | 'desc'
  hasImage: boolean
  hasVideo: boolean
}

export default function ToolsPageClient({
  lang,
  initialSearchParams,
  audiences,
  useCases,
  categories,
  stats
}: ToolsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // État des filtres
  const [filters, setFilters] = useState<Filters>({
    query: initialSearchParams.search || '',
    audience: initialSearchParams.audience || '',
    useCase: initialSearchParams.useCase || '',
    category: initialSearchParams.category || '',
    minQuality: parseInt(initialSearchParams.minQuality || '0'),
    maxQuality: parseInt(initialSearchParams.maxQuality || '10'),
    sortBy: (initialSearchParams.sort as Filters['sortBy']) || 'created_at',
    sortOrder: (initialSearchParams.order as 'asc' | 'desc') || 'desc',
    hasImage: initialSearchParams.hasImage === 'true',
    hasVideo: initialSearchParams.hasVideo === 'true'
  })

  // État des résultats
  const [tools, setTools] = useState<ToolWithTranslation[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(parseInt(initialSearchParams.page || '1'))
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cards'>(
    (initialSearchParams.view as 'grid' | 'list' | 'cards') || 'grid'
  )
  const [showFilters, setShowFilters] = useState(false)

  const ITEMS_PER_PAGE = 24

  // Fonction de recherche avec pagination
  const searchTools = useCallback(async (newFilters: Filters, page: number = 1) => {
    setLoading(true)
    try {
      const result = await multilingualToolsService.searchTools({
        language: lang,
        query: newFilters.query || undefined,
        audience: newFilters.audience || undefined,
        useCase: newFilters.useCase || undefined,
        category: newFilters.category || undefined,
        filters: {
          minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined,
          hasImageUrl: newFilters.hasImage || undefined,
          hasVideoUrl: newFilters.hasVideo || undefined
        },
        sortBy: newFilters.sortBy,
        sortOrder: newFilters.sortOrder,
        page,
        limit: ITEMS_PER_PAGE
      })

      setTools(result.tools)
      setTotalCount(result.pagination.totalCount)
      setCurrentPage(page)

      // Mettre à jour l'URL
      updateURL(newFilters, page)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setLoading(false)
    }
  }, [lang])

  // Mise à jour de l'URL pour partage et bookmarks
  const updateURL = useCallback((newFilters: Filters, page: number) => {
    const params = new URLSearchParams()
    
    if (newFilters.query) params.set('search', newFilters.query)
    if (newFilters.audience) params.set('audience', newFilters.audience)
    if (newFilters.useCase) params.set('useCase', newFilters.useCase)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.minQuality > 0) params.set('minQuality', newFilters.minQuality.toString())
    if (newFilters.maxQuality < 10) params.set('maxQuality', newFilters.maxQuality.toString())
    if (newFilters.sortBy !== 'created_at') params.set('sort', newFilters.sortBy)
    if (newFilters.sortOrder !== 'desc') params.set('order', newFilters.sortOrder)
    if (newFilters.hasImage) params.set('hasImage', 'true')
    if (newFilters.hasVideo) params.set('hasVideo', 'true')
    if (page > 1) params.set('page', page.toString())
    if (viewMode !== 'grid') params.set('view', viewMode)

    const newURL = `/${lang}/tools?${params.toString()}`
    router.replace(newURL, { scroll: false })
  }, [lang, router, viewMode])

  // Gestion des changements de filtres
  const handleFilterChange = useCallback((key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    searchTools(newFilters, 1)
  }, [filters, searchTools])

  // Gestion de la pagination
  const handlePageChange = useCallback((page: number) => {
    searchTools(filters, page)
  }, [filters, searchTools])

  // Gestion du changement de vue
  const handleViewChange = useCallback((view: 'grid' | 'list' | 'cards') => {
    setViewMode(view)
    updateURL(filters, currentPage)
  }, [filters, currentPage, updateURL])

  // Recherche initiale
  useEffect(() => {
    searchTools(filters, currentPage)
  }, [])

  // Calcul de la pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Filtres actifs
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 0 && value !== 10 && value !== false
  ).length

  return (
    <Container className="py-8">
      {/* Header avec stats et contrôles */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {lang === 'fr' ? 'Outils IA' : 'AI Tools'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {lang === 'fr' 
                ? `${totalCount.toLocaleString()} outils disponibles`
                : `${totalCount.toLocaleString()} tools available`
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Bouton filtres mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              {lang === 'fr' ? 'Filtres' : 'Filters'}
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Sélecteur de vue */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('grid')}
                className="rounded-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={lang === 'fr' ? 'Rechercher des outils...' : 'Search tools...'}
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar des filtres */}
        <div className={`w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {lang === 'fr' ? 'Filtres' : 'Filters'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtre Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {lang === 'fr' ? 'Audience' : 'Audience'}
                </label>
                <select
                  value={filters.audience}
                  onChange={(e) => handleFilterChange('audience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{lang === 'fr' ? 'Toutes les audiences' : 'All audiences'}</option>
                  {audiences.map((audience) => (
                    <option key={audience.name} value={audience.name}>
                      {audience.name} ({audience.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre Cas d'usage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {lang === 'fr' ? 'Cas d\'usage' : 'Use Case'}
                </label>
                <select
                  value={filters.useCase}
                  onChange={(e) => handleFilterChange('useCase', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{lang === 'fr' ? 'Tous les cas d\'usage' : 'All use cases'}</option>
                  {useCases.map((useCase) => (
                    <option key={useCase.name} value={useCase.name}>
                      {useCase.name} ({useCase.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {lang === 'fr' ? 'Catégorie' : 'Category'}
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{lang === 'fr' ? 'Toutes les catégories' : 'All categories'}</option>
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.actualToolCount || category.toolCount || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre Qualité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {lang === 'fr' ? 'Note de qualité' : 'Quality Score'}
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={filters.minQuality}
                      onChange={(e) => handleFilterChange('minQuality', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {filters.minQuality}+
                    </span>
                  </div>
                </div>
              </div>

              {/* Filtres binaires */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasImage}
                    onChange={(e) => handleFilterChange('hasImage', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {lang === 'fr' ? 'Avec image' : 'With image'}
                  </span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasVideo}
                    onChange={(e) => handleFilterChange('hasVideo', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {lang === 'fr' ? 'Avec vidéo' : 'With video'}
                  </span>
                </label>
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {lang === 'fr' ? 'Trier par' : 'Sort by'}
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="created_at">{lang === 'fr' ? 'Plus récent' : 'Most recent'}</option>
                  <option value="name">{lang === 'fr' ? 'Nom A-Z' : 'Name A-Z'}</option>
                  <option value="view_count">{lang === 'fr' ? 'Plus populaire' : 'Most popular'}</option>
                  <option value="quality_score">{lang === 'fr' ? 'Meilleure qualité' : 'Best quality'}</option>
                </select>
              </div>

              {/* Bouton réinitialiser */}
              <Button
                variant="outline"
                onClick={() => {
                  const resetFilters: Filters = {
                    query: '',
                    audience: '',
                    useCase: '',
                    category: '',
                    minQuality: 0,
                    maxQuality: 10,
                    sortBy: 'created_at',
                    sortOrder: 'desc',
                    hasImage: false,
                    hasVideo: false
                  }
                  setFilters(resetFilters)
                  searchTools(resetFilters, 1)
                }}
                className="w-full"
              >
                {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          {/* Résultats */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {lang === 'fr' ? 'Chargement...' : 'Loading...'}
              </p>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {lang === 'fr' ? 'Aucun outil trouvé' : 'No tools found'}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  const resetFilters: Filters = {
                    query: '',
                    audience: '',
                    useCase: '',
                    category: '',
                    minQuality: 0,
                    maxQuality: 10,
                    sortBy: 'created_at',
                    sortOrder: 'desc',
                    hasImage: false,
                    hasVideo: false
                  }
                  setFilters(resetFilters)
                  searchTools(resetFilters, 1)
                }}
              >
                {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
              </Button>
            </div>
          ) : (
            <>
              {/* Grille des outils */}
              <div className="mb-8">
                {viewMode === 'grid' && (
                  <GridLayout cols={3} className="gap-6">
                    {tools.map((tool) => (
                      <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg font-semibold line-clamp-2">
                              {tool.displayName}
                            </CardTitle>
                            {tool.qualityScore && (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-medium">{tool.qualityScore}</span>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                            {tool.displayOverview || tool.displayDescription}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{tool.category}</span>
                            <span>{tool.viewCount?.toLocaleString() || 0} vues</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </GridLayout>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {tools.map((tool) => (
                      <Card key={tool.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{tool.displayName}</h3>
                                {tool.qualityScore && (
                                  <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-medium">{tool.qualityScore}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                {tool.displayOverview || tool.displayDescription}
                              </p>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <div>{tool.category}</div>
                              <div>{tool.viewCount?.toLocaleString() || 0} vues</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                  >
                    {lang === 'fr' ? 'Précédent' : 'Previous'}
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      if (totalPages <= 5) return page
                      
                      if (page === 1) return page
                      if (page === totalPages) return page
                      if (page >= currentPage - 1 && page <= currentPage + 1) return page
                      
                      if (page === currentPage - 2) return '...'
                      if (page === currentPage + 2) return '...'
                      
                      return null
                    }).filter(Boolean).map((page, i) => (
                      <Button
                        key={i}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...'}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    {lang === 'fr' ? 'Suivant' : 'Next'}
                  </Button>
                </div>
              )}

              {/* Info pagination */}
              <div className="text-center text-sm text-gray-500 mt-4">
                {lang === 'fr' 
                  ? `Affichage de ${((currentPage - 1) * ITEMS_PER_PAGE) + 1} à ${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} sur ${totalCount.toLocaleString()} outils`
                  : `Showing ${((currentPage - 1) * ITEMS_PER_PAGE) + 1} to ${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of ${totalCount.toLocaleString()} tools`
                }
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  )
}

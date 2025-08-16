/**
 * DiscoverPageClient - Composant Interactif
 * 
 * Interface de découverte avancée avec filtres en temps réel,
 * gestion d'état URL, et expérience utilisateur optimisée.
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, Grid, List, Sparkles, TrendingUp, Star, Users } from 'lucide-react'
import { SupportedLocale } from '@/middleware'

import { Container } from '@/src/components/ui/Container'
import { Button } from '@/src/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
import { Grid as GridLayout } from '@/src/components/ui/Grid'

import { multilingualToolsService, ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools'

interface DiscoverPageClientProps {
  lang: SupportedLocale
  initialSearchParams: Record<string, string | undefined>
  audiences: Array<{ name: string; count: number }>
  useCases: Array<{ name: string; count: number }>
  categories: Array<{ name: string; actualToolCount?: number; toolCount?: number }>
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
  sortBy: 'relevance' | 'name' | 'view_count' | 'quality_score'
  sortOrder: 'asc' | 'desc'
}

export default function DiscoverPageClient({
  lang,
  initialSearchParams,
  audiences,
  useCases,
  categories,
  stats
}: DiscoverPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // État des filtres
  const [filters, setFilters] = useState<Filters>({
    query: initialSearchParams.q || '',
    audience: initialSearchParams.audience || '',
    useCase: initialSearchParams.useCase || '',
    category: initialSearchParams.category || '',
    minQuality: parseInt(initialSearchParams.quality || '0'),
    sortBy: (initialSearchParams.sort as Filters['sortBy']) || 'relevance',
    sortOrder: 'desc'
  })

  // État des résultats
  const [tools, setTools] = useState<ToolWithTranslation[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const ITEMS_PER_PAGE = 24

  // Fonction de recherche
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
          minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined
        },
        sortBy: newFilters.sortBy,
        sortOrder: newFilters.sortOrder,
        page,
        limit: ITEMS_PER_PAGE
      })

      if (page === 1) {
        setTools(result.tools)
      } else {
        setTools(prev => [...prev, ...result.tools])
      }
      
      setTotalCount(result.pagination.totalCount)
      setCurrentPage(page)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [lang])

  // Mettre à jour URL quand filtres changent
  const updateURL = useCallback((newFilters: Filters) => {
    const params = new URLSearchParams()
    
    if (newFilters.query) params.set('q', newFilters.query)
    if (newFilters.audience) params.set('audience', newFilters.audience)
    if (newFilters.useCase) params.set('useCase', newFilters.useCase)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.minQuality > 0) params.set('quality', newFilters.minQuality.toString())
    if (newFilters.sortBy !== 'relevance') params.set('sort', newFilters.sortBy)

    const url = `/${lang}/discover${params.toString() ? '?' + params.toString() : ''}`
    router.replace(url, { scroll: false })
  }, [lang, router])

  // Handler pour changement de filtres
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
    searchTools(updatedFilters, 1)
  }, [filters, updateURL, searchTools])

  // Charger plus de résultats
  const loadMore = useCallback(() => {
    searchTools(filters, currentPage + 1)
  }, [searchTools, filters, currentPage])

  // Recherche initiale
  useEffect(() => {
    searchTools(filters, 1)
  }, []) // Volontairement vide pour éviter loop

  // Réinitialiser filtres
  const resetFilters = useCallback(() => {
    const resetFilters: Filters = {
      query: '',
      audience: '',
      useCase: '',
      category: '',
      minQuality: 0,
      sortBy: 'relevance',
      sortOrder: 'desc'
    }
    setFilters(resetFilters)
    updateURL(resetFilters)
    searchTools(resetFilters, 1)
  }, [updateURL, searchTools])

  // Textes localisés
  const getText = useCallback((key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'en': {
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
        hideFilters: 'Hide Filters'
      },
      'fr': {
        title: 'Découvrir les Outils IA',
        subtitle: 'Trouvez les outils IA parfaits pour vos besoins',
        searchPlaceholder: 'Rechercher parmi 16 765+ outils IA...',
        filters: 'Filtres',
        allAudiences: 'Toutes les Audiences',
        allUseCases: 'Tous les Cas d\'Usage',
        allCategories: 'Toutes les Catégories',
        minQuality: 'Qualité Minimum',
        sortBy: 'Trier par',
        relevance: 'Pertinence',
        name: 'Nom',
        popularity: 'Popularité',
        quality: 'Qualité',
        results: 'résultats',
        noResults: 'Aucun outil trouvé',
        noResultsDesc: 'Essayez d\'ajuster vos filtres ou termes de recherche',
        loadMore: 'Charger Plus',
        reset: 'Réinitialiser',
        viewGrid: 'Vue Grille',
        viewList: 'Vue Liste',
        showFilters: 'Afficher Filtres',
        hideFilters: 'Masquer Filtres'
      }
      // Ajouter autres langues si nécessaire
    }
    
    return translations[lang]?.[key] || translations['en'][key] || key
  }, [lang])

  const getLocalizedHref = useCallback((path: string) => {
    if (lang === 'en') {
      return path === '/' ? '/' : path
    }
    return path === '/' ? `/${lang}` : `/${lang}${path}`
  }, [lang])

  // Calculer filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.query) count++
    if (filters.audience) count++
    if (filters.useCase) count++
    if (filters.category) count++
    if (filters.minQuality > 0) count++
    return count
  }, [filters])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b">
        <Container size="xl">
          <div className="py-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {getText('title')}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {getText('subtitle')}
              </p>
            </div>

            {/* Barre de recherche principale */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleFilterChange({ query: e.target.value })}
                  placeholder={getText('searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stats et contrôles */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>{totalCount.toLocaleString()} {getText('results')}</span>
                {activeFiltersCount > 0 && (
                  <span className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>{activeFiltersCount} active</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Toggle Filtres Mobile */}
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? getText('hideFilters') : getText('showFilters')}
                </Button>

                {/* View Mode */}
                <div className="hidden md:flex border rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                    title={getText('viewGrid')}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                    title={getText('viewList')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as Filters['sortBy'] })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">{getText('relevance')}</option>
                  <option value="name">{getText('name')}</option>
                  <option value="view_count">{getText('popularity')}</option>
                  <option value="quality_score">{getText('quality')}</option>
                </select>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <Container size="xl">
        <div className="py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filtres */}
            <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        {getText('filters')}
                      </CardTitle>
                      {activeFiltersCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>
                          {getText('reset')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Audience Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getText('allAudiences')}
                      </label>
                      <select
                        value={filters.audience}
                        onChange={(e) => handleFilterChange({ audience: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{getText('allAudiences')}</option>
                        {audiences.map((audience) => (
                          <option key={audience.name} value={audience.name}>
                            {audience.name} ({audience.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Use Case Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getText('allUseCases')}
                      </label>
                      <select
                        value={filters.useCase}
                        onChange={(e) => handleFilterChange({ useCase: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{getText('allUseCases')}</option>
                        {useCases.map((useCase) => (
                          <option key={useCase.name} value={useCase.name}>
                            {useCase.name} ({useCase.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getText('allCategories')}
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange({ category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{getText('allCategories')}</option>
                        {categories.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name} ({category.actualToolCount || category.toolCount || 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quality Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getText('minQuality')}
                      </label>
                      <select
                        value={filters.minQuality}
                        onChange={(e) => handleFilterChange({ minQuality: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <main className="flex-1">
              {loading && tools.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching tools...</p>
                </div>
              ) : tools.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                    <Search className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getText('noResults')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {getText('noResultsDesc')}
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    {getText('reset')}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Grid Results */}
                  {viewMode === 'grid' ? (
                    <GridLayout cols={1} responsive={{ md: 2, lg: 3 }} gap="md">
                      {tools.map((tool) => (
                        <Card key={tool.id} variant="elevated" hover className="h-full group cursor-pointer">
                          <a href={getLocalizedHref(`/tools/${tool.slug || tool.toolName.toLowerCase().replace(/\s+/g, '-')}`)}>
                            <CardContent className="p-6">
                              {tool.imageUrl && (
                                <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                  <img 
                                    src={tool.imageUrl} 
                                    alt={tool.displayName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {tool.toolCategory}
                                </span>
                                {tool.quality_score && (
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span className="text-sm text-gray-600">{tool.quality_score.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>

                              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {tool.displayName}
                              </h3>
                              
                              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {tool.displayOverview || tool.displayDescription}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Users className="w-4 h-4 mr-1" />
                                  <span>{tool.viewCount || 0} users</span>
                                </div>
                                <div className="text-blue-600 text-sm font-medium group-hover:underline">
                                  Learn More →
                                </div>
                              </div>
                            </CardContent>
                          </a>
                        </Card>
                      ))}
                    </GridLayout>
                  ) : (
                    /* List Results */
                    <div className="space-y-4">
                      {tools.map((tool) => (
                        <Card key={tool.id} variant="outlined" hover className="group cursor-pointer">
                          <a href={getLocalizedHref(`/tools/${tool.slug || tool.toolName.toLowerCase().replace(/\s+/g, '-')}`)}>
                            <CardContent className="p-6">
                              <div className="flex gap-6">
                                {tool.imageUrl && (
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img 
                                      src={tool.imageUrl} 
                                      alt={tool.displayName}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {tool.displayName}
                                    </h3>
                                    <div className="flex items-center space-x-4">
                                      {tool.quality_score && (
                                        <div className="flex items-center">
                                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                          <span className="text-sm text-gray-600">{tool.quality_score.toFixed(1)}</span>
                                        </div>
                                      )}
                                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {tool.toolCategory}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {tool.displayOverview || tool.displayDescription}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Users className="w-4 h-4 mr-1" />
                                      <span>{tool.viewCount || 0} users</span>
                                    </div>
                                    <div className="text-blue-600 text-sm font-medium group-hover:underline">
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
                    <div className="text-center mt-12">
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
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
  )
}
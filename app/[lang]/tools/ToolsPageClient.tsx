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
  // Nouveaux filtres avancés
  priceRange: 'free' | 'freemium' | 'paid' | 'enterprise' | ''
  platform: 'web' | 'mobile' | 'desktop' | 'api' | ''
  language: string
  tags: string[]
  excludeTags: string[]
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | ''
  minViews: number
  maxViews: number
  // Logique de filtres
  filterLogic: 'AND' | 'OR'
  exactMatch: boolean
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
    hasVideo: initialSearchParams.hasVideo === 'true',
    // Nouveaux filtres avancés
    priceRange: (initialSearchParams.priceRange as Filters['priceRange']) || '',
    platform: (initialSearchParams.platform as Filters['platform']) || '',
    language: initialSearchParams.language || '',
    tags: initialSearchParams.tags ? initialSearchParams.tags.split(',') : [],
    excludeTags: initialSearchParams.excludeTags ? initialSearchParams.excludeTags.split(',') : [],
    dateRange: (initialSearchParams.dateRange as Filters['dateRange']) || '',
    minViews: parseInt(initialSearchParams.minViews || '0'),
    maxViews: parseInt(initialSearchParams.maxViews || '999999'),
    // Logique de filtres
    filterLogic: (initialSearchParams.filterLogic as 'AND' | 'OR') || 'AND',
    exactMatch: initialSearchParams.exactMatch === 'true'
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
  const [paginationMode, setPaginationMode] = useState<'classic' | 'infinite'>('classic')
  
  // Calcul des variables de pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; filters: Filters }>>([])
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  
  // Cache simple en mémoire pour les requêtes fréquentes
  const [queryCache, setQueryCache] = useState<Map<string, { data: ToolWithTranslation[]; totalCount: number; timestamp: number }>>(new Map())
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const ITEMS_PER_PAGE = 24

  // Charger les recherches sauvegardées depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tools-saved-searches-${lang}`)
      if (saved) {
        setSavedSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recherches sauvegardées:', error)
    }
  }, [lang])

  // Sauvegarder une recherche
  const saveSearch = useCallback((name: string, currentFilters: Filters) => {
    const newSavedSearch = { name, filters: { ...currentFilters } }
    const updatedSearches = [...savedSearches, newSavedSearch]
    setSavedSearches(updatedSearches)
    
    try {
      localStorage.setItem(`tools-saved-searches-${lang}`, JSON.stringify(updatedSearches))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }, [savedSearches, lang])

  // Charger une recherche sauvegardée
  const loadSavedSearch = useCallback((savedFilters: Filters) => {
    setFilters(savedFilters)
    searchTools(savedFilters, 1)
  }, [searchTools])

  // Supprimer une recherche sauvegardée
  const deleteSavedSearch = useCallback((index: number) => {
    const updatedSearches = savedSearches.filter((_, i) => i !== index)
    setSavedSearches(updatedSearches)
    
    try {
      localStorage.setItem(`tools-saved-searches-${lang}`, JSON.stringify(updatedSearches))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }, [savedSearches, lang])

  // Gestion du cache des requêtes
  const getCacheKey = useCallback((filters: Filters, page: number) => {
    return JSON.stringify({ ...filters, page, lang })
  }, [lang])

  const getFromCache = useCallback((cacheKey: string) => {
    const cached = queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached
    }
    return null
  }, [queryCache])

  const setCache = useCallback((cacheKey: string, data: ToolWithTranslation[], totalCount: number) => {
    setQueryCache(prev => new Map(prev).set(cacheKey, {
      data,
      totalCount,
      timestamp: Date.now()
    }))
  }, [])

  // Gestion du changement de page
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      searchTools(filters, page)
    }
  }, [searchTools, filters, totalPages])

  // Gestion du changement de vue
  const handleViewChange = useCallback((newViewMode: 'grid' | 'list' | 'cards') => {
    setViewMode(newViewMode)
    // Mettre à jour l'URL avec le mode de vue
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newViewMode)
    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  // Helper pour convertir les plages de dates
  const getDateFromRange = (range: string): Date => {
    const now = new Date()
    switch (range) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate())
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      case 'quarter':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      case 'year':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      default:
        return new Date(0)
    }
  }

  // Fonction de recherche avec pagination et logique de filtres avancés
  const searchTools = useCallback(async (newFilters: Filters, page: number = 1) => {
    setLoading(true)
    try {
      // Vérifier le cache d'abord
      const cacheKey = getCacheKey(newFilters, page)
      const cached = getFromCache(cacheKey)
      
      if (cached) {
        setTools(cached.data)
        setTotalCount(cached.totalCount)
        setCurrentPage(page)
        setLoading(false)
        return
      }

      // Traitement de la requête de recherche avec correspondance exacte
      let processedQuery = newFilters.query
      if (newFilters.exactMatch && newFilters.query) {
        // Correspondance exacte : ajouter des guillemets pour la recherche exacte
        processedQuery = `"${newFilters.query}"`
      }
      
      // Construction des filtres avec logique AND/OR
      const baseFilters = {
        language: lang,
        query: processedQuery || undefined,
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: newFilters.sortBy,
        sortOrder: newFilters.sortOrder
      }

      // Filtres conditionnels selon la logique choisie
      if (newFilters.filterLogic === 'AND') {
        // Logique ET : tous les filtres doivent être satisfaits
        const result = await multilingualToolsService.searchTools({
          ...baseFilters,
          audience: newFilters.audience || undefined,
          useCase: newFilters.useCase || undefined,
          category: newFilters.category || undefined,
          tags: newFilters.tags.length > 0 ? newFilters.tags : undefined,
          filters: {
            minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined,
            maxQualityScore: newFilters.maxQuality < 10 ? newFilters.maxQuality : undefined,
            hasImageUrl: newFilters.hasImage || undefined,
            hasVideoUrl: newFilters.hasVideo || undefined,
            minViewCount: newFilters.minViews > 0 ? newFilters.minViews : undefined,
            maxViewCount: newFilters.maxViews < 999999 ? newFilters.maxViews : undefined,
            updatedSince: newFilters.dateRange ? getDateFromRange(newFilters.dateRange) : undefined,
            ...(newFilters.platform && { platform: newFilters.platform }),
            ...(newFilters.priceRange && { priceRange: newFilters.priceRange }),
            ...(newFilters.language && { language: newFilters.language })
          }
        })
        setTools(result.tools)
        setTotalCount(result.pagination.totalCount)
      } else {
        // Logique OU : au moins un filtre doit être satisfait
        const searchPromises = []
        
        // Recherche par audience
        if (newFilters.audience) {
          searchPromises.push(
            multilingualToolsService.searchTools({
              ...baseFilters,
              audience: newFilters.audience,
              filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
            })
          )
        }
        
        // Recherche par cas d'usage
        if (newFilters.useCase) {
          searchPromises.push(
            multilingualToolsService.searchTools({
              ...baseFilters,
              useCase: newFilters.useCase,
              filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
            })
          )
        }
        
        // Recherche par catégorie
        if (newFilters.category) {
          searchPromises.push(
            multilingualToolsService.searchTools({
              ...baseFilters,
              category: newFilters.category,
              filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
            })
          )
        }
        
        // Recherche par tags
        if (newFilters.tags.length > 0) {
          searchPromises.push(
            multilingualToolsService.searchTools({
              ...baseFilters,
              tags: newFilters.tags,
              filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
            })
          )
        }
        
        // Si aucun filtre spécifique, recherche générale
        if (searchPromises.length === 0) {
          const result = await multilingualToolsService.searchTools({
            ...baseFilters,
            filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
          })
          setTools(result.tools)
          setTotalCount(result.pagination.totalCount)
        } else {
          // Combiner les résultats de toutes les recherches
          const results = await Promise.all(searchPromises)
          const allTools = results.flatMap(r => r.tools)
          const uniqueTools = allTools.filter((tool, index, self) => 
            index === self.findIndex(t => t.id === tool.id)
          )
          
          // Appliquer les filtres de qualité et autres critères
          const filteredTools = uniqueTools.filter(tool => {
            if (newFilters.minQuality > 0 && (tool.quality_score || 0) < newFilters.minQuality) return false
            if (newFilters.maxQuality < 10 && (tool.quality_score || 0) > newFilters.maxQuality) return false
            if (newFilters.hasImage && !tool.image_url) return false
            if (newFilters.hasVideo && !tool.video_url) return false
            if (newFilters.minViews > 0 && (tool.view_count || 0) < newFilters.minViews) return false
            if (newFilters.maxViews < 999999 && (tool.view_count || 0) > newFilters.maxViews) return false
            return true
          })
          
          setTools(filteredTools)
          setTotalCount(filteredTools.length)
        }
      }

      // Mettre en cache les résultats
      const finalTools = newFilters.filterLogic === 'AND' ? 
        (await multilingualToolsService.searchTools({
          ...baseFilters,
          audience: newFilters.audience || undefined,
          useCase: newFilters.useCase || undefined,
          category: newFilters.category || undefined,
          tags: newFilters.tags.length > 0 ? newFilters.tags : undefined,
          filters: {
            minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined,
            maxQualityScore: newFilters.maxQuality < 10 ? newFilters.maxQuality : undefined,
            hasImageUrl: newFilters.hasImage || undefined,
            hasVideoUrl: newFilters.hasVideo || undefined,
            minViewCount: newFilters.minViews > 0 ? newFilters.minViews : undefined,
            maxViewCount: newFilters.maxViews < 999999 ? newFilters.maxViews : undefined,
            updatedSince: newFilters.dateRange ? getDateFromRange(newFilters.dateRange) : undefined,
            ...(newFilters.platform && { platform: newFilters.platform }),
            ...(newFilters.priceRange && { priceRange: newFilters.priceRange }),
            ...(newFilters.language && { language: newFilters.language })
          }
        })).tools : 
        (newFilters.filterLogic === 'OR' ? 
          (() => {
            const searchPromises = []
            
            if (newFilters.audience) {
              searchPromises.push(
                multilingualToolsService.searchTools({
                  ...baseFilters,
                  audience: newFilters.audience,
                  filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
                })
              )
            }
            
            if (newFilters.useCase) {
              searchPromises.push(
                multilingualToolsService.searchTools({
                  ...baseFilters,
                  useCase: newFilters.useCase,
                  filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
                })
              )
            }
            
            if (newFilters.category) {
              searchPromises.push(
                multilingualToolsService.searchTools({
                  ...baseFilters,
                  category: newFilters.category,
                  filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
                })
              )
            }
            
            if (newFilters.tags.length > 0) {
              searchPromises.push(
                multilingualToolsService.searchTools({
                  ...baseFilters,
                  tags: newFilters.tags,
                  filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
                })
              )
            }
            
            if (searchPromises.length === 0) {
              return multilingualToolsService.searchTools({
                ...baseFilters,
                filters: { minQualityScore: newFilters.minQuality > 0 ? newFilters.minQuality : undefined }
              }).then(r => r.tools)
            } else {
              return Promise.all(searchPromises).then(results => {
                const allTools = results.flatMap(r => r.tools)
                const uniqueTools = allTools.filter((tool, index, self) => 
                  index === self.findIndex(t => t.id === tool.id)
                )
                
                return uniqueTools.filter(tool => {
                  if (newFilters.minQuality > 0 && (tool.quality_score || 0) < newFilters.minQuality) return false
                  if (newFilters.maxQuality < 10 && (tool.quality_score || 0) > newFilters.maxQuality) return false
                  if (newFilters.hasImage && !tool.image_url) return false
                  if (newFilters.hasVideo && !tool.video_url) return false
                  if (newFilters.minViews > 0 && (tool.view_count || 0) < newFilters.minViews) return false
                  if (newFilters.maxViews < 999999 && (tool.view_count || 0) > newFilters.maxViews) return false
                  return true
                })
              })
            }
          })() : 
          []
        )

      const finalTotalCount = finalTools.length

      // Mettre en cache les résultats
      setCache(cacheKey, finalTools, finalTotalCount)

      setCurrentPage(page)
      updateURL(newFilters, page)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setLoading(false)
    }
  }, [lang, getCacheKey, getFromCache, setCache, updateURL])

  // Mise à jour de l'URL pour partage et bookmarks
  const updateURL = useCallback((newFilters: Filters, page: number) => {
    const params = new URLSearchParams()
    
    // Filtres de base
    if (newFilters.query) params.set('search', newFilters.query)
    if (newFilters.audience) params.set('audience', newFilters.audience)
    if (newFilters.useCase) params.set('useCase', newFilters.useCase)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.minQuality > 0) params.set('minQuality', newFilters.minQuality.toString())
    if (newFilters.maxQuality < 10) params.set('maxQuality', newFilters.maxQuality.toString())
    
    // Nouveaux filtres avancés
    if (newFilters.priceRange) params.set('priceRange', newFilters.priceRange)
    if (newFilters.platform) params.set('platform', newFilters.platform)
    if (newFilters.language) params.set('language', newFilters.language)
    if (newFilters.tags.length > 0) params.set('tags', newFilters.tags.join(','))
    if (newFilters.excludeTags.length > 0) params.set('excludeTags', newFilters.excludeTags.join(','))
    if (newFilters.dateRange) params.set('dateRange', newFilters.dateRange)
    if (newFilters.minViews > 0) params.set('minViews', newFilters.minViews.toString())
    if (newFilters.maxViews < 999999) params.set('maxViews', newFilters.maxViews.toString())
    
    // Logique de filtres
    if (newFilters.filterLogic !== 'AND') params.set('filterLogic', newFilters.filterLogic)
    if (newFilters.exactMatch) params.set('exactMatch', 'true')
    
    // Paramètres de base
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
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder' || key === 'filterLogic') return false
    if (key === 'maxQuality' && value === 10) return false
    if (key === 'maxViews' && value === 999999) return false
    if (Array.isArray(value)) return value.length > 0
    return value !== '' && value !== 0 && value !== false
  }).length

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

            {/* Sélecteur de mode de pagination */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={paginationMode === 'classic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPaginationMode('classic')}
                className="rounded-none text-xs"
              >
                {lang === 'fr' ? 'Pages' : 'Pages'}
              </Button>
              <Button
                variant={paginationMode === 'infinite' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPaginationMode('infinite')}
                className="rounded-none text-xs"
              >
                {lang === 'fr' ? 'Infinie' : 'Infinite'}
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

              {/* Section Filtres Avancés */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  {lang === 'fr' ? 'Filtres Avancés' : 'Advanced Filters'}
                </h4>
                
                {/* Plage de prix */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {lang === 'fr' ? 'Modèle de prix' : 'Pricing Model'}
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{lang === 'fr' ? 'Tous les modèles' : 'All models'}</option>
                    <option value="free">{lang === 'fr' ? 'Gratuit' : 'Free'}</option>
                    <option value="freemium">{lang === 'fr' ? 'Freemium' : 'Freemium'}</option>
                    <option value="paid">{lang === 'fr' ? 'Payant' : 'Paid'}</option>
                    <option value="enterprise">{lang === 'fr' ? 'Entreprise' : 'Enterprise'}</option>
                  </select>
                </div>

                {/* Plateforme */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {lang === 'fr' ? 'Plateforme' : 'Platform'}
                  </label>
                  <select
                    value={filters.platform}
                    onChange={(e) => handleFilterChange('platform', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{lang === 'fr' ? 'Toutes les plateformes' : 'All platforms'}</option>
                    <option value="web">{lang === 'fr' ? 'Web' : 'Web'}</option>
                    <option value="mobile">{lang === 'fr' ? 'Mobile' : 'Mobile'}</option>
                    <option value="desktop">{lang === 'fr' ? 'Desktop' : 'Desktop'}</option>
                    <option value="api">{lang === 'fr' ? 'API' : 'API'}</option>
                  </select>
                </div>

                {/* Plage de vues */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {lang === 'fr' ? 'Nombre de vues' : 'View Count'}
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minViews || ''}
                        onChange={(e) => handleFilterChange('minViews', parseInt(e.target.value) || 0)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxViews === 999999 ? '' : filters.maxViews}
                        onChange={(e) => handleFilterChange('maxViews', parseInt(e.target.value) || 999999)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Plage de date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {lang === 'fr' ? 'Mise à jour' : 'Last Updated'}
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{lang === 'fr' ? 'Toutes les dates' : 'All dates'}</option>
                    <option value="today">{lang === 'fr' ? 'Aujourd\'hui' : 'Today'}</option>
                    <option value="week">{lang === 'fr' ? 'Cette semaine' : 'This week'}</option>
                    <option value="month">{lang === 'fr' ? 'Ce mois' : 'This month'}</option>
                    <option value="quarter">{lang === 'fr' ? 'Ce trimestre' : 'This quarter'}</option>
                    <option value="year">{lang === 'fr' ? 'Cette année' : 'This year'}</option>
                  </select>
                </div>

                {/* Logique de filtres */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {lang === 'fr' ? 'Logique des filtres' : 'Filter Logic'}
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="filterLogic"
                        value="AND"
                        checked={filters.filterLogic === 'AND'}
                        onChange={(e) => handleFilterChange('filterLogic', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {lang === 'fr' ? 'ET (tous)' : 'AND (all)'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="filterLogic"
                        value="OR"
                        checked={filters.filterLogic === 'OR'}
                        onChange={(e) => handleFilterChange('filterLogic', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {lang === 'fr' ? 'OU (au moins un)' : 'OR (at least one)'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Correspondance exacte */}
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.exactMatch}
                      onChange={(e) => handleFilterChange('exactMatch', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {lang === 'fr' ? 'Correspondance exacte' : 'Exact match'}
                    </span>
                  </label>
                </div>
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
                    hasVideo: false,
                    // Réinitialiser nouveaux filtres
                    priceRange: '',
                    platform: '',
                    language: '',
                    tags: [],
                    excludeTags: [],
                    dateRange: '',
                    minViews: 0,
                    maxViews: 999999,
                    filterLogic: 'AND',
                    exactMatch: false
                  }
                  setFilters(resetFilters)
                  searchTools(resetFilters, 1)
                }}
                className="w-full"
              >
                {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
              </Button>

              {/* Section Recherches Sauvegardées */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {lang === 'fr' ? 'Recherches Sauvegardées' : 'Saved Searches'}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSavedSearches(!showSavedSearches)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {showSavedSearches ? 'Masquer' : 'Afficher'}
                  </Button>
                </div>
                
                {showSavedSearches && (
                  <div className="space-y-3">
                    {savedSearches.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        {lang === 'fr' ? 'Aucune recherche sauvegardée' : 'No saved searches'}
                      </p>
                    ) : (
                      savedSearches.map((savedSearch, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {savedSearch.name}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {lang === 'fr' ? 'Cliquez pour charger' : 'Click to load'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadSavedSearch(savedSearch.filters)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {lang === 'fr' ? 'Charger' : 'Load'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSavedSearch(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              {lang === 'fr' ? 'Supprimer' : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Formulaire pour sauvegarder la recherche actuelle */}
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={lang === 'fr' ? 'Nom de la recherche' : 'Search name'}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement
                              if (input.value.trim()) {
                                saveSearch(input.value.trim(), filters)
                                input.value = ''
                              }
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Nom"], input[placeholder*="Search"]') as HTMLInputElement
                            if (input?.value.trim()) {
                              saveSearch(input.value.trim(), filters)
                              input.value = ''
                            }
                          }}
                        >
                          {lang === 'fr' ? 'Sauvegarder' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

              {/* Pagination selon le mode choisi */}
              {totalPages > 1 && (
                <>
                  {paginationMode === 'classic' ? (
                    /* Pagination classique */
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
                  ) : (
                    /* Pagination infinie */
                    <div className="text-center">
                      {hasNextPage ? (
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="px-8"
                        >
                          {lang === 'fr' ? 'Charger plus d\'outils' : 'Load more tools'}
                        </Button>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          {lang === 'fr' ? 'Tous les outils ont été chargés' : 'All tools have been loaded'}
                        </p>
                      )}
                    </div>
                  )}
                </>
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

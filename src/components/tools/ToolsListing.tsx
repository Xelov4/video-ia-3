/**
 * Tools Listing Component
 * 
 * Advanced tools listing with search, filtering, sorting, and pagination.
 * Features real-time updates and responsive design.
 * 
 * Features:
 * - Real-time search with debouncing
 * - Category and feature filtering
 * - Multiple sorting options
 * - Pagination with URL state sync
 * - Responsive grid layout
 * - Loading states and error handling
 * - Tool analytics tracking
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Category } from '@prisma/client'
import { DatabaseTool } from '@/src/lib/database/services/tools'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  Bars3Icon, 
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { formatNumber } from '@/src/lib/utils/formatNumbers'

interface ToolsListingProps {
  initialTools: DatabaseTool[]
  initialCategories: Category[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasMore: boolean
  searchParams: {
    search: string
    category: string
    featured: boolean
    sort: string
    order: 'asc' | 'desc'
  }
}

export default function ToolsListing({
  initialTools,
  initialCategories,
  totalCount,
  currentPage,
  totalPages,
  hasMore,
  searchParams: initialSearchParams
}: ToolsListingProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [tools, setTools] = useState<DatabaseTool[]>(initialTools)
  const [categories] = useState<Category[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchParams.search)
  const [selectedCategory, setSelectedCategory] = useState(initialSearchParams.category)
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(initialSearchParams.featured)
  const [sortBy, setSortBy] = useState(initialSearchParams.sort)
  const [sortOrder, setSortOrder] = useState(initialSearchParams.order)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  /**
   * Load tools from API
   */
  const loadTools = async (params: {
    search?: string;
    category?: string;
    featured?: boolean;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
  }) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      
      if (params.search) searchParams.set('search', params.search);
      if (params.category) searchParams.set('category', params.category);
      if (params.featured) searchParams.set('featured', 'true');
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.order) searchParams.set('order', params.order);
      if (params.page && params.page > 1) searchParams.set('page', String(params.page));
      
      const response = await fetch(`/api/tools?${searchParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools || []);
      } else {
        console.error('Failed to load tools');
      }
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update URL with current filters
   */
  const updateURL = (params: Record<string, string | boolean | number>) => {
    const url = new URL(window.location.href)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all' && value !== 0 && value !== false) {
        url.searchParams.set(key, String(value))
      } else {
        url.searchParams.delete(key)
      }
    })
    
    url.searchParams.delete('page') // Reset page when filters change
    router.push(url.pathname + url.search)
  }

  /**
   * Handle search input with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== initialSearchParams.search) {
        updateURL({
          search: searchQuery,
          category: selectedCategory,
          featured: showFeaturedOnly,
          sort: sortBy,
          order: sortOrder
        })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  /**
   * Load tools when URL parameters change
   */
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category') || '';
    const currentFeatured = searchParams.get('featured') === 'true';
    const currentSort = searchParams.get('sort') || 'created_at';
    const currentOrder = (searchParams.get('order') as 'asc' | 'desc') || 'desc';
    const currentPage = parseInt(searchParams.get('page') || '1');

    // Only reload if parameters actually changed
    if (
      currentSearch !== searchQuery ||
      currentCategory !== selectedCategory ||
      currentFeatured !== showFeaturedOnly ||
      currentSort !== sortBy ||
      currentOrder !== sortOrder
    ) {
      setSearchQuery(currentSearch);
      setSelectedCategory(currentCategory);
      setShowFeaturedOnly(currentFeatured);
      setSortBy(currentSort);
      setSortOrder(currentOrder);
      
      loadTools({
        search: currentSearch,
        category: currentCategory,
        featured: currentFeatured,
        sort: currentSort,
        order: currentOrder,
        page: currentPage
      });
    }
  }, [searchParams]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (filterType: string, value: any) => {
    const updates: Record<string, any> = {
      search: searchQuery,
      category: selectedCategory,
      featured: showFeaturedOnly,
      sort: sortBy,
      order: sortOrder
    }

    switch (filterType) {
      case 'category':
        setSelectedCategory(value)
        updates.category = value
        break
      case 'featured':
        setShowFeaturedOnly(value)
        updates.featured = value
        break
      case 'sort':
        setSortBy(value)
        updates.sort = value
        break
      case 'order':
        setSortOrder(value)
        updates.order = value
        break
    }

    // Update URL and reload data
    updateURL(updates)
    
    // Reload tools with new filters
    loadTools({
      search: updates.search,
      category: updates.category,
      featured: updates.featured,
      sort: updates.sort,
      order: updates.order,
      page: 1 // Reset to first page when filters change
    })
  }

  /**
   * Handle tool click for analytics
   */
  const handleToolClick = async (toolId: number) => {
    try {
      fetch(`/api/tools/${toolId}/click`, {
        method: 'POST',
      }).catch(() => {
        // Silently handle errors for analytics
      })
    } catch (error) {
      // Silently handle errors for analytics
    }
  }

  /**
   * Render tool card
   */
  const renderToolCard = (tool: DatabaseTool) => {
    const hasImage = tool.image_url && tool.image_url.length > 0
    const viewCount = tool.view_count || 0
    const qualityScore = tool.quality_score || 0

    return (
      <div
        key={tool.id}
        className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 overflow-hidden"
      >
        {/* Tool Image */}
        <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          {hasImage ? (
            <img
              src={tool.image_url!}
              alt={`${tool.tool_name} logo`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {tool.tool_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Featured badge */}
          {tool.featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
              ⭐ Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {tool.tool_name}
              </h3>
              {tool.tool_category && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {tool.tool_category}
                </span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center ml-2">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(qualityScore / 2)
                      ? 'text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {tool.overview || tool.tool_description?.substring(0, 100) + '...' || 'Outil d\'intelligence artificielle innovant.'}
          </p>

          {/* Stats */}
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <EyeIcon className="w-3 h-3 mr-1" />
            <span>{formatNumber(viewCount)} vues</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Link
              href={`/tools/${tool.slug || tool.id}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Voir détails
            </Link>
            
            {tool.tool_link && (
              <a
                href={tool.tool_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleToolClick(tool.id)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  /**
   * Render pagination
   */
  const renderPagination = () => {
    if (totalPages <= 1) return null

    const maxVisible = 5
    const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const endPage = Math.min(totalPages, startPage + maxVisible - 1)
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

    const createPageUrl = (page: number) => {
      const url = new URL(window.location.href)
      if (page === 1) {
        url.searchParams.delete('page')
      } else {
        url.searchParams.set('page', String(page))
      }
      return url.pathname + url.search
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        {/* Previous */}
        {currentPage > 1 && (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Précédent
          </Link>
        )}

        {/* Pages */}
        {pages.map(page => (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </Link>
        ))}

        {/* Next */}
        {currentPage < totalPages && (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
          >
            Suivant
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
              >
                <FunnelIcon className="w-5 h-5" />
              </button>
            </div>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nom de l'outil..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les catégories</option>
                                        {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name} ({category.toolCount || 0})
                        </option>
                      ))}
                </select>
              </div>

              {/* Featured Filter */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showFeaturedOnly}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-700">Outils mis en avant uniquement</span>
                </label>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-')
                    handleFilterChange('sort', sort)
                    handleFilterChange('order', order)
                  }}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at-desc">Plus récents</option>
                  <option value="created_at-asc">Plus anciens</option>
                  <option value="tool_name-asc">Nom A-Z</option>
                  <option value="tool_name-desc">Nom Z-A</option>
                  <option value="view_count-desc">Plus populaires</option>
                  <option value="quality_score-desc">Mieux notés</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Toolbar */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {formatNumber(totalCount)} outils trouvés
              </div>
              
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Bars3Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tools.length > 0 ? (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {tools.map(renderToolCard)}
              </div>
              
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun outil trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche ou supprimez certains filtres.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
/**
 * Tools Listing Component with Universal Search Filters
 * 
 * Advanced tools listing using the new UniversalSearchFilters component.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@prisma/client'
import { DatabaseTool } from '@/src/lib/database/services/tools'
import { UniversalSearchFilters } from '@/src/components/common/UniversalSearchFilters'
import { getSearchFiltersConfig } from '@/src/config/searchFilters'
import type { FilterState } from '@/src/types/search'
import { 
  StarIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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

export default function ToolsListingWithUniversalFilters({
  initialTools,
  initialCategories,
  totalCount,
  currentPage,
  totalPages,
  hasMore,
  searchParams: initialSearchParams
}: ToolsListingProps) {
  const router = useRouter()
  
  // State
  const [tools, setTools] = useState<DatabaseTool[]>(initialTools)
  const [isLoading, setIsLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    search: initialSearchParams.search,
    category: initialSearchParams.category,
    featured: initialSearchParams.featured ? 'true' : '',
    status: '',
    qualityScore: '',
    toolCount: '',
    hasTools: '',
    tags: [],
    sortBy: initialSearchParams.sort,
    sortOrder: initialSearchParams.order
  })

  // Configuration pour le composant de recherche
  const searchConfig = getSearchFiltersConfig('tools', 'tools', handleFiltersChange)

  // Gestionnaire de changement de filtres
  function handleFiltersChange(filters: FilterState) {
    setCurrentFilters(filters)
    loadToolsWithFilters(filters)
  }

  // Charger les outils avec filtres
  const loadToolsWithFilters = async (filters: FilterState) => {
    try {
      setIsLoading(true)

      // Build query string from filters
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.category) params.set('category', filters.category)
      if (filters.featured) params.set('featured', filters.featured)
      if (filters.qualityScore) params.set('qualityScore', filters.qualityScore)
      if (filters.sortBy) params.set('sort', filters.sortBy)
      if (filters.sortOrder) params.set('order', filters.sortOrder)

      // Fetch tools from API
      const response = await fetch(`/api/tools?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTools(data.tools || [])
    } catch (err) {
      console.error('Error loading tools with filters:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Track tool view
  const trackToolView = async (toolId: number) => {
    try {
      await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' })
      })
    } catch (error) {
      console.error('Failed to track tool view:', error)
    }
  }

  // Generate pagination numbers
  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 7
    const total = totalPages

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      } else if (currentPage >= total - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = total - 4; i <= total; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      }
    }

    return pages
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Universal Search and Filters */}
      <div className="mb-8">
        <UniversalSearchFilters config={searchConfig} />
      </div>

      {/* Results Summary */}
      <div className="mb-6 text-center sm:text-left">
        <p className="text-gray-400">
          {isLoading ? (
            <span className="animate-pulse">Chargement...</span>
          ) : (
            <>
              <span className="font-semibold text-white">{formatNumber(totalCount)}</span>
              <span className="ml-1">outils trouvés</span>
              {currentFilters.search && (
                <span className="ml-1">
                  pour "<span className="font-medium text-blue-300">{currentFilters.search}</span>"
                </span>
              )}
              {currentFilters.category && (
                <span className="ml-1">
                  dans <span className="font-medium text-blue-300">{currentFilters.category}</span>
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Tools Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="glass-effect rounded-xl overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-700/50"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-700/50 rounded"></div>
                <div className="h-3 bg-gray-700/50 rounded w-3/4"></div>
                <div className="h-8 bg-gray-700/50 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="glass-effect rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 group">
              {/* Tool Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                {tool.image_url ? (
                  <Image
                    src={tool.image_url}
                    alt={tool.tool_name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {tool.tool_name.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* Featured Badge */}
                {tool.featured && (
                  <div className="absolute top-4 right-4">
                    <StarSolidIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                )}

                {/* Tool Link Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  {tool.tool_link && (
                    <a
                      href={tool.tool_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackToolView(tool.id)}
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      <span>Visiter</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tool Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                    <Link
                      href={`/tools/${tool.slug || tool.id}`}
                      onClick={() => trackToolView(tool.id)}
                    >
                      {tool.tool_name}
                    </Link>
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                  {tool.overview || 'Aucune description disponible'}
                </p>

                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                    {tool.tool_category}
                  </span>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                    {tool.view_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="w-3 h-3" />
                        <span>{formatNumber(tool.view_count)}</span>
                      </div>
                    )}
                    {tool.quality_score > 0 && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-3 h-3" />
                        <span>{tool.quality_score}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="glass-effect rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun outil trouvé
            </h3>
            <p className="text-gray-300 mb-4">
              Essayez de modifier vos critères de recherche ou de filtrage
            </p>
            <button
              onClick={() => handleFiltersChange({
                search: '',
                category: '',
                featured: '',
                status: '',
                qualityScore: '',
                toolCount: '',
                hasTools: '',
                tags: [],
                sortBy: 'created_at',
                sortOrder: 'desc'
              })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center">
          <nav className="flex items-center space-x-2">
            {/* Previous */}
            <button
              onClick={() => currentPage > 1 && router.push(`?page=${currentPage - 1}`)}
              disabled={currentPage <= 1}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage <= 1
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {generatePageNumbers().map((pageNum, index) => (
              <span key={index}>
                {pageNum === '...' ? (
                  <span className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => router.push(`?page=${pageNum}`)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                )}
              </span>
            ))}

            {/* Next */}
            <button
              onClick={() => hasMore && router.push(`?page=${currentPage + 1}`)}
              disabled={!hasMore}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !hasMore
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
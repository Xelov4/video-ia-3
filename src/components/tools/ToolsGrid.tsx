/**
 * Tools Grid Component
 * Professional grid display for tools with filtering and pagination
 */

'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { DatabaseTool } from '@/src/lib/database/services/tools'
import { ToolCard } from './ToolCard'
import { formatNumber } from '@/src/lib/utils/formatNumbers'
import { 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface ToolsGridProps {
  tools: DatabaseTool[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  showCategory?: boolean
}

export const ToolsGrid = ({ 
  tools, 
  totalCount, 
  currentPage, 
  totalPages, 
  hasNextPage, 
  hasPreviousPage,
  showCategory = true 
}: ToolsGridProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    })
    
    return newSearchParams.toString()
  }

  const handlePageChange = (page: number) => {
    const queryString = createQueryString({ page: page.toString() })
    router.push(`${pathname}?${queryString}`)
  }

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const queryString = createQueryString({ 
      sort: sortBy, 
      order: sortOrder,
      page: '1' // Reset to first page
    })
    router.push(`${pathname}?${queryString}`)
  }

  const handleFeaturedFilter = (featured: string | null) => {
    const queryString = createQueryString({ 
      featured,
      page: '1' // Reset to first page
    })
    router.push(`${pathname}?${queryString}`)
  }

  const currentSort = searchParams.get('sort') || 'created_at'
  const currentOrder = searchParams.get('order') || 'desc'
  const currentFeatured = searchParams.get('featured')

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Results Info */}
        <div className="text-gray-300">
          <span className="font-semibold text-white">{formatNumber(totalCount)}</span> outils trouvés
          {currentPage > 1 && (
            <span className="ml-2">
              • Page {currentPage} sur {totalPages}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filtres
          </button>

          {/* Sort Dropdown */}
          <select
            value={`${currentSort}-${currentOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              handleSortChange(sortBy, sortOrder)
            }}
            className="px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="created_at-desc">Plus récents</option>
            <option value="created_at-asc">Plus anciens</option>
            <option value="view_count-desc">Plus populaires</option>
            <option value="quality_score-desc">Mieux notés</option>
            <option value="tool_name-asc">Nom (A-Z)</option>
            <option value="tool_name-desc">Nom (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mise en vedette
              </label>
              <select
                value={currentFeatured || ''}
                onChange={(e) => handleFeaturedFilter(e.target.value || null)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tous les outils</option>
                <option value="true">En vedette uniquement</option>
                <option value="false">Non en vedette</option>
              </select>
            </div>

            {/* Quality Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Score qualité minimum
              </label>
              <select
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tous les scores</option>
                <option value="8">8+ (Premium)</option>
                <option value="6">6+ (Bon)</option>
                <option value="4">4+ (Correct)</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => router.push(pathname)}
                className="w-full px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Effacer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tools Grid/List */}
      {tools.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128A9.38 9.38 0 0112 21c-2.646 0-4.755-.753-5.877-2.172M13 13.496V8a4 4 0 00-8 0v5.496M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucun outil trouvé</h3>
          <p className="text-gray-400">
            Essayez de modifier vos critères de recherche ou de filtrage
          </p>
        </div>
      ) : (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {tools.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                showCategory={showCategory}
                size={viewMode === 'list' ? 'small' : 'medium'}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-8">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  hasPreviousPage
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-600/50 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Précédent
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 3)
                  if (page > totalPages) return null
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  hasNextPage
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-600/50 text-gray-500 cursor-not-allowed'
                }`}
              >
                Suivant
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
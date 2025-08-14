/**
 * Admin Tools Content Component
 * Simple and efficient tools management interface
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { formatNumber } from '@/src/lib/utils/formatNumbers'

interface Tool {
  id: number
  tool_name: string
  tool_category: string
  overview: string
  is_active: boolean
  featured: boolean
  view_count: number
  quality_score: number
  created_at: string
  updated_at: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface AdminToolsContentProps {
  searchParams: {
    page?: string
    search?: string
    category?: string
    featured?: string
    sortBy?: string
    sortOrder?: string
  }
}

export function AdminToolsContent({ searchParams }: AdminToolsContentProps) {
  const router = useRouter()
  const [tools, setTools] = useState<Tool[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Local state for filters
  const [search, setSearch] = useState(searchParams.search || '')
  const [category, setCategory] = useState(searchParams.category || '')
  const [featured, setFeatured] = useState(searchParams.featured || '')
  const [sortBy, setSortBy] = useState(searchParams.sortBy || 'created_at')
  const [sortOrder, setSortOrder] = useState(searchParams.sortOrder || 'desc')
  const [showFilters, setShowFilters] = useState(false)

  // Simple categories for now
  const categories = [
    { name: 'AI Assistant', count: 2500 },
    { name: 'Content Creation', count: 3200 },
    { name: 'Image Generation', count: 1800 },
    { name: 'Video Generation', count: 1200 },
    { name: 'Audio Generation', count: 800 },
    { name: 'Developer Tools', count: 1500 }
  ]

  // Load tools
  useEffect(() => {
    loadTools()
  }, [searchParams])

  const loadTools = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string
      const params = new URLSearchParams()
      if (searchParams.search) params.set('search', searchParams.search)
      if (searchParams.category) params.set('category', searchParams.category)
      if (searchParams.featured) params.set('featured', searchParams.featured)
      if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy)
      if (searchParams.sortOrder) params.set('sortOrder', searchParams.sortOrder)
      if (searchParams.page) params.set('page', searchParams.page)

      // Fetch tools from API
      const response = await fetch(`/api/admin/tools?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTools(data.tools || [])
      setPagination(data.pagination || null)
    } catch (err) {
      console.error('Error loading tools:', err)
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
      
      // Fallback: show mock data for development
      setTools(generateMockTools())
      setPagination({
        currentPage: parseInt(searchParams.page || '1'),
        totalPages: 336,
        totalCount: 16765,
        hasNextPage: true,
        hasPreviousPage: false
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate mock tools for development
  const generateMockTools = (): Tool[] => {
    const mockTools: Tool[] = []
    const toolNames = [
      'ChatGPT', 'Midjourney', 'Runway ML', 'Stable Diffusion', 'DALL-E',
      'Jasper', 'Copy.ai', 'Grammarly', 'Notion AI', 'Tome',
      'Synthesia', 'Descript', 'Murf', 'Play.ht', 'ElevenLabs',
      'GitHub Copilot', 'Tabnine', 'Kite', 'IntelliCode', 'CodeWhisperer'
    ]
    
    const categories = ['AI Assistant', 'Content Creation', 'Image Generation', 'Video Generation', 'Audio Generation', 'Developer Tools']
    
    for (let i = 0; i < 50; i++) {
      mockTools.push({
        id: i + 1,
        tool_name: toolNames[i % toolNames.length] + (i > toolNames.length ? ` ${Math.floor(i / toolNames.length) + 1}` : ''),
        tool_category: categories[i % categories.length],
        overview: `Description de l'outil ${i + 1} pour le développement et la création de contenu.`,
        is_active: Math.random() > 0.1,
        featured: Math.random() > 0.7,
        view_count: Math.floor(Math.random() * 50000) + 1000,
        quality_score: Math.floor(Math.random() * 10) + 1,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
    
    return mockTools
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (featured) params.set('featured', featured)
    if (sortBy !== 'created_at') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)
    
    router.push(`?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    setCategory('')
    setFeatured('')
    setSortBy('created_at')
    setSortOrder('desc')
    router.push('?')
  }

  if (error && !tools.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadTools}
            className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span className="flex items-center">
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filtres et recherche
            </span>
            <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        {/* Filters Container */}
        <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          {/* Search Bar */}
          <div className="w-full">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des outils..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>

            {/* Featured Filter */}
            <select
              value={featured}
              onChange={(e) => setFeatured(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les outils</option>
              <option value="true">En vedette</option>
              <option value="false">Non en vedette</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at">Date de création</option>
              <option value="updated_at">Date de modification</option>
              <option value="view_count">Nombre de vues</option>
              <option value="quality_score">Score qualité</option>
              <option value="tool_name">Nom</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleSearch}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rechercher
            </button>
            <button
              onClick={handleClear}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Effacer
            </button>
          </div>
        </div>
      </div>

      {/* Tools Display */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Outils {pagination ? `(${formatNumber(pagination.totalCount)})` : ''}
            </h3>
            {pagination && (
              <p className="text-sm text-gray-600">
                Affichage de {((pagination.currentPage - 1) * 50) + 1} à {Math.min(pagination.currentPage * 50, pagination.totalCount)} sur {formatNumber(pagination.totalCount)} outils
              </p>
            )}
          </div>
        </div>

        {/* Tools List */}
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tools.map((tool) => (
              <div key={tool.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {tool.tool_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {tool.tool_name}
                          </h4>
                          {tool.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Vedette
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            tool.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tool.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {tool.overview}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Catégorie: {tool.tool_category}</span>
                          <span>Vues: {formatNumber(tool.view_count)}</span>
                          <span>Score: {tool.quality_score}/10</span>
                          <span>Créé: {new Date(tool.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="text-gray-400 hover:text-blue-600 p-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-blue-600 p-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-red-600 p-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700 text-center sm:text-left">
                <span className="font-medium">
                  Page {pagination.currentPage} sur {pagination.totalPages}
                </span>
                <span className="ml-2 text-gray-500">
                  ({formatNumber(pagination.totalCount)} outils au total)
                </span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                {/* Previous */}
                <button
                  onClick={() => router.push(`?page=${pagination.currentPage - 1}`)}
                  disabled={!pagination.hasPreviousPage}
                  className={`px-3 py-2 border border-gray-300 text-sm font-medium rounded-md transition-colors ${
                    pagination.hasPreviousPage
                      ? 'text-gray-700 bg-white hover:bg-gray-50'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  Précédent
                </button>

                {/* Page Numbers */}
                {generatePageNumbers(pagination.currentPage, pagination.totalPages).map((pageNum, index) => (
                  <span key={index}>
                    {pageNum === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => router.push(`?page=${pageNum}`)}
                        className={`px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                          pageNum === pagination.currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )}
                  </span>
                ))}

                {/* Next */}
                <button
                  onClick={() => router.push(`?page=${pagination.currentPage + 1}`)}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-2 border border-gray-300 text-sm font-medium rounded-md transition-colors ${
                    pagination.hasNextPage
                      ? 'text-gray-700 bg-white hover:bg-gray-50'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to generate page numbers
function generatePageNumbers(current: number, total: number): (number | string)[] {
  const pages: (number | string)[] = []
  const maxVisible = 7

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
}

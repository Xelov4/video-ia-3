/**
 * Tools Listing Page
 * 
 * Main page for browsing and searching AI tools with advanced filters.
 * Features search, category filtering, sorting, and pagination.
 * 
 * Features:
 * - Search functionality with real-time results
 * - Category and feature filtering
 * - Multiple sorting options
 * - Pagination with URL state management
 * - Server-side rendering for SEO
 * - Loading states and error handling
 * 
 * @author Video-IA.net Development Team
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import ToolsListing from '@/src/components/tools/ToolsListing'
import { ToolsService, CategoriesService } from '@/src/lib/database'

interface ToolsPageProps {
  searchParams: {
    search?: string
    category?: string
    featured?: string
    sort?: string
    order?: string
    page?: string
  }
}

export const metadata: Metadata = {
  title: 'Outils IA - Répertoire complet de 16 763 outils d\'intelligence artificielle | Video-IA.net',
  description: 'Explorez notre collection complète de plus de 16 000 outils d\'intelligence artificielle. Recherchez, filtrez et découvrez les meilleurs outils IA pour créateurs, développeurs et professionnels.',
  keywords: 'outils IA, intelligence artificielle, recherche outils IA, ChatGPT, Midjourney, Claude, outils créateurs, développeurs, productivité, automatisation',
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const {
    search = '',
    category = '',
    featured = '',
    sort = 'created_at',
    order = 'desc',
    page = '1'
  } = searchParams

  // Parse parameters
  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const limit = 20
  const offset = (currentPage - 1) * limit

  // Build search parameters
  const searchParams_api = {
    search: search || undefined,
    category: category || undefined,
    featured: featured === 'true',
    sort: sort as any,
    order: order as 'asc' | 'desc',
    limit,
    offset
  }

  // Load data server-side
  const [toolsResult, categories] = await Promise.all([
    ToolsService.searchTools(searchParams_api).catch(error => {
      console.error('Failed to load tools:', error)
      return { tools: [], totalCount: 0, hasMore: false }
    }),
    CategoriesService.getAllCategories().catch(error => {
      console.error('Failed to load categories:', error)
      return []
    })
  ])

  const totalPages = Math.ceil(toolsResult.totalCount / limit)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {search ? (
                <>Résultats pour "<span className="text-blue-600">{search}</span>"</>
              ) : category ? (
                <>Outils IA - <span className="text-blue-600">{category}</span></>
              ) : (
                'Tous les outils IA'
              )}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {search ? (
                `${toolsResult.totalCount.toLocaleString()} outils trouvés pour votre recherche`
              ) : (
                `Découvrez notre collection de ${toolsResult.totalCount.toLocaleString()} outils d'intelligence artificielle`
              )}
            </p>
            
            {/* Quick stats */}
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div>
                <span className="font-semibold text-blue-600">{toolsResult.totalCount.toLocaleString()}</span> outils
              </div>
              <div>
                <span className="font-semibold text-purple-600">{categories.length}</span> catégories
              </div>
              <div>
                <span className="font-semibold text-green-600">Mis à jour</span> quotidiennement
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Suspense fallback={<ToolsListingLoading />}>
        <ToolsListing
          initialTools={toolsResult.tools}
          initialCategories={categories}
          totalCount={toolsResult.totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={toolsResult.hasMore}
          searchParams={{
            search,
            category,
            featured: featured === 'true',
            sort,
            order: order as 'asc' | 'desc'
          }}
        />
      </Suspense>
    </div>
  )
}

/**
 * Loading component for tools listing
 */
function ToolsListingLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="lg:col-span-3">
          {/* Filters skeleton */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>

          {/* Tools grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
/**
 * Category Detail Page
 * 
 * Display tools within a specific category with filtering and sorting options.
 * Features breadcrumbs, category info, and tools listing.
 * 
 * Features:
 * - Category-specific tools listing
 * - Breadcrumb navigation
 * - Category information and stats
 * - Search and filtering within category
 * - SEO optimization with dynamic metadata
 * 
 * @author Video-IA.net Development Team
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ToolsService, CategoriesService } from '@/src/lib/database'
import ToolsListing from '@/src/components/tools/ToolsListing'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

interface CategoryPageProps {
  params: { slug: string }
  searchParams: {
    search?: string
    featured?: string
    sort?: string
    order?: string
    page?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await CategoriesService.getCategoryBySlug(params.slug).catch(() => null)
  
  if (!category) {
    return {
      title: 'Catégorie non trouvée | Video-IA.net',
      description: 'Cette catégorie d\'outils IA n\'existe pas ou a été supprimée.'
    }
  }

  return {
    title: `${category.name} - ${category.toolCount} outils IA | Video-IA.net`,
    description: category.description || `Découvrez les meilleurs outils d'intelligence artificielle dans la catégorie ${category.name}. ${category.toolCount} outils sélectionnés et testés par nos experts.`,
    keywords: `${category.name}, outils IA ${category.name.toLowerCase()}, intelligence artificielle ${category.name.toLowerCase()}`,
    openGraph: {
      title: `${category.name} - Outils IA | Video-IA.net`,
      description: category.description || `${category.toolCount} outils IA dans la catégorie ${category.name}`,
      type: 'website',
    }
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const {
    search = '',
    featured = '',
    sort = 'created_at',
    order = 'desc',
    page = '1'
  } = searchParams

  // Load category information
  const category = await CategoriesService.getCategoryBySlug(params.slug).catch(() => null)
  
  if (!category) {
    notFound()
  }

  // Parse parameters
  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const limit = 20
  const offset = (currentPage - 1) * limit

  // Build search parameters
  const searchParams_api = {
    search: search || undefined,
    category: category.name,
    featured: featured === 'true',
    sort: sort as any,
    order: order as 'asc' | 'desc',
    limit,
    offset
  }

  // Load tools and related categories
  const [toolsResult, allCategories, relatedCategories] = await Promise.all([
    ToolsService.searchTools(searchParams_api).catch(error => {
      console.error('Failed to load tools:', error)
      return { tools: [], totalCount: 0, hasMore: false }
    }),
    CategoriesService.getAllCategories().catch(() => []),
    CategoriesService.getRelatedCategories(category.name, 4).catch(() => [])
  ])

  const totalPages = Math.ceil(toolsResult.totalCount / limit)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-blue-600 flex items-center">
              <HomeIcon className="w-4 h-4 mr-1" />
              Accueil
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <Link href="/categories" className="text-gray-500 hover:text-blue-600">
              Catégories
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Category Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              {category.iconName ? (
                <span className="text-3xl text-white">{category.iconName}</span>
              ) : (
                <span className="text-3xl font-bold text-white">
                  {category.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Title and Description */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {category.name}
            </h1>
            
            {category.description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                {category.description}
              </p>
            )}

            {/* Category Stats */}
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div>
                <span className="font-semibold text-blue-600">{category.toolCount}</span> outils disponibles
              </div>
              <div>
                <span className="font-semibold text-purple-600">{toolsResult.totalCount}</span> résultats
              </div>
              {category.isFeatured && (
                <div>
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    ⭐ Catégorie principale
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Related Categories */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Catégories similaires
              </h3>
              
              {relatedCategories.length > 0 ? (
                <div className="space-y-3">
                  {relatedCategories.map(relatedCategory => (
                    <Link
                      key={relatedCategory.id}
                      href={`/categories/${relatedCategory.slug}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {relatedCategory.iconName || relatedCategory.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {relatedCategory.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {relatedCategory.toolCount} outils
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Aucune catégorie similaire trouvée.
                </p>
              )}

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Navigation rapide
                </h4>
                <div className="space-y-2">
                  <Link
                    href="/categories"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Toutes les catégories
                  </Link>
                  <Link
                    href="/tools"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Tous les outils
                  </Link>
                  <Link
                    href="/tools?featured=true"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Outils mis en avant
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tools Listing */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Suspense fallback={<ToolsListingLoading />}>
              <ToolsListing
                initialTools={toolsResult.tools}
                initialCategories={allCategories}
                totalCount={toolsResult.totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                hasMore={toolsResult.hasMore}
                searchParams={{
                  search,
                  category: category.name,
                  featured: featured === 'true',
                  sort,
                  order: order as 'asc' | 'desc'
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading component for tools listing
 */
function ToolsListingLoading() {
  return (
    <div className="space-y-6">
      {/* Toolbar skeleton */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Tools grid skeleton */}
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
    </div>
  )
}
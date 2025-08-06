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
import { toolsService } from '@/src/lib/database/services/tools'
import { CategoriesService } from '@/src/lib/database/services/categories'
import { ToolsGrid } from '@/src/components/tools/ToolsGrid'
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

  // Build search parameters for new service
  const searchParams_api = {
    query: search || undefined,
    category: category.name,
    featured: featured === 'true' ? true : undefined,
    page: currentPage,
    limit,
    sortBy: sort,
    sortOrder: order as 'asc' | 'desc'
  }

  // Load tools and related categories
  const [toolsResult, allCategories, relatedCategories] = await Promise.all([
    toolsService.searchTools(searchParams_api).catch((error: any) => {
      console.error('Failed to load tools:', error)
      return { tools: [], totalCount: 0, hasMore: false, totalPages: 0, currentPage: 1, hasNextPage: false, hasPreviousPage: false }
    }),
    CategoriesService.getAllCategories().catch(() => []),
    CategoriesService.getRelatedCategories(category.name, 4).catch(() => [])
  ])

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass-effect border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-white transition-colors">
              Catégories
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{category.name}</span>
          </nav>

          {/* Category Info */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                {category.description}
              </p>
            )}
            <div className="flex justify-center items-center space-x-8 text-lg text-gray-400">
              <div>
                <span className="font-bold gradient-text">{category.toolCount}</span> outils
              </div>
              <div>
                <span className="font-bold gradient-text">{relatedCategories.length}</span> catégories similaires
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Listing */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Outils dans cette catégorie
            </h2>
            <p className="text-gray-300">
              {toolsResult.totalCount} outils trouvés
            </p>
          </div>
          
          <ToolsGrid
            tools={toolsResult.tools}
            totalCount={toolsResult.totalCount}
            currentPage={toolsResult.currentPage}
            totalPages={toolsResult.totalPages}
            hasNextPage={toolsResult.hasNextPage}
            hasPreviousPage={toolsResult.hasPreviousPage}
            showCategory={false}
          />
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

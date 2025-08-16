/**
 * Categories Page
 * 
 * Display all available AI tool categories with statistics and navigation.
 * Features category cards with tool counts and descriptions.
 * 
 * Features:
 * - Complete categories listing
 * - Category statistics and descriptions
 * - Search and filtering
 * - Responsive grid layout
 * - SEO optimization
 * 
 * @author Video-IA.net Development Team
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { CategoriesService } from '@/src/lib/database/services/categories'
import CategoriesListingWithUniversalFilters from '@/src/components/categories/CategoriesListingWithUniversalFilters'

export const metadata: Metadata = {
  title: 'Catégories d\'outils IA - Explorez 140+ catégories organisées | Video-IA.net',
  description: 'Découvrez nos 140+ catégories d\'outils d\'intelligence artificielle organisées par domaine : créativité, productivité, développement, marketing et bien plus.',
  keywords: 'catégories outils IA, classification IA, types outils intelligence artificielle, domaines IA, secteurs IA',
}

interface CategoriesPageProps {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { search = '' } = searchParams

  // Load categories with statistics
  const categories = await CategoriesService.getAllCategories().catch((error: any) => {
    console.error('Failed to load categories:', error)
    return []
  })

  const totalTools = categories.reduce((sum, cat) => sum + (cat.toolCount || 0), 0)
  const featuredCount = categories.filter(cat => cat.isFeatured === true || (cat.toolCount || 0) > 50).length

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass-effect border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Catégories d'<span className="gradient-text">outils IA</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Explorez notre collection organisée de {categories.length} catégories d'outils 
              d'intelligence artificielle pour tous vos besoins créatifs et professionnels.
            </p>

            {/* Stats */}
            <div className="flex justify-center items-center space-x-8 mt-8 text-sm text-gray-400">
              <div>
                <span className="font-semibold gradient-text">{categories.length}</span> catégories
              </div>
              <div>
                <span className="font-semibold gradient-text">{totalTools.toLocaleString()}</span> outils total
              </div>
              <div>
                <span className="font-semibold gradient-text">{featuredCount}</span> catégories principales
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Listing with Universal Filters */}
      <Suspense fallback={<CategoriesLoading />}>
        <CategoriesListingWithUniversalFilters
          initialCategories={categories}
          searchQuery={search}
        />
      </Suspense>
    </div>
  )
}

/**
 * Loading component for categories listing
 */
function CategoriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters loading */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories grid loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
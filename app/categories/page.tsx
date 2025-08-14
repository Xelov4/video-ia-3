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
import Link from 'next/link'
import { CategoriesService } from '@/src/lib/database/services/categories'
import { getCategoryEmojiString } from '@/src/lib/services/emojiMapping'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { formatNumber } from '@/src/lib/utils/formatNumbers'

export const metadata: Metadata = {
  title: 'Catégories d\'outils IA - Explorez 140+ catégories organisées | Video-IA.net',
  description: 'Découvrez nos 140+ catégories d\'outils d\'intelligence artificielle organisées par domaine : créativité, productivité, développement, marketing et bien plus.',
  keywords: 'catégories outils IA, classification IA, types outils intelligence artificielle, domaines IA, secteurs IA',
}

interface CategoriesPageProps {
  searchParams: Promise<{
    search?: string
  }
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { search = '' } = searchParams

  // Load categories with statistics
  const categories = await CategoriesService.getAllCategories().catch((error: any) => {
    console.error('Failed to load categories:', error)
    return []
  })

  // Filter categories if search query provided
  const filteredCategories = search 
    ? categories.filter(category => 
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
      )
    : categories

  // Group categories by tool count for better organization
  const featuredCategories = filteredCategories.filter(cat => (cat.isFeatured === true) || (cat.toolCount || 0) > 50)
  const popularCategories = filteredCategories.filter(cat => (cat.isFeatured !== true) && (cat.toolCount || 0) > 10 && (cat.toolCount || 0) <= 50)
  const otherCategories = filteredCategories.filter(cat => (cat.isFeatured !== true) && (cat.toolCount || 0) <= 10)

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

            {/* Search */}
            <div className="max-w-md mx-auto">
              <form action="/categories" method="GET">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Rechercher une catégorie..."
                    className="input-field"
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Stats */}
            <div className="flex justify-center items-center space-x-8 mt-8 text-sm text-gray-400">
              <div>
                <span className="font-semibold gradient-text">{categories.length}</span> catégories
              </div>
              <div>
                <span className="font-semibold gradient-text">{categories.reduce((sum, cat) => sum + (cat.toolCount || 0), 0).toLocaleString()}</span> outils total
              </div>
              <div>
                <span className="font-semibold gradient-text">{featuredCategories.length}</span> catégories principales
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {search && (
          <div className="mb-8">
            <p className="text-gray-600">
              {filteredCategories.length} catégorie{filteredCategories.length !== 1 ? 's' : ''} trouvée{filteredCategories.length !== 1 ? 's' : ''} pour "<span className="font-semibold text-blue-600">{search}</span>"
            </p>
          </div>
        )}

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Catégories principales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredCategories.map(category => (
                <CategoryCard key={category.id} category={category} featured />
              ))}
            </div>
          </section>
        )}

        {/* Popular Categories */}
        {popularCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Catégories populaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        )}

        {/* Other Categories */}
        {otherCategories.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Autres catégories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {otherCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune catégorie trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier votre recherche ou explorez toutes nos catégories.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir toutes les catégories
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Category Card Component
 */
interface CategoryCardProps {
  category: {
    id: number
    name: string
    slug: string | null
    description?: string | null
    iconName?: string | null
    toolCount: number | null
    isFeatured: boolean | null
  }
  featured?: boolean
}

function CategoryCard({ category, featured = false }: CategoryCardProps) {
  const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  return (
    <Link
      href={`/categories/${slug}`}
      className={`group block bg-white rounded-xl p-6 border hover:shadow-lg transition-all duration-200 ${
        featured 
          ? 'border-blue-200 shadow-md hover:shadow-xl hover:border-blue-300' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Emoji Icon */}
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
        featured 
          ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-200' 
          : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200 group-hover:border-purple-200 group-hover:bg-gradient-to-br group-hover:from-purple-50/50 group-hover:to-pink-50/50'
      } transition-all duration-300 group-hover:scale-110`}
        <span className="text-3xl animate-pulse">
          {getCategoryEmojiString(category.name)}
        </span>
      </div>

      {/* Content */}
      <div>
        <h3 className={`text-lg font-semibold mb-2 transition-colors ${
          featured 
            ? 'text-gray-900 group-hover:text-blue-600' 
            : 'text-gray-900 group-hover:text-blue-600'
        }`}
          {category.name}
        </h3>
        
        {category.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {category.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            featured ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
          } transition-colors`}
            {category.toolCount || 0} outil{(category.toolCount || 0) !== 1 ? 's' : ''}
          </span>
          
          {(featured || category.isFeatured === true) && (
            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              ⭐ Principal
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
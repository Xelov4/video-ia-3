/**
 * Homepage Component
 * 
 * Main landing page for the Video-IA.net AI tools directory.
 * Showcases the comprehensive collection of 16,763+ AI tools
 * with hero section, featured tools, categories, and statistics.
 * 
 * Features:
 * - Hero section with search functionality
 * - Featured tools showcase
 * - Popular categories display
 * - Statistics and trust indicators
 * - SEO optimization
 * - Server-side data loading
 * 
 * @author Video-IA.net Development Team
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import HeroSection from '@/src/components/home/HeroSection'
import FeaturedTools from '@/src/components/home/FeaturedTools'
import { ToolsService, CategoriesService, DatabaseUtils } from '@/src/lib/database'

/**
 * Page metadata for SEO optimization
 */
export const metadata: Metadata = {
  title: 'Video-IA.net - Répertoire de 16 763 Outils IA pour Créateurs | Intelligence Artificielle',
  description: 'Découvrez le répertoire le plus complet d\'outils d\'intelligence artificielle. Plus de 16 000 outils IA organisés par catégories : ChatGPT, Midjourney, Claude et bien plus pour créateurs, développeurs et professionnels.',
  keywords: 'outils IA, intelligence artificielle, ChatGPT, Midjourney, Claude, outils créateurs, développeurs, productivité, automatisation, AI tools',
  openGraph: {
    title: 'Video-IA.net - 16 763 Outils IA pour Créateurs',
    description: 'Le répertoire le plus complet d\'outils d\'intelligence artificielle pour créateurs et professionnels',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://video-ia.net',
    siteName: 'Video-IA.net',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video-IA.net - 16 763 Outils IA',
    description: 'Découvrez les meilleurs outils IA pour créateurs et professionnels',
    site: '@videoianet',
  },
  alternates: {
    canonical: 'https://video-ia.net',
    languages: {
      'fr': 'https://video-ia.net',
      'en': 'https://video-ia.net/en',
    },
  },
}

/**
 * Homepage component with server-side data loading
 */
export default async function HomePage() {
  // Load initial data on server-side for better performance and SEO
  const [
    featuredTools,
    featuredCategories,
    stats
  ] = await Promise.all([
    // Get featured tools for homepage showcase
    ToolsService.getFeaturedTools(8).catch(error => {
      console.error('Failed to load featured tools:', error)
      return []
    }),
    
    // Get featured categories for navigation
    CategoriesService.getFeaturedCategories(6).catch(error => {
      console.error('Failed to load featured categories:', error)
      return []
    }),
    
    // Get platform statistics
    DatabaseUtils.getDatabaseStatistics().catch(error => {
      console.error('Failed to load statistics:', error)
      return {
        tools: { totalTools: 16763, activeTools: 16763, featuredTools: 150 },
        categories: { totalCategories: 140 },
        system: { totalRecords: 16903 }
      }
    })
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection
        totalToolsCount={stats.tools.totalTools}
        totalCategoriesCount={stats.categories.totalCategories}
        featuredToolsCount={stats.tools.featuredTools}
      />

      {/* Featured Tools Section */}
      <Suspense fallback={<FeaturedToolsLoading />}>
        <FeaturedTools 
          initialTools={featuredTools}
          limit={8}
        />
      </Suspense>

      {/* Popular Categories Section */}
      <Suspense fallback={<CategoriesLoading />}>
        <PopularCategories categories={featuredCategories} />
      </Suspense>

      {/* Statistics & Features Section */}
      <PlatformFeatures stats={stats} />

      {/* Call-to-Action Section */}
      <CallToActionSection />
    </div>
  )
}

/**
 * Loading component for featured tools
 */
function FeaturedToolsLoading() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
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
    </section>
  )
}

/**
 * Loading component for categories
 */
function CategoriesLoading() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Popular Categories Section Component
 */
async function PopularCategories({ categories }: { categories: any[] }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Catégories populaires
          </h2>
          <p className="text-xl text-gray-600">
            Explorez nos catégories les plus recherchées
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/categories/${category.slug}`}
              className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">
                  {category.name.charAt(0)}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">
                {category.toolCount} outils
              </p>
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/categories"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            Voir toutes les catégories
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

/**
 * Platform Features Section Component
 */
function PlatformFeatures({ stats }: { stats: any }) {
  const features = [
    {
      icon: '🎯',
      title: 'Curation experte',
      description: 'Chaque outil est testé et évalué par notre équipe d\'experts en IA'
    },
    {
      icon: '🔄',
      title: 'Mise à jour quotidienne',
      description: 'Notre base de données est constamment enrichie avec les derniers outils'
    },
    {
      icon: '🏷️',
      title: 'Organisation intelligente',
      description: 'Plus de 140 catégories pour trouver exactement ce dont vous avez besoin'
    },
    {
      icon: '⚡',
      title: 'Recherche rapide',
      description: 'Trouvez l\'outil parfait en quelques secondes grâce à notre moteur de recherche'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir Video-IA.net ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La référence française pour découvrir, comparer et utiliser les meilleurs outils d'intelligence artificielle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Platform Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Des chiffres qui parlent
            </h3>
            <p className="text-gray-600">
              La plus grande communauté francophone d'outils IA
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                {stats.tools.totalTools.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Outils référencés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-1">
                {stats.categories.totalCategories}+
              </div>
              <div className="text-gray-600 font-medium">Catégories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
                100K+
              </div>
              <div className="text-gray-600 font-medium">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-1">
                24h
              </div>
              <div className="text-gray-600 font-medium">Mises à jour</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Call-to-Action Section Component
 */
function CallToActionSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Prêt à découvrir l'IA qui révolutionnera votre travail ?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers de créateurs et professionnels qui utilisent déjà nos outils recommandés
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/tools"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-2xl hover:bg-gray-100 transition-all"
          >
            Commencer l'exploration
          </a>
          <a
            href="/categories"
            className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-2xl hover:bg-white hover:text-blue-600 transition-all"
          >
            Parcourir les catégories
          </a>
        </div>
      </div>
    </section>
  )
}
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
import { formatNumber } from '@/src/lib/utils/formatNumbers'

/**
 * Page metadata for SEO optimization
 */
export const metadata: Metadata = {
  title: 'Video-IA.net - Annuaire des Outils IA',
  description: 'Découvrez les meilleurs outils d\'intelligence artificielle pour tous vos besoins. Plus de 16,000 outils IA classés et testés.',
  keywords: 'IA, intelligence artificielle, outils IA, ChatGPT, Midjourney, génération d\'images, génération de texte',
  openGraph: {
    title: 'Video-IA.net - Annuaire des Outils IA',
    description: 'Découvrez les meilleurs outils d\'intelligence artificielle pour tous vos besoins.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video-IA.net - Annuaire des Outils IA',
    description: 'Découvrez les meilleurs outils d\'intelligence artificielle pour tous vos besoins.',
  },
}

/**
 * Homepage component with server-side data loading
 */
export default async function HomePage() {
  // Default stats
  const stats = {
    tools: { totalTools: 16763, activeTools: 16763, featuredTools: 150 },
    categories: { totalCategories: 140 },
    system: { totalRecords: 16903 }
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <HeroSection
        totalToolsCount={stats.tools.totalTools}
        totalCategoriesCount={stats.categories.totalCategories}
        featuredToolsCount={stats.tools.featuredTools}
      />

      {/* Featured Tools Section */}
      <Suspense fallback={<FeaturedToolsLoading />}>
        <FeaturedTools 
          initialTools={[]}
          limit={8}
        />
      </Suspense>

      {/* Popular Categories Section */}
      <Suspense fallback={<CategoriesLoading />}>
        <PopularCategories categories={[]} />
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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-10 bg-gray-800 rounded-2xl w-80 mx-auto mb-6 animate-pulse"></div>
          <div className="h-6 bg-gray-800 rounded-xl w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card-hover overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-800 rounded-2xl mb-6"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-800 rounded-xl"></div>
                <div className="h-4 bg-gray-800 rounded-lg w-3/4"></div>
                <div className="h-10 bg-gray-800 rounded-xl"></div>
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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-10 bg-gray-800 rounded-2xl w-64 mx-auto mb-6 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card text-center animate-pulse">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl mx-auto mb-4"></div>
              <div className="h-5 bg-gray-800 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-800 rounded-lg w-3/4 mx-auto"></div>
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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Catégories <span className="gradient-text">populaires</span>
          </h2>
          <p className="text-xl text-gray-300">
            Explorez nos catégories les plus recherchées
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/categories/${category.slug}`}
              className="card-hover text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white font-bold text-xl">
                  {category.name.charAt(0)}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:gradient-text transition-all duration-200">
                {category.name}
              </h3>
              <p className="text-sm text-gray-400">
                {category.toolCount} outils
              </p>
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/categories"
            className="btn-outline inline-flex items-center"
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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pourquoi choisir <span className="gradient-text">Video-IA.net</span> ?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            La référence française pour découvrir, comparer et utiliser les meilleurs outils d'intelligence artificielle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center card p-8">
              <div className="text-5xl mb-6">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Platform Stats */}
        <div className="glass-effect rounded-3xl p-12 border border-gray-700/50">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Des chiffres qui <span className="gradient-text">parlent</span>
            </h3>
            <p className="text-gray-300 text-lg">
              La plus grande communauté francophone d'outils IA
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {formatNumber(stats.tools.totalTools)}
              </div>
              <div className="text-gray-300 font-medium">Outils référencés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stats.categories.totalCategories}+
              </div>
              <div className="text-gray-300 font-medium">Catégories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                100K+
              </div>
              <div className="text-gray-300 font-medium">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                24h
              </div>
              <div className="text-gray-300 font-medium">Mises à jour</div>
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
    <section className="py-20 glass-effect border-t border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Prêt à découvrir l'IA qui <span className="gradient-text">révolutionnera</span> votre travail ?
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Rejoignez des milliers de créateurs et professionnels qui utilisent déjà nos outils recommandés
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href="/tools"
            className="btn-primary text-lg px-10 py-4"
          >
            Commencer l'exploration
          </a>
          <a
            href="/categories"
            className="btn-outline text-lg px-10 py-4"
          >
            Parcourir les catégories
          </a>
        </div>
      </div>
    </section>
  )
}
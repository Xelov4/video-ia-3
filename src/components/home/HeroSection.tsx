/**
 * Hero Section Component
 * 
 * Main landing section for the AI tools directory homepage.
 * Features compelling headline, search functionality, and key statistics
 * to immediately engage users and showcase the platform's value.
 * 
 * Features:
 * - Compelling value proposition
 * - Global search functionality
 * - Real-time statistics display
 * - Call-to-action buttons
 * - Responsive design
 * - SEO-optimized content
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'
import { formatNumber } from '@/src/lib/utils/formatNumbers'

interface HeroSectionProps {
  totalToolsCount?: number
  totalCategoriesCount?: number
  featuredToolsCount?: number
}

export default function HeroSection({
  totalToolsCount = 16763,
  totalCategoriesCount = 140,
  featuredToolsCount = 150
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  /**
   * Handle hero search submission
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
      router.push(`/tools?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearching(false)
    }
  }

  /**
   * Quick action handlers
   */
  const handleBrowseTools = () => {
    router.push('/tools')
  }

  const handleViewCategories = () => {
    router.push('/categories')
  }

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main headline */}
          <div className="mb-12">
            <div className="inline-flex items-center px-6 py-3 glass-effect rounded-full text-sm font-medium mb-8 border border-purple-500/30">
              <SparklesIcon className="w-5 h-5 mr-3 text-purple-400" />
              <span className="text-purple-300">Répertoire N°1 des outils d'IA en France</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
              <span className="block">Découvrez les</span>
              <span className="block gradient-text">
                {formatNumber(totalToolsCount)} outils IA
              </span>
              <span className="block">pour créateurs</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              La plus grande collection d'outils d'intelligence artificielle pour créateurs, 
              développeurs et professionnels. Organisés par catégories, testés et approuvés 
              par notre communauté.
            </p>
          </div>

          {/* Search section */}
          <div className="mb-16">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un outil IA (ex: ChatGPT, Midjourney, Notion AI...)"
                  className="block w-full pl-16 pr-36 py-5 text-lg glass-effect rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 shadow-2xl"
                  disabled={isSearching}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="btn-primary px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>
              </div>
            </form>
            
            {/* Popular searches */}
            <div className="mt-6 text-sm text-gray-400">
              <span className="mr-3">Recherches populaires:</span>
              <button 
                onClick={() => setSearchQuery('ChatGPT')}
                className="text-purple-400 hover:text-purple-300 mx-2 transition-colors"
              >
                ChatGPT
              </button>
              <span className="mx-2">•</span>
              <button 
                onClick={() => setSearchQuery('Midjourney')}
                className="text-purple-400 hover:text-purple-300 mx-2 transition-colors"
              >
                Midjourney
              </button>
              <span className="mx-2">•</span>
              <button 
                onClick={() => setSearchQuery('Notion AI')}
                className="text-purple-400 hover:text-purple-300 mx-2 transition-colors"
              >
                Notion AI
              </button>
              <span className="mx-2">•</span>
              <button 
                onClick={() => setSearchQuery('Claude')}
                className="text-purple-400 hover:text-purple-300 mx-2 transition-colors"
              >
                Claude
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center card p-8">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                {formatNumber(totalToolsCount)}
              </div>
              <div className="text-gray-300 font-medium text-lg">Outils IA référencés</div>
              <div className="text-sm text-gray-400 mt-2">Mis à jour quotidiennement</div>
            </div>
            
            <div className="text-center card p-8">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                {totalCategoriesCount}+
              </div>
              <div className="text-gray-300 font-medium text-lg">Catégories</div>
              <div className="text-sm text-gray-400 mt-2">Soigneusement organisées</div>
            </div>
            
            <div className="text-center card p-8">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                {featuredToolsCount}+
              </div>
              <div className="text-gray-300 font-medium text-lg">Outils recommandés</div>
              <div className="text-sm text-gray-400 mt-2">Testés par nos experts</div>
            </div>
          </div>

          {/* Call-to-action buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleBrowseTools}
              className="btn-primary text-lg px-10 py-4 inline-flex items-center"
            >
              <RocketLaunchIcon className="w-6 h-6 mr-3" />
              Explorer tous les outils
            </button>
            
            <button
              onClick={handleViewCategories}
              className="btn-outline text-lg px-10 py-4 inline-flex items-center"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m14 8H5" />
              </svg>
              Parcourir par catégories
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-20 pt-12 border-t border-gray-700/50">
            <p className="text-gray-400 text-base mb-6">Utilisé par des milliers de créateurs</p>
            <div className="flex justify-center items-center space-x-12 opacity-60">
              {/* Placeholder for logos/testimonials */}
              <div className="w-32 h-10 glass-effect rounded-lg"></div>
              <div className="w-32 h-10 glass-effect rounded-lg"></div>
              <div className="w-32 h-10 glass-effect rounded-lg"></div>
              <div className="w-32 h-10 glass-effect rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
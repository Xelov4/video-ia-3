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
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main headline */}
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Répertoire N°1 des outils d'IA en France
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="block">Découvrez les</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {totalToolsCount.toLocaleString()} outils IA
              </span>
              <span className="block">pour créateurs</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              La plus grande collection d'outils d'intelligence artificielle pour créateurs, 
              développeurs et professionnels. Organisés par catégories, testés et approuvés 
              par notre communauté.
            </p>
          </div>

          {/* Search section */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un outil IA (ex: ChatGPT, Midjourney, Notion AI...)"
                  className="block w-full pl-12 pr-32 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-lg"
                  disabled={isSearching}
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? 'Recherche...' : 'Rechercher'}
                  </button>
                </div>
              </div>
            </form>
            
            {/* Popular searches */}
            <div className="mt-4 text-sm text-gray-500">
              <span className="mr-2">Recherches populaires:</span>
              <button 
                onClick={() => setSearchQuery('ChatGPT')}
                className="text-blue-600 hover:text-blue-800 mx-1"
              >
                ChatGPT
              </button>
              <span className="mx-1">•</span>
              <button 
                onClick={() => setSearchQuery('Midjourney')}
                className="text-blue-600 hover:text-blue-800 mx-1"
              >
                Midjourney
              </button>
              <span className="mx-1">•</span>
              <button 
                onClick={() => setSearchQuery('Notion AI')}
                className="text-blue-600 hover:text-blue-800 mx-1"
              >
                Notion AI
              </button>
              <span className="mx-1">•</span>
              <button 
                onClick={() => setSearchQuery('Claude')}
                className="text-blue-600 hover:text-blue-800 mx-1"
              >
                Claude
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {totalToolsCount.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Outils IA référencés</div>
              <div className="text-sm text-gray-500 mt-1">Mis à jour quotidiennement</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                {totalCategoriesCount}+
              </div>
              <div className="text-gray-600 font-medium">Catégories</div>
              <div className="text-sm text-gray-500 mt-1">Soigneusement organisées</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                {featuredToolsCount}+
              </div>
              <div className="text-gray-600 font-medium">Outils recommandés</div>
              <div className="text-sm text-gray-500 mt-1">Testés par nos experts</div>
            </div>
          </div>

          {/* Call-to-action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleBrowseTools}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl hover:shadow-lg hover:scale-105 transition-all"
            >
              <RocketLaunchIcon className="w-5 h-5 mr-2" />
              Explorer tous les outils
            </button>
            
            <button
              onClick={handleViewCategories}
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m14 8H5" />
              </svg>
              Parcourir par catégories
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-4">Utilisé par des milliers de créateurs</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {/* Placeholder for logos/testimonials */}
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
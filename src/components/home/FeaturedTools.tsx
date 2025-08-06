/**
 * Featured Tools Section Component
 * 
 * Displays a curated selection of featured AI tools on the homepage.
 * Shows high-quality tools with rich metadata and engagement features.
 * 
 * Features:
 * - Featured tools carousel/grid
 * - Tool cards with rich information
 * - Click tracking for analytics
 * - Responsive design
 * - Loading states
 * - Call-to-action integration
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tool } from '@prisma/client'
import { StarIcon, EyeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { formatNumber } from '@/src/lib/utils/formatNumbers'

interface FeaturedToolsProps {
  initialTools?: Tool[]
  limit?: number
}

export default function FeaturedTools({ initialTools = [], limit = 8 }: FeaturedToolsProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools)
  const [isLoading, setIsLoading] = useState(!initialTools.length)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load featured tools from API
   */
  useEffect(() => {
    if (initialTools.length > 0) return

    const loadFeaturedTools = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/tools?featured=true&limit=${limit}&sort=qualityScore&order=desc`)
        
        if (!response.ok) {
          throw new Error('Failed to load featured tools')
        }
        
        const data = await response.json()
        setTools(data.tools || [])
      } catch (error) {
        console.error('Error loading featured tools:', error)
        setError('Impossible de charger les outils mis en avant')
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedTools()
  }, [initialTools, limit])

  /**
   * Handle tool click for analytics
   */
  const handleToolClick = async (toolId: number) => {
    try {
      // Track click for analytics (non-blocking)
      fetch(`/api/tools/${toolId}/click`, {
        method: 'POST',
      }).catch(() => {
        // Silently handle errors for analytics
      })
    } catch (error) {
      // Silently handle errors for analytics
    }
  }

  /**
   * Render tool card
   */
  const renderToolCard = (tool: Tool) => {
    const hasImage = tool.imageUrl && tool.imageUrl.length > 0
    const viewCount = tool.viewCount || 0
    const qualityScore = tool.qualityScore || 0

    return (
      <div
        key={tool.id}
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden"
      >
        {/* Tool Image/Icon */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          {hasImage ? (
            <img
              src={tool.imageUrl!}
              alt={`${tool.toolName} logo`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {tool.toolName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Quality badge */}
          {qualityScore > 7 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
              Premium
            </div>
          )}
        </div>

        {/* Tool Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {tool.toolName}
              </h3>
              {tool.toolCategory && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {tool.toolCategory}
                </span>
              )}
            </div>
            
            {/* Rating stars */}
            <div className="flex items-center ml-4">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(qualityScore / 2)
                      ? 'text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {tool.overview || tool.toolDescription?.substring(0, 120) + '...' || 'Outil d\'intelligence artificielle innovant.'}
          </p>

          {/* Features/Tags */}
          {tool.keyFeatures && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {tool.keyFeatures.split(',').slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    {feature.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                <span>{formatNumber(viewCount)} vues</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Link
              href={`/tools/${tool.slug || tool.id}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              En savoir plus
            </Link>
            
            {tool.toolLink && (
              <a
                href={tool.toolLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleToolClick(tool.id)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                title="Visiter le site officiel"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️ Erreur de chargement</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Outils IA mis en avant
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez notre sélection d'outils d'intelligence artificielle les plus populaires et efficaces, 
            testés et approuvés par notre équipe d'experts.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tools Grid */}
        {!isLoading && tools.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {tools.map(renderToolCard)}
            </div>
            
            {/* Call to action */}
            <div className="text-center">
              <Link
                href="/tools"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl hover:shadow-lg hover:scale-105 transition-all"
              >
                Voir tous les outils
                <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && tools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <StarIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun outil mis en avant
            </h3>
            <p className="text-gray-600">
              Nous travaillons à sélectionner les meilleurs outils pour vous.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
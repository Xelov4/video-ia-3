/**
 * Tool Detail Page
 * 
 * Comprehensive detail page for individual AI tools showing all information,
 * features, pricing, reviews, and related tools.
 * 
 * Features:
 * - Complete tool information display
 * - Screenshots and media gallery
 * - Pricing information
 * - Feature highlights
 * - Usage examples and use cases
 * - Related tools suggestions
 * - Click tracking for analytics
 * - SEO optimization
 * 
 * @author Video-IA.net Development Team
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ToolsService, CategoriesService } from '@/src/lib/database'
import { 
  ArrowTopRightOnSquareIcon, 
  StarIcon,
  EyeIcon,
  HeartIcon,
  ChevronRightIcon,
  HomeIcon,
  ClockIcon,
  TagIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface ToolPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = await ToolsService.getToolBySlug(params.slug).catch(() => null)
  
  if (!tool) {
    return {
      title: 'Outil non trouvé | Video-IA.net',
      description: 'Cet outil d\'IA n\'existe pas ou a été supprimé de notre répertoire.'
    }
  }

  return {
    title: tool.metaTitle || `${tool.toolName} - Outil IA ${tool.toolCategory} | Video-IA.net`,
    description: tool.metaDescription || tool.overview || `Découvrez ${tool.toolName}, un outil d'intelligence artificielle ${tool.toolCategory}. ${tool.toolDescription?.substring(0, 120)}...`,
    keywords: tool.seoKeywords || `${tool.toolName}, ${tool.toolCategory}, outil IA, intelligence artificielle`,
    openGraph: {
      title: `${tool.toolName} - Outil IA`,
      description: tool.overview || tool.toolDescription?.substring(0, 160) || '',
      type: 'website',
      images: tool.imageUrl ? [{ url: tool.imageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.toolName} - Outil IA`,
      description: tool.overview || tool.toolDescription?.substring(0, 160) || '',
      images: tool.imageUrl ? [tool.imageUrl] : undefined,
    }
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  // Load tool details
  const tool = await ToolsService.getToolBySlug(params.slug).catch(() => null)
  
  if (!tool) {
    notFound()
  }

  // Track view (non-blocking)
  ToolsService.incrementViewCount(tool.id).catch(() => {
    // Silently handle errors for analytics
  })

  // Load related data
  const [relatedTools, categoryInfo] = await Promise.all([
    ToolsService.searchTools({
      category: tool.toolCategory || undefined,
      limit: 4,
      excludeId: tool.id
    }).catch(() => ({ tools: [], totalCount: 0, hasMore: false })),
    tool.toolCategory 
      ? CategoriesService.getCategoryByName(tool.toolCategory).catch(() => null)
      : Promise.resolve(null)
  ])

  const hasImage = tool.imageUrl && tool.imageUrl.length > 0
  const qualityScore = tool.qualityScore || 0
  const features = tool.keyFeatures ? tool.keyFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0) : []
  const useCases = tool.useCases ? tool.useCases.split(',').map(u => u.trim()).filter(u => u.length > 0) : []
  const tags = tool.tags ? tool.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : []

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
            <Link href="/tools" className="text-gray-500 hover:text-blue-600">
              Outils
            </Link>
            {tool.toolCategory && categoryInfo && (
              <>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <Link 
                  href={`/categories/${categoryInfo.slug || tool.toolCategory.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="text-gray-500 hover:text-blue-600"
                >
                  {tool.toolCategory}
                </Link>
              </>
            )}
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{tool.toolName}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tool Image */}
            <div className="lg:col-span-4">
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                {hasImage ? (
                  <Image
                    src={tool.imageUrl!}
                    alt={`${tool.toolName} logo`}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {tool.toolName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {tool.featured && (
                    <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                  {qualityScore > 8 && (
                    <span className="inline-block px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tool Info */}
            <div className="lg:col-span-8">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        {tool.toolName}
                      </h1>
                      {tool.toolCategory && (
                        <Link 
                          href={`/categories/${categoryInfo?.slug || tool.toolCategory.toLowerCase().replace(/\s+/g, '-')}`}
                          className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          {tool.toolCategory}
                        </Link>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center ml-6">
                      <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(qualityScore / 2)
                                ? 'text-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {(qualityScore / 2).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {tool.overview && (
                    <p className="text-xl text-gray-600 leading-relaxed mb-6">
                      {tool.overview}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>{(tool.viewCount || 0).toLocaleString()} vues</span>
                    </div>
                    <div className="flex items-center">
                      <HeartIcon className="w-4 h-4 mr-1" />
                      <span>{(tool.favoriteCount || 0).toLocaleString()} favoris</span>
                    </div>
                    {tool.updatedAt && (
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>Mis à jour le {new Date(tool.updatedAt).toLocaleDateString('fr')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  {tool.toolLink && (
                    <a
                      href={tool.toolLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
                      Visiter {tool.toolName}
                    </a>
                  )}
                  
                  <button className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-red-300 hover:text-red-600 transition-colors flex items-center">
                    <HeartIcon className="w-5 h-5 mr-2" />
                    Ajouter aux favoris
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            {tool.toolDescription && (
              <section className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {tool.toolDescription.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Key Features */}
            {features.length > 0 && (
              <section className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Fonctionnalités clés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Use Cases */}
            {useCases.length > 0 && (
              <section className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cas d'usage</h2>
                <div className="space-y-4">
                  {useCases.map((useCase, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <UserGroupIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{useCase}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Target Audience */}
            {tool.targetAudience && (
              <section className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Public cible</h2>
                <p className="text-gray-700 leading-relaxed">
                  {tool.targetAudience}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Tool Info Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations
              </h3>
              
              <div className="space-y-4">
                {/* Category */}
                {tool.toolCategory && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                    <dd className="mt-1">
                      <Link 
                        href={`/categories/${categoryInfo?.slug || tool.toolCategory.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {tool.toolCategory}
                      </Link>
                    </dd>
                  </div>
                )}

                {/* Quality Score */}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Note qualité</dt>
                  <dd className="mt-1 flex items-center">
                    <div className="flex items-center mr-2">
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
                    <span className="font-medium">{(qualityScore / 2).toFixed(1)}/5</span>
                  </dd>
                </div>

                {/* Stats */}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Statistiques</dt>
                  <dd className="mt-1 space-y-1 text-sm">
                    <div>{(tool.viewCount || 0).toLocaleString()} vues</div>
                    <div>{(tool.clickCount || 0).toLocaleString()} clics</div>
                    <div>{(tool.favoriteCount || 0).toLocaleString()} favoris</div>
                  </dd>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                    <dd className="flex flex-wrap gap-2">
                      {tags.slice(0, 6).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                        >
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {tool.toolLink && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href={tool.toolLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                    Essayer maintenant
                  </a>
                </div>
              )}
            </div>

            {/* Related Tools */}
            {relatedTools.tools.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Outils similaires
                </h3>
                <div className="space-y-4">
                  {relatedTools.tools.map(relatedTool => (
                    <Link
                      key={relatedTool.id}
                      href={`/tools/${relatedTool.slug || relatedTool.id}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          {relatedTool.imageUrl ? (
                            <Image
                              src={relatedTool.imageUrl}
                              alt={relatedTool.toolName}
                              width={40}
                              height={40}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {relatedTool.toolName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {relatedTool.toolName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {relatedTool.toolCategory}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
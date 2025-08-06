/**
 * Page Détail Outil - Multilingue
 * 
 * Affichage complet d'un outil avec métadonnées traduites,
 * recommendations et optimisations SEO avancées.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/middleware'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools'

// Interface pour paramètres
interface ToolPageProps {
  params: {
    lang: SupportedLocale
    slug: string
  }
}

/**
 * Validation et récupération des données outil
 */
async function getToolData(slug: string, lang: SupportedLocale): Promise<ToolWithTranslation | null> {
  try {
    // Pour cette demo, nous simulons la récupération par slug
    // En réalité, il faudrait une méthode getToolBySlug dans le service
    
    // Récupération par recherche de nom pour l'instant
    const searchResult = await multilingualToolsService.searchTools({
      language: lang,
      query: slug.replace(/-/g, ' '), // Convertir slug en termes recherche
      limit: 1,
      useCache: true
    })
    
    if (searchResult.tools.length === 0) {
      return null
    }
    
    const tool = searchResult.tools[0]
    
    // Vérifier que le slug correspond (approximation)
    const toolSlug = tool.slug || tool.displayName.toLowerCase().replace(/\s+/g, '-')
    if (toolSlug !== slug) {
      return null
    }
    
    return tool
    
  } catch (error) {
    console.error('Error fetching tool:', error)
    return null
  }
}

/**
 * Génération métadonnées SEO dynamiques
 */
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { lang, slug } = params
  
  if (!SUPPORTED_LOCALES.includes(lang)) {
    notFound()
  }
  
  const tool = await getToolData(slug, lang)
  
  if (!tool) {
    return {
      title: 'Tool Not Found | Video-IA.net',
      description: 'The requested AI tool could not be found.'
    }
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const langPrefix = lang === 'en' ? '' : `/${lang}`
  const currentUrl = `${baseUrl}${langPrefix}/tools/${slug}`
  
  // Textes localisés pour SEO
  const seoTexts = {
    'en': {
      titleSuffix: 'AI Tool Review & Guide | Video-IA.net',
      descriptionTemplate: (name: string, category: string) => 
        `Complete guide to ${name} - ${category} AI tool. Features, pricing, reviews, alternatives and tutorials. Get started today!`
    },
    'fr': {
      titleSuffix: 'Outil IA Guide & Avis | Video-IA.net',
      descriptionTemplate: (name: string, category: string) => 
        `Guide complet de ${name} - Outil IA ${category}. Fonctionnalités, prix, avis, alternatives et tutoriels. Commencez dès aujourd\'hui !`
    }
    // Ajouter autres langues...
  }
  
  const texts = seoTexts[lang] || seoTexts['en']
  const title = `${tool.displayName} - ${texts.titleSuffix}`
  const description = tool.displayDescription || 
    texts.descriptionTemplate(tool.displayName, tool.toolCategory)
  
  return {
    title,
    description: description.slice(0, 160), // Limite SEO
    keywords: `${tool.displayName}, ${tool.toolCategory}, AI tool, artificial intelligence, ${lang === 'fr' ? 'outil IA' : 'AI software'}`,
    
    openGraph: {
      title,
      description,
      url: currentUrl,
      type: 'article',
      siteName: 'Video-IA.net',
      locale: lang === 'en' ? 'en_US' : `${lang}_${lang.toUpperCase()}`,
      images: tool.imageUrl ? [
        {
          url: tool.imageUrl,
          width: 1200,
          height: 630,
          alt: `${tool.displayName} screenshot`
        }
      ] : []
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: tool.imageUrl ? [tool.imageUrl] : []
    },
    
    alternates: {
      canonical: currentUrl,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map(locale => [
          locale,
          `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/tools/${slug}`
        ])
      )
    },
    
    other: {
      'article:author': 'Video-IA.net',
      'article:published_time': tool.createdAt?.toISOString(),
      'article:modified_time': tool.updatedAt?.toISOString(),
    }
  }
}

/**
 * Page Component détail outil
 */
export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { lang, slug } = params
  
  if (!SUPPORTED_LOCALES.includes(lang)) {
    notFound()
  }
  
  const tool = await getToolData(slug, lang)
  
  if (!tool) {
    notFound()
  }
  
  // Récupération d'outils similaires
  const relatedTools = await multilingualToolsService.searchTools({
    language: lang,
    category: tool.toolCategory,
    limit: 6,
    useCache: true
  })
  
  // Messages localisés
  const messages = getLocalizedMessages(lang)
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête avec breadcrumb */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex text-sm text-gray-600 dark:text-gray-400 mb-4">
            <a href={`/${lang}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {messages.home}
            </a>
            <span className="mx-2">/</span>
            <a href={`/${lang}/tools`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {messages.tools}
            </a>
            <span className="mx-2">/</span>
            <a href={`/${lang}/tools?category=${tool.toolCategory}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {tool.toolCategory}
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{tool.displayName}</span>
          </nav>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {tool.imageUrl && (
                  <img
                    src={tool.imageUrl}
                    alt={`${tool.displayName} logo`}
                    className="w-16 h-16 rounded-lg object-cover shadow-md"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {tool.displayName}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {tool.toolCategory}
                    </span>
                    {tool.translationSource !== 'exact' && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        {messages.translated}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {tool.displayOverview && (
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tool.displayOverview}
                </p>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3 lg:min-w-[200px]">
              <a
                href={tool.toolLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                onClick={() => {
                  // Analytics tracking
                  if (typeof gtag !== 'undefined') {
                    gtag('event', 'tool_visit', {
                      tool_name: tool.displayName,
                      tool_category: tool.toolCategory,
                      language: lang
                    })
                  }
                }}
              >
                {messages.visitTool}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                {tool.viewCount && (
                  <p>{tool.viewCount.toLocaleString()} {messages.views}</p>
                )}
                {tool.translationQuality > 0 && (
                  <p className="mt-1">{messages.quality}: {tool.translationQuality.toFixed(1)}/10</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description détaillée */}
            {tool.displayDescription && (
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {messages.description}
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {tool.displayDescription}
                  </p>
                </div>
              </section>
            )}
            
            {/* Fonctionnalités */}
            {tool.keyFeatures && (
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {messages.keyFeatures}
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {tool.keyFeatures}
                  </p>
                </div>
              </section>
            )}
            
            {/* Cas d'usage */}
            {tool.useCases && (
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {messages.useCases}
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {tool.useCases}
                  </p>
                </div>
              </section>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Informations rapides */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {messages.toolInfo}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {messages.category}:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    {tool.toolCategory}
                  </span>
                </div>
                
                {tool.targetAudience && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {messages.targetAudience}:
                    </span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {tool.targetAudience}
                    </span>
                  </div>
                )}
                
                {tool.tags && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                      {messages.tags}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.split(',').slice(0, 5).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Outils similaires */}
            {relatedTools.tools.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {messages.similarTools}
                </h3>
                <div className="space-y-3">
                  {relatedTools.tools.slice(0, 4).map((relatedTool) => (
                    relatedTool.id !== tool.id && (
                      <a
                        key={relatedTool.id}
                        href={`/${lang}/tools/${relatedTool.slug || relatedTool.displayName.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {relatedTool.imageUrl && (
                            <img
                              src={relatedTool.imageUrl}
                              alt={relatedTool.displayName}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {relatedTool.displayName}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {relatedTool.toolCategory}
                            </p>
                          </div>
                        </div>
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Schema.org structuré pour SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": tool.displayName,
              "description": tool.displayDescription || tool.displayOverview,
              "url": tool.toolLink,
              "image": tool.imageUrl,
              "category": tool.toolCategory,
              "inLanguage": lang,
              "aggregateRating": tool.translationQuality > 0 ? {
                "@type": "AggregateRating",
                "ratingValue": tool.translationQuality,
                "ratingCount": 1
              } : undefined,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              }
            })
          }}
        />
      </main>
    </div>
  )
}

/**
 * Messages localisés
 */
function getLocalizedMessages(lang: SupportedLocale) {
  const messages = {
    'en': {
      home: 'Home',
      tools: 'Tools',
      visitTool: 'Visit Tool',
      views: 'views',
      quality: 'Quality',
      translated: 'Translated',
      description: 'Description',
      keyFeatures: 'Key Features',
      useCases: 'Use Cases',
      toolInfo: 'Tool Information',
      category: 'Category',
      targetAudience: 'Target Audience',
      tags: 'Tags',
      similarTools: 'Similar Tools'
    },
    'fr': {
      home: 'Accueil',
      tools: 'Outils',
      visitTool: 'Visiter l\'Outil',
      views: 'vues',
      quality: 'Qualité',
      translated: 'Traduit',
      description: 'Description',
      keyFeatures: 'Fonctionnalités Clés',
      useCases: 'Cas d\'Usage',
      toolInfo: 'Informations Outil',
      category: 'Catégorie',
      targetAudience: 'Public Cible',
      tags: 'Tags',
      similarTools: 'Outils Similaires'
    }
    // Ajouter autres langues...
  }
  
  return messages[lang] || messages['en']
}
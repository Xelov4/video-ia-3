/**
 * Page Détail Outil - Multilingue
 * 
 * Affichage complet d'un outil avec métadonnées traduites,
 * recommendations et optimisations SEO avancées.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, supportedLocales } from '@/middleware'
import { toolsService } from '@/src/lib/database/services/tools'

// Interface pour paramètres de page
interface ToolPageProps {
  params: Promise<{
    lang: SupportedLocale
    slug: string
  }>
}

// Interface pour les outils avec données enrichies
interface EnrichedTool {
  id: number
  slug: string
  displayName: string
  displayDescription: string
  displayOverview: string
  toolCategory: string
  toolLink: string
  targetAudience?: string[]
  keyFeatures?: string[]
  useCases?: string[]
  tags?: string[]
  imageUrl?: string
  featured: boolean
}

/**
 * Validation et récupération des données outil
 */
async function getToolData(slug: string, lang: SupportedLocale): Promise<EnrichedTool | null> {
  try {
    // Récupérer l'outil depuis la base de données
    const tool = await toolsService.getToolBySlug(slug)
    
    if (!tool || !tool.is_active) {
      return null
    }
    
    // Transformer les données pour l'interface
    return {
      id: tool.id,
      slug: tool.slug,
      displayName: tool.tool_name,
      displayDescription: tool.tool_description || tool.overview || '',
      displayOverview: tool.overview || '',
      toolCategory: tool.tool_category || '',
      toolLink: tool.tool_link || '',
      targetAudience: tool.target_audience ? tool.target_audience.split(',').map(s => s.trim()).filter(Boolean) : [],
      keyFeatures: tool.key_features ? tool.key_features.split(',').map(s => s.trim()).filter(Boolean) : [],
      useCases: tool.use_cases ? tool.use_cases.split(',').map(s => s.trim()).filter(Boolean) : [],
      tags: tool.tags ? tool.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      imageUrl: tool.image_url || undefined,
      featured: tool.featured || false
    }
  } catch (error) {
    console.error('Error fetching tool data:', error)
    return null
  }
}

/**
 * Génération métadonnées SEO dynamiques
 */
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  
  if (!supportedLocales.includes(lang)) {
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
    },
    'de': {
      titleSuffix: 'KI-Tool Test & Leitfaden | Video-IA.net',
      descriptionTemplate: (name: string, category: string) => 
        `Vollständiger Leitfaden zu ${name} - ${category} KI-Tool. Funktionen, Preise, Bewertungen, Alternativen und Tutorials. Starten Sie noch heute!`
    },
    'nl': {
      titleSuffix: 'AI-Tool Review & Gids | Video-IA.net',
      descriptionTemplate: (name: string, category: string) => 
        `Volledige gids voor ${name} - ${category} AI-tool. Functies, prijzen, reviews, alternatieven en tutorials. Begin vandaag nog!`
    },
    'it': {
      titleSuffix: 'Recensione e Guida Strumento IA | Video-IA.net',
      descriptionTemplate: (name: string, category: string) => 
        `Guida completa a ${name} - Strumento IA ${category}. Funzionalità, prezzi, recensioni, alternative e tutorial. Inizia oggi stesso!`
    },
    'es': {
      titleSuffix: 'Reseña y Guía de Herramienta IA | Video-IA.net',
      descriptionTemplate: (name: string, category: string) => 
        `Guía completa de ${name} - Herramienta IA ${category}. Características, precios, reseñas, alternativas y tutoriales. ¡Comienza hoy!`
    },
    'pt': {
      titleSuffix: 'Análise e Guia da Ferramenta IA | Video-IA.net',
      descriptionTemplate: (name: string, category: string) => 
        `Guia completo do ${name} - Ferramenta IA ${category}. Recursos, preços, avaliações, alternativas e tutoriais. Comece hoje!`
    }
  }
  
  const texts = seoTexts[lang] || seoTexts['en']
  const title = `${tool.displayName} - ${texts.titleSuffix}`
  const description = tool.displayDescription || 
    texts.descriptionTemplate(tool.displayName, tool.toolCategory)
  
  return {
    title,
    description,
    
    openGraph: {
      title,
      description,
      url: currentUrl,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/tools/${slug}.jpg`,
          width: 1200,
          height: 630,
          alt: tool.displayName
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/images/tools/${slug}.jpg`]
    },
    
    alternates: {
      canonical: currentUrl,
      languages: Object.fromEntries(
        supportedLocales.map(locale => [
          locale,
          `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/tools/${slug}`
        ])
      )
    }
  }
}

/**
 * Génération des paramètres statiques pour build
 */
export async function generateStaticParams() {
  const params = []
  
  try {
    // Récupérer tous les outils actifs de la base de données
    const { tools } = await toolsService.getAllTools(1, 1000) // Récupérer tous les outils
    
    for (const lang of supportedLocales) {
      for (const tool of tools) {
        if (tool.slug && tool.is_active) {
          params.push({
            lang,
            slug: tool.slug
          })
        }
      }
    }
  } catch (error) {
    console.error('Error generating static params:', error)
  }
  
  return params
}

/**
 * Page Component Principal
 */
export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { lang, slug } = await params
  
  if (!supportedLocales.includes(lang)) {
    notFound()
  }
  
  const tool = await getToolData(slug, lang)
  
  if (!tool) {
    notFound()
  }
  
  const messages = getLocalizedMessages(lang)
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex text-sm text-gray-600 dark:text-gray-400 mb-4">
            <a href={`/${lang}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {messages.home}
            </a>
            <span className="mx-2">/</span>
            <a href={`/${lang}/tools`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {messages.tools}
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {tool.displayName}
            </span>
          </nav>
          
          {/* Informations principales */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">🛠️</div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {tool.displayName}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {tool.toolCategory}
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                {tool.displayOverview || tool.displayDescription}
              </p>
              
              {/* Tags */}
              {tool.tags && tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* CTA */}
            <div className="lg:w-80">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                {tool.toolLink && (
                  <a
                    href={tool.toolLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {messages.visitTool}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description détaillée */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {messages.about}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {tool.displayDescription || tool.displayOverview || messages.noDescription}
              </p>
            </section>

            {/* Public cible */}
            {tool.targetAudience && tool.targetAudience.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {messages.targetAudience}
                </h2>
                <ul className="space-y-3">
                  {tool.targetAudience.map((audience, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {audience}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            {/* Fonctionnalités clés */}
            {tool.keyFeatures && tool.keyFeatures.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {messages.features}
                </h2>
                <ul className="space-y-3">
                  {tool.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Cas d'usage */}
            {tool.useCases && tool.useCases.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {messages.useCases}
                </h2>
                <ul className="space-y-3">
                  {tool.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {useCase}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Outils similaires */}
            <SimilarToolsSection 
              toolId={tool.id}
              category={tool.toolCategory}
              lang={lang}
              messages={messages}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * Composant pour afficher les outils similaires
 */
async function SimilarToolsSection({ 
  toolId, 
  category, 
  lang, 
  messages 
}: { 
  toolId: number
  category: string
  lang: string
  messages: any 
}) {
  try {
    const relatedTools = await toolsService.getRelatedTools(toolId, category, 3)
    
    if (relatedTools.length === 0) {
      return null
    }

    return (
      <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {messages.similarTools}
        </h3>
        <div className="space-y-3">
          {relatedTools.map((relatedTool) => (
            <a
              key={relatedTool.id}
              href={`/${lang}/tools/${relatedTool.slug || relatedTool.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-2xl">🛠️</div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {relatedTool.tool_name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {relatedTool.tool_category}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error loading related tools:', error)
    return null
  }
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
      about: 'About',
      features: 'Key Features',
      targetAudience: 'Target Audience',
      useCases: 'Use Cases',
      similarTools: 'Similar Tools',
      noDescription: 'No description available'
    },
    'fr': {
      home: 'Accueil',
      tools: 'Outils',
      visitTool: 'Visiter l\'Outil',
      about: 'À Propos',
      features: 'Fonctionnalités Clés',
      targetAudience: 'Public Cible',
      useCases: 'Cas d\'Usage',
      similarTools: 'Outils Similaires',
      noDescription: 'Aucune description disponible'
    },
    'de': {
      home: 'Startseite',
      tools: 'Tools',
      visitTool: 'Tool Besuchen',
      about: 'Über',
      features: 'Hauptfunktionen',
      targetAudience: 'Zielgruppe',
      useCases: 'Anwendungsfälle',
      similarTools: 'Ähnliche Tools',
      noDescription: 'Keine Beschreibung verfügbar'
    },
    'nl': {
      home: 'Home',
      tools: 'Tools',
      visitTool: 'Tool Bezoeken',
      about: 'Over',
      features: 'Belangrijkste Functies',
      targetAudience: 'Doelgroep',
      useCases: 'Gebruiksgevallen',
      similarTools: 'Vergelijkbare Tools',
      noDescription: 'Geen beschrijving beschikbaar'
    },
    'it': {
      home: 'Home',
      tools: 'Strumenti',
      visitTool: 'Visita Strumento',
      about: 'Informazioni',
      features: 'Funzionalità Principali',
      targetAudience: 'Pubblico Target',
      useCases: 'Casi d\'Uso',
      similarTools: 'Strumenti Simili',
      noDescription: 'Nessuna descrizione disponibile'
    },
    'es': {
      home: 'Inicio',
      tools: 'Herramientas',
      visitTool: 'Visitar Herramienta',
      about: 'Acerca de',
      features: 'Características Principales',
      targetAudience: 'Público Objetivo',
      useCases: 'Casos de Uso',
      similarTools: 'Herramientas Similares',
      noDescription: 'Sin descripción disponible'
    },
    'pt': {
      home: 'Início',
      tools: 'Ferramentas',
      visitTool: 'Visitar Ferramenta',
      about: 'Sobre',
      features: 'Principais Recursos',
      targetAudience: 'Público-Alvo',
      useCases: 'Casos de Uso',
      similarTools: 'Ferramentas Similares',
      noDescription: 'Nenhuma descrição disponível'
    }
  }
  
  return messages[lang] || messages['en']
}
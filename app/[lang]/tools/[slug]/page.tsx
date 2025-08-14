/**
 * Page Détail Outil - Multilingue
 * 
 * Affichage complet d'un outil avec métadonnées traduites,
 * recommendations et optimisations SEO avancées.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, supportedLocales } from '@/middleware'

// Interface pour paramètres
interface ToolPageProps {
  params: Promise<{
    lang: SupportedLocale
    slug: string
  }
}

/**
 * Données mockées pour les outils populaires
 */
const MOCK_TOOLS = {
  'midjourney': {
    id: 1,
    displayName: 'Midjourney',
    displayDescription: 'AI-powered image generation tool that creates stunning artwork from text descriptions',
    toolCategory: 'Image Generation',
    toolLink: 'https://midjourney.com',
    qualityScore: 9.2,
    viewCount: 150000,
    featured: true,
    emoji: '🎨',
    pricing: 'Paid',
    tags: ['AI Art', 'Image Generation', 'Creative']
  },
  'chatgpt': {
    id: 2,
    displayName: 'ChatGPT',
    displayDescription: 'Advanced AI chatbot for conversations, writing assistance, and problem solving',
    toolCategory: 'Chatbot',
    toolLink: 'https://chat.openai.com',
    qualityScore: 9.5,
    viewCount: 250000,
    featured: true,
    emoji: '🤖',
    pricing: 'Freemium',
    tags: ['AI Chat', 'Writing', 'Assistant']
  },
  'jasper': {
    id: 3,
    displayName: 'Jasper',
    displayDescription: 'AI writing assistant for content creation, marketing copy, and creative writing',
    toolCategory: 'Writing',
    toolLink: 'https://jasper.ai',
    qualityScore: 8.8,
    viewCount: 120000,
    featured: true,
    emoji: '✍️',
    pricing: 'Paid',
    tags: ['Content Writing', 'Marketing', 'AI Assistant']
  },
  'dall-e': {
    id: 4,
    displayName: 'DALL-E',
    displayDescription: 'AI system that creates realistic images and art from natural language descriptions',
    toolCategory: 'Art',
    toolLink: 'https://openai.com/dall-e-2',
    qualityScore: 9.0,
    viewCount: 180000,
    featured: true,
    emoji: '🎭',
    pricing: 'Paid',
    tags: ['AI Art', 'Image Generation', 'Creative']
  }
}

/**
 * Validation et récupération des données outil
 */
async function getToolData(slug: string, lang: SupportedLocale) {
  // Utiliser les données mockées pour l'instant
  const tool = MOCK_TOOLS[slug as keyof typeof MOCK_TOOLS]
  
  if (!tool) {
    return null
  }
  
  return {
    ...tool,
    slug: slug,
    // Ajouter des traductions basiques
    displayName: tool.displayName,
    displayDescription: tool.displayDescription,
    toolCategory: tool.toolCategory
  }
}

/**
 * Génération métadonnées SEO dynamiques
 */
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { lang, slug } = params
  
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
  
  for (const lang of supportedLocales) {
    for (const slug of Object.keys(MOCK_TOOLS)) {
      params.push({
        lang,
        slug
      })
    }
  }
  
  return params
}

/**
 * Page Component Principal
 */
export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { lang, slug } = params
  
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
                <div className="text-4xl">{tool.emoji}</div>
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
                {tool.displayDescription}
              </p>
              
              {/* Tags */}
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
            </div>
            
            {/* CTA et métriques */}
            <div className="lg:w-80">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {messages.qualityScore}
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {tool.qualityScore}/10
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {messages.views}
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {tool.viewCount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {messages.pricing}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {tool.pricing}
                  </span>
                </div>
                
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
                {tool.displayDescription} {tool.displayDescription} {tool.displayDescription}
              </p>
            </section>
            
            {/* Fonctionnalités */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {messages.features}
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Advanced AI-powered functionality
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    User-friendly interface
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    High-quality output
                  </span>
                </li>
              </ul>
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Outils similaires */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {messages.similarTools}
              </h3>
              <div className="space-y-3">
                {Object.entries(MOCK_TOOLS)
                  .filter(([key]) => key !== slug)
                  .slice(0, 3)
                  .map(([key, similarTool]) => (
                    <a
                      key={key}
                      href={`/${lang}/tools/${key}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="text-2xl">{similarTool.emoji}</div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {similarTool.displayName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {similarTool.toolCategory}
                        </div>
                      </div>
                    </a>
                  ))}
              </div>
            </section>
          </div>
        </div>
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
      qualityScore: 'Quality Score',
      views: 'Views',
      pricing: 'Pricing',
      visitTool: 'Visit Tool',
      about: 'About',
      features: 'Features',
      similarTools: 'Similar Tools'
    },
    'fr': {
      home: 'Accueil',
      tools: 'Outils',
      qualityScore: 'Score Qualité',
      views: 'Vues',
      pricing: 'Prix',
      visitTool: 'Visiter l\'Outil',
      about: 'À Propos',
      features: 'Fonctionnalités',
      similarTools: 'Outils Similaires'
    },
    'de': {
      home: 'Startseite',
      tools: 'Tools',
      qualityScore: 'Qualitätsbewertung',
      views: 'Aufrufe',
      pricing: 'Preise',
      visitTool: 'Tool Besuchen',
      about: 'Über',
      features: 'Funktionen',
      similarTools: 'Ähnliche Tools'
    },
    'nl': {
      home: 'Home',
      tools: 'Tools',
      qualityScore: 'Kwaliteitsscore',
      views: 'Weergaven',
      pricing: 'Prijzen',
      visitTool: 'Tool Bezoeken',
      about: 'Over',
      features: 'Functies',
      similarTools: 'Vergelijkbare Tools'
    },
    'it': {
      home: 'Home',
      tools: 'Strumenti',
      qualityScore: 'Punteggio Qualità',
      views: 'Visualizzazioni',
      pricing: 'Prezzi',
      visitTool: 'Visita Strumento',
      about: 'Informazioni',
      features: 'Funzionalità',
      similarTools: 'Strumenti Simili'
    },
    'es': {
      home: 'Inicio',
      tools: 'Herramientas',
      qualityScore: 'Puntuación de Calidad',
      views: 'Visualizaciones',
      pricing: 'Precios',
      visitTool: 'Visitar Herramienta',
      about: 'Acerca de',
      features: 'Características',
      similarTools: 'Herramientas Similares'
    },
    'pt': {
      home: 'Início',
      tools: 'Ferramentas',
      qualityScore: 'Pontuação de Qualidade',
      views: 'Visualizações',
      pricing: 'Preços',
      visitTool: 'Visitar Ferramenta',
      about: 'Sobre',
      features: 'Recursos',
      similarTools: 'Ferramentas Similares'
    }
  }
  
  return messages[lang] || messages['en']
}
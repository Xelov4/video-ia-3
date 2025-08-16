/**
 * Homepage Révolutionnaire - Video-IA.net
 * 
 * Homepage moderne exploitant l'architecture data-driven avec navigation
 * intelligente par audience, cas d'usage et fonctionnalités.
 * 
 * Features:
 * - Données réelles extraites de 16,765 outils IA
 * - Navigation par audience (developpeurs, créateurs, marketeurs, etc.)
 * - Sections dynamiques basées sur les cas d'usage populaires
 * - Outils trending et recommandations personnalisées
 * - Design moderne avec composants du Design System
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, supportedLocales } from '@/middleware'

import { Container } from '@/src/components/ui/Container'
import { Button } from '@/src/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
import { Grid } from '@/src/components/ui/Grid'

import { DataExtractionService } from '@/src/lib/services/dataExtraction'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'

// Interface pour paramètres de page
interface HomePageProps {
  params: Promise<{
    lang: SupportedLocale
  }>
}

/**
 * Validation des paramètres
 */
function validateLanguageParam(lang: string): SupportedLocale {
  if (!supportedLocales.includes(lang as SupportedLocale)) {
    notFound()
  }
  return lang as SupportedLocale
}

/**
 * Métadonnées SEO optimisées avec données réelles
 */
export async function generateMetadata({ 
  params 
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const validatedLang = validateLanguageParam(lang)
  
  // Obtenir stats réelles
  let totalTools = '16,765+'
  try {
    const stats = await DataExtractionService.getOverallStats()
    totalTools = stats.totalTools.toLocaleString() + '+'
  } catch (error) {
    console.warn('Could not fetch real stats for metadata:', error)
  }
  
  const seoContent = {
    'en': {
      title: `Video-IA.net - Best AI Tools Directory 2025 | ${totalTools} AI Tools`,
      description: `Discover the world's largest AI tools directory with ${totalTools} verified tools for video creation, content generation, automation and more. Find tools by audience, use case, and features.`,
      keywords: 'AI tools directory, artificial intelligence, video AI tools, content creation, automation, machine learning, AI for developers, AI for creators'
    },
    'fr': {
      title: `Video-IA.net - Meilleur Répertoire d'Outils IA 2025 | ${totalTools} Outils IA`,
      description: `Découvrez le plus grand répertoire d'outils IA au monde avec ${totalTools} outils vérifiés pour création vidéo, génération de contenu, automatisation et plus. Trouvez des outils par audience, cas d'usage et fonctionnalités.`,
      keywords: 'répertoire outils IA, intelligence artificielle, outils IA vidéo, création contenu, automatisation, IA pour développeurs, IA pour créateurs'
    },
    'it': {
      title: `Video-IA.net - Migliore Directory Strumenti AI 2025 | ${totalTools} Strumenti AI`,
      description: `Scopri la più grande directory di strumenti AI al mondo con ${totalTools} strumenti verificati per creazione video, generazione contenuti, automazione e altro. Trova strumenti per pubblico, caso d'uso e funzionalità.`,
      keywords: 'directory strumenti AI, intelligenza artificiale, strumenti AI video, creazione contenuti, automazione'
    },
    'es': {
      title: `Video-IA.net - Mejor Directorio Herramientas IA 2025 | ${totalTools} Herramientas IA`,
      description: `Descubre el directorio de herramientas IA más grande del mundo con ${totalTools} herramientas verificadas para creación de video, generación de contenido, automatización y más. Encuentra herramientas por audiencia, caso de uso y características.`,
      keywords: 'directorio herramientas IA, inteligencia artificial, herramientas IA video, creación contenido, automatización'
    },
    'de': {
      title: `Video-IA.net - Bestes KI-Tools Verzeichnis 2025 | ${totalTools} KI-Tools`,
      description: `Entdecken Sie das weltgrößte KI-Tools-Verzeichnis mit ${totalTools} verifizierten Tools für Videoerstellung, Content-Generierung, Automatisierung und mehr. Finden Sie Tools nach Zielgruppe, Anwendungsfall und Features.`,
      keywords: 'KI-Tools Verzeichnis, künstliche Intelligenz, Video-KI-Tools, Content-Erstellung, Automatisierung'
    },
    'nl': {
      title: `Video-IA.net - Beste AI Tools Directory 2025 | ${totalTools} AI Tools`,
      description: `Ontdek 's werelds grootste AI-tools directory met ${totalTools} geverifieerde tools voor video creatie, content generatie, automatisering en meer. Vind tools op publiek, use case en functies.`,
      keywords: 'AI-tools directory, kunstmatige intelligentie, video AI-tools, content creatie, automatisering'
    },
    'pt': {
      title: `Video-IA.net - Melhor Diretório Ferramentas IA 2025 | ${totalTools} Ferramentas IA`,
      description: `Descubra o maior diretório de ferramentas IA do mundo com ${totalTools} ferramentas verificadas para criação de vídeo, geração de conteúdo, automação e mais. Encontre ferramentas por audiência, caso de uso e recursos.`,
      keywords: 'diretório ferramentas IA, inteligência artificial, ferramentas IA vídeo, criação conteúdo, automação'
    }
  }
  
  const content = seoContent[validatedLang]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const currentUrl = validatedLang === 'en' ? baseUrl : `${baseUrl}/${validatedLang}`
  
  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    
    openGraph: {
      title: content.title,
      description: content.description,
      url: currentUrl,
      siteName: 'Video-IA.net',
      locale: validatedLang === 'en' ? 'en_US' : `${validatedLang}_${validatedLang.toUpperCase()}`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image-${validatedLang}.jpg`,
          width: 1200,
          height: 630,
          alt: content.title
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
    },
    
    alternates: {
      canonical: currentUrl,
      languages: Object.fromEntries(
        supportedLocales.map(locale => [
          locale,
          locale === 'en' ? baseUrl : `${baseUrl}/${locale}`
        ])
      )
    },

    // Schema.org structured data sera ajouté via JsonLd
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Video-IA.net',
        description: content.description,
        url: currentUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${currentUrl}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      })
    }
  }
}

/**
 * Génération des paramètres statiques pour build
 */
export function generateStaticParams() {
  return supportedLocales.map((lang) => ({
    lang: lang
  }))
}

/**
 * Homepage Component Révolutionnaire
 */
export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const validatedLang = validateLanguageParam(lang)
  
  // Charger les données réelles en parallèle
  const [
    stats,
    featuredTools,
    topCategories,
    topAudiences,
    topUseCases,
    trendingTools
  ] = await Promise.allSettled([
    DataExtractionService.getOverallStats(),
    multilingualToolsService.getFeaturedTools(validatedLang, 8),
    multilingualCategoriesService.getAllCategories(validatedLang, { limit: 12, includeCounts: true }),
    DataExtractionService.extractUniqueAudiences(15),
    DataExtractionService.extractUseCases(12),
    multilingualToolsService.searchTools({
      language: validatedLang,
      limit: 6,
      sortBy: 'view_count',
      sortOrder: 'desc',
      filters: { minQualityScore: 7.0 }
    })
  ])

  // Extraire données avec fallbacks
  const overallStats = stats.status === 'fulfilled' ? stats.value : {
    totalTools: 16765,
    totalCategories: 140,
    totalAudiences: 50,
    totalUseCases: 100
  }

  const featured = featuredTools.status === 'fulfilled' ? featuredTools.value.slice(0, 8) : []
  const categories = topCategories.status === 'fulfilled' ? topCategories.value.slice(0, 12) : []
  const audiences = topAudiences.status === 'fulfilled' ? topAudiences.value.slice(0, 12) : []
  const useCases = topUseCases.status === 'fulfilled' ? topUseCases.value.slice(0, 8) : []
  const trending = trendingTools.status === 'fulfilled' ? trendingTools.value.tools.slice(0, 6) : []

  const getLocalizedHref = (path: string) => {
    if (validatedLang === 'en') {
      return path === '/' ? '/' : path
    }
    return path === '/' ? `/${validatedLang}` : `/${validatedLang}${path}`
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Modern et Impactant */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <Container size="xl" className="relative z-10">
          <div className="py-20 md:py-32 text-center">
            {/* Badge New */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
              ✨ {getLocalizedText(validatedLang, 'newUpdate')} {overallStats.totalTools.toLocaleString()}+ {getLocalizedText(validatedLang, 'toolsAvailable')}
            </div>

            {/* Titre Principal */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {getLocalizedText(validatedLang, 'heroTitle')}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {getLocalizedText(validatedLang, 'heroTitleHighlight')}
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              {getLocalizedText(validatedLang, 'heroSubtitle')}
            </p>

            {/* Stats Impressionnantes */}
            <Grid cols={3} gap="lg" className="mb-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                  {overallStats.totalTools.toLocaleString()}+
                </div>
                <div className="text-gray-600 text-lg">{getLocalizedText(validatedLang, 'aiTools')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
                  {overallStats.totalAudiences}+
                </div>
                <div className="text-gray-600 text-lg">{getLocalizedText(validatedLang, 'audiences')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                  {overallStats.totalUseCases}+
                </div>
                <div className="text-gray-600 text-lg">{getLocalizedText(validatedLang, 'useCases')}</div>
              </div>
            </Grid>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="primary" 
                size="lg"
                className="text-lg px-8 py-4"
                href={getLocalizedHref('/discover')}
              >
                {getLocalizedText(validatedLang, 'startExploring')}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                className="text-lg px-8 py-4"
                href={getLocalizedHref('/categories')}
              >
                {getLocalizedText(validatedLang, 'browseCategories')}
              </Button>
            </div>
          </div>
        </Container>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
      </section>

      {/* Section Navigation par Audience */}
      <section className="py-20 bg-white">
        <Container size="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {getLocalizedText(validatedLang, 'findToolsForYou')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {getLocalizedText(validatedLang, 'findToolsForYouDesc')}
            </p>
          </div>

          <Grid cols={3} responsive={{ sm: 2, md: 3, lg: 4 }} gap="md">
            {audiences.map((audience, index) => (
              <Card 
                key={audience.name}
                variant="outlined"
                hover
                className="group cursor-pointer h-full"
              >
                <a href={getLocalizedHref(`/for/${audience.name.toLowerCase().replace(/\s+/g, '-')}`)}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-2xl">
                        {getAudienceEmoji(audience.name)}
                      </span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {audience.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">
                      {audience.count.toLocaleString()} {getLocalizedText(validatedLang, 'tools')}
                    </p>
                    <div className="text-blue-600 text-sm font-medium group-hover:underline">
                      {getLocalizedText(validatedLang, 'explore')} →
                    </div>
                  </CardContent>
                </a>
              </Card>
            ))}
          </Grid>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              href={getLocalizedHref('/audiences')}
            >
              {getLocalizedText(validatedLang, 'viewAllAudiences')}
            </Button>
          </div>
        </Container>
      </section>

      {/* Section Cas d'Usage Populaires */}
      <section className="py-20 bg-gray-50">
        <Container size="xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {getLocalizedText(validatedLang, 'popularUseCases')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {getLocalizedText(validatedLang, 'popularUseCasesDesc')}
            </p>
          </div>

          <Grid cols={2} responsive={{ md: 2, lg: 4 }} gap="md">
            {useCases.map((useCase, index) => (
              <Card 
                key={useCase.name}
                variant="elevated"
                hover
                className="group cursor-pointer"
              >
                <a href={getLocalizedHref(`/use-cases/${useCase.name.toLowerCase().replace(/\s+/g, '-')}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">
                          {getUseCaseEmoji(useCase.name)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {useCase.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {useCase.count.toLocaleString()} {getLocalizedText(validatedLang, 'tools')}
                        </p>
                        <div className="text-blue-600 text-sm font-medium group-hover:underline">
                          {getLocalizedText(validatedLang, 'discover')} →
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </a>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Section Outils Featured */}
      {featured.length > 0 && (
        <section className="py-20 bg-white">
          <Container size="xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {getLocalizedText(validatedLang, 'featuredTools')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {getLocalizedText(validatedLang, 'featuredToolsDesc')}
              </p>
            </div>

            <Grid cols={2} responsive={{ md: 2, lg: 4 }} gap="md">
              {featured.map((tool) => (
                <Card 
                  key={tool.id}
                  variant="elevated"
                  hover
                  className="group cursor-pointer h-full"
                >
                  <a href={getLocalizedHref(`/tools/${tool.slug || tool.toolName.toLowerCase().replace(/\s+/g, '-')}`)}>
                    <CardContent className="p-6">
                      {tool.imageUrl && (
                        <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                          <img 
                            src={tool.imageUrl} 
                            alt={tool.displayName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {tool.toolCategory}
                        </span>
                        {tool.qualityScore && (
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="ml-1 text-sm text-gray-600">{(tool.qualityScore / 10).toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {tool.displayName}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {tool.displayOverview || tool.displayDescription}
                      </p>

                      <div className="text-blue-600 text-sm font-medium group-hover:underline">
                        {getLocalizedText(validatedLang, 'learnMore')} →
                      </div>
                    </CardContent>
                  </a>
                </Card>
              ))}
            </Grid>

            <div className="text-center mt-12">
              <Button 
                variant="primary" 
                href={getLocalizedHref('/tools')}
              >
                {getLocalizedText(validatedLang, 'exploreAllTools')}
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* Section Trending Tools */}
      {trending.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
          <Container size="xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                🔥 {getLocalizedText(validatedLang, 'trendingNow')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {getLocalizedText(validatedLang, 'trendingDesc')}
              </p>
            </div>

            <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="md">
              {trending.map((tool, index) => (
                <Card 
                  key={tool.id}
                  variant="glass"
                  hover
                  className="group cursor-pointer"
                >
                  <a href={getLocalizedHref(`/tools/${tool.slug || tool.toolName.toLowerCase().replace(/\s+/g, '-')}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {tool.displayName}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {tool.displayOverview}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                              {tool.toolCategory}
                            </span>
                            <div className="text-blue-600 text-sm font-medium group-hover:underline">
                              {getLocalizedText(validatedLang, 'tryNow')} →
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </a>
                </Card>
              ))}
            </Grid>
          </Container>
        </section>
      )}

      {/* Section CTA Newsletter */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <Container size="lg">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {getLocalizedText(validatedLang, 'stayAhead')}
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {getLocalizedText(validatedLang, 'stayAheadDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder={getLocalizedText(validatedLang, 'emailPlaceholder')}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                {getLocalizedText(validatedLang, 'subscribe')}
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              {getLocalizedText(validatedLang, 'noSpam')}
            </p>
          </div>
        </Container>
      </section>
    </div>
  )
}

/**
 * Textes localisés pour la homepage révolutionnaire
 */
function getLocalizedText(lang: SupportedLocale, key: string): string {
  const translations: Record<string, Record<string, string>> = {
    'en': {
      newUpdate: 'New:',
      toolsAvailable: 'AI tools available',
      heroTitle: 'Find the Perfect ',
      heroTitleHighlight: 'AI Tool',
      heroSubtitle: 'Discover 16,765+ verified AI tools organized by your role, use case, and specific needs. Save time and find exactly what you need.',
      aiTools: 'AI Tools',
      audiences: 'Audiences',
      useCases: 'Use Cases',
      startExploring: 'Start Exploring',
      browseCategories: 'Browse Categories',
      findToolsForYou: 'Find Tools Built For You',
      findToolsForYouDesc: 'Discover AI tools specifically designed for your role and industry.',
      tools: 'tools',
      explore: 'Explore',
      viewAllAudiences: 'View All Audiences',
      popularUseCases: 'Popular Use Cases',
      popularUseCasesDesc: 'Find tools by what you want to accomplish.',
      discover: 'Discover',
      featuredTools: 'Featured AI Tools',
      featuredToolsDesc: 'Hand-picked tools with exceptional quality and user ratings.',
      learnMore: 'Learn More',
      exploreAllTools: 'Explore All Tools',
      trendingNow: 'Trending Now',
      trendingDesc: 'The most popular AI tools this week.',
      tryNow: 'Try Now',
      stayAhead: 'Stay Ahead of the AI Curve',
      stayAheadDesc: 'Get weekly updates on the latest AI tools, trends, and exclusive insights.',
      emailPlaceholder: 'Enter your email',
      subscribe: 'Subscribe',
      noSpam: 'No spam, unsubscribe anytime.'
    },
    'fr': {
      newUpdate: 'Nouveau :',
      toolsAvailable: 'outils IA disponibles',
      heroTitle: 'Trouvez l\'',
      heroTitleHighlight: 'Outil IA Parfait',
      heroSubtitle: 'Découvrez 16 765+ outils IA vérifiés organisés par votre rôle, cas d\'usage et besoins spécifiques. Gagnez du temps et trouvez exactement ce qu\'il vous faut.',
      aiTools: 'Outils IA',
      audiences: 'Audiences',
      useCases: 'Cas d\'Usage',
      startExploring: 'Commencer l\'Exploration',
      browseCategories: 'Parcourir les Catégories',
      findToolsForYou: 'Trouvez des Outils Faits Pour Vous',
      findToolsForYouDesc: 'Découvrez des outils IA spécialement conçus pour votre rôle et secteur.',
      tools: 'outils',
      explore: 'Explorer',
      viewAllAudiences: 'Voir Toutes les Audiences',
      popularUseCases: 'Cas d\'Usage Populaires',
      popularUseCasesDesc: 'Trouvez des outils selon ce que vous voulez accomplir.',
      discover: 'Découvrir',
      featuredTools: 'Outils IA en Vedette',
      featuredToolsDesc: 'Outils sélectionnés avec une qualité exceptionnelle et d\'excellentes notes.',
      learnMore: 'En Savoir Plus',
      exploreAllTools: 'Explorer Tous les Outils',
      trendingNow: 'Tendance Maintenant',
      trendingDesc: 'Les outils IA les plus populaires cette semaine.',
      tryNow: 'Essayer Maintenant',
      stayAhead: 'Restez en Avance sur l\'IA',
      stayAheadDesc: 'Recevez des mises à jour hebdomadaires sur les derniers outils IA, tendances et insights exclusifs.',
      emailPlaceholder: 'Entrez votre email',
      subscribe: 'S\'abonner',
      noSpam: 'Pas de spam, désabonnement à tout moment.'
    },
    // Add other languages similarly...
    'it': {
      newUpdate: 'Nuovo:',
      toolsAvailable: 'strumenti AI disponibili',
      heroTitle: 'Trova lo ',
      heroTitleHighlight: 'Strumento AI Perfetto',
      heroSubtitle: 'Scopri 16.765+ strumenti AI verificati organizzati per il tuo ruolo, caso d\'uso e esigenze specifiche.',
      aiTools: 'Strumenti AI',
      audiences: 'Pubblico',
      useCases: 'Casi d\'Uso',
      startExploring: 'Inizia ad Esplorare',
      browseCategories: 'Sfoglia Categorie',
      findToolsForYou: 'Trova Strumenti Fatti per Te',
      findToolsForYouDesc: 'Scopri strumenti AI progettati specificamente per il tuo ruolo e settore.',
      tools: 'strumenti',
      explore: 'Esplora',
      viewAllAudiences: 'Vedi Tutti i Pubblici',
      popularUseCases: 'Casi d\'Uso Popolari',
      popularUseCasesDesc: 'Trova strumenti in base a ciò che vuoi realizzare.',
      discover: 'Scopri',
      featuredTools: 'Strumenti AI in Evidenza',
      featuredToolsDesc: 'Strumenti selezionati con qualità eccezionale e valutazioni utenti.',
      learnMore: 'Scopri di Più',
      exploreAllTools: 'Esplora Tutti gli Strumenti',
      trendingNow: 'Trending Ora',
      trendingDesc: 'Gli strumenti AI più popolari questa settimana.',
      tryNow: 'Prova Ora',
      stayAhead: 'Rimani Avanti nella Curva AI',
      stayAheadDesc: 'Ricevi aggiornamenti settimanali sui più recenti strumenti AI, tendenze e insights esclusivi.',
      emailPlaceholder: 'Inserisci la tua email',
      subscribe: 'Iscriviti',
      noSpam: 'Niente spam, cancellati quando vuoi.'
    },
    'es': {
      newUpdate: 'Nuevo:',
      toolsAvailable: 'herramientas IA disponibles',
      heroTitle: 'Encuentra la ',
      heroTitleHighlight: 'Herramienta IA Perfecta',
      heroSubtitle: 'Descubre 16.765+ herramientas IA verificadas organizadas por tu rol, caso de uso y necesidades específicas.',
      aiTools: 'Herramientas IA',
      audiences: 'Audiencias',
      useCases: 'Casos de Uso',
      startExploring: 'Comenzar a Explorar',
      browseCategories: 'Navegar Categorías',
      findToolsForYou: 'Encuentra Herramientas Hechas Para Ti',
      findToolsForYouDesc: 'Descubre herramientas IA diseñadas específicamente para tu rol e industria.',
      tools: 'herramientas',
      explore: 'Explorar',
      viewAllAudiences: 'Ver Todas las Audiencias',
      popularUseCases: 'Casos de Uso Populares',
      popularUseCasesDesc: 'Encuentra herramientas según lo que quieras lograr.',
      discover: 'Descubrir',
      featuredTools: 'Herramientas IA Destacadas',
      featuredToolsDesc: 'Herramientas seleccionadas con calidad excepcional y valoraciones de usuarios.',
      learnMore: 'Saber Más',
      exploreAllTools: 'Explorar Todas las Herramientas',
      trendingNow: 'Tendencia Ahora',
      trendingDesc: 'Las herramientas IA más populares esta semana.',
      tryNow: 'Probar Ahora',
      stayAhead: 'Mantente Adelante en la Curva IA',
      stayAheadDesc: 'Recibe actualizaciones semanales sobre las últimas herramientas IA, tendencias e insights exclusivos.',
      emailPlaceholder: 'Ingresa tu email',
      subscribe: 'Suscribirse',
      noSpam: 'Sin spam, cancela cuando quieras.'
    },
    'de': {
      newUpdate: 'Neu:',
      toolsAvailable: 'KI-Tools verfügbar',
      heroTitle: 'Finden Sie das ',
      heroTitleHighlight: 'Perfekte KI-Tool',
      heroSubtitle: 'Entdecken Sie 16.765+ verifizierte KI-Tools organisiert nach Ihrer Rolle, Anwendungsfall und spezifischen Bedürfnissen.',
      aiTools: 'KI-Tools',
      audiences: 'Zielgruppen',
      useCases: 'Anwendungsfälle',
      startExploring: 'Erkunden Beginnen',
      browseCategories: 'Kategorien Durchsuchen',
      findToolsForYou: 'Finden Sie Tools Für Sie',
      findToolsForYouDesc: 'Entdecken Sie KI-Tools speziell für Ihre Rolle und Branche entwickelt.',
      tools: 'tools',
      explore: 'Erkunden',
      viewAllAudiences: 'Alle Zielgruppen Anzeigen',
      popularUseCases: 'Beliebte Anwendungsfälle',
      popularUseCasesDesc: 'Finden Sie Tools basierend auf dem, was Sie erreichen möchten.',
      discover: 'Entdecken',
      featuredTools: 'Featured KI-Tools',
      featuredToolsDesc: 'Handverlesene Tools mit außergewöhnlicher Qualität und Nutzerbewertungen.',
      learnMore: 'Mehr Erfahren',
      exploreAllTools: 'Alle Tools Erkunden',
      trendingNow: 'Trending Jetzt',
      trendingDesc: 'Die beliebtesten KI-Tools diese Woche.',
      tryNow: 'Jetzt Testen',
      stayAhead: 'Bleiben Sie der KI-Kurve Voraus',
      stayAheadDesc: 'Erhalten Sie wöchentliche Updates zu den neuesten KI-Tools, Trends und exklusiven Einblicken.',
      emailPlaceholder: 'E-Mail eingeben',
      subscribe: 'Abonnieren',
      noSpam: 'Kein Spam, jederzeit abmelden.'
    },
    'nl': {
      newUpdate: 'Nieuw:',
      toolsAvailable: 'AI-tools beschikbaar',
      heroTitle: 'Vind de ',
      heroTitleHighlight: 'Perfecte AI Tool',
      heroSubtitle: 'Ontdek 16.765+ geverifieerde AI-tools georganiseerd op jouw rol, use case en specifieke behoeften.',
      aiTools: 'AI Tools',
      audiences: 'Doelgroepen',
      useCases: 'Gebruikscases',
      startExploring: 'Begin Verkennen',
      browseCategories: 'Categorieën Bladeren',
      findToolsForYou: 'Vind Tools Gemaakt Voor Jou',
      findToolsForYouDesc: 'Ontdek AI-tools speciaal ontworpen voor jouw rol en industrie.',
      tools: 'tools',
      explore: 'Verkennen',
      viewAllAudiences: 'Bekijk Alle Doelgroepen',
      popularUseCases: 'Populaire Gebruikscases',
      popularUseCasesDesc: 'Vind tools gebaseerd op wat je wilt bereiken.',
      discover: 'Ontdekken',
      featuredTools: 'Uitgelichte AI Tools',
      featuredToolsDesc: 'Handgeplukte tools met uitzonderlijke kwaliteit en gebruikersbeoordelingen.',
      learnMore: 'Meer Leren',
      exploreAllTools: 'Alle Tools Verkennen',
      trendingNow: 'Trending Nu',
      trendingDesc: 'De populairste AI-tools deze week.',
      tryNow: 'Nu Proberen',
      stayAhead: 'Blijf Voorop in de AI-Curve',
      stayAheadDesc: 'Ontvang wekelijkse updates over de nieuwste AI-tools, trends en exclusieve inzichten.',
      emailPlaceholder: 'Voer je e-mail in',
      subscribe: 'Abonneren',
      noSpam: 'Geen spam, altijd uitschrijven.'
    },
    'pt': {
      newUpdate: 'Novo:',
      toolsAvailable: 'ferramentas IA disponíveis',
      heroTitle: 'Encontre a ',
      heroTitleHighlight: 'Ferramenta IA Perfeita',
      heroSubtitle: 'Descubra 16.765+ ferramentas IA verificadas organizadas por sua função, caso de uso e necessidades específicas.',
      aiTools: 'Ferramentas IA',
      audiences: 'Audiências',
      useCases: 'Casos de Uso',
      startExploring: 'Começar a Explorar',
      browseCategories: 'Navegar Categorias',
      findToolsForYou: 'Encontre Ferramentas Feitas Para Você',
      findToolsForYouDesc: 'Descubra ferramentas IA projetadas especificamente para sua função e indústria.',
      tools: 'ferramentas',
      explore: 'Explorar',
      viewAllAudiences: 'Ver Todas as Audiências',
      popularUseCases: 'Casos de Uso Populares',
      popularUseCasesDesc: 'Encontre ferramentas baseadas no que você quer alcançar.',
      discover: 'Descobrir',
      featuredTools: 'Ferramentas IA em Destaque',
      featuredToolsDesc: 'Ferramentas selecionadas com qualidade excepcional e avaliações de usuários.',
      learnMore: 'Saber Mais',
      exploreAllTools: 'Explorar Todas as Ferramentas',
      trendingNow: 'Trending Agora',
      trendingDesc: 'As ferramentas IA mais populares desta semana.',
      tryNow: 'Experimentar Agora',
      stayAhead: 'Fique à Frente da Curva IA',
      stayAheadDesc: 'Receba atualizações semanais sobre as mais recentes ferramentas IA, tendências e insights exclusivos.',
      emailPlaceholder: 'Digite seu email',
      subscribe: 'Assinar',
      noSpam: 'Sem spam, cancele a qualquer momento.'
    }
  }
  
  return translations[lang]?.[key] || translations['en'][key] || key
}

/**
 * Helper functions pour emojis
 */
function getAudienceEmoji(audience: string): string {
  const emojiMap: Record<string, string> = {
    'developers': '👨‍💻',
    'creators': '🎨',
    'marketers': '📈',
    'writers': '✍️',
    'designers': '🎨',
    'students': '🎓',
    'entrepreneurs': '🚀',
    'researchers': '🔬',
    'analysts': '📊',
    'content creators': '📹',
    'social media managers': '📱',
    'small business owners': '🏪'
  }
  
  const key = audience.toLowerCase()
  return emojiMap[key] || '⚡'
}

function getUseCaseEmoji(useCase: string): string {
  const emojiMap: Record<string, string> = {
    'content creation': '📝',
    'video editing': '🎬',
    'image generation': '🖼️',
    'writing assistance': '✍️',
    'code generation': '💻',
    'data analysis': '📊',
    'automation': '🤖',
    'translation': '🌐',
    'voice synthesis': '🎤',
    'research': '🔍',
    'productivity': '⚡',
    'design': '🎨'
  }
  
  const key = useCase.toLowerCase()
  return emojiMap[key] || '🔧'
}
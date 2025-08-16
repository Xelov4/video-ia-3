/**
 * Page Discover - Video-IA.net
 * 
 * Page de découverte avancée exploitant pleinement l'architecture data-driven
 * avec filtres multicritères, résultats en temps réel et UX moderne.
 * 
 * Features:
 * - Interface de filtrage par audience, cas d'usage, catégorie
 * - Résultats temps réel avec 16,765 outils IA
 * - URL state pour partage et bookmarks
 * - Sauvegarde préférences utilisateur
 * - Design moderne responsive
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, supportedLocales } from '@/middleware'

import DiscoverPageClient from './DiscoverPageClient'

import { DataExtractionService } from '@/src/lib/services/dataExtraction'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'

// Interface pour paramètres de page
interface DiscoverPageProps {
  params: Promise<{
    lang: SupportedLocale
  }>
  searchParams: Promise<{
    audience?: string
    useCase?: string
    category?: string
    quality?: string
    sort?: string
    q?: string
    page?: string
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
 * Métadonnées SEO optimisées pour page Discover
 */
export async function generateMetadata({ 
  params,
  searchParams
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ audience?: string, useCase?: string, category?: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const { audience, useCase, category } = await searchParams
  const validatedLang = validateLanguageParam(lang)
  
  // Construire titre dynamique basé sur filtres
  let titleSuffix = ''
  if (audience) titleSuffix += ` for ${audience}`
  if (useCase) titleSuffix += ` - ${useCase}`
  if (category) titleSuffix += ` in ${category}`
  
  const seoContent = {
    'en': {
      title: `Discover AI Tools${titleSuffix} | Video-IA.net`,
      description: `Explore 16,765+ AI tools with advanced filters. Find the perfect tools for your needs by audience, use case, category, and quality rating.`,
      keywords: 'discover AI tools, AI tools finder, advanced search, AI tools by category, AI tools for developers, AI tools for creators'
    },
    'fr': {
      title: `Découvrir des Outils IA${titleSuffix} | Video-IA.net`,
      description: `Explorez 16 765+ outils IA avec des filtres avancés. Trouvez les outils parfaits pour vos besoins par audience, cas d'usage, catégorie et note qualité.`,
      keywords: 'découvrir outils IA, chercheur outils IA, recherche avancée, outils IA par catégorie, outils IA développeurs, outils IA créateurs'
    },
    'it': {
      title: `Scopri Strumenti AI${titleSuffix} | Video-IA.net`,
      description: `Esplora 16.765+ strumenti AI con filtri avanzati. Trova gli strumenti perfetti per le tue esigenze per pubblico, caso d'uso, categoria e valutazione qualità.`,
      keywords: 'scoprire strumenti AI, finder strumenti AI, ricerca avanzata, strumenti AI per categoria'
    },
    'es': {
      title: `Descubrir Herramientas IA${titleSuffix} | Video-IA.net`,
      description: `Explora 16.765+ herramientas IA con filtros avanzados. Encuentra las herramientas perfectas para tus necesidades por audiencia, caso de uso, categoría y calificación de calidad.`,
      keywords: 'descubrir herramientas IA, buscador herramientas IA, búsqueda avanzada, herramientas IA por categoría'
    },
    'de': {
      title: `KI-Tools Entdecken${titleSuffix} | Video-IA.net`,
      description: `Erkunden Sie 16.765+ KI-Tools mit erweiterten Filtern. Finden Sie die perfekten Tools für Ihre Bedürfnisse nach Zielgruppe, Anwendungsfall, Kategorie und Qualitätsbewertung.`,
      keywords: 'KI-Tools entdecken, KI-Tools Finder, erweiterte Suche, KI-Tools nach Kategorie'
    },
    'nl': {
      title: `AI Tools Ontdekken${titleSuffix} | Video-IA.net`,
      description: `Verken 16.765+ AI-tools met geavanceerde filters. Vind de perfecte tools voor jouw behoeften op publiek, use case, categorie en kwaliteitsbeoordeling.`,
      keywords: 'AI-tools ontdekken, AI-tools finder, geavanceerd zoeken, AI-tools per categorie'
    },
    'pt': {
      title: `Descobrir Ferramentas IA${titleSuffix} | Video-IA.net`,
      description: `Explore 16.765+ ferramentas IA com filtros avançados. Encontre as ferramentas perfeitas para suas necessidades por audiência, caso de uso, categoria e classificação de qualidade.`,
      keywords: 'descobrir ferramentas IA, localizador ferramentas IA, busca avançada, ferramentas IA por categoria'
    }
  }
  
  const content = seoContent[validatedLang]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const currentUrl = validatedLang === 'en' ? `${baseUrl}/discover` : `${baseUrl}/${validatedLang}/discover`
  
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
      type: 'website'
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
          locale === 'en' ? `${baseUrl}/discover` : `${baseUrl}/${locale}/discover`
        ])
      )
    }
  }
}

/**
 * Page Component
 */
export default async function DiscoverPage({ params, searchParams }: DiscoverPageProps) {
  const { lang } = await params
  const searchParamsValue = await searchParams
  const validatedLang = validateLanguageParam(lang)
  
  // Charger données initiales pour filtres en parallèle
  const [
    audiencesResult,
    useCasesResult,
    categoriesResult,
    statsResult
  ] = await Promise.allSettled([
    DataExtractionService.extractUniqueAudiences(20),
    DataExtractionService.extractUseCases(25),
    multilingualCategoriesService.getAllCategories(validatedLang, { limit: 30, includeCounts: true }),
    DataExtractionService.getOverallStats()
  ])

  // Extraire données avec fallbacks
  const audiences = audiencesResult.status === 'fulfilled' ? audiencesResult.value : []
  const useCases = useCasesResult.status === 'fulfilled' ? useCasesResult.value : []
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : {
    totalTools: 16765,
    totalCategories: 140,
    totalAudiences: 50,
    totalUseCases: 100
  }

  return (
    <DiscoverPageClient
      lang={validatedLang}
      initialSearchParams={searchParamsValue}
      audiences={audiences}
      useCases={useCases}
      categories={categories.map(cat => ({
        name: cat.name,
        actualToolCount: cat.actualToolCount,
        toolCount: cat.toolCount || 0
      }))}
      stats={stats}
    />
  )
}

/**
 * Génération des paramètres statiques pour build
 */
export function generateStaticParams() {
  return supportedLocales.map((lang) => ({
    lang: lang
  }))
}
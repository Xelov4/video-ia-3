/**
 * Simple Homepage - Video-IA.net
 * 
 * Clean, focused homepage with search/filter and tools grid
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, supportedLocales } from '@/middleware'

import SimpleHomepageClient from './SimpleHomepageClient'

import { DataExtractionService } from '@/src/lib/services/dataExtraction'
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
 * Métadonnées SEO optimisées
 */
export async function generateMetadata({ 
  params 
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const validatedLang = validateLanguageParam(lang)
  
  const seoContent = {
    'en': {
      title: 'Video-IA.net - AI Tools Directory | Find the Perfect AI Tool',
      description: 'Discover 16,765+ verified AI tools for video creation, content generation, automation and more. Search and filter by category, audience, and use case.',
      keywords: 'AI tools directory, artificial intelligence, video AI tools, content creation, automation'
    },
    'fr': {
      title: 'Video-IA.net - Répertoire d\'Outils IA | Trouvez l\'Outil IA Parfait',
      description: 'Découvrez 16 765+ outils IA vérifiés pour création vidéo, génération de contenu, automatisation et plus. Recherchez et filtrez par catégorie, audience et cas d\'usage.',
      keywords: 'répertoire outils IA, intelligence artificielle, outils IA vidéo, création contenu, automatisation'
    },
    'it': {
      title: 'Video-IA.net - Directory Strumenti AI | Trova lo Strumento AI Perfetto',
      description: 'Scopri 16.765+ strumenti AI verificati per creazione video, generazione contenuti, automazione e altro. Cerca e filtra per categoria, pubblico e caso d\'uso.',
      keywords: 'directory strumenti AI, intelligenza artificiale, strumenti AI video, creazione contenuti'
    },
    'es': {
      title: 'Video-IA.net - Directorio Herramientas IA | Encuentra la Herramienta IA Perfecta',
      description: 'Descubre 16.765+ herramientas IA verificadas para creación de video, generación de contenido, automatización y más. Busca y filtra por categoría, audiencia y caso de uso.',
      keywords: 'directorio herramientas IA, inteligencia artificial, herramientas IA video'
    },
    'de': {
      title: 'Video-IA.net - KI-Tools Verzeichnis | Finden Sie das Perfekte KI-Tool',
      description: 'Entdecken Sie 16.765+ verifizierte KI-Tools für Videoerstellung, Content-Generierung, Automatisierung und mehr. Suchen und filtern Sie nach Kategorie, Zielgruppe und Anwendungsfall.',
      keywords: 'KI-Tools Verzeichnis, künstliche Intelligenz, Video-KI-Tools'
    },
    'nl': {
      title: 'Video-IA.net - AI Tools Directory | Vind de Perfecte AI Tool',
      description: 'Ontdek 16.765+ geverifieerde AI-tools voor video creatie, content generatie, automatisering en meer. Zoek en filter op categorie, publiek en use case.',
      keywords: 'AI-tools directory, kunstmatige intelligentie, video AI-tools'
    },
    'pt': {
      title: 'Video-IA.net - Diretório Ferramentas IA | Encontre a Ferramenta IA Perfeita',
      description: 'Descubra 16.765+ ferramentas IA verificadas para criação de vídeo, geração de conteúdo, automação e mais. Pesquise e filtre por categoria, audiência e caso de uso.',
      keywords: 'diretório ferramentas IA, inteligência artificial, ferramentas IA vídeo'
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
 * Simple Homepage Component
 */
export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const validatedLang = validateLanguageParam(lang)
  
  // Charger les données nécessaires pour les filtres
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

  // Extraction des données avec fallbacks
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
    <SimpleHomepageClient
      lang={validatedLang}
      audiences={audiences}
      useCases={useCases}
      categories={categories}
      stats={stats}
    />
  )
}
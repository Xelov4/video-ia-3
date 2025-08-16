import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLanguage } from '@/src/lib/i18n/types'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { serializePrismaObject } from '@/src/lib/utils/prismaHelpers'
import ToolDetailClient from './ToolDetailClient'

interface ToolPageProps {
  params: Promise<{ lang: SupportedLanguage; slug: string }>
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  
  const tool = await multilingualToolsService.getToolBySlug(slug, lang)
  if (!tool) {
    return { title: 'Tool Not Found' }
  }

  const titles = {
    en: `${tool.displayName} - AI Tool Review & Information`,
    fr: `${tool.displayName} - Avis et Informations sur l'Outil IA`,
    es: `${tool.displayName} - Reseña e Información de Herramienta IA`,
    de: `${tool.displayName} - KI-Tool Bewertung & Informationen`,
    it: `${tool.displayName} - Recensione e Informazioni Strumento IA`,
    nl: `${tool.displayName} - AI-tool Beoordeling & Informatie`,
    pt: `${tool.displayName} - Avaliação e Informações da Ferramenta IA`
  }

  const descriptions = {
    en: `${tool.displayDescription}. Discover features, pricing, and user reviews for this AI tool.`,
    fr: `${tool.displayDescription}. Découvrez les fonctionnalités, tarifs et avis utilisateurs pour cet outil IA.`,
    es: `${tool.displayDescription}. Descubre características, precios y reseñas de usuarios para esta herramienta de IA.`,
    de: `${tool.displayDescription}. Entdecken Sie Funktionen, Preise und Benutzerbewertungen für dieses KI-Tool.`,
    it: `${tool.displayDescription}. Scopri caratteristiche, prezzi e recensioni degli utenti per questo strumento IA.`,
    nl: `${tool.displayDescription}. Ontdek functies, prijzen en gebruikersbeoordelingen voor dit AI-tool.`,
    pt: `${tool.displayDescription}. Descubra recursos, preços e avaliações de usuários para esta ferramenta de IA.`
  }

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `https://video-ia.net/${lang}/t/${slug}`,
      languages: {
        en: `https://video-ia.net/en/t/${slug}`,
        fr: `https://video-ia.net/fr/t/${slug}`,
        es: `https://video-ia.net/es/t/${slug}`,
        de: `https://video-ia.net/de/t/${slug}`,
        it: `https://video-ia.net/it/t/${slug}`,
        nl: `https://video-ia.net/nl/t/${slug}`,
        pt: `https://video-ia.net/pt/t/${slug}`
      }
    }
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { lang, slug } = await params
  
  const tool = await multilingualToolsService.getToolBySlug(slug, lang)
  if (!tool) {
    notFound()
  }

  const serializedTool = serializePrismaObject(tool)

  // Fetch related tools (same category)
  let relatedTools: any[] = []
  try {
    if (tool.tool_category) {
      const relatedResult = await multilingualToolsService.searchTools({
        language: lang,
        category: tool.tool_category,
        limit: 6
      })
      relatedTools = relatedResult.tools.filter(t => t.id !== tool.id).slice(0, 5)
    }
  } catch (error) {
    console.error('Error fetching related tools:', error)
  }

  // Fetch similar tools (featured or high quality)
  let similarTools: any[] = []
  try {
    const similarResult = await multilingualToolsService.searchTools({
      language: lang,
      filters: {
        minQualityScore: 70,
        featured: true
      },
      limit: 6
    })
    similarTools = similarResult.tools.filter(t => t.id !== tool.id).slice(0, 5)
  } catch (error) {
    console.error('Error fetching similar tools:', error)
  }

  return (
    <ToolDetailClient
      tool={serializedTool}
      lang={lang}
      relatedTools={relatedTools}
      similarTools={similarTools}
    />
  )
}

/**
 * Page de Listing des Catégories - Multilingue
 * 
 * Affichage de toutes les catégories d'outils avec compteurs,
 * descriptions et navigation optimisée.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, supportedLocales } from '@/middleware'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'
import CategoriesPageClient from './CategoriesPageClient'

// Interface pour paramètres
interface CategoriesPageProps {
  params: Promise<{
    lang: SupportedLocale
  }>
  searchParams: Promise<{
    sort?: 'name' | 'count'
    order?: 'asc' | 'desc'
    view?: 'grid' | 'list'
  }>
}

/**
 * Validation paramètres
 */
async function validateAndParseParams(params: any, searchParams: any) {
  const { lang } = await params
  if (!supportedLocales.includes(lang as SupportedLocale)) {
    notFound()
  }

  const { sort, order, view } = await searchParams
  const sortBy = (['name', 'count'].includes(sort)) 
    ? sort as 'name' | 'count'
    : 'count'
  const sortOrder = (['asc', 'desc'].includes(order)) 
    ? order as 'asc' | 'desc' 
    : 'desc'
  const viewMode = (['grid', 'list'].includes(view)) 
    ? view as 'grid' | 'list' 
    : 'grid'

  return {
    lang: lang as SupportedLocale,
    sortBy,
    sortOrder,
    viewMode
  }
}

/**
 * Métadonnées SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const validatedLang = lang as SupportedLocale
  
  if (!supportedLocales.includes(validatedLang)) {
    notFound()
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const langPrefix = validatedLang === 'en' ? '' : `/${validatedLang}`
  const currentUrl = `${baseUrl}${langPrefix}/categories`
  
  const metadata = {
    'en': {
      title: 'AI Tools Categories - Browse by Type | Video-IA.net',
      description: 'Explore 140+ AI tools categories including video creation, automation, machine learning, and more. Find the perfect AI tool for your needs.'
    },
    'fr': {
      title: 'Catégories d\'Outils IA - Parcourir par Type | Video-IA.net',
      description: 'Explorez 140+ catégories d\'outils IA incluant création vidéo, automatisation, machine learning et plus. Trouvez l\'outil IA parfait pour vos besoins.'
    },
    'de': {
      title: 'KI-Tools Kategorien - Nach Typ durchstöbern | Video-IA.net',
      description: 'Erkunden Sie 140+ KI-Tools-Kategorien einschließlich Videoerstellung, Automatisierung, maschinelles Lernen und mehr. Finden Sie das perfekte KI-Tool für Ihre Bedürfnisse.'
    },
    'nl': {
      title: 'AI Tools Categorieën - Bladeren per Type | Video-IA.net',
      description: 'Verken 140+ AI-tools categorieën inclusief videocreatie, automatisering, machine learning en meer. Vind de perfecte AI-tool voor uw behoeften.'
    },
    'it': {
      title: 'Categorie Strumenti IA - Sfoglia per Tipo | Video-IA.net',
      description: 'Esplora 140+ categorie di strumenti IA incluse creazione video, automazione, machine learning e altro. Trova lo strumento IA perfetto per le tue esigenze.'
    },
    'es': {
      title: 'Categorías de Herramientas IA - Navegar por Tipo | Video-IA.net',
      description: 'Explora 140+ categorías de herramientas IA incluyendo creación de video, automatización, machine learning y más. Encuentra la herramienta IA perfecta para tus necesidades.'
    },
    'pt': {
      title: 'Categorias de Ferramentas IA - Navegar por Tipo | Video-IA.net',
      description: 'Explore 140+ categorias de ferramentas IA incluindo criação de vídeo, automação, machine learning e mais. Encontre a ferramenta IA perfeita para suas necessidades.'
    }
  }
  
  const content = metadata[validatedLang] || metadata['en']
  
  return {
    title: content.title,
    description: content.description,
    
    openGraph: {
      title: content.title,
      description: content.description,
      url: currentUrl,
      type: 'website'
    },
    
    alternates: {
      canonical: currentUrl,
      languages: Object.fromEntries(
        supportedLocales.map(locale => [
          locale,
          `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/categories`
        ])
      )
    }
  }
}

/**
 * Page Component
 */
export default async function CategoriesPage({ params, searchParams }: CategoriesPageProps) {
  const { lang, sortBy, sortOrder, viewMode } = await validateAndParseParams(params, searchParams)
  
  try {
    // Récupération des catégories
    const categoriesData = await multilingualCategoriesService.getAllCategories(lang, {
      includeEmpty: false,
      useCache: true,
      includeCounts: true
    })
    
    // Gestion compatible avec les deux formats de retour possibles
    const categories = Array.isArray(categoriesData) ? categoriesData : 
                    (categoriesData && 'categories' in categoriesData) ? categoriesData.categories : []
    
    // Tri des catégories selon les paramètres
    const sortedCategories = [...categories].sort((a, b) => {
      if (sortBy === 'name') {
        const comparison = a.displayName.localeCompare(b.displayName)
        return sortOrder === 'asc' ? comparison : -comparison
      } else {
        const aCount = a.actualToolCount || 0
        const bCount = b.actualToolCount || 0
        const comparison = aCount - bCount
        return sortOrder === 'asc' ? comparison : -comparison
      }
    })
    
    return (
      <CategoriesPageClient
        categories={categories}
        lang={lang}
        initialSort={sortBy}
        initialOrder={sortOrder}
        initialView={viewMode}
      />
    )
    
  } catch (error) {
    console.error('Categories page error:', error)
    
    // Fallback gracieux
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Categories</h1>
          <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
        </div>
      </div>
    )
  }
}
/**
 * Category Detail Page - Multilingual
 * 
 * Display tools within a specific category with filtering and sorting options.
 * Features breadcrumbs, category info, and tools listing with i18n support.
 * 
 * Features:
 * - Category-specific tools listing
 * - Breadcrumb navigation with language support
 * - Category information and stats
 * - Search and filtering within category
 * - SEO optimization with dynamic metadata
 * - Multilingual support
 * 
 * @author Video-IA.net Development Team
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { CategoriesService } from '@/src/lib/database/services/categories'
import { ToolsGrid } from '@/src/components/tools/ToolsGrid'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { supportedLocales, defaultLocale, type SupportedLocale } from '@/middleware'

interface CategoryPageProps {
  params: { 
    lang: string
    slug: string 
  }
  searchParams: {
    search?: string
    featured?: string
    sort?: string
    order?: string
    page?: string
  }
}

async function validateAndParseParams(params: any, searchParams: any) {
  const { lang, slug } = await params
  
  if (!supportedLocales.includes(lang)) {
    notFound()
  }
  
  const { search, featured, sort, order, page } = await searchParams
  return {
    lang,
    slug: slug as string,
    search: search || '',
    featured: featured || '',
    sort: sort || 'created_at',
    order: order || 'desc',
    page: page || '1'
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lang, slug } = await validateAndParseParams(params, {})
  
  const category = await CategoriesService.getCategoryBySlug(slug).catch(() => null)
  
  if (!category) {
    const messages = {
      'en': {
        title: 'Category not found | Video-IA.net',
        description: 'This AI tools category does not exist or has been removed.'
      },
      'fr': {
        title: 'Catégorie non trouvée | Video-IA.net',
        description: 'Cette catégorie d\'outils IA n\'existe pas ou a été supprimée.'
      },
      'de': {
        title: 'Kategorie nicht gefunden | Video-IA.net',
        description: 'Diese KI-Tools-Kategorie existiert nicht oder wurde entfernt.'
      },
      'nl': {
        title: 'Categorie niet gevonden | Video-IA.net',
        description: 'Deze AI-tools categorie bestaat niet of is verwijderd.'
      },
      'it': {
        title: 'Categoria non trovata | Video-IA.net',
        description: 'Questa categoria di strumenti IA non esiste o è stata rimossa.'
      },
      'es': {
        title: 'Categoría no encontrada | Video-IA.net',
        description: 'Esta categoría de herramientas de IA no existe o ha sido eliminada.'
      },
      'pt': {
        title: 'Categoria não encontrada | Video-IA.net',
        description: 'Esta categoria de ferramentas de IA não existe ou foi removida.'
      }
    }
    
    const content = messages[lang] || messages['en']
    
    return {
      title: content.title,
      description: content.description
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const langPrefix = lang === 'en' ? '' : `/${lang}`
  const currentUrl = `${baseUrl}${langPrefix}/categories/${slug}`

  const messages = {
    'en': {
      title: `${category.name} - ${category.toolCount} AI Tools | Video-IA.net`,
      description: category.description || `Discover the best artificial intelligence tools in the ${category.name} category. ${category.toolCount} tools selected and tested by our experts.`,
      keywords: `${category.name}, AI tools ${category.name.toLowerCase()}, artificial intelligence ${category.name.toLowerCase()}`
    },
    'fr': {
      title: `${category.name} - ${category.toolCount} outils IA | Video-IA.net`,
      description: category.description || `Découvrez les meilleurs outils d'intelligence artificielle dans la catégorie ${category.name}. ${category.toolCount} outils sélectionnés et testés par nos experts.`,
      keywords: `${category.name}, outils IA ${category.name.toLowerCase()}, intelligence artificielle ${category.name.toLowerCase()}`
    },
    'de': {
      title: `${category.name} - ${category.toolCount} KI-Tools | Video-IA.net`,
      description: category.description || `Entdecken Sie die besten KI-Tools in der Kategorie ${category.name}. ${category.toolCount} Tools ausgewählt und getestet von unseren Experten.`,
      keywords: `${category.name}, KI-Tools ${category.name.toLowerCase()}, künstliche Intelligenz ${category.name.toLowerCase()}`
    },
    'nl': {
      title: `${category.name} - ${category.toolCount} AI-tools | Video-IA.net`,
      description: category.description || `Ontdek de beste AI-tools in de categorie ${category.name}. ${category.toolCount} tools geselecteerd en getest door onze experts.`,
      keywords: `${category.name}, AI-tools ${category.name.toLowerCase()}, kunstmatige intelligentie ${category.name.toLowerCase()}`
    },
    'it': {
      title: `${category.name} - ${category.toolCount} Strumenti IA | Video-IA.net`,
      description: category.description || `Scopri i migliori strumenti di intelligenza artificiale nella categoria ${category.name}. ${category.toolCount} strumenti selezionati e testati dai nostri esperti.`,
      keywords: `${category.name}, strumenti IA ${category.name.toLowerCase()}, intelligenza artificiale ${category.name.toLowerCase()}`
    },
    'es': {
      title: `${category.name} - ${category.toolCount} Herramientas IA | Video-IA.net`,
      description: category.description || `Descubre las mejores herramientas de inteligencia artificial en la categoría ${category.name}. ${category.toolCount} herramientas seleccionadas y probadas por nuestros expertos.`,
      keywords: `${category.name}, herramientas IA ${category.name.toLowerCase()}, inteligencia artificial ${category.name.toLowerCase()}`
    },
    'pt': {
      title: `${category.name} - ${category.toolCount} Ferramentas IA | Video-IA.net`,
      description: category.description || `Descubra as melhores ferramentas de inteligência artificial na categoria ${category.name}. ${category.toolCount} ferramentas selecionadas e testadas pelos nossos especialistas.`,
      keywords: `${category.name}, ferramentas IA ${category.name.toLowerCase()}, inteligência artificial ${category.name.toLowerCase()}`
    }
  }

  const content = messages[lang] || messages['en']

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    openGraph: {
      title: `${category.name} - AI Tools | Video-IA.net`,
      description: category.description || `${category.toolCount} AI tools in the ${category.name} category`,
      type: 'website',
      url: currentUrl
    },
    alternates: {
      canonical: currentUrl,
      languages: Object.fromEntries(
        supportedLocales.map(locale => [
          locale,
          `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/categories/${slug}`
        ])
      )
    }
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { lang, slug, search, featured, sort, order, page } = await validateAndParseParams(params, searchParams)

  // Load category information
  const category = await CategoriesService.getCategoryBySlug(slug).catch(() => null)
  
  if (!category) {
    notFound()
  }

  // Parse parameters
  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const limit = 20

  // Build search parameters for new service
  const searchParams_api = {
    query: search || undefined,
    category: category.name,
    featured: featured === 'true' ? true : undefined,
    page: currentPage,
    limit,
    sortBy: sort,
    sortOrder: order as 'asc' | 'desc'
  }

  // Load tools and related categories
  const [toolsResult, allCategories, relatedCategories] = await Promise.all([
    multilingualToolsService.searchTools({
      language: lang as any,
      category: params.slug,
      query: searchParams_api.query,
      featured: searchParams_api.featured,
      page: searchParams_api.page,
      limit: searchParams_api.limit,
      sortBy: searchParams_api.sortBy as any,
      sortOrder: searchParams_api.sortOrder as any
    }).catch((error: any) => {
      console.error('Failed to load tools:', error)
      return { 
        tools: [], 
        pagination: { 
          totalCount: 0, 
          totalPages: 0, 
          page: 1, 
          hasNextPage: false, 
          hasPreviousPage: false, 
          limit: 10 
        } 
      }
    }),
    CategoriesService.getAllCategories().catch(() => []),
    CategoriesService.getRelatedCategories(category.name, 4).catch(() => [])
  ])

  const messages = {
    'en': {
      home: 'Home',
      categories: 'Categories',
      tools: 'tools',
      similarCategories: 'similar categories',
      toolsInCategory: 'Tools in this category',
      toolsFound: 'tools found'
    },
    'fr': {
      home: 'Accueil',
      categories: 'Catégories',
      tools: 'outils',
      similarCategories: 'catégories similaires',
      toolsInCategory: 'Outils dans cette catégorie',
      toolsFound: 'outils trouvés'
    },
    'de': {
      home: 'Startseite',
      categories: 'Kategorien',
      tools: 'Tools',
      similarCategories: 'ähnliche Kategorien',
      toolsInCategory: 'Tools in dieser Kategorie',
      toolsFound: 'Tools gefunden'
    },
    'nl': {
      home: 'Home',
      categories: 'Categorieën',
      tools: 'tools',
      similarCategories: 'vergelijkbare categorieën',
      toolsInCategory: 'Tools in deze categorie',
      toolsFound: 'tools gevonden'
    },
    'it': {
      home: 'Home',
      categories: 'Categorie',
      tools: 'strumenti',
      similarCategories: 'categorie simili',
      toolsInCategory: 'Strumenti in questa categoria',
      toolsFound: 'strumenti trovati'
    },
    'es': {
      home: 'Inicio',
      categories: 'Categorías',
      tools: 'herramientas',
      similarCategories: 'categorías similares',
      toolsInCategory: 'Herramientas en esta categoría',
      toolsFound: 'herramientas encontradas'
    },
    'pt': {
      home: 'Início',
      categories: 'Categorias',
      tools: 'ferramentas',
      similarCategories: 'categorias similares',
      toolsInCategory: 'Ferramentas nesta categoria',
      toolsFound: 'ferramentas encontradas'
    }
  }

  const t = messages[lang] || messages['en']

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass-effect border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
            <Link href={`/${lang}`} className="hover:text-white transition-colors">
              {t.home}
            </Link>
            <span>/</span>
            <Link href={`/${lang}/categories`} className="hover:text-white transition-colors">
              {t.categories}
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{category.name}</span>
          </nav>

          {/* Category Info */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                {category.description}
              </p>
            )}
            <div className="flex justify-center items-center space-x-8 text-lg text-gray-400">
              <div>
                <span className="font-bold gradient-text">{category.toolCount}</span> {t.tools}
              </div>
              <div>
                <span className="font-bold gradient-text">{relatedCategories.length}</span> {t.similarCategories}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Listing */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t.toolsInCategory}
            </h2>
            <p className="text-gray-300">
              {toolsResult.pagination?.totalCount || 0} {t.toolsFound}
            </p>
          </div>
          
          <ToolsGrid
            tools={toolsResult.tools}
            totalCount={toolsResult.pagination?.totalCount || 0}
            currentPage={toolsResult.pagination?.page || 1}
            totalPages={toolsResult.pagination?.totalPages || 0}
            hasNextPage={toolsResult.pagination?.hasNextPage || false}
            hasPreviousPage={toolsResult.pagination?.hasPreviousPage || false}
            showCategory={false}
            lang={lang}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Loading component for tools listing
 */
function ToolsListingLoading() {
  return (
    <div className="space-y-6">
      {/* Toolbar skeleton */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Tools grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
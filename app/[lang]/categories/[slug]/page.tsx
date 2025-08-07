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
import { toolsService } from '@/src/lib/database/services/tools'
import { CategoriesService } from '@/src/lib/database/services/categories'
import { ToolsGrid } from '@/src/components/tools/ToolsGrid'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/middleware'

type SupportedLocale = typeof SUPPORTED_LOCALES[number]

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

function validateAndParseParams(params: any, searchParams: any) {
  const lang = params.lang as SupportedLocale
  
  if (!SUPPORTED_LOCALES.includes(lang)) {
    notFound()
  }
  
  return {
    lang,
    slug: params.slug as string,
    search: searchParams.search || '',
    featured: searchParams.featured || '',
    sort: searchParams.sort || 'created_at',
    order: searchParams.order || 'desc',
    page: searchParams.page || '1'
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lang, slug } = validateAndParseParams(params, {})
  
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
        SUPPORTED_LOCALES.map(locale => [
          locale,
          `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/categories/${slug}`
        ])
      )
    }
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { lang, slug, search, featured, sort, order, page } = validateAndParseParams(params, searchParams)

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
    toolsService.searchTools(searchParams_api).catch((error: any) => {
      console.error('Failed to load tools:', error)
      return { tools: [], totalCount: 0, hasMore: false, totalPages: 0, currentPage: 1, hasNextPage: false, hasPreviousPage: false }
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
              {toolsResult.totalCount} {t.toolsFound}
            </p>
          </div>
          
          <ToolsGrid
            tools={toolsResult.tools}
            totalCount={toolsResult.totalCount}
            currentPage={toolsResult.currentPage}
            totalPages={toolsResult.totalPages}
            hasNextPage={toolsResult.hasNextPage}
            hasPreviousPage={toolsResult.hasPreviousPage}
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
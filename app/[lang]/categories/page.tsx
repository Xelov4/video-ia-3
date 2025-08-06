/**
 * Page de Listing des Catégories - Multilingue
 * 
 * Affichage de toutes les catégories d'outils avec compteurs,
 * descriptions et navigation optimisée.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/middleware'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'

// Interface pour paramètres
interface CategoriesPageProps {
  params: {
    lang: SupportedLocale
  }
  searchParams: {
    sort?: 'name' | 'count'
    order?: 'asc' | 'desc'
    view?: 'grid' | 'list'
  }
}

/**
 * Validation paramètres
 */
function validateAndParseParams(params: any, searchParams: any) {
  const lang = params.lang
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound()
  }

  const sortBy = (['name', 'count'].includes(searchParams.sort)) 
    ? searchParams.sort as 'name' | 'count'
    : 'count'
  const sortOrder = (['asc', 'desc'].includes(searchParams.order)) 
    ? searchParams.order as 'asc' | 'desc' 
    : 'desc'
  const viewMode = (['grid', 'list'].includes(searchParams.view)) 
    ? searchParams.view as 'grid' | 'list' 
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
export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang = params.lang as SupportedLocale
  
  if (!SUPPORTED_LOCALES.includes(lang)) {
    notFound()
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const langPrefix = lang === 'en' ? '' : `/${lang}`
  const currentUrl = `${baseUrl}${langPrefix}/categories`
  
  const metadata = {
    'en': {
      title: 'AI Tools Categories - Browse by Type | Video-IA.net',
      description: 'Explore 140+ AI tools categories including video creation, automation, machine learning, and more. Find the perfect AI tool for your needs.'
    },
    'fr': {
      title: 'Catégories d\'Outils IA - Parcourir par Type | Video-IA.net',
      description: 'Explorez 140+ catégories d\'outils IA incluant création vidéo, automatisation, machine learning et plus. Trouvez l\'outil IA parfait pour vos besoins.'
    }
    // Ajouter autres langues...
  }
  
  const content = metadata[lang] || metadata['en']
  
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
        SUPPORTED_LOCALES.map(locale => [
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
  const { lang, sortBy, sortOrder, viewMode } = validateAndParseParams(params, searchParams)
  
  try {
    // Récupération des catégories
    const categoriesResult = await multilingualCategoriesService.getAllCategories(lang, {
      includeEmpty: false,
      useCache: true,
      includeCounts: true
    })
    
    const { categories } = categoriesResult
    
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
    
    // Messages localisés
    const messages = getLocalizedMessages(lang)
    const totalTools = categories.reduce((sum, cat) => sum + (cat.actualToolCount || 0), 0)
    
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
              <span className="text-gray-900 dark:text-white font-medium">
                {messages.categories}
              </span>
            </nav>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {messages.allCategories}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {messages.categoriesDescription}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{categories.length} {messages.categories.toLowerCase()}</span>
                  <span>•</span>
                  <span>{totalTools.toLocaleString()} {messages.totalTools}</span>
                </div>
              </div>
              
              {/* Contrôles de vue et tri */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {messages.sortBy}:
                  </span>
                  <select
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSort, newOrder] = e.target.value.split('-')
                      window.location.href = `/${lang}/categories?sort=${newSort}&order=${newOrder}&view=${viewMode}`
                    }}
                  >
                    <option value="count-desc">{messages.mostPopular}</option>
                    <option value="count-asc">{messages.leastPopular}</option>
                    <option value="name-asc">{messages.alphabetical}</option>
                    <option value="name-desc">{messages.reverseAlphabetical}</option>
                  </select>
                </div>
                
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                  <a
                    href={`/${lang}/categories?sort=${sortBy}&order=${sortOrder}&view=grid`}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {messages.gridView}
                  </a>
                  <a
                    href={`/${lang}/categories?sort=${sortBy}&order=${sortOrder}&view=list`}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {messages.listView}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {viewMode === 'grid' ? (
            /* Vue grille */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {sortedCategories.map((category) => (
                <a
                  key={category.id}
                  href={`/${lang}/tools?category=${encodeURIComponent(category.name)}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center hover:scale-105"
                >
                  <div className="text-4xl mb-4">
                    {category.emoji || '🔧'}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 line-clamp-2 min-h-[2.5rem]">
                    {category.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {(category.actualToolCount || 0).toLocaleString()} {messages.tools}
                  </p>
                  {category.displayDescription && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {category.displayDescription}
                    </p>
                  )}
                  {category.translationSource !== 'exact' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 mt-2">
                      {messages.translated}
                    </span>
                  )}
                </a>
              ))}
            </div>
          ) : (
            /* Vue liste */
            <div className="space-y-4">
              {sortedCategories.map((category) => (
                <a
                  key={category.id}
                  href={`/${lang}/tools?category=${encodeURIComponent(category.name)}`}
                  className="group block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">
                      {category.emoji || '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                            {category.displayName}
                          </h3>
                          {category.displayDescription && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                              {category.displayDescription}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {(category.actualToolCount || 0).toLocaleString()} {messages.tools}
                            </span>
                            {category.translationSource !== 'exact' && (
                              <>
                                <span>•</span>
                                <span className="text-yellow-600 dark:text-yellow-400">
                                  {messages.translated}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {(category.actualToolCount || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {messages.tools}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          
          {/* Section CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              {messages.ctaTitle}
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {messages.ctaDescription}
            </p>
            <a
              href={`/${lang}/tools`}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              {messages.browseAllTools}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </main>
      </div>
    )
    
  } catch (error) {
    console.error('Categories page error:', error)
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {getLocalizedMessages(lang).errorLoading}
          </h1>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {getLocalizedMessages(lang).reload}
          </button>
        </div>
      </div>
    )
  }
}

/**
 * Messages localisés
 */
function getLocalizedMessages(lang: SupportedLocale) {
  const messages = {
    'en': {
      home: 'Home',
      categories: 'Categories',
      allCategories: 'All AI Tool Categories',
      categoriesDescription: 'Discover AI tools organized by category. From video creation to automation, find exactly what you need.',
      totalTools: 'tools total',
      sortBy: 'Sort by',
      mostPopular: 'Most Popular',
      leastPopular: 'Least Popular', 
      alphabetical: 'A-Z',
      reverseAlphabetical: 'Z-A',
      gridView: 'Grid',
      listView: 'List',
      tools: 'tools',
      translated: 'Translated',
      ctaTitle: 'Ready to Explore AI Tools?',
      ctaDescription: 'Browse our complete collection of 16,000+ AI tools across all categories. Find the perfect solution for your next project.',
      browseAllTools: 'Browse All Tools',
      errorLoading: 'Error Loading Categories',
      reload: 'Reload Page'
    },
    'fr': {
      home: 'Accueil',
      categories: 'Catégories',
      allCategories: 'Toutes les Catégories d\'Outils IA',
      categoriesDescription: 'Découvrez les outils IA organisés par catégorie. De la création vidéo à l\'automatisation, trouvez exactement ce dont vous avez besoin.',
      totalTools: 'outils au total',
      sortBy: 'Trier par',
      mostPopular: 'Plus Populaires',
      leastPopular: 'Moins Populaires',
      alphabetical: 'A-Z',
      reverseAlphabetical: 'Z-A',
      gridView: 'Grille',
      listView: 'Liste',
      tools: 'outils',
      translated: 'Traduit',
      ctaTitle: 'Prêt à Explorer les Outils IA ?',
      ctaDescription: 'Parcourez notre collection complète de 16 000+ outils IA dans toutes les catégories. Trouvez la solution parfaite pour votre prochain projet.',
      browseAllTools: 'Parcourir Tous les Outils',
      errorLoading: 'Erreur de Chargement',
      reload: 'Recharger la Page'
    }
    // Ajouter autres langues...
  }
  
  return messages[lang] || messages['en']
}
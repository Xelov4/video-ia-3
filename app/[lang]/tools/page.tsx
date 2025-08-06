/**
 * Page de Listing des Outils - Multilingue
 * 
 * Affichage paginé des outils avec filtres, recherche et tri,
 * optimisée pour SEO et performance avec cache avancé.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/middleware'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'

import ToolsGrid from '@/src/components/tools/ToolsGrid'
import ToolsListing from '@/src/components/tools/ToolsListing'
import SearchAndFilters from '@/src/components/admin/SearchAndFilters'
import LoadingSpinner from '@/src/components/ui/LoadingSpinner'

// Interface pour les paramètres de page et query
interface ToolsPageProps {
  params: {
    lang: SupportedLocale
  }
  searchParams: {
    page?: string
    search?: string
    category?: string
    sort?: 'name' | 'created_at' | 'view_count' | 'quality_score'
    order?: 'asc' | 'desc'
    view?: 'grid' | 'list'
  }
}

/**
 * Validation des paramètres avec valeurs par défaut
 */
function validateAndParseParams(params: any, searchParams: any) {
  const lang = params.lang
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound()
  }

  const page = Math.max(1, parseInt(searchParams.page || '1'))
  const search = searchParams.search || undefined
  const category = searchParams.category || undefined
  const sortBy = (['name', 'created_at', 'view_count', 'quality_score'].includes(searchParams.sort)) 
    ? searchParams.sort as 'name' | 'created_at' | 'view_count' | 'quality_score'
    : 'created_at'
  const sortOrder = (['asc', 'desc'].includes(searchParams.order)) 
    ? searchParams.order as 'asc' | 'desc' 
    : 'desc'
  const viewMode = (['grid', 'list'].includes(searchParams.view)) 
    ? searchParams.view as 'grid' | 'list' 
    : 'grid'

  return {
    lang: lang as SupportedLocale,
    page,
    search,
    category,
    sortBy,
    sortOrder,
    viewMode
  }
}

/**
 * Génération métadonnées SEO dynamiques
 */
export async function generateMetadata({ 
  params, 
  searchParams 
}: ToolsPageProps): Promise<Metadata> {
  const { lang, search, category, page } = validateAndParseParams(params, searchParams)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const langPrefix = lang === 'en' ? '' : `/${lang}`
  const basePageUrl = `${baseUrl}${langPrefix}/tools`
  
  // Métadonnées par langue et contexte
  const metadata = {
    'en': {
      title: search 
        ? `Search Results for "${search}" - AI Tools Directory`
        : category 
        ? `${category} AI Tools - Video-IA.net`
        : page > 1 
        ? `AI Tools Directory - Page ${page} | Video-IA.net`
        : 'AI Tools Directory - 16,000+ Best AI Tools | Video-IA.net',
      description: search
        ? `Find the best AI tools matching "${search}". Browse verified tools with reviews, ratings and comparisons.`
        : category
        ? `Discover the best ${category} AI tools. Professional reviews, ratings and detailed comparisons.`
        : 'Browse the world\'s largest directory of AI tools. 16,000+ verified tools for video creation, automation, machine learning and more.',
    },
    'fr': {
      title: search 
        ? `Résultats de recherche pour "${search}" - Répertoire Outils IA`
        : category 
        ? `Outils IA ${category} - Video-IA.net`
        : page > 1 
        ? `Répertoire Outils IA - Page ${page} | Video-IA.net`
        : 'Répertoire Outils IA - 16 000+ Meilleurs Outils IA | Video-IA.net',
      description: search
        ? `Trouvez les meilleurs outils IA correspondant à "${search}". Parcourez des outils vérifiés avec avis, notes et comparaisons.`
        : category
        ? `Découvrez les meilleurs outils IA ${category}. Avis professionnels, notes et comparaisons détaillées.`
        : 'Parcourez le plus grand répertoire d\'outils IA au monde. 16 000+ outils vérifiés pour création vidéo, automatisation, machine learning et plus.',
    }
    // Ajouter autres langues...
  }
  
  const content = metadata[lang] || metadata['en']
  const currentUrl = `${basePageUrl}${buildQueryString(searchParams)}`
  
  return {
    title: content.title,
    description: content.description,
    
    openGraph: {
      title: content.title,
      description: content.description,
      url: currentUrl,
      type: 'website',
    },
    
    alternates: {
      canonical: currentUrl,
    },
    
    // Pagination SEO
    ...(page > 1 && {
      other: {
        'prev': page > 2 
          ? `${basePageUrl}?${new URLSearchParams({...searchParams, page: (page-1).toString()}).toString()}`
          : basePageUrl,
      }
    })
  }
}

/**
 * Construction query string pour URLs
 */
function buildQueryString(searchParams: any): string {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.append(key, value as string)
  })
  return params.toString() ? `?${params.toString()}` : ''
}

/**
 * Page Component principale
 */
export default async function ToolsPage({ params, searchParams }: ToolsPageProps) {
  const { lang, page, search, category, sortBy, sortOrder, viewMode } = validateAndParseParams(params, searchParams)
  
  try {
    // Récupération données en parallèle pour performance optimale
    const [toolsResult, categoriesResult] = await Promise.all([
      multilingualToolsService.searchTools({
        language: lang,
        query: search,
        category,
        page,
        limit: 24, // 24 outils par page pour grille 4x6
        sortBy,
        sortOrder,
        useCache: true
      }),
      
      // Categories pour filtres
      multilingualCategoriesService.getAllCategories(lang, {
        includeEmpty: false,
        useCache: true,
        includeCounts: true
      })
    ])
    
    const { tools, pagination, meta } = toolsResult
    const { categories } = categoriesResult
    
    // Messages localisés
    const messages = getLocalizedMessages(lang)
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* En-tête avec fil d'Ariane */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Breadcrumb */}
              <nav className="flex text-sm text-gray-600 dark:text-gray-400">
                <a href={`/${lang}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {messages.home}
                </a>
                <span className="mx-2">/</span>
                {category ? (
                  <>
                    <a href={`/${lang}/tools`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {messages.tools}
                    </a>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 dark:text-white font-medium">{category}</span>
                  </>
                ) : (
                  <span className="text-gray-900 dark:text-white font-medium">{messages.tools}</span>
                )}
              </nav>
              
              {/* Titre et statistiques */}
              <div className="text-right">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {search ? `${messages.searchResults} "${search}"` 
                   : category ? `${category} ${messages.tools}`
                   : messages.allTools}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {pagination.totalCount.toLocaleString()} {messages.toolsFound}
                  {meta.fallbackCount > 0 && (
                    <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                      {meta.fallbackCount} {messages.fallbackUsed}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Contenu principal avec filtres */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar filtres */}
            <aside className="lg:col-span-1 mb-8 lg:mb-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <Suspense fallback={<LoadingSpinner />}>
                  <SearchAndFilters
                    categories={categories}
                    currentCategory={category}
                    currentSearch={search}
                    currentSort={sortBy}
                    currentOrder={sortOrder}
                    currentView={viewMode}
                    language={lang}
                    baseUrl={`/${lang}/tools`}
                  />
                </Suspense>
              </div>
            </aside>
            
            {/* Grille/Liste des outils */}
            <section className="lg:col-span-3">
              {tools.length > 0 ? (
                <div className="space-y-6">
                  {/* Barre d'outils de vue */}
                  <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {messages.showing} {((page - 1) * 24) + 1}-{Math.min(page * 24, pagination.totalCount)} 
                      {messages.of} {pagination.totalCount.toLocaleString()} {messages.results}
                    </span>
                    
                    <div className="flex items-center gap-4">
                      {/* Mode de vue */}
                      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                        <a
                          href={`/${lang}/tools${buildQueryString({...searchParams, view: 'grid'})}`}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            viewMode === 'grid' 
                              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {messages.gridView}
                        </a>
                        <a
                          href={`/${lang}/tools${buildQueryString({...searchParams, view: 'list'})}`}
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
                  
                  {/* Affichage des outils */}
                  {viewMode === 'grid' ? (
                    <ToolsGrid 
                      tools={tools} 
                      language={lang}
                      showLoadMore={false}
                    />
                  ) : (
                    <ToolsListing 
                      tools={tools} 
                      language={lang} 
                    />
                  )}
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <nav className="flex items-center justify-center space-x-2 mt-12">
                      {/* Page précédente */}
                      {pagination.hasPreviousPage && (
                        <a
                          href={`/${lang}/tools${buildQueryString({...searchParams, page: (page-1).toString()})}`}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {messages.previous}
                        </a>
                      )}
                      
                      {/* Numéros de pages */}
                      {generatePageNumbers(page, pagination.totalPages).map((pageNum, idx) => (
                        pageNum === '...' ? (
                          <span key={idx} className="px-3 py-2 text-sm text-gray-500">...</span>
                        ) : (
                          <a
                            key={idx}
                            href={`/${lang}/tools${buildQueryString({...searchParams, page: pageNum.toString()})}`}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                              pageNum === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </a>
                        )
                      ))}
                      
                      {/* Page suivante */}
                      {pagination.hasNextPage && (
                        <a
                          href={`/${lang}/tools${buildQueryString({...searchParams, page: (page+1).toString()})}`}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {messages.next}
                        </a>
                      )}
                    </nav>
                  )}
                </div>
              ) : (
                // État vide avec suggestions
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="text-6xl text-gray-300 dark:text-gray-600 mb-4">🔍</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {messages.noResults}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {search ? messages.noSearchResults : messages.noToolsCategory}
                  </p>
                  <div className="space-y-2">
                    <a
                      href={`/${lang}/tools`}
                      className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {messages.browseAll}
                    </a>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    )
    
  } catch (error) {
    console.error('Tools page error:', error)
    
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
 * Génération des numéros de pages pour pagination
 */
function generatePageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = []
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    
    if (currentPage > 4) pages.push('...')
    
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (currentPage < totalPages - 3) pages.push('...')
    
    pages.push(totalPages)
  }
  
  return pages
}

/**
 * Messages localisés pour la page
 */
function getLocalizedMessages(lang: SupportedLocale) {
  const messages = {
    'en': {
      home: 'Home', tools: 'Tools', allTools: 'All AI Tools',
      searchResults: 'Search Results for', toolsFound: 'tools found',
      fallbackUsed: 'using fallback language', showing: 'Showing',
      of: 'of', results: 'results', gridView: 'Grid', listView: 'List',
      previous: 'Previous', next: 'Next', noResults: 'No Tools Found',
      noSearchResults: 'Try adjusting your search terms or filters',
      noToolsCategory: 'No tools found in this category',
      browseAll: 'Browse All Tools', errorLoading: 'Error Loading Tools',
      reload: 'Reload Page'
    },
    'fr': {
      home: 'Accueil', tools: 'Outils', allTools: 'Tous les Outils IA',
      searchResults: 'Résultats de recherche pour', toolsFound: 'outils trouvés',
      fallbackUsed: 'langue de secours utilisée', showing: 'Affichage',
      of: 'sur', results: 'résultats', gridView: 'Grille', listView: 'Liste',
      previous: 'Précédent', next: 'Suivant', noResults: 'Aucun Outil Trouvé',
      noSearchResults: 'Essayez d\'ajuster vos termes de recherche ou filtres',
      noToolsCategory: 'Aucun outil trouvé dans cette catégorie',
      browseAll: 'Parcourir Tous les Outils', errorLoading: 'Erreur de Chargement',
      reload: 'Recharger la Page'
    }
    // Ajouter autres langues...
  }
  
  return messages[lang] || messages['en']
}
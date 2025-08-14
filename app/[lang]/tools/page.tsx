/**
 * Page de Listing des Outils - Multilingue
 * 
 * Affichage paginé des outils avec filtres, recherche et tri,
 * optimisée pour SEO et performance avec cache avancé.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { SupportedLocale, supportedLocales } from '@/middleware'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'

import ToolsPageClient from '@/src/components/tools/ToolsPageClient'
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
  if (!supportedLocales.includes(lang as SupportedLocale)) {
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
    },
    'de': {
      title: search 
        ? `Suchergebnisse für "${search}" - KI-Tools Verzeichnis`
        : category 
        ? `${category} KI-Tools - Video-IA.net`
        : page > 1 
        ? `KI-Tools Verzeichnis - Seite ${page} | Video-IA.net`
        : 'KI-Tools Verzeichnis - 16.000+ Beste KI-Tools | Video-IA.net',
      description: search
        ? `Finden Sie die besten KI-Tools für "${search}". Durchsuchen Sie verifizierte Tools mit Bewertungen, Ratings und Vergleichen.`
        : category
        ? `Entdecken Sie die besten ${category} KI-Tools. Professionelle Bewertungen, Ratings und detaillierte Vergleiche.`
        : 'Durchsuchen Sie das weltweit größte Verzeichnis von KI-Tools. 16.000+ verifizierte Tools für Videoerstellung, Automatisierung, maschinelles Lernen und mehr.',
    },
    'nl': {
      title: search 
        ? `Zoekresultaten voor "${search}" - AI-Tools Directory`
        : category 
        ? `${category} AI-Tools - Video-IA.net`
        : page > 1 
        ? `AI-Tools Directory - Pagina ${page} | Video-IA.net`
        : 'AI-Tools Directory - 16.000+ Beste AI-Tools | Video-IA.net',
      description: search
        ? `Vind de beste AI-tools voor "${search}". Blader door geverifieerde tools met reviews, ratings en vergelijkingen.`
        : category
        ? `Ontdek de beste ${category} AI-tools. Professionele reviews, ratings en gedetailleerde vergelijkingen.`
        : `Blader door 's werelds grootste directory van AI-tools. 16.000+ geverifieerde tools voor videocreatie, automatisering, machine learning en meer.`,
    },
    'it': {
      title: search 
        ? `Risultati di ricerca per "${search}" - Directory Strumenti IA`
        : category 
        ? `Strumenti IA ${category} - Video-IA.net`
        : page > 1 
        ? `Directory Strumenti IA - Pagina ${page} | Video-IA.net`
        : 'Directory Strumenti IA - 16.000+ Migliori Strumenti IA | Video-IA.net',
      description: search
        ? `Trova i migliori strumenti IA per "${search}". Sfoglia strumenti verificati con recensioni, valutazioni e confronti.`
        : category
        ? `Scopri i migliori strumenti IA ${category}. Recensioni professionali, valutazioni e confronti dettagliati.`
        : 'Sfoglia la più grande directory di strumenti IA al mondo. 16.000+ strumenti verificati per creazione video, automazione, machine learning e altro.',
    },
    'es': {
      title: search 
        ? `Resultados de búsqueda para "${search}" - Directorio de Herramientas IA`
        : category 
        ? `Herramientas IA ${category} - Video-IA.net`
        : page > 1 
        ? `Directorio de Herramientas IA - Página ${page} | Video-IA.net`
        : 'Directorio de Herramientas IA - 16.000+ Mejores Herramientas IA | Video-IA.net',
      description: search
        ? `Encuentra las mejores herramientas IA para "${search}". Navega herramientas verificadas con reseñas, calificaciones y comparaciones.`
        : category
        ? `Descubre las mejores herramientas IA ${category}. Reseñas profesionales, calificaciones y comparaciones detalladas.`
        : 'Navega el directorio de herramientas IA más grande del mundo. 16.000+ herramientas verificadas para creación de video, automatización, machine learning y más.',
    },
    'pt': {
      title: search 
        ? `Resultados de pesquisa para "${search}" - Diretório de Ferramentas IA`
        : category 
        ? `Ferramentas IA ${category} - Video-IA.net`
        : page > 1 
        ? `Diretório de Ferramentas IA - Página ${page} | Video-IA.net`
        : 'Diretório de Ferramentas IA - 16.000+ Melhores Ferramentas IA | Video-IA.net',
      description: search
        ? `Encontre as melhores ferramentas IA para "${search}". Navegue ferramentas verificadas com avaliações, classificações e comparações.`
        : category
        ? `Descubra as melhores ferramentas IA ${category}. Avaliações profissionais, classificações e comparações detalhadas.`
        : 'Navegue pelo maior diretório de ferramentas IA do mundo. 16.000+ ferramentas verificadas para criação de vídeo, automação, machine learning e mais.',
    }
  }
  
  const content = metadata[lang] || metadata['en']
  const currentUrl = buildQueryString(searchParams) ? `${basePageUrl}?${buildQueryString(searchParams)}` : basePageUrl
  
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
          `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/tools`
        ])
      )
    }
  }
}

/**
 * Construction de l'URL de requête pour les métadonnées
 */
function buildQueryString(searchParams: any): string {
  const params = new URLSearchParams()
  
  if (searchParams.search) params.set('search', searchParams.search)
  if (searchParams.category) params.set('category', searchParams.category)
  if (searchParams.sort) params.set('sort', searchParams.sort)
  if (searchParams.order) params.set('order', searchParams.order)
  if (searchParams.view) params.set('view', searchParams.view)
  if (searchParams.page && searchParams.page !== '1') params.set('page', searchParams.page)
  
  return params.toString()
}

/**
 * Page Component Principal
 */
export default async function ToolsPage({ params, searchParams }: ToolsPageProps) {
  const { lang, page, search, category, sortBy, sortOrder, viewMode } = validateAndParseParams(params, searchParams)
  
  try {
    // Récupération parallèle des données
    const [toolsResult, categoriesResult] = await Promise.all([
      // Outils avec pagination et filtres
      multilingualToolsService.searchTools({
        language: lang,
        page,
        limit: 24,
        query: search,
        category,
        sortBy,
        sortOrder,
        useCache: true
      }),
      
      // Catégories pour les filtres
      multilingualCategoriesService.getAllCategories(lang, {
        includeEmpty: false,
        useCache: true,
        includeCounts: true
      })
    ])
    
    const { tools, pagination } = toolsResult
    const { totalCount, totalPages, hasNextPage, hasPreviousPage } = pagination
    const { categories } = categoriesResult
    
    // Messages localisés
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
              <span className="text-gray-900 dark:text-white font-medium">
                {messages.tools}
              </span>
            </nav>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {search 
                    ? `${messages.searchResults} "${search}"`
                    : category 
                    ? `${category} ${messages.tools}`
                    : messages.allTools
                  }
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {messages.toolsDescription}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{totalCount.toLocaleString()} {messages.tools.toLowerCase()}</span>
                  {totalPages > 1 && (
                    <>
                      <span>•</span>
                      <span>{messages.page} {page} {messages.of} {totalPages}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Contenu principal avec Client Component */}
        <Suspense fallback={<LoadingSpinner />}>
          <ToolsPageClient
            tools={tools}
            categories={categories}
            totalCount={totalCount}
            currentPage={page}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            lang={lang}
            search={search}
            category={category}
            sortBy={sortBy}
            sortOrder={sortOrder}
            viewMode={viewMode}
            messages={messages}
          />
        </Suspense>
      </div>
    )
    
  } catch (error) {
    console.error('Tools page error:', error)
    
    // Fallback gracieux
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {getLocalizedMessages(lang).errorLoading}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getLocalizedMessages(lang).errorTryAgain}
          </p>
          <a
            href={`/${lang}/tools`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {getLocalizedMessages(lang).reload}
          </a>
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
      tools: 'Tools',
      allTools: 'All AI Tools',
      searchResults: 'Search Results for',
      toolsDescription: 'Browse our comprehensive collection of AI tools',
      page: 'Page',
      of: 'of',
      errorLoading: 'Error Loading Tools',
      errorTryAgain: 'Something went wrong. Please try again.',
      reload: 'Reload'
    },
    'fr': {
      home: 'Accueil',
      tools: 'Outils',
      allTools: 'Tous les Outils IA',
      searchResults: 'Résultats de recherche pour',
      toolsDescription: 'Parcourez notre collection complète d\'outils IA',
      page: 'Page',
      of: 'sur',
      errorLoading: 'Erreur de Chargement',
      errorTryAgain: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
      reload: 'Recharger'
    },
    'de': {
      home: 'Startseite',
      tools: 'Tools',
      allTools: 'Alle KI-Tools',
      searchResults: 'Suchergebnisse für',
      toolsDescription: 'Durchsuchen Sie unsere umfassende Sammlung von KI-Tools',
      page: 'Seite',
      of: 'von',
      errorLoading: 'Fehler beim Laden der Tools',
      errorTryAgain: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
      reload: 'Neu laden'
    },
    'nl': {
      home: 'Home',
      tools: 'Tools',
      allTools: 'Alle AI-Tools',
      searchResults: 'Zoekresultaten voor',
      toolsDescription: 'Blader door onze uitgebreide collectie AI-tools',
      page: 'Pagina',
      of: 'van',
      errorLoading: 'Fout bij het Laden van Tools',
      errorTryAgain: 'Er is iets misgegaan. Probeer het opnieuw.',
      reload: 'Herladen'
    },
    'it': {
      home: 'Home',
      tools: 'Strumenti',
      allTools: 'Tutti gli Strumenti IA',
      searchResults: 'Risultati di ricerca per',
      toolsDescription: 'Sfoglia la nostra collezione completa di strumenti IA',
      page: 'Pagina',
      of: 'di',
      errorLoading: 'Errore nel Caricamento degli Strumenti',
      errorTryAgain: 'Qualcosa è andato storto. Riprova.',
      reload: 'Ricarica'
    },
    'es': {
      home: 'Inicio',
      tools: 'Herramientas',
      allTools: 'Todas las Herramientas IA',
      searchResults: 'Resultados de búsqueda para',
      toolsDescription: 'Explora nuestra colección completa de herramientas IA',
      page: 'Página',
      of: 'de',
      errorLoading: 'Error al Cargar Herramientas',
      errorTryAgain: 'Algo salió mal. Por favor inténtalo de nuevo.',
      reload: 'Recargar'
    },
    'pt': {
      home: 'Início',
      tools: 'Ferramentas',
      allTools: 'Todas as Ferramentas IA',
      searchResults: 'Resultados de pesquisa para',
      toolsDescription: 'Navegue nossa coleção abrangente de ferramentas IA',
      page: 'Página',
      of: 'de',
      errorLoading: 'Erro ao Carregar Ferramentas',
      errorTryAgain: 'Algo deu errado. Tente novamente.',
      reload: 'Recarregar'
    }
  }
  
  return messages[lang] || messages['en']
}
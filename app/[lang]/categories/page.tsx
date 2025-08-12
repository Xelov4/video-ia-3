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
import CategoriesControls from '@/src/components/categories/CategoriesControls'

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
  if (!supportedLocales.includes(lang as SupportedLocale)) {
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
  
  if (!supportedLocales.includes(lang)) {
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
              
              {/* Contrôles de vue et tri - Client Component */}
              <CategoriesControls 
                lang={lang}
                sortBy={sortBy}
                sortOrder={sortOrder}
                viewMode={viewMode}
                messages={messages}
              />
            </div>
          </div>
        </header>
        
        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCategories.map((category) => (
                <a
                  key={category.id}
                  href={`/${lang}/categories/${category.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-4xl mb-4">{category.emoji || '🔧'}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {category.displayName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {category.actualToolCount?.toLocaleString() || 0} {messages.tools}
                    </span>
                    <span className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCategories.map((category) => (
                <a
                  key={category.id}
                  href={`/${lang}/categories/${category.slug}`}
                  className="group flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-3xl">{category.emoji || '🔧'}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {category.displayName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {category.actualToolCount?.toLocaleString() || 0} {messages.tools}
                    </div>
                    <div className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      →
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </main>
      </div>
    )
    
  } catch (error) {
    console.error('Categories page error:', error)
    
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
            href={`/${lang}/categories`}
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
      categories: 'Categories',
      allCategories: 'All AI Tools Categories',
      categoriesDescription: 'Explore our comprehensive collection of AI tool categories',
      totalTools: 'total tools',
      tools: 'tools',
      sortBy: 'Sort by',
      mostPopular: 'Most Popular',
      leastPopular: 'Least Popular',
      alphabetical: 'A-Z',
      reverseAlphabetical: 'Z-A',
      gridView: 'Grid',
      listView: 'List',
      errorLoading: 'Error Loading Categories',
      errorTryAgain: 'Something went wrong. Please try again.',
      reload: 'Reload'
    },
    'fr': {
      home: 'Accueil',
      categories: 'Catégories',
      allCategories: 'Toutes les Catégories d\'Outils IA',
      categoriesDescription: 'Explorez notre collection complète de catégories d\'outils IA',
      totalTools: 'outils au total',
      tools: 'outils',
      sortBy: 'Trier par',
      mostPopular: 'Plus Populaires',
      leastPopular: 'Moins Populaires',
      alphabetical: 'A-Z',
      reverseAlphabetical: 'Z-A',
      gridView: 'Grille',
      listView: 'Liste',
      errorLoading: 'Erreur de Chargement',
      errorTryAgain: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
      reload: 'Recharger'
    },
    'de': {
      home: 'Startseite',
      categories: 'Kategorien',
      allCategories: 'Alle KI-Tools-Kategorien',
      categoriesDescription: 'Erkunden Sie unsere umfassende Sammlung von KI-Tools-Kategorien',
      totalTools: 'Tools insgesamt',
      tools: 'Tools',
      sortBy: 'Sortieren nach',
      mostPopular: 'Beliebteste',
      leastPopular: 'Weniger Beliebte',
      alphabetical: 'A-Z',
      reverseAlphabetical: 'Z-A',
      gridView: 'Raster',
      listView: 'Liste',
      errorLoading: 'Fehler beim Laden der Kategorien',
      errorTryAgain: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
      reload: 'Neu laden'
    },
    'nl': {
      home: 'Home',
      categories: 'Categorieën',
      allCategories: 'Alle AI-Tools Categorieën',
      categoriesDescription: 'Verken onze uitgebreide collectie AI-tools categorieën',
      totalTools: 'tools in totaal',
      tools: 'tools',
      sortBy: 'Sorteren op',
      mostPopular: 'Populairste',
      leastPopular: 'Minst Populair',
      alphabetical: 'A-Z',
      reverseAlphabetical: 'Z-A',
      gridView: 'Raster',
      listView: 'Lijst',
      errorLoading: 'Fout bij het Laden van Categorieën',
      errorTryAgain: 'Er is iets misgegaan. Probeer het opnieuw.',
      reload: 'Herladen'
    },
    'it': {
      home: 'Home',
      categories: 'Categorie',
      allCategories: 'Tutte le Categorie di Strumenti IA',
      categoriesDescription: 'Esplora la nostra collezione completa di categorie di strumenti IA',
      totalTools: 'strumenti totali',
      tools: 'strumenti',
      sortBy: 'Ordina per',
      mostPopular: 'Più Popolari',
      leastPopular: 'Meno Popolari',
      alphabetical: 'A-Z',
      reverseAlphabetical: 'Z-A',
      gridView: 'Griglia',
      listView: 'Lista',
      errorLoading: 'Errore nel Caricamento delle Categorie',
      errorTryAgain: 'Qualcosa è andato storto. Riprova.',
      reload: 'Ricarica'
    },
    'es': {
      home: 'Inicio',
      categories: 'Categorías',
      allCategories: 'Todas las Categorías de Herramientas IA',
      categoriesDescription: 'Explora nuestra colección completa de categorías de herramientas IA',
      totalTools: 'herramientas en total',
      tools: 'herramientas',
      sortBy: 'Ordenar por',
      mostPopular: 'Más Populares',
      leastPopular: 'Menos Populares',
      alphabetical: 'A-Z',
      reverseAlphabetical: 'Z-A',
      gridView: 'Cuadrícula',
      listView: 'Lista',
      errorLoading: 'Error al Cargar Categorías',
      errorTryAgain: 'Algo salió mal. Por favor inténtalo de nuevo.',
      reload: 'Recargar'
    },
    'pt': {
      home: 'Início',
      categories: 'Categorias',
      allCategories: 'Todas as Categorias de Ferramentas IA',
      categoriesDescription: 'Explore nossa coleção abrangente de categorias de ferramentas IA',
      totalTools: 'ferramentas no total',
      tools: 'ferramentas',
      sortBy: 'Ordenar por',
      mostPopular: 'Mais Populares',
      leastPopular: 'Menos Populares',
      alphabetical: 'A-Z',
      reverseAlphabetical: 'Z-A',
      gridView: 'Grade',
      listView: 'Lista',
      errorLoading: 'Erro ao Carregar Categorias',
      errorTryAgain: 'Algo deu errado. Tente novamente.',
      reload: 'Recarregar'
    }
  }
  
  return messages[lang] || messages['en']
}
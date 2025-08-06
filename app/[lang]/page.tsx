/**
 * Homepage Multilingue - Video-IA.net
 * 
 * Page d'accueil avec contenu dynamique par langue, outils featured,
 * catégories populaires et optimisations SEO complètes.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, SUPPORTED_LOCALES } from '@/middleware'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'

import HeroSection from '@/src/components/home/HeroSection'
import FeaturedTools from '@/src/components/home/FeaturedTools'
import ToolsGrid from '@/src/components/tools/ToolsGrid'

// Interface pour props de page
interface HomePageProps {
  params: {
    lang: SupportedLocale
  }
}

/**
 * Validation des paramètres
 */
function validateLanguageParam(lang: string): SupportedLocale {
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound()
  }
  return lang as SupportedLocale
}

/**
 * Métadonnées SEO spécifiques à la homepage par langue
 */
export async function generateMetadata({ 
  params 
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const lang = validateLanguageParam(params.lang)
  
  // Contenu SEO optimisé par langue
  const seoContent = {
    'en': {
      title: 'Video-IA.net - Best AI Tools Directory 2025 | 16,000+ AI Tools',
      description: 'Discover the world\'s largest AI tools directory with 16,000+ verified tools for video creation, editing, automation and more. Free reviews, comparisons and ratings.',
      keywords: 'AI tools directory, artificial intelligence, video AI tools, machine learning tools, AI automation, free AI tools'
    },
    'fr': {
      title: 'Video-IA.net - Meilleur Répertoire d\'Outils IA 2025 | 16 000+ Outils IA',
      description: 'Découvrez le plus grand répertoire d\'outils IA au monde avec 16 000+ outils vérifiés pour création vidéo, édition, automatisation et plus. Avis, comparaisons et notes gratuits.',
      keywords: 'répertoire outils IA, intelligence artificielle, outils IA vidéo, outils machine learning, automatisation IA, outils IA gratuits'
    },
    'it': {
      title: 'Video-IA.net - Migliore Directory Strumenti AI 2025 | 16.000+ Strumenti AI',
      description: 'Scopri la più grande directory di strumenti AI al mondo con 16.000+ strumenti verificati per creazione video, editing, automazione e altro. Recensioni, confronti e valutazioni gratuite.',
      keywords: 'directory strumenti AI, intelligenza artificiale, strumenti AI video, strumenti machine learning, automazione AI, strumenti AI gratuiti'
    },
    'es': {
      title: 'Video-IA.net - Mejor Directorio Herramientas IA 2025 | 16.000+ Herramientas IA',
      description: 'Descubre el directorio de herramientas IA más grande del mundo con 16.000+ herramientas verificadas para creación de video, edición, automatización y más. Reviews, comparaciones y calificaciones gratis.',
      keywords: 'directorio herramientas IA, inteligencia artificial, herramientas IA video, herramientas machine learning, automatización IA, herramientas IA gratis'
    },
    'de': {
      title: 'Video-IA.net - Bestes KI-Tools Verzeichnis 2025 | 16.000+ KI-Tools',
      description: 'Entdecken Sie das weltgrößte KI-Tools-Verzeichnis mit 16.000+ verifizierten Tools für Videoerstellung, Bearbeitung, Automatisierung und mehr. Kostenlose Bewertungen, Vergleiche und Ratings.',
      keywords: 'KI-Tools Verzeichnis, künstliche Intelligenz, Video-KI-Tools, Machine Learning Tools, KI-Automatisierung, kostenlose KI-Tools'
    },
    'nl': {
      title: 'Video-IA.net - Beste AI Tools Directory 2025 | 16.000+ AI Tools',
      description: 'Ontdek 's werelds grootste AI-tools directory met 16.000+ geverifieerde tools voor video creatie, bewerking, automatisering en meer. Gratis reviews, vergelijkingen en beoordelingen.',
      keywords: 'AI-tools directory, kunstmatige intelligentie, video AI-tools, machine learning tools, AI-automatisering, gratis AI-tools'
    },
    'pt': {
      title: 'Video-IA.net - Melhor Diretório Ferramentas IA 2025 | 16.000+ Ferramentas IA',
      description: 'Descubra o maior diretório de ferramentas IA do mundo com 16.000+ ferramentas verificadas para criação de vídeo, edição, automação e mais. Reviews, comparações e avaliações grátis.',
      keywords: 'diretório ferramentas IA, inteligência artificial, ferramentas IA vídeo, ferramentas machine learning, automação IA, ferramentas IA grátis'
    }
  }
  
  const content = seoContent[lang]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const currentUrl = lang === 'en' ? baseUrl : `${baseUrl}/${lang}`
  
  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    
    openGraph: {
      title: content.title,
      description: content.description,
      url: currentUrl,
      siteName: 'Video-IA.net',
      locale: lang === 'en' ? 'en_US' : lang === 'fr' ? 'fr_FR' : `${lang}_${lang.toUpperCase()}`,
      type: 'website',
    },
    
    // Alternates languages
    alternates: {
      canonical: currentUrl,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map(locale => [
          locale,
          locale === 'en' ? baseUrl : `${baseUrl}/${locale}`
        ])
      )
    }
  }
}

/**
 * Génération des paramètres statiques
 */
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({
    lang: lang
  }))
}

/**
 * Homepage Component avec données multilingues
 */
export default async function HomePage({ params }: HomePageProps) {
  const lang = validateLanguageParam(params.lang)
  
  try {
    // Récupération parallèle des données pour performance
    const [featuredToolsResult, topCategoriesResult, recentToolsResult] = await Promise.all([
      // Outils en vedette (8 premiers)
      multilingualToolsService.getFeaturedTools(lang, 8),
      
      // Top catégories (6 premières)  
      multilingualCategoriesService.getFeaturedCategories(lang, 6),
      
      // Outils récents (12 premiers)
      multilingualToolsService.searchTools({
        language: lang,
        limit: 12,
        sortBy: 'created_at',
        sortOrder: 'desc',
        useCache: true
      })
    ])
    
    // Données pour composants
    const pageData = {
      featuredTools: featuredToolsResult,
      topCategories: topCategoriesResult,
      recentTools: recentToolsResult.tools,
      language: lang
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Section Hero avec CTA */}
        <HeroSection 
          language={lang}
          totalToolsCount={16765} 
          featuredCategories={pageData.topCategories.slice(0, 4)}
        />
        
        {/* Section Outils en Vedette */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <FeaturedTools 
              tools={pageData.featuredTools}
              language={lang}
              title={getLocalizedText(lang, 'featuredTools')}
              subtitle={getLocalizedText(lang, 'featuredToolsSubtitle')}
            />
          </div>
        </section>
        
        {/* Section Catégories Populaires */}
        <section className="py-16 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              {getLocalizedText(lang, 'popularCategories')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {pageData.topCategories.map((category) => (
                <a
                  key={category.id}
                  href={`/${lang}/categories/${category.slug}`}
                  className="group flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-4xl mb-3">
                    {category.emoji || '🔧'}
                  </div>
                  <h3 className="text-sm font-semibold text-center text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {category.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {category.actualToolCount} {getLocalizedText(lang, 'tools')}
                  </p>
                </a>
              ))}
            </div>
            <div className="text-center mt-8">
              <a
                href={`/${lang}/categories`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {getLocalizedText(lang, 'viewAllCategories')}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>
        
        {/* Section Outils Récents */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              {getLocalizedText(lang, 'recentlyAdded')}
            </h2>
            <ToolsGrid 
              tools={pageData.recentTools}
              language={lang}
              showLoadMore={false}
            />
            <div className="text-center mt-12">
              <a
                href={`/${lang}/tools`}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                {getLocalizedText(lang, 'exploreAllTools')}
                <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </section>
        
        {/* Section CTA Newsletter/Community */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              {getLocalizedText(lang, 'stayUpdated')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {getLocalizedText(lang, 'stayUpdatedDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder={getLocalizedText(lang, 'emailPlaceholder')}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                {getLocalizedText(lang, 'subscribe')}
              </button>
            </div>
          </div>
        </section>
      </div>
    )
    
  } catch (error) {
    console.error('Homepage data loading error:', error)
    
    // Fallback gracieux en cas d'erreur
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {getLocalizedText(lang, 'errorLoading')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getLocalizedText(lang, 'errorTryAgain')}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {getLocalizedText(lang, 'reload')}
          </button>
        </div>
      </div>
    )
  }
}

/**
 * Textes localisés pour la homepage
 */
function getLocalizedText(lang: SupportedLocale, key: string): string {
  const translations = {
    'en': {
      featuredTools: 'Featured AI Tools',
      featuredToolsSubtitle: 'Discover the most popular and highly-rated AI tools',
      popularCategories: 'Popular Categories',
      tools: 'tools',
      viewAllCategories: 'View All Categories',
      recentlyAdded: 'Recently Added Tools',
      exploreAllTools: 'Explore All Tools',
      stayUpdated: 'Stay Updated',
      stayUpdatedDescription: 'Get the latest AI tools and updates delivered to your inbox',
      emailPlaceholder: 'Enter your email',
      subscribe: 'Subscribe',
      errorLoading: 'Error Loading Page',
      errorTryAgain: 'Something went wrong. Please try again.',
      reload: 'Reload Page'
    },
    'fr': {
      featuredTools: 'Outils IA en Vedette',
      featuredToolsSubtitle: 'Découvrez les outils IA les plus populaires et les mieux notés',
      popularCategories: 'Catégories Populaires',
      tools: 'outils',
      viewAllCategories: 'Voir Toutes les Catégories',
      recentlyAdded: 'Outils Récemment Ajoutés',
      exploreAllTools: 'Explorer Tous les Outils',
      stayUpdated: 'Restez Informé',
      stayUpdatedDescription: 'Recevez les derniers outils IA et mises à jour dans votre boîte mail',
      emailPlaceholder: 'Entrez votre email',
      subscribe: 'S\'abonner',
      errorLoading: 'Erreur de Chargement',
      errorTryAgain: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
      reload: 'Recharger la Page'
    },
    'it': {
      featuredTools: 'Strumenti AI in Evidenza',
      featuredToolsSubtitle: 'Scopri gli strumenti AI più popolari e meglio valutati',
      popularCategories: 'Categorie Popolari',
      tools: 'strumenti',
      viewAllCategories: 'Visualizza Tutte le Categorie',
      recentlyAdded: 'Strumenti Aggiunti di Recente',
      exploreAllTools: 'Esplora Tutti gli Strumenti',
      stayUpdated: 'Resta Aggiornato',
      stayUpdatedDescription: 'Ricevi i più recenti strumenti AI e aggiornamenti nella tua casella di posta',
      emailPlaceholder: 'Inserisci la tua email',
      subscribe: 'Iscriviti',
      errorLoading: 'Errore nel Caricamento',
      errorTryAgain: 'Qualcosa è andato storto. Riprova.',
      reload: 'Ricarica Pagina'
    },
    'es': {
      featuredTools: 'Herramientas IA Destacadas',
      featuredToolsSubtitle: 'Descubre las herramientas IA más populares y mejor valoradas',
      popularCategories: 'Categorías Populares',
      tools: 'herramientas',
      viewAllCategories: 'Ver Todas las Categorías',
      recentlyAdded: 'Herramientas Añadidas Recientemente',
      exploreAllTools: 'Explorar Todas las Herramientas',
      stayUpdated: 'Mantente Actualizado',
      stayUpdatedDescription: 'Recibe las últimas herramientas IA y actualizaciones en tu bandeja de entrada',
      emailPlaceholder: 'Ingresa tu email',
      subscribe: 'Suscribirse',
      errorLoading: 'Error al Cargar',
      errorTryAgain: 'Algo salió mal. Por favor, inténtalo de nuevo.',
      reload: 'Recargar Página'
    },
    'de': {
      featuredTools: 'Featured KI-Tools',
      featuredToolsSubtitle: 'Entdecken Sie die beliebtesten und bestbewerteten KI-Tools',
      popularCategories: 'Beliebte Kategorien',
      tools: 'Tools',
      viewAllCategories: 'Alle Kategorien Anzeigen',
      recentlyAdded: 'Kürzlich Hinzugefügte Tools',
      exploreAllTools: 'Alle Tools Erkunden',
      stayUpdated: 'Bleiben Sie auf dem Laufenden',
      stayUpdatedDescription: 'Erhalten Sie die neuesten KI-Tools und Updates in Ihr Postfach',
      emailPlaceholder: 'E-Mail eingeben',
      subscribe: 'Abonnieren',
      errorLoading: 'Fehler beim Laden',
      errorTryAgain: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
      reload: 'Seite Neu Laden'
    },
    'nl': {
      featuredTools: 'Uitgelichte AI Tools',
      featuredToolsSubtitle: 'Ontdek de meest populaire en best beoordeelde AI-tools',
      popularCategories: 'Populaire Categorieën',
      tools: 'tools',
      viewAllCategories: 'Bekijk Alle Categorieën',
      recentlyAdded: 'Recent Toegevoegde Tools',
      exploreAllTools: 'Verken Alle Tools',
      stayUpdated: 'Blijf Op de Hoogte',
      stayUpdatedDescription: 'Ontvang de nieuwste AI-tools en updates in je inbox',
      emailPlaceholder: 'Voer je e-mail in',
      subscribe: 'Abonneren',
      errorLoading: 'Fout bij Laden',
      errorTryAgain: 'Er is iets misgegaan. Probeer het opnieuw.',
      reload: 'Pagina Herladen'
    },
    'pt': {
      featuredTools: 'Ferramentas IA em Destaque',
      featuredToolsSubtitle: 'Descubra as ferramentas IA mais populares e mais bem avaliadas',
      popularCategories: 'Categorias Populares',
      tools: 'ferramentas',
      viewAllCategories: 'Ver Todas as Categorias',
      recentlyAdded: 'Ferramentas Adicionadas Recentemente',
      exploreAllTools: 'Explorar Todas as Ferramentas',
      stayUpdated: 'Fique Atualizado',
      stayUpdatedDescription: 'Receba as mais recentes ferramentas IA e atualizações na sua caixa de entrada',
      emailPlaceholder: 'Digite seu email',
      subscribe: 'Assinar',
      errorLoading: 'Erro ao Carregar',
      errorTryAgain: 'Algo deu errado. Tente novamente.',
      reload: 'Recarregar Página'
    }
  }
  
  return translations[lang]?.[key] || translations['en'][key] || key
}
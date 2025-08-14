/**
 * Homepage Multilingue - Video-IA.net
 * 
 * Page d'accueil avec contenu dynamique par langue, outils featured,
 * catégories populaires et optimisations SEO complètes.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLocale, supportedLocales } from '@/middleware'

// Interface pour props de page
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
 * Métadonnées SEO spécifiques à la homepage par langue
 */
export async function generateMetadata({ 
  params 
}: {
  params: Promise<{ lang: string }
}): Promise<Metadata> {
  const { lang: langParam } = await params
  const lang = validateLanguageParam(langParam)
  
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
      description: 'Ontdek \'s werelds grootste AI-tools directory met 16.000+ geverifieerde tools voor video creatie, bewerking, automatisering en meer. Gratis reviews, vergelijkingen en beoordelingen.',
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
 * Homepage Component avec contenu multilingue
 */
export default async function HomePage({ params }: HomePageProps) {
  const { lang: langParam } = await params
  const lang = validateLanguageParam(langParam)
  
  // Données mockées pour l'instant
  const mockData = {
    totalTools: 16765,
    totalCategories: 140,
    featuredTools: [
      { id: 1, name: 'ChatGPT', description: 'AI chatbot for conversations', category: 'Chatbot', rating: 4.8 },
      { id: 2, name: 'Midjourney', description: 'AI image generation', category: 'Image Generation', rating: 4.7 },
      { id: 3, name: 'Jasper', description: 'AI writing assistant', category: 'Writing', rating: 4.6 },
      { id: 4, name: 'DALL-E', description: 'AI art creation', category: 'Art', rating: 4.5 }
    ],
    popularCategories: [
      { id: 1, name: 'Writing Assistant', slug: 'writing-assistant', toolCount: 1250, emoji: '✍️' },
      { id: 2, name: 'Image Editing', slug: 'image-editing', toolCount: 980, emoji: '🎨' },
      { id: 3, name: 'Video Editing', slug: 'video-editing', toolCount: 750, emoji: '🎬' },
      { id: 4, name: 'Music Generation', slug: 'music-generation', toolCount: 420, emoji: '🎵' },
      { id: 5, name: 'Productivity', slug: 'productivity', toolCount: 890, emoji: '⚡' },
      { id: 6, name: 'Chatbot', slug: 'chatbot', toolCount: 650, emoji: '🤖' }
    ]
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Section Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            {getLocalizedText(lang, 'heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {getLocalizedText(lang, 'heroSubtitle')}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {mockData.totalTools.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{getLocalizedText(lang, 'tools')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {mockData.totalCategories}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{getLocalizedText(lang, 'categories')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                150+
              </div>
              <div className="text-gray-600 dark:text-gray-400">{getLocalizedText(lang, 'featured')}</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${lang}/tools`}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              {getLocalizedText(lang, 'exploreTools')}
              <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href={`/${lang}/categories`}
              className="inline-flex items-center px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300"
            >
              {getLocalizedText(lang, 'browseCategories')}
            </a>
          </div>
        </div>
      </section>
      
      {/* Section Outils en Vedette */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {getLocalizedText(lang, 'featuredTools')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockData.featuredTools.map((tool) => (
              <div key={tool.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{tool.category}</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">{tool.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{tool.description}</p>
                <a
                  href={`/${lang}/tools/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  {getLocalizedText(lang, 'learnMore')}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Section Catégories Populaires */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {getLocalizedText(lang, 'popularCategories')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mockData.popularCategories.map((category) => (
              <a
                key={category.id}
                href={`/${lang}/categories/${category.slug}`}
                className="group flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-3">{category.emoji}</div>
                <h3 className="text-sm font-semibold text-center text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {category.toolCount} {getLocalizedText(lang, 'tools')}
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
      
      {/* Section CTA Newsletter */}
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
}

/**
 * Textes localisés pour la homepage
 */
function getLocalizedText(lang: SupportedLocale, key: string): string {
  const translations: Record<string, Record<string, string>> = {
    'en': {
      heroTitle: 'Discover the Best AI Tools',
      heroSubtitle: '16,000+ verified AI tools for creators and professionals',
      tools: 'Tools',
      categories: 'Categories',
      featured: 'Featured',
      exploreTools: 'Explore Tools',
      browseCategories: 'Browse Categories',
      featuredTools: 'Featured AI Tools',
      popularCategories: 'Popular Categories',
      learnMore: 'Learn More',
      viewAllCategories: 'View All Categories',
      stayUpdated: 'Stay Updated',
      stayUpdatedDescription: 'Get the latest AI tools and updates delivered to your inbox',
      emailPlaceholder: 'Enter your email',
      subscribe: 'Subscribe'
    },
    'fr': {
      heroTitle: 'Découvrez les Meilleurs Outils IA',
      heroSubtitle: '16 000+ outils IA vérifiés pour créateurs et professionnels',
      tools: 'Outils',
      categories: 'Catégories',
      featured: 'En Vedette',
      exploreTools: 'Explorer les Outils',
      browseCategories: 'Parcourir les Catégories',
      featuredTools: 'Outils IA en Vedette',
      popularCategories: 'Catégories Populaires',
      learnMore: 'En Savoir Plus',
      viewAllCategories: 'Voir Toutes les Catégories',
      stayUpdated: 'Restez Informé',
      stayUpdatedDescription: 'Recevez les derniers outils IA et mises à jour dans votre boîte mail',
      emailPlaceholder: 'Entrez votre email',
      subscribe: 'S\'abonner'
    },
    'it': {
      heroTitle: 'Scopri i Migliori Strumenti AI',
      heroSubtitle: '16.000+ strumenti AI verificati per creatori e professionisti',
      tools: 'Strumenti',
      categories: 'Categorie',
      featured: 'In Evidenza',
      exploreTools: 'Esplora Strumenti',
      browseCategories: 'Sfoglia Categorie',
      featuredTools: 'Strumenti AI in Evidenza',
      popularCategories: 'Categorie Popolari',
      learnMore: 'Scopri di Più',
      viewAllCategories: 'Visualizza Tutte le Categorie',
      stayUpdated: 'Resta Aggiornato',
      stayUpdatedDescription: 'Ricevi i più recenti strumenti AI e aggiornamenti nella tua casella di posta',
      emailPlaceholder: 'Inserisci la tua email',
      subscribe: 'Iscriviti'
    },
    'es': {
      heroTitle: 'Descubre las Mejores Herramientas IA',
      heroSubtitle: '16.000+ herramientas IA verificadas para creadores y profesionales',
      tools: 'Herramientas',
      categories: 'Categorías',
      featured: 'Destacadas',
      exploreTools: 'Explorar Herramientas',
      browseCategories: 'Navegar Categorías',
      featuredTools: 'Herramientas IA Destacadas',
      popularCategories: 'Categorías Populares',
      learnMore: 'Saber Más',
      viewAllCategories: 'Ver Todas las Categorías',
      stayUpdated: 'Mantente Actualizado',
      stayUpdatedDescription: 'Recibe las últimas herramientas IA y actualizaciones en tu bandeja de entrada',
      emailPlaceholder: 'Ingresa tu email',
      subscribe: 'Suscribirse'
    },
    'de': {
      heroTitle: 'Entdecken Sie die Besten KI-Tools',
      heroSubtitle: '16.000+ verifizierte KI-Tools für Kreative und Profis',
      tools: 'Tools',
      categories: 'Kategorien',
      featured: 'Empfohlen',
      exploreTools: 'Tools Erkunden',
      browseCategories: 'Kategorien Durchsuchen',
      featuredTools: 'Featured KI-Tools',
      popularCategories: 'Beliebte Kategorien',
      learnMore: 'Mehr Erfahren',
      viewAllCategories: 'Alle Kategorien Anzeigen',
      stayUpdated: 'Bleiben Sie auf dem Laufenden',
      stayUpdatedDescription: 'Erhalten Sie die neuesten KI-Tools und Updates in Ihr Postfach',
      emailPlaceholder: 'E-Mail eingeben',
      subscribe: 'Abonnieren'
    },
    'nl': {
      heroTitle: 'Ontdek de Beste AI Tools',
      heroSubtitle: '16.000+ geverifieerde AI-tools voor creatieven en professionals',
      tools: 'Tools',
      categories: 'Categorieën',
      featured: 'Uitgelicht',
      exploreTools: 'Tools Verkennen',
      browseCategories: 'Categorieën Bladeren',
      featuredTools: 'Uitgelichte AI Tools',
      popularCategories: 'Populaire Categorieën',
      learnMore: 'Meer Leren',
      viewAllCategories: 'Bekijk Alle Categorieën',
      stayUpdated: 'Blijf Op de Hoogte',
      stayUpdatedDescription: 'Ontvang de nieuwste AI-tools en updates in je inbox',
      emailPlaceholder: 'Voer je e-mail in',
      subscribe: 'Abonneren'
    },
    'pt': {
      heroTitle: 'Descubra as Melhores Ferramentas IA',
      heroSubtitle: '16.000+ ferramentas IA verificadas para criadores e profissionais',
      tools: 'Ferramentas',
      categories: 'Categorias',
      featured: 'Destacadas',
      exploreTools: 'Explorar Ferramentas',
      browseCategories: 'Navegar Categorias',
      featuredTools: 'Ferramentas IA em Destaque',
      popularCategories: 'Categorias Populares',
      learnMore: 'Saber Mais',
      viewAllCategories: 'Ver Todas as Categorias',
      stayUpdated: 'Fique Atualizado',
      stayUpdatedDescription: 'Receba as mais recentes ferramentas IA e atualizações na sua caixa de entrada',
      emailPlaceholder: 'Digite seu email',
      subscribe: 'Assinar'
    }
  }
  
  return translations[lang]?.[key] || translations['en'][key] || key
}
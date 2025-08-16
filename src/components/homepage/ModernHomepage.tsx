'use client'

import * as React from 'react'
import { Filter, Grid3X3, LayoutGrid, List, SlidersHorizontal, X, Search, Sparkles, Bot, TrendingUp, Star, Zap } from 'lucide-react'

import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { cn } from '@/src/lib/utils'

import AdvancedFilterSidebar from '@/src/components/search/AdvancedFilterSidebar'
import ModernToolGrid from '@/src/components/tools/ModernToolGrid'

interface ModernHomepageProps {
  tools: any[]
  categories?: any[]
  audiences?: any[]
  featuredTools?: any[]
  totalCount?: number
  lang?: string
}

// Traductions pour les stats du héros
const getHeroStats = (lang: string) => {
  const translations = {
    'en': [
      { label: 'AI Tools', value: '16,765+', icon: Bot, color: 'text-blue-600' },
      { label: 'Categories', value: '150+', icon: Filter, color: 'text-purple-600' },
      { label: 'Active Users', value: '250K+', icon: TrendingUp, color: 'text-green-600' },
      { label: 'Reviews', value: '50K+', icon: Star, color: 'text-yellow-600' }
    ],
    'fr': [
      { label: 'Outils IA', value: '16 765+', icon: Bot, color: 'text-blue-600' },
      { label: 'Catégories', value: '150+', icon: Filter, color: 'text-purple-600' },
      { label: 'Utilisateurs actifs', value: '250k+', icon: TrendingUp, color: 'text-green-600' },
      { label: 'Évaluations', value: '50k+', icon: Star, color: 'text-yellow-600' }
    ],
    'es': [
      { label: 'Herramientas IA', value: '16.765+', icon: Bot, color: 'text-blue-600' },
      { label: 'Categorías', value: '150+', icon: Filter, color: 'text-purple-600' },
      { label: 'Usuarios activos', value: '250k+', icon: TrendingUp, color: 'text-green-600' },
      { label: 'Evaluaciones', value: '50k+', icon: Star, color: 'text-yellow-600' }
    ],
    'de': [
      { label: 'KI-Tools', value: '16.765+', icon: Bot, color: 'text-blue-600' },
      { label: 'Kategorien', value: '150+', icon: Filter, color: 'text-purple-600' },
      { label: 'Aktive Nutzer', value: '250k+', icon: TrendingUp, color: 'text-green-600' },
      { label: 'Bewertungen', value: '50k+', icon: Star, color: 'text-yellow-600' }
    ],
    'it': [
      { label: 'Strumenti IA', value: '16.765+', icon: Bot, color: 'text-blue-600' },
      { label: 'Categorie', value: '150+', icon: Filter, color: 'text-purple-600' },
      { label: 'Utenti attivi', value: '250k+', icon: TrendingUp, color: 'text-green-600' },
      { label: 'Recensioni', value: '50k+', icon: Star, color: 'text-yellow-600' }
    ],
    'nl': [
      { label: 'AI Tools', value: '16.765+', icon: Bot, color: 'text-blue-600' },
      { label: 'Categorieën', value: '150+', icon: Filter, color: 'text-purple-600' },
      { label: 'Actieve gebruikers', value: '250k+', icon: TrendingUp, color: 'text-green-600' },
      { label: 'Beoordelingen', value: '50k+', icon: Star, color: 'text-yellow-600' }
    ],
    'pt': [
      { label: 'Ferramentas IA', value: '16.765+', icon: Bot, color: 'text-blue-600' },
      { label: 'Categorias', value: '150+', icon: Filter, color: 'text-purple-600' },
      { label: 'Usuários ativos', value: '250k+', icon: TrendingUp, color: 'text-green-600' },
      { label: 'Avaliações', value: '50k+', icon: Star, color: 'text-yellow-600' }
    ]
  }
  return translations[lang] || translations['en']
}

// Catégories vedettes traduites (limitées à 6 pour un design plus propre)
const getFeaturedCategories = (lang: string) => {
  const translations = {
    'en': [
      { name: 'AI Assistant', count: 1247, emoji: '🤖', description: 'Smart assistants for all your needs' },
      { name: 'Content Creation', count: 892, emoji: '✍️', description: 'Tools to create engaging content' },
      { name: 'Image Generation', count: 634, emoji: '🎨', description: 'Create images with AI' },
      { name: 'Video Tools', count: 523, emoji: '🎬', description: 'Edit and create videos easily' },
      { name: 'Data Analysis', count: 387, emoji: '📊', description: 'Analyze your data intelligently' },
      { name: 'Marketing', count: 298, emoji: '📈', description: 'Boost your marketing with AI' }
    ],
    'fr': [
      { name: 'Assistant IA', count: 1247, emoji: '🤖', description: 'Assistants intelligents pour tous vos besoins' },
      { name: 'Création de contenu', count: 892, emoji: '✍️', description: 'Outils pour créer du contenu engageant' },
      { name: 'Génération d\'images', count: 634, emoji: '🎨', description: 'Créez des images avec l\'IA' },
      { name: 'Outils vidéo', count: 523, emoji: '🎬', description: 'Éditez et créez des vidéos facilement' },
      { name: 'Analyse de données', count: 387, emoji: '📊', description: 'Analysez vos données intelligemment' },
      { name: 'Marketing', count: 298, emoji: '📈', description: 'Boostez votre marketing avec l\'IA' }
    ],
    'es': [
      { name: 'Asistente IA', count: 1247, emoji: '🤖', description: 'Asistentes inteligentes para todas tus necesidades' },
      { name: 'Creación de contenido', count: 892, emoji: '✍️', description: 'Herramientas para crear contenido atractivo' },
      { name: 'Generación de imágenes', count: 634, emoji: '🎨', description: 'Crea imágenes con IA' },
      { name: 'Herramientas de vídeo', count: 523, emoji: '🎬', description: 'Edita y crea vídeos fácilmente' },
      { name: 'Análisis de datos', count: 387, emoji: '📊', description: 'Analiza tus datos inteligentemente' },
      { name: 'Marketing', count: 298, emoji: '📈', description: 'Potencia tu marketing con IA' }
    ],
    'de': [
      { name: 'KI-Assistent', count: 1247, emoji: '🤖', description: 'Intelligente Assistenten für alle Ihre Bedürfnisse' },
      { name: 'Content-Erstellung', count: 892, emoji: '✍️', description: 'Tools zur Erstellung ansprechender Inhalte' },
      { name: 'Bildgenerierung', count: 634, emoji: '🎨', description: 'Erstellen Sie Bilder mit KI' },
      { name: 'Video-Tools', count: 523, emoji: '🎬', description: 'Videos einfach bearbeiten und erstellen' },
      { name: 'Datenanalyse', count: 387, emoji: '📊', description: 'Analysieren Sie Ihre Daten intelligent' },
      { name: 'Marketing', count: 298, emoji: '📈', description: 'Steigern Sie Ihr Marketing mit KI' }
    ],
    'it': [
      { name: 'Assistente IA', count: 1247, emoji: '🤖', description: 'Assistenti intelligenti per tutte le tue esigenze' },
      { name: 'Creazione contenuti', count: 892, emoji: '✍️', description: 'Strumenti per creare contenuti coinvolgenti' },
      { name: 'Generazione immagini', count: 634, emoji: '🎨', description: 'Crea immagini con IA' },
      { name: 'Strumenti video', count: 523, emoji: '🎬', description: 'Modifica e crea video facilmente' },
      { name: 'Analisi dati', count: 387, emoji: '📊', description: 'Analizza i tuoi dati intelligentemente' },
      { name: 'Marketing', count: 298, emoji: '📈', description: 'Potenzia il tuo marketing con IA' }
    ],
    'nl': [
      { name: 'AI Assistent', count: 1247, emoji: '🤖', description: 'Slimme assistenten voor al uw behoeften' },
      { name: 'Content creatie', count: 892, emoji: '✍️', description: 'Tools om boeiende content te creëren' },
      { name: 'Beeldgeneratie', count: 634, emoji: '🎨', description: 'Creëer afbeeldingen met AI' },
      { name: 'Video tools', count: 523, emoji: '🎬', description: 'Video\'s eenvoudig bewerken en maken' },
      { name: 'Data-analyse', count: 387, emoji: '📊', description: 'Analyseer uw data intelligent' },
      { name: 'Marketing', count: 298, emoji: '📈', description: 'Versterk uw marketing met AI' }
    ],
    'pt': [
      { name: 'Assistente IA', count: 1247, emoji: '🤖', description: 'Assistentes inteligentes para todas as suas necessidades' },
      { name: 'Criação de conteúdo', count: 892, emoji: '✍️', description: 'Ferramentas para criar conteúdo envolvente' },
      { name: 'Geração de imagens', count: 634, emoji: '🎨', description: 'Crie imagens com IA' },
      { name: 'Ferramentas de vídeo', count: 523, emoji: '🎬', description: 'Edite e crie vídeos facilmente' },
      { name: 'Análise de dados', count: 387, emoji: '📊', description: 'Analise seus dados inteligentemente' },
      { name: 'Marketing', count: 298, emoji: '📈', description: 'Impulsione seu marketing com IA' }
    ]
  }
  return translations[lang] || translations['en']
}

export default function ModernHomepage({
  tools = [],
  categories = [],
  audiences = [],
  featuredTools = [],
  totalCount = 16765,
  lang = 'fr'
}: ModernHomepageProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false) // Fermé par défaut pour un design plus propre
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState<any>({})
  const [filteredTools, setFilteredTools] = React.useState(tools)
  
  // Obtenir les traductions basées sur la langue
  const HERO_STATS = getHeroStats(lang)
  const FEATURED_CATEGORIES = getFeaturedCategories(lang)
  
  // Traductions pour l'interface
  const getTranslations = (lang: string) => {
    const translations = {
      'en': {
        discoverBest: 'Discover the best',
        aiTools: 'AI tools',
        subtitle: 'More than',
        toolsDescription: 'artificial intelligence tools carefully selected to boost your productivity and creativity.',
        searchPlaceholder: 'Search AI tools (e.g., image generation, chatbot, analysis...)',
        searchButton: 'Search',
        exploreByCategory: 'Explore by category',
        exploreDescription: 'Quickly find the AI tools you need according to your field of activity.',
        allAiTools: 'All AI tools',
        toolsFound: 'tools found',
        filters: 'Filters',
        loadMore: 'Load more tools'
      },
      'fr': {
        discoverBest: 'Découvrez les meilleurs',
        aiTools: 'outils d\'IA',
        subtitle: 'Plus de',
        toolsDescription: 'outils d\'intelligence artificielle soigneusement sélectionnés pour booster votre productivité et créativité.',
        searchPlaceholder: 'Rechercher des outils IA (ex: génération d\'images, chatbot, analyse...)',
        searchButton: 'Rechercher',
        exploreByCategory: 'Explorer par catégorie',
        exploreDescription: 'Trouvez rapidement les outils IA dont vous avez besoin selon votre domaine d\'activité.',
        allAiTools: 'Tous les outils IA',
        toolsFound: 'outils trouvés',
        filters: 'Filtres',
        loadMore: 'Charger plus d\'outils'
      },
      'es': {
        discoverBest: 'Descubre las mejores',
        aiTools: 'herramientas de IA',
        subtitle: 'Más de',
        toolsDescription: 'herramientas de inteligencia artificial cuidadosamente seleccionadas para impulsar tu productividad y creatividad.',
        searchPlaceholder: 'Buscar herramientas IA (ej: generación de imágenes, chatbot, análisis...)',
        searchButton: 'Buscar',
        exploreByCategory: 'Explorar por categoría',
        exploreDescription: 'Encuentra rápidamente las herramientas IA que necesitas según tu campo de actividad.',
        allAiTools: 'Todas las herramientas IA',
        toolsFound: 'herramientas encontradas',
        filters: 'Filtros',
        loadMore: 'Cargar más herramientas'
      },
      'de': {
        discoverBest: 'Entdecke die besten',
        aiTools: 'KI-Tools',
        subtitle: 'Mehr als',
        toolsDescription: 'sorgfältig ausgewählte Künstliche Intelligenz Tools, um Ihre Produktivität und Kreativität zu steigern.',
        searchPlaceholder: 'KI-Tools suchen (z.B.: Bildgenerierung, Chatbot, Analyse...)',
        searchButton: 'Suchen',
        exploreByCategory: 'Nach Kategorie erkunden',
        exploreDescription: 'Finden Sie schnell die KI-Tools, die Sie für Ihr Tätigkeitsfeld benötigen.',
        allAiTools: 'Alle KI-Tools',
        toolsFound: 'Tools gefunden',
        filters: 'Filter',
        loadMore: 'Mehr Tools laden'
      },
      'it': {
        discoverBest: 'Scopri i migliori',
        aiTools: 'strumenti IA',
        subtitle: 'Più di',
        toolsDescription: 'strumenti di intelligenza artificiale accuratamente selezionati per potenziare la tua produttività e creatività.',
        searchPlaceholder: 'Cerca strumenti IA (es: generazione immagini, chatbot, analisi...)',
        searchButton: 'Cerca',
        exploreByCategory: 'Esplora per categoria',
        exploreDescription: 'Trova rapidamente gli strumenti IA di cui hai bisogno secondo il tuo campo di attività.',
        allAiTools: 'Tutti gli strumenti IA',
        toolsFound: 'strumenti trovati',
        filters: 'Filtri',
        loadMore: 'Carica più strumenti'
      },
      'nl': {
        discoverBest: 'Ontdek de beste',
        aiTools: 'AI tools',
        subtitle: 'Meer dan',
        toolsDescription: 'zorgvuldig geselecteerde kunstmatige intelligentie tools om uw productiviteit en creativiteit te verhogen.',
        searchPlaceholder: 'Zoek AI tools (bijv: beeldgeneratie, chatbot, analyse...)',
        searchButton: 'Zoeken',
        exploreByCategory: 'Verken op categorie',
        exploreDescription: 'Vind snel de AI tools die u nodig heeft volgens uw activiteitengebied.',
        allAiTools: 'Alle AI tools',
        toolsFound: 'tools gevonden',
        filters: 'Filters',
        loadMore: 'Meer tools laden'
      },
      'pt': {
        discoverBest: 'Descubra as melhores',
        aiTools: 'ferramentas de IA',
        subtitle: 'Mais de',
        toolsDescription: 'ferramentas de inteligência artificial cuidadosamente selecionadas para impulsionar sua produtividade e criatividade.',
        searchPlaceholder: 'Buscar ferramentas IA (ex: geração de imagens, chatbot, análise...)',
        searchButton: 'Buscar',
        exploreByCategory: 'Explorar por categoria',
        exploreDescription: 'Encontre rapidamente as ferramentas IA que você precisa segundo seu campo de atividade.',
        allAiTools: 'Todas as ferramentas IA',
        toolsFound: 'ferramentas encontradas',
        filters: 'Filtros',
        loadMore: 'Carregar mais ferramentas'
      }
    }
    return translations[lang] || translations['en']
  }
  
  const t = getTranslations(lang)

  // Initialize filtered tools when tools change
  React.useEffect(() => {
    setFilteredTools(tools)
  }, [tools])

  React.useEffect(() => {
    console.log('Filtering tools:', { searchQuery, filters, toolsCount: tools.length })
    
    // Filter tools based on search and filters
    let filtered = [...tools]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tool => 
        tool.displayName?.toLowerCase().includes(query) ||
        tool.description?.toLowerCase().includes(query) ||
        tool.overview?.toLowerCase().includes(query) ||
        tool.category?.toLowerCase().includes(query) ||
        tool.toolCategory?.toLowerCase().includes(query)
      )
    }

    // Apply category filters
    if (filters.categories?.length > 0) {
      filtered = filtered.filter(tool => 
        filters.categories.includes(tool.category) || 
        filters.categories.includes(tool.toolCategory)
      )
    }

    // Apply audience filters  
    if (filters.audiences?.length > 0) {
      // For now, just keep all tools since we don't have audience data on tools
      // You can implement this based on your data structure
    }

    // Apply pricing filters
    if (filters.pricing?.length > 0) {
      filtered = filtered.filter(tool => filters.pricing.includes(tool.pricing))
    }

    // Apply feature filters
    if (filters.features?.length > 0) {
      // Mock implementation - you can enhance based on actual tool features
      if (filters.features.includes('free')) {
        filtered = filtered.filter(tool => tool.pricing === 'free')
      }
    }

    // Apply quality score filter
    if (filters.qualityScore && filters.qualityScore.length === 2) {
      filtered = filtered.filter(tool => {
        const score = tool.qualityScore || 5
        return score >= filters.qualityScore[0] && score <= filters.qualityScore[1]
      })
    }

    // Apply featured filter
    if (filters.showFeatured) {
      filtered = filtered.filter(tool => tool.featured)
    }

    // Apply new filter
    if (filters.showNew) {
      filtered = filtered.filter(tool => tool.isNew)
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'popularity':
            return (b.views || 0) - (a.views || 0)
          case 'rating':
            return (b.qualityScore || 0) - (a.qualityScore || 0)
          case 'newest':
            return b.id - a.id // Assuming higher ID = newer
          case 'alphabetical':
            return a.displayName.localeCompare(b.displayName)
          case 'category':
            return a.category.localeCompare(b.category)
          default:
            return 0
        }
      })
    }

    console.log('Filtered tools:', filtered.length)
    setFilteredTools(filtered)
  }, [tools, searchQuery, filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Mobile First Design */}
      <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4 md:mb-6">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                {lang === 'en' ? 'The largest AI tools directory' :
                 lang === 'fr' ? 'Le plus grand répertoire d\'outils IA' :
                 lang === 'es' ? 'El mayor directorio de herramientas IA' :
                 lang === 'de' ? 'Das größte KI-Tools-Verzeichnis' :
                 lang === 'it' ? 'La più grande directory di strumenti IA' :
                 lang === 'nl' ? 'De grootste AI tools directory' :
                 lang === 'pt' ? 'O maior diretório de ferramentas IA' : 'Le plus grand répertoire d\'outils IA'}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t.discoverBest}
              <br />
              <span className="text-foreground">{t.aiTools}</span>
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              {t.subtitle} <strong>{totalCount.toLocaleString()}</strong> {t.toolsDescription}
            </p>

            {/* Hero Search - Mobile First */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 md:mb-12 px-4">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 md:pl-14 pr-20 md:pr-24 h-12 md:h-14 text-sm md:text-lg border-2 shadow-lg focus:shadow-xl transition-all"
                />
                <Button 
                  type="submit" 
                  size={"sm"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 md:h-10 px-3 md:px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs md:text-sm"
                >
                  {t.searchButton}
                </Button>
              </div>
            </form>

            {/* Hero Stats - Mobile First Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 px-4">
              {HERO_STATS.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6">
                      <Icon className={cn("h-6 w-6 md:h-8 md:w-8 mx-auto mb-2", stat.color)} />
                      <div className="text-lg md:text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories Section - Mobile First */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{t.exploreByCategory}</h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto px-4">
            {t.exploreDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          {FEATURED_CATEGORIES.map((category, index) => {
            // Créer un lien vers la catégorie traduite
            const categorySlug = category.name.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w\-]+/g, '')
              .replace(/\-\-+/g, '-')
              .replace(/^-+/, '')
              .replace(/-+$/, '')
            
            const categoryLink = lang === 'en' 
              ? `/categories/${categorySlug}` 
              : `/${lang}/categories/${categorySlug}`
            
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-1"
                onClick={() => window.location.href = categoryLink}
              >
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="text-2xl md:text-4xl">{category.emoji}</div>
                    <div className="flex-1">
                      <CardTitle className="group-hover:text-primary transition-colors text-sm md:text-base">
                        {category.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {category.count} {lang === 'en' ? 'tools' : 
                                       lang === 'fr' ? 'outils' :
                                       lang === 'es' ? 'herramientas' :
                                       lang === 'de' ? 'Tools' :
                                       lang === 'it' ? 'strumenti' :
                                       lang === 'nl' ? 'tools' :
                                       lang === 'pt' ? 'ferramentas' : 'outils'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{category.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tools Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-3xl font-bold mb-2">{t.allAiTools}</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {filteredTools.length} {t.toolsFound}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="hidden md:flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Toggle - Mobile First */}
            <Button
              variant={sidebarOpen ? 'default' : 'outline'}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              size={"sm"}
              className="flex items-center space-x-2 md:space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm">{t.filters}</span>
              {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
                <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
                  {Object.values(filters).reduce((acc, v) => 
                    acc + (Array.isArray(v) ? v.length : v ? 1 : 0), 0
                  )}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          {sidebarOpen && (
            <div className="hidden lg:block">
              <AdvancedFilterSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onFiltersChange={setFilters}
                categories={categories}
                audiences={audiences}
              />
            </div>
          )}

          {/* Tools Grid */}
          <div className="flex-1">
            <ModernToolGrid
              tools={filteredTools}
              lang={lang}
              onToolClick={(tool) => {
                console.log('Tool clicked:', tool)
              }}
              onBookmark={(toolId) => {
                console.log('Bookmark tool:', toolId)
              }}
              onLike={(toolId) => {
                console.log('Like tool:', toolId)
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet - You can implement this later */}
      {/* This would show the filter sidebar as a sheet on mobile when sidebarOpen is true */}
    </div>
  )
}
/**
 * Simple Homepage Client Component
 * 
 * Clean, focused homepage with search/filter and tools grid
 */

'use client'

import { useState, useEffect } from 'react'
import { SupportedLocale } from '@/middleware'
import { Container } from '@/src/components/ui/Container'
import { UniversalSearchFilters } from '@/src/components/common/UniversalSearchFilters'
import SimpleToolsGrid from '@/src/components/tools/SimpleToolsGrid'
import { getSearchFiltersConfig } from '@/src/config/searchFilters'
import type { FilterState } from '@/src/types/search'

interface SimpleHomepageClientProps {
  lang: SupportedLocale
  audiences: Array<{ name: string; count: number }>
  useCases: Array<{ name: string; count: number }>
  categories: Array<{ name: string; slug: string; toolCount?: number }>
  stats: {
    totalTools: number
    totalCategories: number
    totalAudiences: number
    totalUseCases: number
  }
}

export default function SimpleHomepageClient({
  lang,
  audiences,
  useCases,
  categories,
  stats
}: SimpleHomepageClientProps) {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    search: '',
    category: '',
    featured: '',
    status: '',
    qualityScore: '',
    toolCount: '',
    hasTools: '',
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  // Textes localisés
  const texts = {
    en: {
      title: 'Find the Perfect AI Tool',
      subtitle: 'Discover 16,765+ verified AI tools for your specific needs',
      searchPlaceholder: 'Search AI tools...',
      noResults: 'No tools found',
      noResultsDesc: 'Try adjusting your search criteria or filters',
      resetFilters: 'Reset Filters',
      toolsFound: 'tools found'
    },
    fr: {
      title: 'Trouvez l\'Outil IA Parfait',
      subtitle: 'Découvrez 16 765+ outils IA vérifiés pour vos besoins spécifiques',
      searchPlaceholder: 'Rechercher des outils IA...',
      noResults: 'Aucun outil trouvé',
      noResultsDesc: 'Essayez de modifier vos critères de recherche ou vos filtres',
      resetFilters: 'Réinitialiser les Filtres',
      toolsFound: 'outils trouvés'
    },
    it: {
      title: 'Trova lo Strumento AI Perfetto',
      subtitle: 'Scopri 16.765+ strumenti AI verificati per le tue esigenze specifiche',
      searchPlaceholder: 'Cerca strumenti AI...',
      noResults: 'Nessuno strumento trovato',
      noResultsDesc: 'Prova a modificare i tuoi criteri di ricerca o filtri',
      resetFilters: 'Reimposta Filtri',
      toolsFound: 'strumenti trovati'
    },
    es: {
      title: 'Encuentra la Herramienta IA Perfecta',
      subtitle: 'Descubre 16.765+ herramientas IA verificadas para tus necesidades específicas',
      searchPlaceholder: 'Buscar herramientas IA...',
      noResults: 'No se encontraron herramientas',
      noResultsDesc: 'Intenta ajustar tus criterios de búsqueda o filtros',
      resetFilters: 'Restablecer Filtros',
      toolsFound: 'herramientas encontradas'
    },
    de: {
      title: 'Finden Sie das Perfekte KI-Tool',
      subtitle: 'Entdecken Sie 16.765+ verifizierte KI-Tools für Ihre spezifischen Bedürfnisse',
      searchPlaceholder: 'KI-Tools suchen...',
      noResults: 'Keine Tools gefunden',
      noResultsDesc: 'Versuchen Sie, Ihre Suchkriterien oder Filter anzupassen',
      resetFilters: 'Filter Zurücksetzen',
      toolsFound: 'Tools gefunden'
    },
    nl: {
      title: 'Vind de Perfecte AI Tool',
      subtitle: 'Ontdek 16.765+ geverifieerde AI-tools voor jouw specifieke behoeften',
      searchPlaceholder: 'Zoek AI-tools...',
      noResults: 'Geen tools gevonden',
      noResultsDesc: 'Probeer je zoekcriteria of filters aan te passen',
      resetFilters: 'Filters Resetten',
      toolsFound: 'tools gevonden'
    },
    pt: {
      title: 'Encontre a Ferramenta IA Perfeita',
      subtitle: 'Descubra 16.765+ ferramentas IA verificadas para suas necessidades específicas',
      searchPlaceholder: 'Pesquisar ferramentas IA...',
      noResults: 'Nenhuma ferramenta encontrada',
      noResultsDesc: 'Tente ajustar seus critérios de pesquisa ou filtros',
      resetFilters: 'Redefinir Filtros',
      toolsFound: 'ferramentas encontradas'
    }
  }

  const currentTexts = texts[lang] || texts['en']

  // Gestionnaire de changement de filtres
  const handleFiltersChange = async (filters: FilterState) => {
    try {
      setCurrentFilters(filters)
      setLoading(true)

      // Construire les paramètres de recherche
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.category) params.set('category', filters.category)
      if (filters.featured) params.set('featured', filters.featured)
      if (filters.qualityScore) params.set('qualityScore', filters.qualityScore)
      if (filters.sortBy) params.set('sortBy', filters.sortBy)
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
      params.set('lang', lang)
      params.set('limit', '24')

      // Appeler l'API des outils
      const response = await fetch(`/api/tools?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setTools(data.data || [])
        setTotalCount(data.pagination?.totalCount || 0)
      } else {
        console.error('API error:', data.error)
        setTools([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error loading tools:', error)
      setTools([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Configuration pour le composant de recherche
  const searchConfig = getSearchFiltersConfig('homepage-tools', 'tools', handleFiltersChange)
  
  // Mettre à jour le placeholder de recherche
  searchConfig.searchPlaceholder = currentTexts.searchPlaceholder

  // Charger les outils initiaux
  useEffect(() => {
    handleFiltersChange(currentFilters)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <Container size="xl" className="py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              {currentTexts.title}
            </h1>
            <p className="text-xl md:text-2xl text-white opacity-90 max-w-3xl mx-auto">
              {currentTexts.subtitle}
            </p>
          </div>
        </Container>
      </section>

      {/* Search and Filters */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <Container size="xl" className="py-8">
          <UniversalSearchFilters config={searchConfig} />
        </Container>
      </section>

      {/* Results Summary */}
      <section className="bg-gray-100 border-b border-gray-200">
        <Container size="xl" className="py-4">
          <div className="text-center sm:text-left">
            <p className="text-gray-700">
              {loading ? (
                <span className="animate-pulse text-gray-600">Loading...</span>
              ) : (
                <>
                  <span className="font-semibold text-gray-900">
                    {totalCount.toLocaleString()}
                  </span>
                  <span className="ml-1 text-gray-700">{currentTexts.toolsFound}</span>
                  {currentFilters.search && (
                    <span className="ml-1 text-gray-700">
                      for "<span className="font-medium text-blue-600">{currentFilters.search}</span>"
                    </span>
                  )}
                  {currentFilters.category && (
                    <span className="ml-1 text-gray-700">
                      in <span className="font-medium text-blue-600">{currentFilters.category}</span>
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </Container>
      </section>

      {/* Tools Grid */}
      <section className="bg-gray-50 min-h-screen">
        <Container size="xl" className="py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tools.length > 0 ? (
            <SimpleToolsGrid tools={tools} lang={lang} />
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentTexts.noResults}
                </h3>
                <p className="text-gray-600 mb-6">
                  {currentTexts.noResultsDesc}
                </p>
                <button
                  onClick={() => handleFiltersChange({
                    search: '',
                    category: '',
                    featured: '',
                    status: '',
                    qualityScore: '',
                    toolCount: '',
                    hasTools: '',
                    tags: [],
                    sortBy: 'created_at',
                    sortOrder: 'desc'
                  })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {currentTexts.resetFilters}
                </button>
              </div>
            </div>
          )}
        </Container>
      </section>
    </div>
  )
}
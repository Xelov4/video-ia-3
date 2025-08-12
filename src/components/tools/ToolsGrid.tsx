/**
 * Tools Grid Component
 * Professional grid display for tools with filtering and pagination
 */

'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools'
import { ToolCard } from './ToolCard'
import { formatNumber } from '@/src/lib/utils/formatNumbers'
import { 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface ToolsGridProps {
  tools: ToolWithTranslation[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  showCategory?: boolean
  lang?: string
}

export const ToolsGrid = ({ 
  tools, 
  totalCount, 
  currentPage, 
  totalPages, 
  hasNextPage, 
  hasPreviousPage,
  showCategory = true,
  lang = 'en'
}: ToolsGridProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Multilingual messages
  const messages = {
    'en': {
      toolsFound: 'tools found',
      page: 'Page',
      of: 'of',
      filters: 'Filters',
      featured: 'Featured',
      allTools: 'All tools',
      featuredOnly: 'Featured only',
      notFeatured: 'Not featured',
      qualityScore: 'Minimum quality score',
      allScores: 'All scores',
      premium: '8+ (Premium)',
      good: '6+ (Good)',
      correct: '4+ (Correct)',
      clearFilters: 'Clear filters',
      previous: 'Previous',
      next: 'Next'
    },
    'fr': {
      toolsFound: 'outils trouvés',
      page: 'Page',
      of: 'sur',
      filters: 'Filtres',
      featured: 'Mise en vedette',
      allTools: 'Tous les outils',
      featuredOnly: 'En vedette uniquement',
      notFeatured: 'Non en vedette',
      qualityScore: 'Score qualité minimum',
      allScores: 'Tous les scores',
      premium: '8+ (Premium)',
      good: '6+ (Bon)',
      correct: '4+ (Correct)',
      clearFilters: 'Effacer les filtres',
      previous: 'Précédent',
      next: 'Suivant'
    },
    'de': {
      toolsFound: 'Tools gefunden',
      page: 'Seite',
      of: 'von',
      filters: 'Filter',
      featured: 'Empfohlen',
      allTools: 'Alle Tools',
      featuredOnly: 'Nur empfohlene',
      notFeatured: 'Nicht empfohlen',
      qualityScore: 'Mindestqualitätsscore',
      allScores: 'Alle Scores',
      premium: '8+ (Premium)',
      good: '6+ (Gut)',
      correct: '4+ (Korrekt)',
      clearFilters: 'Filter löschen',
      previous: 'Zurück',
      next: 'Weiter'
    },
    'nl': {
      toolsFound: 'tools gevonden',
      page: 'Pagina',
      of: 'van',
      filters: 'Filters',
      featured: 'Uitgelicht',
      allTools: 'Alle tools',
      featuredOnly: 'Alleen uitgelicht',
      notFeatured: 'Niet uitgelicht',
      qualityScore: 'Minimale kwaliteitsscore',
      allScores: 'Alle scores',
      premium: '8+ (Premium)',
      good: '6+ (Goed)',
      correct: '4+ (Correct)',
      clearFilters: 'Filters wissen',
      previous: 'Vorige',
      next: 'Volgende'
    },
    'es': {
      toolsFound: 'herramientas encontradas',
      page: 'Página',
      of: 'de',
      filters: 'Filtros',
      featured: 'Destacado',
      allTools: 'Todas las herramientas',
      featuredOnly: 'Solo destacadas',
      notFeatured: 'No destacadas',
      qualityScore: 'Puntuación mínima de calidad',
      allScores: 'Todas las puntuaciones',
      premium: '8+ (Premium)',
      good: '6+ (Bueno)',
      correct: '4+ (Correcto)',
      clearFilters: 'Limpiar filtros',
      previous: 'Anterior',
      next: 'Siguiente'
    },
    'it': {
      toolsFound: 'strumenti trovati',
      page: 'Pagina',
      of: 'di',
      filters: 'Filtri',
      featured: 'In evidenza',
      allTools: 'Tutti gli strumenti',
      featuredOnly: 'Solo in evidenza',
      notFeatured: 'Non in evidenza',
      qualityScore: 'Punteggio qualità minimo',
      allScores: 'Tutti i punteggi',
      premium: '8+ (Premium)',
      good: '6+ (Buono)',
      correct: '4+ (Corretto)',
      clearFilters: 'Cancella filtri',
      previous: 'Precedente',
      next: 'Successivo'
    },
    'pt': {
      toolsFound: 'ferramentas encontradas',
      page: 'Página',
      of: 'de',
      filters: 'Filtros',
      featured: 'Destaque',
      allTools: 'Todas as ferramentas',
      featuredOnly: 'Apenas destacadas',
      notFeatured: 'Não destacadas',
      qualityScore: 'Pontuação mínima de qualidade',
      allScores: 'Todas as pontuações',
      premium: '8+ (Premium)',
      good: '6+ (Bom)',
      correct: '4+ (Correto)',
      clearFilters: 'Limpar filtros',
      previous: 'Anterior',
      next: 'Próximo'
    }
  }

  const t = messages[lang as keyof typeof messages] || messages['en']

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    })
    
    return newSearchParams.toString()
  }

  const handlePageChange = (page: number) => {
    const queryString = createQueryString({ page: page.toString() })
    router.push(`${pathname}?${queryString}`)
  }

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const queryString = createQueryString({ 
      sort: sortBy, 
      order: sortOrder,
      page: '1' // Reset to first page
    })
    router.push(`${pathname}?${queryString}`)
  }

  const handleFeaturedFilter = (featured: string | null) => {
    const queryString = createQueryString({ 
      featured,
      page: '1' // Reset to first page
    })
    router.push(`${pathname}?${queryString}`)
  }

  const currentSort = searchParams.get('sort') || 'created_at'
  const currentOrder = searchParams.get('order') || 'desc'
  const currentFeatured = searchParams.get('featured')

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Results Info */}
        <div className="text-gray-300">
          <span className="font-semibold text-white">{formatNumber(totalCount)}</span> {t.toolsFound}
          {currentPage > 1 && (
            <span className="ml-2">
              • {t.page} {currentPage} {t.of} {totalPages}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            {t.filters}
          </button>

          {/* Sort Dropdown */}
          <select
            value={`${currentSort}-${currentOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-')
              handleSortChange(sort, order)
            }}
            className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="created_at-desc">Plus récents</option>
            <option value="created_at-asc">Plus anciens</option>
            <option value="view_count-desc">Plus populaires</option>
            <option value="quality_score-desc">Meilleur score</option>
            <option value="tool_name-asc">A-Z</option>
            <option value="tool_name-desc">Z-A</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.featured}
              </label>
              <select
                value={currentFeatured || ''}
                onChange={(e) => handleFeaturedFilter(e.target.value || null)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">{t.allTools}</option>
                <option value="true">{t.featuredOnly}</option>
                <option value="false">{t.notFeatured}</option>
              </select>
            </div>

            {/* Quality Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.qualityScore}
              </label>
              <select
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">{t.allScores}</option>
                <option value="8">{t.premium}</option>
                <option value="6">{t.good}</option>
                <option value="4">{t.correct}</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => router.push(pathname)}
                className="w-full px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                {t.clearFilters}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tools Grid/List */}
      {tools.length > 0 ? (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {tools.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                showCategory={showCategory}
                size={viewMode === 'list' ? 'small' : 'medium'}
                lang={lang}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-8">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  hasPreviousPage
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-600/50 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                {t.previous}
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  hasNextPage
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-600/50 text-gray-500 cursor-not-allowed'
                }`}
              >
                {t.next}
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Squares2X2Icon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Aucun outil trouvé
          </h3>
          <p className="text-gray-300">
            Essayez de modifier vos critères de recherche ou supprimez certains filtres.
          </p>
        </div>
      )}
    </div>
  )
}
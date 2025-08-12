'use client'

import { SupportedLocale } from '@/middleware'
import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools'
import { CategoryWithTranslation } from '@/src/lib/database/services/multilingual-categories'
import { ToolsGrid } from './ToolsGrid'
import { ToolCard } from './ToolCard'

interface ToolsPageClientProps {
  tools: ToolWithTranslation[]
  categories: CategoryWithTranslation[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  lang: SupportedLocale
  search?: string
  category?: string
  sortBy: 'name' | 'created_at' | 'view_count' | 'quality_score'
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
  messages: {
    home: string
    tools: string
    allTools: string
    searchResults: string
    toolsDescription: string
    page: string
    of: string
    errorLoading: string
    errorTryAgain: string
    reload: string
  }
}

export default function ToolsPageClient({
  tools,
  categories,
  totalCount,
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  lang,
  search,
  category,
  sortBy,
  sortOrder,
  viewMode,
  messages
}: ToolsPageClientProps) {
  const buildQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams()
    
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
    const queryString = buildQueryString({ page: page.toString() })
    window.location.href = `/${lang}/tools?${queryString}`
  }

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const queryString = buildQueryString({ 
      sort: sortBy, 
      order: sortOrder,
      page: '1' // Reset to first page
    })
    window.location.href = `/${lang}/tools?${queryString}`
  }

  const handleFeaturedFilter = (featured: string | null) => {
    const queryString = buildQueryString({ 
      featured,
      page: '1' // Reset to first page
    })
    window.location.href = `/${lang}/tools?${queryString}`
  }

  const generatePageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
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

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {tools.length > 0 ? (
        <div className="space-y-6">
          {/* Barre d'outils */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * 24) + 1}-{Math.min(currentPage * 24, totalCount)} 
              of {totalCount.toLocaleString()} results
            </span>
            
            <div className="flex items-center gap-4">
              {/* Mode de vue */}
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                <a
                  href={`/${lang}/tools?${buildQueryString({ view: 'grid' })}`}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Grid
                </a>
                <a
                  href={`/${lang}/tools?${buildQueryString({ view: 'list' })}`}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  List
                </a>
              </div>
            </div>
          </div>
          
          {/* Affichage des outils */}
          {viewMode === 'grid' ? (
            <ToolsGrid 
              tools={tools} 
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              showCategory={true}
            />
          ) : (
            <div className="space-y-4">
              {tools.map((tool) => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  showCategory={true}
                  size="small"
                />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center space-x-2 mt-12">
              {/* Page précédente */}
              {hasPreviousPage && (
                <a
                  href={`/${lang}/tools?${buildQueryString({ page: (currentPage-1).toString() })}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </a>
              )}
              
              {/* Numéros de pages */}
              {generatePageNumbers(currentPage, totalPages).map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={idx} className="px-3 py-2 text-sm text-gray-500">...</span>
                ) : (
                  <a
                    key={idx}
                    href={`/${lang}/tools?${buildQueryString({ page: pageNum.toString() })}`}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </a>
                )
              ))}
              
              {/* Page suivante */}
              {hasNextPage && (
                <a
                  href={`/${lang}/tools?${buildQueryString({ page: (currentPage+1).toString() })}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
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
            No Tools Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {search ? 'Try adjusting your search terms or filters' : 'No tools found in this category'}
          </p>
          <div className="space-y-2">
            <a
              href={`/${lang}/tools`}
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Tools
            </a>
          </div>
        </div>
      )}
    </main>
  )
} 
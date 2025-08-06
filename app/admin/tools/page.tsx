/**
 * Admin Tools Management Page
 * Interface for managing all AI tools in the database
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { toolsService } from '@/src/lib/database/services/tools'
import { ToolsTable } from '@/src/components/admin/ToolsTable'
import { SearchAndFilters } from '@/src/components/admin/SearchAndFilters'
import { PlusIcon } from '@heroicons/react/24/outline'
import { formatNumber } from '@/src/lib/utils/formatNumbers'

export const dynamic = 'force-dynamic'

interface ToolsPageProps {
  searchParams: {
    page?: string
    search?: string
    category?: string
    featured?: string
    sortBy?: string
    sortOrder?: string
  }
}

export default async function AdminToolsPage({ searchParams }: ToolsPageProps) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const search = searchParams.search || undefined
  const category = searchParams.category || undefined
  const featured = searchParams.featured === 'true' ? true : 
                   searchParams.featured === 'false' ? false : undefined
  const sortBy = searchParams.sortBy || 'created_at'
  const sortOrder = searchParams.sortOrder || 'desc'

  // Fetch tools with current filters
  const result = await toolsService.searchTools({
    query: search,
    category,
    featured,
    page,
    limit,
    sortBy,
    sortOrder
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des outils</h1>
          <p className="mt-2 text-gray-600">
            Gérez les {formatNumber(result.totalCount)} outils IA de votre plateforme
          </p>
        </div>
        <Link
          href="/admin/tools/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Ajouter un outil
        </Link>
      </div>

      {/* Search and Filters */}
      <SearchAndFilters />

      {/* Tools Table */}
      <Suspense fallback={<div>Chargement...</div>}>
        <ToolsTable
          tools={result.tools}
          pagination={{
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalCount: result.totalCount,
            hasNextPage: result.hasNextPage,
            hasPreviousPage: result.hasPreviousPage
          }}
        />
      </Suspense>
    </div>
  )
}
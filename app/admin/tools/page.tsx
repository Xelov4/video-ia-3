/**
 * Admin Tools Management Page
 * Simple and efficient tools management interface
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { AdminToolsContent } from '@/src/components/admin/AdminToolsContent'

export const dynamic = 'force-dynamic'

interface ToolsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    featured?: string
    sortBy?: string
    sortOrder?: string
  }>
}

export default async function AdminToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            Gestion des outils
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Interface d'administration des outils IA
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link
            href="/admin/tools/new"
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Ajouter un outil</span>
            <span className="sm:hidden">Ajouter</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <Suspense fallback={<AdminToolsLoading />}>
        <AdminToolsContent searchParams={params} />
      </Suspense>
    </div>
  )
}

// Loading component
function AdminToolsLoading() {
  return (
    <div className="space-y-6">
      {/* Filters Loading */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Loading */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
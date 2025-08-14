/**
 * Tools Table Component
 * Displays tools in a table format with actions
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DatabaseTool } from '@/src/lib/database/services/tools'
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { formatNumber } from '@/src/lib/utils/formatNumbers'

interface ToolsTableProps {
  tools: DatabaseTool[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export const ToolsTable = ({ tools, pagination }: ToolsTableProps) => {
  const [selectedTools, setSelectedTools] = useState<number[]>([])

  const toggleToolSelection = (toolId: number) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }

  const toggleAllSelection = () => {
    if (selectedTools.length === tools.length) {
      setSelectedTools([])
    } else {
      setSelectedTools(tools.map(tool => tool.id))
    }
  }

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 7
    const current = pagination.currentPage
    const total = pagination.totalPages

    if (total <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Show pages around current page
      if (current <= 4) {
        // Near start
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      } else if (current >= total - 3) {
        // Near end
        pages.push(1)
        pages.push('...')
        for (let i = total - 4; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // In middle
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      }
    }

    return pages
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Outils ({formatNumber(pagination.totalCount)})
          </h3>
          {selectedTools.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedTools.length} sélectionné(s)
              </span>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                Actions groupées
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200">
          {tools.map((tool) => (
            <div key={tool.id} className="p-4 space-y-3">
              {/* Tool Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.id)}
                    onChange={() => toggleToolSelection(tool.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-shrink-0 h-12 w-12">
                    {tool.image_url ? (
                      <Image
                        src={tool.image_url}
                        alt={tool.tool_name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {tool.tool_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {tool.tool_name}
                      </h4>
                      {tool.featured && (
                        <StarSolidIcon className="w-4 h-4 text-yellow-400 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {tool.overview || 'Aucune description'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {tool.tool_link ? (
                          <a href={tool.tool_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                            🔗 Lien
                          </a>
                        ) : 'Pas de lien'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tool Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Catégorie:</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tool.tool_category}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Statut:</span>
                  <div className="mt-1 space-y-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tool.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tool.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    {tool.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Vedette
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Vues:</span>
                  <div className="mt-1 text-gray-600">
                    {formatNumber(tool.view_count || 0)}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Score:</span>
                  <div className="mt-1 text-gray-600">
                    {tool.quality_score || 0}/10
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Créé:</span>
                  <div className="mt-1 text-gray-600 text-xs">
                    {tool.created_at ? new Date(tool.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Modifié:</span>
                  <div className="mt-1 text-gray-600 text-xs">
                    {tool.updated_at ? new Date(tool.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <Link
                  href={`/tools/${tool.slug || tool.id}`}
                  target="_blank"
                  className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                  title="Voir sur le site"
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={`/admin/tools/${tool.id}/edit`}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                  title="Modifier"
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>
                <button
                  className="text-gray-400 hover:text-red-600 transition-colors p-2"
                  title="Supprimer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTools.length === tools.length}
                  onChange={toggleAllSelection}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outil
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statistiques
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tools.map((tool) => (
              <tr key={tool.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.id)}
                    onChange={() => toggleToolSelection(tool.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {tool.image_url ? (
                        <Image
                          src={tool.image_url}
                          alt={tool.tool_name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {tool.tool_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {tool.tool_name}
                        </div>
                        {tool.featured && (
                          <StarSolidIcon className="w-4 h-4 text-yellow-400 ml-2" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {tool.overview || 'Aucune description'}
                      </div>
                      {tool.tool_link && (
                        <div className="text-xs text-gray-400 mt-1">
                          <a href={tool.tool_link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                            🔗 {tool.tool_link}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tool.tool_category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tool.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tool.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    {tool.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Vedette
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 text-gray-400 mr-1" />
                      {formatNumber(tool.view_count || 0)} vues
                    </div>
                    <div className="text-xs text-gray-500">
                      Score: {tool.quality_score || 0}/10
                    </div>
                    <div className="text-xs text-gray-500">
                      Clics: {formatNumber(tool.click_count || 0)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="font-medium">Créé:</span><br/>
                      {tool.created_at ? new Date(tool.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Modifié:</span><br/>
                      {tool.updated_at ? new Date(tool.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/tools/${tool.slug || tool.id}`}
                      target="_blank"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Voir sur le site"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/tools/${tool.id}/edit`}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700 text-center sm:text-left">
            <span className="font-medium">
              Page {pagination.currentPage} sur {pagination.totalPages}
            </span>
            <span className="ml-2 text-gray-500">
              ({formatNumber(pagination.totalCount)} outils au total)
            </span>
          </div>
          
          {/* Page Numbers */}
          <div className="flex items-center justify-center space-x-1">
            {/* Previous Button */}
            <Link
              href={`?page=${pagination.currentPage - 1}`}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md transition-colors ${
                pagination.hasPreviousPage
                  ? 'text-gray-700 bg-white hover:bg-gray-50'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Précédent
            </Link>

            {/* Page Numbers */}
            {generatePageNumbers().map((pageNum, index) => (
              <span key={index}>
                {pageNum === '...' ? (
                  <span className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <Link
                    href={`?page=${pageNum}`}
                    className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                      pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )}
              </span>
            ))}

            {/* Next Button */}
            <Link
              href={`?page=${pagination.currentPage + 1}`}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md transition-colors ${
                pagination.hasNextPage
                  ? 'text-gray-700 bg-white hover:bg-gray-50'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              Suivant
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
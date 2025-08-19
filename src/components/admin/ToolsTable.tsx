/**
 * Tools Table Component
 * Displays tools in a table format with actions
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { formatNumber } from '@/src/lib/utils/formatNumbers';

interface ToolsTableProps {
  tools: ToolWithTranslation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const ToolsTable = ({ tools, pagination }: ToolsTableProps) => {
  const [selectedTools, setSelectedTools] = useState<number[]>([]);

  const toggleToolSelection = (toolId: number) => {
    setSelectedTools(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedTools.length === tools.length) {
      setSelectedTools([]);
    } else {
      setSelectedTools(tools.map(tool => tool.id));
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    const current = pagination.currentPage;
    const total = pagination.totalPages;

    if (total <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      if (current <= 4) {
        // Near start
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        // Near end
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // In middle
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  };

  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
      {/* Table Header */}
      <div className='border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Outils ({formatNumber(pagination.totalCount)})
          </h3>
          {selectedTools.length > 0 && (
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-600'>
                {selectedTools.length} sélectionné(s)
              </span>
              <button className='rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700'>
                Actions groupées
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className='lg:hidden'>
        <div className='divide-y divide-gray-200'>
          {tools.map(tool => (
            <div key={tool.id} className='space-y-3 p-4'>
              {/* Tool Header */}
              <div className='flex items-start justify-between'>
                <div className='flex items-center space-x-3'>
                  <input
                    type='checkbox'
                    checked={selectedTools.includes(tool.id)}
                    onChange={() => toggleToolSelection(tool.id)}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <div className='h-12 w-12 flex-shrink-0'>
                    {tool.image_url ? (
                      <Image
                        src={tool.image_url}
                        alt={tool.tool_name}
                        width={48}
                        height={48}
                        className='rounded-lg object-cover'
                      />
                    ) : (
                      <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600'>
                        <span className='text-sm font-semibold text-white'>
                          {tool.tool_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center'>
                      <h4 className='truncate text-sm font-medium text-gray-900'>
                        {tool.tool_name}
                      </h4>
                      {tool.featured && (
                        <StarSolidIcon className='ml-2 h-4 w-4 flex-shrink-0 text-yellow-400' />
                      )}
                    </div>
                    <p className='truncate text-sm text-gray-500'>
                      {tool.overview || 'Aucune description'}
                    </p>
                    <div className='mt-1 flex items-center space-x-2'>
                      <span className='text-xs text-gray-400'>
                        {tool.tool_link ? (
                          <a
                            href={tool.tool_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:text-blue-600'
                          >
                            🔗 Lien
                          </a>
                        ) : (
                          'Pas de lien'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tool Details */}
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='font-medium text-gray-700'>Catégorie:</span>
                  <div className='mt-1'>
                    <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800'>
                      {tool.tool_category}
                    </span>
                  </div>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Statut:</span>
                  <div className='mt-1 space-y-1'>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        tool.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tool.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    {tool.featured && (
                      <span className='inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800'>
                        Vedette
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Vues:</span>
                  <div className='mt-1 text-gray-600'>
                    {formatNumber(tool.view_count || 0)}
                  </div>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Score:</span>
                  <div className='mt-1 text-gray-600'>{tool.quality_score || 0}/10</div>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Créé:</span>
                  <div className='mt-1 text-xs text-gray-600'>
                    {tool.created_at
                      ? new Date(tool.created_at).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Modifié:</span>
                  <div className='mt-1 text-xs text-gray-600'>
                    {tool.updated_at
                      ? new Date(tool.updated_at).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='flex items-center justify-end space-x-2 border-t border-gray-100 pt-2'>
                <Link
                  href={`/tools/${tool.slug || tool.id}`}
                  target='_blank'
                  className='p-2 text-gray-400 transition-colors hover:text-blue-600'
                  title='Voir sur le site'
                >
                  <EyeIcon className='h-4 w-4' />
                </Link>
                <Link
                  href={`/admin/tools/${tool.id}/edit`}
                  className='p-2 text-gray-400 transition-colors hover:text-blue-600'
                  title='Modifier'
                >
                  <PencilIcon className='h-4 w-4' />
                </Link>
                <button
                  className='p-2 text-gray-400 transition-colors hover:text-red-600'
                  title='Supprimer'
                >
                  <TrashIcon className='h-4 w-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className='hidden overflow-x-auto lg:block'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left'>
                <input
                  type='checkbox'
                  checked={selectedTools.length === tools.length}
                  onChange={toggleAllSelection}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Outil
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Catégorie
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Statut
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Statistiques
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Dates
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {tools.map(tool => (
              <tr key={tool.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4'>
                  <input
                    type='checkbox'
                    checked={selectedTools.includes(tool.id)}
                    onChange={() => toggleToolSelection(tool.id)}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-900'>
                  <div className='flex items-center'>
                    <div className='h-10 w-10 flex-shrink-0'>
                      <Image
                        src={tool.imageUrl || '/images/placeholders/tool-1.jpg'}
                        alt={tool.toolName}
                        width={40}
                        height={40}
                        className='h-10 w-10 rounded-full object-cover'
                      />
                    </div>
                    <div className='ml-4'>
                      <div className='font-medium text-gray-900'>{tool.toolName}</div>
                      <div className='text-gray-500'>{tool.toolCategory}</div>
                    </div>
                  </div>
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                  <a
                    href={tool.toolLink || '#'}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:text-blue-800'
                  >
                    {tool.toolLink ? 'Voir' : 'N/A'}
                  </a>
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                  {tool.toolCategory || 'N/A'}
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                      tool.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tool.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                      tool.isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {tool.isActive ? 'Visible' : 'Masqué'}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  <div className='space-y-1'>
                    <div className='flex items-center'>
                      <EyeIcon className='mr-1 h-4 w-4 text-gray-400' />
                      {formatNumber(tool.view_count || 0)} vues
                    </div>
                    <div className='text-xs text-gray-500'>
                      Score: {tool.quality_score || 0}/10
                    </div>
                    <div className='text-xs text-gray-500'>
                      Clics: {formatNumber(tool.click_count || 0)}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  <div className='space-y-1'>
                    <div className='text-xs'>
                      <span className='font-medium'>Créé:</span>
                      <br />
                      {tool.created_at
                        ? new Date(tool.created_at).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </div>
                    <div className='text-xs'>
                      <span className='font-medium'>Modifié:</span>
                      <br />
                      {tool.updated_at
                        ? new Date(tool.updated_at).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center space-x-2'>
                    <Link
                      href={`/tools/${tool.slug || tool.id}`}
                      target='_blank'
                      className='text-gray-400 transition-colors hover:text-blue-600'
                      title='Voir sur le site'
                    >
                      <EyeIcon className='h-4 w-4' />
                    </Link>
                    <Link
                      href={`/admin/tools/${tool.id}/edit`}
                      className='text-gray-400 transition-colors hover:text-blue-600'
                      title='Modifier'
                    >
                      <PencilIcon className='h-4 w-4' />
                    </Link>
                    <button
                      className='text-gray-400 transition-colors hover:text-red-600'
                      title='Supprimer'
                    >
                      <TrashIcon className='h-4 w-4' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      <div className='border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-center text-sm text-gray-700 sm:text-left'>
            <span className='font-medium'>
              Page {pagination.currentPage} sur {pagination.totalPages}
            </span>
            <span className='ml-2 text-gray-500'>
              ({formatNumber(pagination.totalCount)} outils au total)
            </span>
          </div>

          {/* Page Numbers */}
          <div className='flex items-center justify-center space-x-1'>
            {/* Previous Button */}
            <Link
              href={`?page=${pagination.currentPage - 1}`}
              className={`inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium transition-colors ${
                pagination.hasPreviousPage
                  ? 'bg-white text-gray-700 hover:bg-gray-50'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              }`}
            >
              <ChevronLeftIcon className='mr-1 h-4 w-4' />
              Précédent
            </Link>

            {/* Page Numbers */}
            {generatePageNumbers().map((pageNum, index) => (
              <span key={index}>
                {pageNum === '...' ? (
                  <span className='px-3 py-2 text-gray-500'>...</span>
                ) : (
                  <Link
                    href={`?page=${pageNum}`}
                    className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      pageNum === pagination.currentPage
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
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
              className={`inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium transition-colors ${
                pagination.hasNextPage
                  ? 'bg-white text-gray-700 hover:bg-gray-50'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              }`}
            >
              Suivant
              <ChevronRightIcon className='ml-1 h-4 w-4' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

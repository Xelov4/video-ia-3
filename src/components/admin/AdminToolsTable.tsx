/**
 * Admin Tools Table with Bulk Actions
 * Table professionnelle avec sélection multiple et actions de masse
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { formatNumber } from '@/src/lib/utils/formatNumbers';

interface Tool {
  id: number;
  tool_name: string;
  tool_category: string;
  overview: string;
  is_active: boolean;
  featured: boolean;
  view_count: number;
  quality_score: number;
  created_at: string;
  updated_at: string;
}

interface AdminToolsTableProps {
  tools: Tool[];
  loading: boolean;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onBulkAction: (action: string, ids: number[]) => void;
  onEditTool: (toolId: number) => void;
  onDeleteTool: (toolId: number) => void;
  onToggleFeatured: (toolId: number) => void;
  onToggleStatus: (toolId: number) => void;
}

const BULK_ACTIONS = [
  { value: 'feature', label: '⭐ Mettre en vedette', icon: StarIcon },
  { value: 'unfeature', label: '⭐ Retirer de la vedette', icon: StarIcon },
  { value: 'activate', label: '✅ Activer', icon: CheckIcon },
  { value: 'deactivate', label: '❌ Désactiver', icon: XMarkIcon },
  { value: 'duplicate', label: '📋 Dupliquer', icon: DocumentDuplicateIcon },
  { value: 'archive', label: '📦 Archiver', icon: ArchiveBoxIcon },
  { value: 'export', label: '📊 Exporter', icon: ClipboardDocumentListIcon },
  { value: 'delete', label: '🗑️ Supprimer', icon: TrashIcon, danger: true },
];

export function AdminToolsTable({
  tools,
  loading,
  selectedIds,
  onSelectionChange,
  onBulkAction,
  onEditTool,
  onDeleteTool,
  onToggleFeatured,
  onToggleStatus,
}: AdminToolsTableProps) {
  const [bulkAction, setBulkAction] = useState('');

  // Selection handlers
  const isAllSelected = tools.length > 0 && selectedIds.length === tools.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < tools.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tools.map(tool => tool.id));
    }
  };

  const toggleSelectTool = (toolId: number) => {
    if (selectedIds.includes(toolId)) {
      onSelectionChange(selectedIds.filter(id => id !== toolId));
    } else {
      onSelectionChange([...selectedIds, toolId]);
    }
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedIds.length > 0) {
      onBulkAction(bulkAction, selectedIds);
      setBulkAction('');
      onSelectionChange([]); // Clear selection after action
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white'>
        <div className='p-6'>
          <div className='animate-pulse space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-16 rounded bg-gray-200'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className='border-b border-gray-200 bg-blue-50 px-6 py-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center space-x-4'>
              <span className='text-sm font-medium text-blue-900'>
                {selectedIds.length} outil{selectedIds.length > 1 ? 's' : ''}{' '}
                sélectionné{selectedIds.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => onSelectionChange([])}
                className='text-sm text-blue-700 underline hover:text-blue-900'
              >
                Tout désélectionner
              </button>
            </div>

            <div className='flex items-center space-x-2'>
              <select
                value={bulkAction}
                onChange={e => setBulkAction(e.target.value)}
                className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Choisir une action...</option>
                {BULK_ACTIONS.map(action => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  bulkAction && !BULK_ACTIONS.find(a => a.value === bulkAction)?.danger
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : bulkAction &&
                        BULK_ACTIONS.find(a => a.value === bulkAction)?.danger
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th scope='col' className='relative px-6 py-3'>
                <input
                  type='checkbox'
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={toggleSelectAll}
                  className='absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
              >
                Outil
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
              >
                Catégorie
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
              >
                Statut
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
              >
                Score
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
              >
                Vues
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
              >
                Mis à jour
              </th>
              <th scope='col' className='relative px-6 py-3'>
                <span className='sr-only'>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {tools.map(tool => (
              <tr
                key={tool.id}
                className={`transition-colors hover:bg-gray-50 ${
                  selectedIds.includes(tool.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className='whitespace-nowrap px-6 py-4'>
                  <input
                    type='checkbox'
                    checked={selectedIds.includes(tool.id)}
                    onChange={() => toggleSelectTool(tool.id)}
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                </td>

                <td className='px-6 py-4'>
                  <div className='flex items-center'>
                    <div className='h-10 w-10 flex-shrink-0'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600'>
                        <span className='text-sm font-semibold text-white'>
                          {tool.tool_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className='ml-4'>
                      <div className='flex items-center'>
                        <div className='max-w-xs truncate text-sm font-medium text-gray-900'>
                          {tool.tool_name}
                        </div>
                        {tool.featured && (
                          <StarIconSolid className='ml-2 h-4 w-4 text-yellow-400' />
                        )}
                      </div>
                      <div className='max-w-xs truncate text-sm text-gray-500'>
                        {tool.overview}
                      </div>
                    </div>
                  </div>
                </td>

                <td className='whitespace-nowrap px-6 py-4'>
                  <span className='inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800'>
                    {tool.tool_category}
                  </span>
                </td>

                <td className='whitespace-nowrap px-6 py-4'>
                  <div className='flex flex-col space-y-1'>
                    <button
                      onClick={() => onToggleStatus(tool.id)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        tool.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {tool.is_active ? '✅ Actif' : '❌ Inactif'}
                    </button>
                    {tool.featured && (
                      <span className='inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800'>
                        ⭐ Vedette
                      </span>
                    )}
                  </div>
                </td>

                <td className='whitespace-nowrap px-6 py-4'>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getQualityScoreColor(tool.quality_score)}`}
                  >
                    {tool.quality_score}/10
                  </span>
                </td>

                <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-900'>
                  {formatNumber(tool.view_count)}
                </td>

                <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                  {new Date(tool.updated_at).toLocaleDateString('fr-FR')}
                </td>

                <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
                  <div className='flex items-center justify-end space-x-2'>
                    <Link
                      href={`/tools/${tool.id}`}
                      target='_blank'
                      className='rounded p-1 text-blue-600 hover:text-blue-900'
                      title="Voir l'outil"
                    >
                      <EyeIcon className='h-4 w-4' />
                    </Link>

                    <button
                      onClick={() => onEditTool(tool.id)}
                      className='rounded p-1 text-gray-600 hover:text-gray-900'
                      title='Modifier'
                    >
                      <PencilIcon className='h-4 w-4' />
                    </button>

                    <button
                      onClick={() => onToggleFeatured(tool.id)}
                      className={`rounded p-1 transition-colors ${
                        tool.featured
                          ? 'text-yellow-600 hover:text-yellow-800'
                          : 'text-gray-400 hover:text-yellow-600'
                      }`}
                      title={
                        tool.featured ? 'Retirer de la vedette' : 'Mettre en vedette'
                      }
                    >
                      <StarIcon className='h-4 w-4' />
                    </button>

                    <button
                      onClick={() => onDeleteTool(tool.id)}
                      className='rounded p-1 text-red-600 hover:text-red-900'
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

      {/* Empty state */}
      {tools.length === 0 && !loading && (
        <div className='p-12 text-center'>
          <div className='mb-4 text-gray-400'>
            <ClipboardDocumentListIcon className='mx-auto h-16 w-16' />
          </div>
          <h3 className='mb-2 text-lg font-medium text-gray-900'>Aucun outil trouvé</h3>
          <p className='mb-4 text-gray-500'>
            Essayez de modifier vos critères de recherche ou de filtrage.
          </p>
          <Link
            href='/admin/tools/new'
            className='inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
          >
            Ajouter un nouvel outil
          </Link>
        </div>
      )}
    </div>
  );
}

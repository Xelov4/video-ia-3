/**
 * Advanced Admin Search & Filters Component
 * Spécialement conçu pour l'administration avec fonctionnalités avancées
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useDebounce } from 'use-debounce';

export interface AdminFilterState {
  search: string;
  searchFields: string[]; // Nouveaux: champs de recherche sélectionnés
  categories: string[]; // Multi-sélection des catégories
  featured: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdminSearchFiltersProps {
  filters: AdminFilterState;
  onFiltersChange: (filters: AdminFilterState) => void;
  loading?: boolean;
  totalCount?: number;
  selectedCount?: number;
  onResetFilters?: () => void;
}

const SEARCH_FIELD_OPTIONS = [
  { value: 'name', label: "Nom de l'outil", icon: '🏷️' },
  { value: 'description', label: 'Description', icon: '📝' },
  { value: 'overview', label: 'Aperçu', icon: '👁️' },
  { value: 'category', label: 'Catégorie', icon: '📂' },
  { value: 'all', label: 'Tous les champs', icon: '🔍' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date de création' },
  { value: 'updated_at', label: 'Dernière mise à jour' },
  { value: 'tool_name', label: 'Nom A-Z' },
  { value: 'view_count', label: 'Popularité' },
];

export function AdminSearchFilters({
  filters,
  onFiltersChange,
  loading = false,
  totalCount = 0,
  selectedCount = 0,
  onResetFilters,
}: AdminSearchFiltersProps) {
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string; count: number }>
  >([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [debouncedSearch] = useDebounce(filters.search, 300);

  // Load categories for multi-select
  useEffect(() => {
    fetch('/api/metadata?context=admin-tools')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(
            data.categories.map((cat: { id: number; name: string; count?: number }) => ({
              id: cat.id,
              name: cat.name,
              count: cat.count || 0,
            }))
          );
        }
      })
      .catch(console.error);
  }, []);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  const updateFilter = (key: keyof AdminFilterState, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleCategory = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter(c => c !== categoryName)
      : [...filters.categories, categoryName];

    updateFilter('categories', newCategories);
  };

  const toggleSearchField = (field: string) => {
    if (field === 'all') {
      updateFilter('searchFields', ['all']);
      return;
    }

    const newFields = filters.searchFields.includes('all')
      ? [field] // Si "all" était sélectionné, remplacer par le field spécifique
      : filters.searchFields.includes(field)
        ? filters.searchFields.filter(f => f !== field)
        : [...filters.searchFields.filter(f => f !== 'all'), field];

    updateFilter('searchFields', newFields.length === 0 ? ['all'] : newFields);
  };

  const resetAllFilters = () => {
    const defaultFilters: AdminFilterState = {
      search: '',
      searchFields: ['all'],
      categories: [],
      featured: '',
      status: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };
    onFiltersChange(defaultFilters);
    onResetFilters?.();
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.featured) count++;
    if (filters.status) count++;
    if (filters.searchFields.length > 0 && !filters.searchFields.includes('all'))
      count++;
    return count;
  }, [filters]);

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='p-6'>
        {/* Header avec stats et reset */}
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between'>
          <div className='mb-4 flex items-center space-x-4 sm:mb-0'>
            <h3 className='text-lg font-semibold text-gray-900'>Recherche & Filtres</h3>
            {totalCount > 0 && (
              <div className='text-sm text-gray-600'>
                <span className='font-medium'>{totalCount.toLocaleString()}</span>{' '}
                outils
                {activeFiltersCount > 0 && (
                  <span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800'>
                    {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
                  </span>
                )}
                {selectedCount > 0 && (
                  <span className='ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800'>
                    {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showAdvanced
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AdjustmentsHorizontalIcon className='mr-1.5 h-4 w-4' />
              Avancé
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className='inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
              >
                <ArrowPathIcon className='mr-1.5 h-4 w-4' />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Recherche principale */}
        <div className='mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {/* Champ de recherche */}
          <div className='lg:col-span-2'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Recherche
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                placeholder='Rechercher des outils...'
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                className='block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                autoComplete='off'
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600'
                >
                  <XMarkIcon className='h-4 w-4' />
                </button>
              )}
            </div>
          </div>

          {/* Tri rapide */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>Tri</label>
            <div className='grid grid-cols-2 gap-2'>
              <select
                value={filters.sortBy}
                onChange={e => updateFilter('sortBy', e.target.value)}
                className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.sortOrder}
                onChange={e =>
                  updateFilter('sortOrder', e.target.value as 'asc' | 'desc')
                }
                className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
              >
                <option value='desc'>↓ Décroissant</option>
                <option value='asc'>↑ Croissant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Champs de recherche (toujours visible) */}
        <div className='mb-6'>
          <label className='mb-3 block text-sm font-medium text-gray-700'>
            Rechercher dans les champs :
          </label>
          <div className='flex flex-wrap gap-2'>
            {SEARCH_FIELD_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleSearchField(option.value)}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  filters.searchFields.includes(option.value) ||
                  (option.value === 'all' && filters.searchFields.includes('all'))
                    ? 'border-2 border-blue-300 bg-blue-100 text-blue-800'
                    : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className='mr-1.5'>{option.icon}</span>
                {option.label}
                {(filters.searchFields.includes(option.value) ||
                  (option.value === 'all' && filters.searchFields.includes('all'))) && (
                  <CheckIcon className='ml-1.5 h-4 w-4' />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filtres avancés (conditionnels) */}
        {showAdvanced && (
          <div className='border-t border-gray-200 pt-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              {/* Catégories (Multi-sélection) */}
              <div>
                <label className='mb-3 block text-sm font-medium text-gray-700'>
                  Catégories ({filters.categories.length} sélectionnées)
                </label>
                <div className='max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50'>
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className='flex cursor-pointer items-center px-3 py-2 hover:bg-white'
                    >
                      <input
                        type='checkbox'
                        checked={filters.categories.includes(category.name)}
                        onChange={() => toggleCategory(category.name)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='ml-2 flex-1 text-sm text-gray-700'>
                        {category.name}
                      </span>
                      <span className='text-xs text-gray-500'>{category.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Statut vedette */}
              <div>
                <label className='mb-3 block text-sm font-medium text-gray-700'>
                  Statut vedette
                </label>
                <select
                  value={filters.featured}
                  onChange={e => updateFilter('featured', e.target.value)}
                  className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Tous les outils</option>
                  <option value='true'>⭐ En vedette uniquement</option>
                  <option value='false'>📝 Non vedette uniquement</option>
                </select>
              </div>

              {/* Statut actif */}
              <div>
                <label className='mb-3 block text-sm font-medium text-gray-700'>
                  Statut de publication
                </label>
                <select
                  value={filters.status}
                  onChange={e => updateFilter('status', e.target.value)}
                  className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Tous les statuts</option>
                  <option value='true'>✅ Actifs uniquement</option>
                  <option value='false'>❌ Inactifs uniquement</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className='border-t border-gray-200 bg-blue-50 px-6 py-3'>
          <div className='flex items-center text-sm text-blue-700'>
            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600'></div>
            Recherche en cours...
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Composant universel de recherche et filtrage
 * Réutilisable pour tools, categories, admin - Ultra responsive et accessible
 */

'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import type {
  SearchFiltersConfig,
  FilterOption,
} from '@/src/types/search';

interface UniversalSearchFiltersProps {
  config: SearchFiltersConfig;
  className?: string;
  compact?: boolean;
}

export function UniversalSearchFilters({
  config,
  className = '',
  compact: _compact = false,
}: UniversalSearchFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['search'])
  );

  const {
    filters,
    metadata,
    loading,
    error,
    updateFilter,
    updateFilters: _updateFilters,
    resetFilters,
    activeFiltersCount,
  } = useSearchFilters({
    context: config.context,
    enableUrlSync: config.enableUrlSync,
    enableLocalStorage: config.enableLocalStorage,
    debounceMs: config.debounceMs,
    onFiltersChange: config.onFiltersChange,
  });

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Render search input
  const renderSearch = () => {
    if (!config.showSearch) return null;

    return (
      <div className='relative min-w-0 flex-1'>
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
          <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
        </div>
        <input
          type='text'
          placeholder={config.searchPlaceholder}
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
          className='block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2'
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
    );
  };

  // Render select dropdown
  const renderSelect = (
    key: string,
    options: FilterOption[],
    label: string,
    placeholder: string,
    _multiple: boolean = false
  ) => {
    const currentValue = filters[key as keyof typeof filters];
    const isExpanded = expandedSections.has(key);

    if (!options || options.length === 0) return null;

    return (
      <div className='space-y-2'>
        {/* Mobile section header */}
        <div className='lg:hidden'>
          <button
            onClick={() => toggleSection(key)}
            className='flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700'
          >
            <span>{label}</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Desktop label */}
        <label className='hidden text-sm font-medium text-gray-700 lg:block'>
          {label}
        </label>

        {/* Select content */}
        <div className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>
          <select
            value={Array.isArray(currentValue) ? '' : currentValue}
            onChange={e => updateFilter(key as keyof FilterState, e.target.value)}
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>{placeholder}</option>
            {options.map((option, index) => (
              <option
                key={`${key}-${option.value}-${index}`}
                value={option.value}
                disabled={option.disabled}
              >
                {option.emoji && `${option.emoji} `}
                {option.label}
                {option.count !== undefined && ` (${option.count})`}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // Render sort controls
  const renderSort = () => {
    if (!config.showSort || !metadata?.sortOptions) return null;

    const isExpanded = expandedSections.has('sort');

    return (
      <div className='space-y-2'>
        {/* Mobile section header */}
        <div className='lg:hidden'>
          <button
            onClick={() => toggleSection('sort')}
            className='flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700'
          >
            <span>Tri</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <div
          className={`grid grid-cols-2 gap-2 ${isExpanded ? 'block' : 'hidden lg:block'}`}
        >
          <div>
            <label className='mb-1 hidden text-sm font-medium text-gray-700 lg:block'>
              Trier par
            </label>
            <select
              value={filters.sortBy}
              onChange={e => updateFilter('sortBy', e.target.value)}
              className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
            >
              {metadata.sortOptions.map((option, index) => (
                <option key={`sort-${option.value}-${index}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-1 hidden text-sm font-medium text-gray-700 lg:block'>
              Ordre
            </label>
            <select
              value={filters.sortOrder}
              onChange={e =>
                updateFilter('sortOrder', e.target.value as 'asc' | 'desc')
              }
              className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500'
            >
              <option value='desc'>Décroissant</option>
              <option value='asc'>Croissant</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Render results info
  const renderResultsInfo = () => {
    if (!config.showResultsCount || !metadata?.stats) return null;

    const { stats } = metadata;
    const totalItems = config.context.includes('tools')
      ? stats.totalTools || 0
      : stats.totalCategories || 0;

    return (
      <div className='text-sm text-gray-600'>
        <span className='font-medium'>
          {totalItems.toLocaleString()}{' '}
          {config.context.includes('tools') ? 'outils' : 'catégories'}
        </span>
        {activeFiltersCount > 0 && (
          <span className='ml-2'>
            • {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif
            {activeFiltersCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white p-4 sm:p-6 ${className}`}
      >
        <div className='animate-pulse space-y-4'>
          <div className='h-10 rounded-lg bg-gray-200'></div>
          <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='h-9 rounded-lg bg-gray-200'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6 ${className}`}
      >
        <div className='flex items-center space-x-2'>
          <XMarkIcon className='h-5 w-5 text-red-500' />
          <span className='text-sm text-red-700'>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className='p-4 sm:p-6'>
        {/* Mobile toggle button */}
        {config.showMobileToggle && (
          <div className='mb-4 lg:hidden'>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className='flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100'
            >
              <div className='flex items-center space-x-2'>
                <FunnelIcon className='h-4 w-4' />
                <span>Recherche et filtres</span>
                {activeFiltersCount > 0 && (
                  <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'>
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        )}

        {/* Filters container */}
        <div
          className={`space-y-4 ${config.showMobileToggle ? (showMobileFilters ? 'block' : 'hidden lg:block') : 'block'}`}
        >
          {/* Search and quick actions row */}
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            {renderSearch()}

            {config.showClearAll && activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className='inline-flex flex-shrink-0 items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
              >
                <XMarkIcon className='mr-1.5 h-4 w-4' />
                Effacer tout
              </button>
            )}

            {config.customActions && (
              <div className='flex-shrink-0'>{config.customActions}</div>
            )}
          </div>

          {/* Results info */}
          {renderResultsInfo()}

          {/* Filters grid */}
          {config.showFilters && metadata && (
            <div className='space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-4'>
              {/* Categories */}
              {metadata.categories &&
                renderSelect(
                  'category',
                  [
                    {
                      value: '',
                      label: config.context.includes('categories')
                        ? 'Toutes les catégories'
                        : 'Toutes les catégories',
                    },
                    ...metadata.categories,
                  ],
                  'Catégorie',
                  'Sélectionner une catégorie'
                )}

              {/* Dynamic filters from metadata */}
              {Object.entries(metadata.filterOptions || {}).map(([key, options]) => {
                if (!options || options.length === 0) return null;

                const labels: Record<string, string> = {
                  featured: 'Statut vedette',
                  status: 'Statut',
                  qualityScore: 'Score qualité',
                  toolCount: "Nombre d'outils",
                  hasTools: 'Contenu',
                };

                return (
                  <div key={`filter-${key}`}>
                    {renderSelect(
                      key,
                      options,
                      labels[key] || key,
                      options[0]?.label || 'Sélectionner'
                    )}
                  </div>
                );
              })}

              {/* Sort */}
              {renderSort()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UniversalSearchFilters;

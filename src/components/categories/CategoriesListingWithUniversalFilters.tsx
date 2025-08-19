/**
 * Categories Listing Component with Universal Search Filters
 *
 * Advanced categories listing using the new UniversalSearchFilters component.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UniversalSearchFilters } from '@/src/components/common/UniversalSearchFilters';
import { getSearchFiltersConfig } from '@/src/config/searchFilters';
import type { FilterState } from '@/src/types/search';
import { getCategoryEmojiString } from '@/src/lib/services/emojiMapping';

interface Category {
  id: number;
  name: string;
  slug: string | null;
  description?: string | null;
  iconName?: string | null;
  toolCount: number | null;
  isFeatured: boolean | null;
  actualToolCount?: number;
}

interface CategoriesListingProps {
  initialCategories: Category[];
  searchQuery: string;
}

export default function CategoriesListingWithUniversalFilters({
  initialCategories,
  searchQuery,
}: CategoriesListingProps) {
  // State
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredCategories, setFilteredCategories] =
    useState<Category[]>(initialCategories);

  // Configuration pour le composant de recherche
  const searchConfig = getSearchFiltersConfig(
    'categories',
    'categories',
    handleFiltersChange
  );

  // Gestionnaire de changement de filtres
  function handleFiltersChange(filters: FilterState) {
    setIsLoading(true);

    // Filter categories based on search and filters
    let filtered = [...categories];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        category =>
          category.name.toLowerCase().includes(searchTerm) ||
          (category.description &&
            category.description.toLowerCase().includes(searchTerm))
      );
    }

    // Featured filter
    if (filters.featured === 'true') {
      filtered = filtered.filter(cat => cat.isFeatured === true);
    } else if (filters.featured === 'false') {
      filtered = filtered.filter(cat => cat.isFeatured !== true);
    }

    // HasTools filter
    if (filters.hasTools === 'true') {
      filtered = filtered.filter(
        cat => (cat.actualToolCount || cat.toolCount || 0) > 0
      );
    } else if (filters.hasTools === 'false') {
      filtered = filtered.filter(
        cat => (cat.actualToolCount || cat.toolCount || 0) === 0
      );
    }

    // ToolCount filter
    if (filters.toolCount) {
      switch (filters.toolCount) {
        case '50+':
          filtered = filtered.filter(
            cat => (cat.actualToolCount || cat.toolCount || 0) >= 50
          );
          break;
        case '20-50':
          filtered = filtered.filter(cat => {
            const count = cat.actualToolCount || cat.toolCount || 0;
            return count >= 20 && count < 50;
          });
          break;
        case '10-20':
          filtered = filtered.filter(cat => {
            const count = cat.actualToolCount || cat.toolCount || 0;
            return count >= 10 && count < 20;
          });
          break;
        case '1-10':
          filtered = filtered.filter(cat => {
            const count = cat.actualToolCount || cat.toolCount || 0;
            return count >= 1 && count < 10;
          });
          break;
        case '0':
          filtered = filtered.filter(
            cat => (cat.actualToolCount || cat.toolCount || 0) === 0
          );
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (filters.sortBy) {
        case 'toolCount':
          aVal = a.actualToolCount || a.toolCount || 0;
          bVal = b.actualToolCount || b.toolCount || 0;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'createdAt':
          aVal = a.id; // Using ID as proxy for creation date
          bVal = b.id;
          break;
        default:
          aVal = a.actualToolCount || a.toolCount || 0;
          bVal = b.actualToolCount || b.toolCount || 0;
      }

      if (filters.sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    setFilteredCategories(filtered);
    setIsLoading(false);
  }

  // Group categories by tool count for better organization
  const featuredCategories = filteredCategories.filter(
    cat => cat.isFeatured === true || (cat.actualToolCount || cat.toolCount || 0) > 50
  );
  const popularCategories = filteredCategories.filter(
    cat =>
      cat.isFeatured !== true &&
      (cat.actualToolCount || cat.toolCount || 0) > 10 &&
      (cat.actualToolCount || cat.toolCount || 0) <= 50
  );
  const otherCategories = filteredCategories.filter(
    cat => cat.isFeatured !== true && (cat.actualToolCount || cat.toolCount || 0) <= 10
  );

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      {/* Universal Search and Filters */}
      <div className='mb-8'>
        <UniversalSearchFilters config={searchConfig} />
      </div>

      {/* Results Summary */}
      <div className='mb-6 text-center sm:text-left'>
        <p className='text-gray-400'>
          {isLoading ? (
            <span className='animate-pulse'>Filtrage en cours...</span>
          ) : (
            <>
              <span className='font-semibold text-white'>
                {filteredCategories.length}
              </span>
              <span className='ml-1'>catégories trouvées</span>
              <span className='ml-4 text-sm'>
                Total:{' '}
                {filteredCategories.reduce(
                  (sum, cat) => sum + (cat.actualToolCount || cat.toolCount || 0),
                  0
                )}{' '}
                outils
              </span>
            </>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {[...Array(12)].map((_, i) => (
            <div key={i} className='glass-effect animate-pulse rounded-xl p-6'>
              <div className='mb-4 h-16 w-16 rounded-2xl bg-gray-700/50'></div>
              <div className='mb-2 h-4 rounded bg-gray-700/50'></div>
              <div className='mb-3 h-3 w-3/4 rounded bg-gray-700/50'></div>
              <div className='h-3 w-1/2 rounded bg-gray-700/50'></div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className='space-y-12'>
          {/* Featured Categories */}
          {featuredCategories.length > 0 && (
            <section>
              <h2 className='mb-6 text-2xl font-bold text-white'>
                Catégories principales
              </h2>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {featuredCategories.map(category => (
                  <CategoryCard key={category.id} category={category} featured />
                ))}
              </div>
            </section>
          )}

          {/* Popular Categories */}
          {popularCategories.length > 0 && (
            <section>
              <h2 className='mb-6 text-2xl font-bold text-white'>
                Catégories populaires
              </h2>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {popularCategories.map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>
          )}

          {/* Other Categories */}
          {otherCategories.length > 0 && (
            <section>
              <h2 className='mb-6 text-2xl font-bold text-white'>Autres catégories</h2>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {otherCategories.map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className='py-12 text-center'>
          <div className='glass-effect rounded-xl p-8'>
            <div className='mb-4 text-gray-400'>
              <svg
                className='mx-auto h-16 w-16'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <h3 className='mb-2 text-lg font-medium text-white'>
              Aucune catégorie trouvée
            </h3>
            <p className='mb-4 text-gray-300'>
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
            <button
              onClick={() =>
                handleFiltersChange({
                  search: '',
                  category: '',
                  featured: '',
                  status: '',
                  qualityScore: '',
                  toolCount: '',
                  hasTools: '',
                  tags: [],
                  sortBy: 'toolCount',
                  sortOrder: 'desc',
                })
              }
              className='rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700'
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Category Card Component
 */
interface CategoryCardProps {
  category: Category;
  featured?: boolean;
}

function CategoryCard({ category, featured = false }: CategoryCardProps) {
  const slug =
    category.slug ||
    category.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  const toolCount = category.actualToolCount || category.toolCount || 0;

  return (
    <Link
      href={`/categories/${slug}`}
      className={`glass-effect group block rounded-xl p-6 transition-all duration-300 hover:scale-105 ${
        featured ? 'ring-2 ring-blue-500/20' : ''
      }`}
    >
      {/* Emoji Icon */}
      <div
        className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${
          featured
            ? 'border-2 border-purple-300/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20'
            : 'border border-gray-500/30 bg-gradient-to-br from-gray-700/30 to-gray-600/30 group-hover:border-purple-400/50 group-hover:bg-gradient-to-br group-hover:from-purple-500/20 group-hover:to-pink-500/20'
        } transition-all duration-300 group-hover:scale-110`}
      >
        <span className='text-3xl'>{getCategoryEmojiString(category.name)}</span>
      </div>

      {/* Content */}
      <div>
        <h3
          className={`mb-2 text-lg font-semibold transition-colors ${
            featured
              ? 'text-white group-hover:text-blue-300'
              : 'text-white group-hover:text-blue-300'
          }`}
        >
          {category.name}
        </h3>

        {category.description && (
          <p className='mb-3 line-clamp-2 text-sm text-gray-300'>
            {category.description}
          </p>
        )}

        <div className='flex items-center justify-between'>
          <span
            className={`text-sm font-medium ${
              featured ? 'text-blue-300' : 'text-gray-400 group-hover:text-blue-300'
            } transition-colors`}
          >
            {toolCount} outil{toolCount !== 1 ? 's' : ''}
          </span>

          {(featured || category.isFeatured === true) && (
            <span className='inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-300'>
              ⭐ Principal
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

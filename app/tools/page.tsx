/**
 * Tools Listing Page
 *
 * Main page for browsing and searching AI tools with advanced filters.
 * Features search, category filtering, sorting, and pagination.
 *
 * Features:
 * - Search functionality with real-time results
 * - Category and feature filtering
 * - Multiple sorting options
 * - Pagination with URL state management
 * - Server-side rendering for SEO
 * - Loading states and error handling
 *
 * @author Video-IA.net Development Team
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import ToolsListingWithUniversalFilters from '@/src/components/tools/ToolsListingWithUniversalFilters';
import { toolsService } from '@/src/lib/database/services/tools';
import { CategoriesService } from '@/src/lib/database/services/categories';
import { formatNumber } from '@/src/lib/utils/formatNumbers';

interface ToolsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    featured?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title:
    "Outils IA - Répertoire complet de 16 763 outils d'intelligence artificielle | Video-IA.net",
  description:
    "Explorez notre collection complète de plus de 16 000 outils d'intelligence artificielle. Recherchez, filtrez et découvrez les meilleurs outils IA pour créateurs, développeurs et professionnels.",
  keywords:
    'outils IA, intelligence artificielle, recherche outils IA, ChatGPT, Midjourney, Claude, outils créateurs, développeurs, productivité, automatisation',
};

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const {
    search = '',
    category = '',
    featured = '',
    sort = 'created_at',
    order = 'desc',
    page = '1',
  } = searchParams;

  // Parse parameters
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const limit = 20;

  // Build search parameters for new service
  const searchParams_api = {
    query: search || undefined,
    category: category || undefined,
    featured: featured === 'true' ? true : undefined,
    page: currentPage,
    limit,
    sortBy: sort,
    sortOrder: order as 'asc' | 'desc',
  };

  // Load data server-side
  const [toolsResult, categories] = await Promise.all([
    toolsService.searchTools(searchParams_api).catch((error: any) => {
      console.error('Failed to load tools:', error);
      return {
        tools: [],
        totalCount: 0,
        hasMore: false,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }),
    CategoriesService.getAllCategories().catch((error: any) => {
      console.error('Failed to load categories:', error);
      return [];
    }),
  ]);

  return (
    <div className='gradient-bg min-h-screen'>
      {/* Header Section */}
      <div className='glass-effect border-b border-gray-700/50'>
        <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h1 className='mb-6 text-4xl font-bold text-white md:text-5xl'>
              {search ? (
                <>
                  Résultats pour "<span className='gradient-text'>{search}</span>"
                </>
              ) : category ? (
                <>
                  Outils IA - <span className='gradient-text'>{category}</span>
                </>
              ) : (
                'Tous les <span className="gradient-text">outils IA</span>'
              )}
            </h1>
            <p className='mx-auto max-w-3xl text-xl leading-relaxed text-gray-300'>
              {search
                ? `${formatNumber(toolsResult.totalCount)} outils trouvés pour votre recherche`
                : `Découvrez notre collection de ${formatNumber(toolsResult.totalCount)} outils d'intelligence artificielle`}
            </p>
          </div>
        </div>
      </div>

      {/* Tools Listing Section */}
      <Suspense fallback={<ToolsListingLoading />}>
        <ToolsListingWithUniversalFilters
          initialTools={toolsResult.tools}
          initialCategories={categories}
          totalCount={toolsResult.totalCount}
          currentPage={toolsResult.currentPage}
          totalPages={toolsResult.totalPages}
          hasMore={toolsResult.hasNextPage}
          searchParams={{
            search,
            category,
            featured: featured === 'true',
            sort,
            order: order as 'asc' | 'desc',
          }}
        />
      </Suspense>
    </div>
  );
}

/**
 * Loading component for tools listing
 */
function ToolsListingLoading() {
  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
        {/* Sidebar skeleton */}
        <div className='lg:col-span-1'>
          <div className='rounded-lg border border-gray-200 bg-white p-6'>
            <div className='mb-4 h-6 animate-pulse rounded bg-gray-200'></div>
            <div className='space-y-3'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='h-4 animate-pulse rounded bg-gray-200'></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className='lg:col-span-3'>
          {/* Filters skeleton */}
          <div className='mb-6 rounded-lg border border-gray-200 bg-white p-4'>
            <div className='flex items-center justify-between'>
              <div className='h-6 w-32 animate-pulse rounded bg-gray-200'></div>
              <div className='h-8 w-48 animate-pulse rounded bg-gray-200'></div>
            </div>
          </div>

          {/* Tools grid skeleton */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className='animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white'
              >
                <div className='h-48 bg-gray-200'></div>
                <div className='p-6'>
                  <div className='mb-2 h-4 rounded bg-gray-200'></div>
                  <div className='mb-4 h-3 w-3/4 rounded bg-gray-200'></div>
                  <div className='h-8 rounded bg-gray-200'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

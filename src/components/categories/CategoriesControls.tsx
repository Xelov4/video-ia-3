'use client';

import { SupportedLocale } from '@/middleware';

interface CategoriesControlsProps {
  lang: SupportedLocale;
  sortBy: 'name' | 'count';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  messages: {
    sortBy: string;
    mostPopular: string;
    leastPopular: string;
    alphabetical: string;
    reverseAlphabetical: string;
    gridView: string;
    listView: string;
  };
}

export default function CategoriesControls({
  lang,
  sortBy,
  sortOrder,
  viewMode,
  messages,
}: CategoriesControlsProps) {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newOrder] = e.target.value.split('-');
    window.location.href = `/${lang}/categories?sort=${newSort}&order=${newOrder}&view=${viewMode}`;
  };

  return (
    <div className='flex flex-col gap-4 sm:flex-row'>
      <div className='flex items-center gap-2'>
        <span className='whitespace-nowrap text-sm text-gray-600 dark:text-gray-400'>
          {messages.sortBy}:
        </span>
        <select
          className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          value={`${sortBy}-${sortOrder}`}
          onChange={handleSortChange}
        >
          <option value='count-desc'>{messages.mostPopular}</option>
          <option value='count-asc'>{messages.leastPopular}</option>
          <option value='name-asc'>{messages.alphabetical}</option>
          <option value='name-desc'>{messages.reverseAlphabetical}</option>
        </select>
      </div>

      <div className='flex rounded-lg bg-gray-100 p-1 dark:bg-gray-700'>
        <a
          href={`/${lang}/categories?sort=${sortBy}&order=${sortOrder}&view=grid`}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            viewMode === 'grid'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          {messages.gridView}
        </a>
        <a
          href={`/${lang}/categories?sort=${sortBy}&order=${sortOrder}&view=list`}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          {messages.listView}
        </a>
      </div>
    </div>
  );
}

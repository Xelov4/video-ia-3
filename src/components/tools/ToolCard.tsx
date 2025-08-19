'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools';
import { getCategoryEmojiString } from '@/src/lib/services/emojiMapping';
import { SafeImage } from '@/src/components/ui/SafeImage';

interface ToolCardProps {
  tool: ToolWithTranslation;
  showCategory?: boolean;
  size?: 'small' | 'medium' | 'large';
  lang?: string;
}

/**
 * ToolCard component for displaying tool information
 * Supports multiple sizes and display modes
 */
export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  showCategory = true,
  size = 'medium',
  lang = 'en',
}) => {
  // Translation support for UI elements
  const translations: Record<string, Record<string, string>> = {
    en: {
      viewTool: 'View Tool',
      featured: 'Featured',
      notTranslated: 'Not translated to your language',
    },
    fr: {
      viewTool: "Voir l'Outil",
      featured: 'En vedette',
      notTranslated: 'Non traduit dans votre langue',
    },
    it: {
      viewTool: 'Visualizza Strumento',
      featured: 'In evidenza',
      notTranslated: 'Non tradotto nella tua lingua',
    },
    es: {
      viewTool: 'Ver Herramienta',
      featured: 'Destacado',
      notTranslated: 'No traducido a tu idioma',
    },
    de: {
      viewTool: 'Tool ansehen',
      featured: 'Empfohlen',
      notTranslated: 'Nicht in deine Sprache übersetzt',
    },
    nl: {
      viewTool: 'Bekijk Tool',
      featured: 'Uitgelicht',
      notTranslated: 'Niet vertaald naar jouw taal',
    },
    pt: {
      viewTool: 'Ver Ferramenta',
      featured: 'Destaque',
      notTranslated: 'Não traduzido para o seu idioma',
    },
  };

  const t = translations[lang] || translations['en'];

  // Build the tool URL based on the language
  const toolUrl =
    lang === 'en' ? `/t/${tool.slug || tool.id}` : `/${lang}/t/${tool.slug || tool.id}`;

  // Determine the category emoji
  const categoryEmoji = tool.toolCategory
    ? getCategoryEmojiString(tool.toolCategory)
    : '🔧';

  // Choose placeholder image if no image is available
  const imageUrl = tool.imageUrl || '/images/placeholder-tool.png';

  // Show translation warning if fallback was used
  const showTranslationWarning = tool.resolvedLanguage !== lang;

  // Use excerpt from description for display
  const getExcerpt = (text?: string | null, length: number = 140): string => {
    if (!text) return '';
    return text.length > length ? `${text.substring(0, length).trim()}...` : text;
  };

  // Generate different card layouts based on size
  if (size === 'small') {
    // Compact list view
    return (
      <div className='group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg'>
        <Link href={toolUrl} className='block h-full'>
          <div className='flex h-full items-start p-4'>
            <div className='mr-4 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600'>
              <span className='text-2xl text-white'>{categoryEmoji}</span>
            </div>
            <div className='min-w-0 flex-1'>
              <h3 className='mb-1 truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600'>
                {tool.displayName}
              </h3>

              {showCategory && tool.toolCategory && (
                <div className='mb-2 text-sm text-gray-600'>{tool.toolCategory}</div>
              )}

              <p className='line-clamp-2 text-sm text-gray-500'>
                {getExcerpt(tool.displayOverview || tool.displayDescription, 80)}
              </p>

              {showTranslationWarning && (
                <div className='mt-2 text-xs text-amber-400'>{t.notTranslated}</div>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Default card view (medium/large)
  return (
    <div className='group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg'>
      <Link href={toolUrl} className='block h-full'>
        <div className='flex h-full flex-col'>
          {/* Image */}
          <div className='relative h-48 w-full overflow-hidden bg-gray-200'>
            <SafeImage
              src={imageUrl}
              alt={tool.displayName}
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-cover transition-transform duration-300 group-hover:scale-105'
              priority={false}
            />

            {tool.featured && (
              <div className='absolute right-3 top-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-semibold text-white'>
                {t.featured}
              </div>
            )}

            {showCategory && tool.toolCategory && (
              <div className='absolute bottom-3 left-3 flex items-center space-x-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm'>
                <span>{categoryEmoji}</span>
                <span>{tool.toolCategory}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex flex-1 flex-col p-5'>
            <h3 className='mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600'>
              {tool.displayName}
            </h3>

            <p className='mb-4 line-clamp-3 flex-1 text-gray-600'>
              {getExcerpt(tool.displayOverview || tool.displayDescription)}
            </p>

            {showTranslationWarning && (
              <div className='mb-3 flex items-center space-x-1 text-xs text-amber-400'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>{t.notTranslated}</span>
              </div>
            )}

            <div className='text-center'>
              <span className='inline-flex items-center text-sm font-medium text-blue-600 group-hover:underline'>
                {t.viewTool}
                <svg
                  className='ml-1 h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M14 5l7 7m0 0l-7 7m7-7H3'
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SupportedLocale } from '@/middleware';

interface SimpleHeaderProps {
  currentLanguage: SupportedLocale;
}

export default function SimpleHeader({ currentLanguage }: SimpleHeaderProps) {
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link
            href={`/${currentLanguage === 'en' ? '' : currentLanguage}`}
            className='flex items-center space-x-3'
          >
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600'>
              <span className='text-xl text-white'>✨</span>
            </div>
            <span className='text-xl font-bold text-white'>Video-IA.net</span>
          </Link>

          {/* Navigation simple */}
          <nav className='flex items-center space-x-6'>
            <Link
              href={`/${currentLanguage === 'en' ? '' : currentLanguage}/tools`}
              className='font-medium text-gray-300 transition-colors hover:text-white'
            >
              Outils
            </Link>
            <Link
              href={`/${currentLanguage === 'en' ? '' : currentLanguage}/categories`}
              className='font-medium text-gray-300 transition-colors hover:text-white'
            >
              Catégories
            </Link>

            {/* Menu déroulant des langues */}
            <div className='relative'>
              <button
                onClick={() => setIsLanguagesOpen(!isLanguagesOpen)}
                className='flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white'
              >
                <span>🌐</span>
                <span className='text-sm'>Langues</span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${isLanguagesOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>

              {isLanguagesOpen && (
                <div className='absolute right-0 z-50 mt-2 w-56 rounded-lg border border-white/20 bg-black/90 py-2 shadow-2xl backdrop-blur-xl'>
                  <div className='border-b border-white/10 px-4 py-2'>
                    <h3 className='text-sm font-medium text-white'>
                      Choisir une langue
                    </h3>
                  </div>
                  <div className='py-1'>
                    {[
                      { code: 'en', name: 'English', flag: '🇺🇸', path: '/' },
                      { code: 'fr', name: 'Français', flag: '🇫🇷', path: '/fr' },
                      { code: 'it', name: 'Italiano', flag: '🇮🇹', path: '/it' },
                      { code: 'es', name: 'Español', flag: '🇪🇸', path: '/es' },
                      { code: 'de', name: 'Deutsch', flag: '🇩🇪', path: '/de' },
                      { code: 'nl', name: 'Nederlands', flag: '🇳🇱', path: '/nl' },
                      { code: 'pt', name: 'Português', flag: '🇵🇹', path: '/pt' },
                    ].map(lang => (
                      <Link
                        key={lang.code}
                        href={lang.path}
                        onClick={() => setIsLanguagesOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white ${
                          lang.code === currentLanguage
                            ? 'bg-purple-600/20 text-purple-300'
                            : ''
                        }`}
                      >
                        <span className='text-lg'>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Backdrop pour le menu des langues */}
      {isLanguagesOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsLanguagesOpen(false)} />
      )}
    </header>
  );
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SupportedLocale } from '@/middleware'

interface SimpleHeaderProps {
  currentLanguage: SupportedLocale
}

export default function SimpleHeader({ currentLanguage }: SimpleHeaderProps) {
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${currentLanguage === 'en' ? '' : currentLanguage}`} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">✨</span>
            </div>
            <span className="text-xl font-bold text-white">Video-IA.net</span>
          </Link>

          {/* Navigation simple */}
          <nav className="flex items-center space-x-6">
            <Link 
              href={`/${currentLanguage === 'en' ? '' : currentLanguage}/tools`}
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Outils
            </Link>
            <Link 
              href={`/${currentLanguage === 'en' ? '' : currentLanguage}/categories`}
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Catégories
            </Link>

            {/* Menu déroulant des langues */}
            <div className="relative">
              <button
                onClick={() => setIsLanguagesOpen(!isLanguagesOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span>🌐</span>
                <span className="text-sm">Langues</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isLanguagesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLanguagesOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <h3 className="text-sm font-medium text-white">Choisir une langue</h3>
                  </div>
                  <div className="py-1">
                    {[
                      { code: 'en', name: 'English', flag: '🇺🇸', path: '/' },
                      { code: 'fr', name: 'Français', flag: '🇫🇷', path: '/fr' },
                      { code: 'it', name: 'Italiano', flag: '🇮🇹', path: '/it' },
                      { code: 'es', name: 'Español', flag: '🇪🇸', path: '/es' },
                      { code: 'de', name: 'Deutsch', flag: '🇩🇪', path: '/de' },
                      { code: 'nl', name: 'Nederlands', flag: '🇳🇱', path: '/nl' },
                      { code: 'pt', name: 'Português', flag: '🇵🇹', path: '/pt' }
                    ].map((lang) => (
                      <Link
                        key={lang.code}
                        href={lang.path}
                        onClick={() => setIsLanguagesOpen(false)}
                        className={`px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center space-x-3 ${
                          lang.code === currentLanguage ? 'bg-purple-600/20 text-purple-300' : ''
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
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
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsLanguagesOpen(false)}
        />
      )}
    </header>
  )
}

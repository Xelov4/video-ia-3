import './globals.css'
import type { Metadata } from 'next'
import { SessionProvider } from '@/src/components/auth/SessionProvider'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Video-IA.net - Répertoire de 16 763 Outils IA pour Créateurs',
  description: 'Découvrez le répertoire le plus complet d\'outils d\'intelligence artificielle. Plus de 16 000 outils IA organisés par catégories pour créateurs, développeurs et professionnels.',
  keywords: 'outils IA, intelligence artificielle, créateurs, développeurs, productivité, ChatGPT, Midjourney, assistants IA',
  authors: [{ name: 'Video-IA.net', url: 'https://video-ia.net' }],
  openGraph: {
    title: 'Video-IA.net - 16 763 Outils IA pour Créateurs',
    description: 'Le répertoire le plus complet d\'outils d\'intelligence artificielle pour créateurs et professionnels',
    url: 'https://video-ia.net',
    siteName: 'Video-IA.net',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video-IA.net - 16 763 Outils IA',
    description: 'Découvrez les meilleurs outils IA pour créateurs et professionnels',
    site: '@videoianet',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-900 text-gray-100 min-h-screen antialiased font-roboto">
        <SessionProvider>
          {/* Header Racine */}
          <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo et Navigation */}
                <div className="flex items-center space-x-8">
                  {/* Logo */}
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">V</span>
                    </div>
                    <span className="text-xl font-bold text-white">Video-IA.net</span>
                  </Link>
                  
                  {/* Navigation Links */}
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link 
                      href="/categories" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Catégories
                    </Link>
                    <Link 
                      href="/tools" 
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Outils
                    </Link>
                  </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  {/* Search Button */}
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  
                  {/* Language Switcher Placeholder */}
                  <div className="hidden sm:flex items-center space-x-2 text-gray-400 text-sm">
                    <span>FR</span>
                    <span>|</span>
                    <span className="hover:text-white cursor-pointer">EN</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu Principal */}
          <main>
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
} 
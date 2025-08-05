import './globals.css'
import type { Metadata } from 'next'
import Header from '@/src/components/layout/Header'
import Footer from '@/src/components/layout/Footer'

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
      <body className="bg-gray-50 min-h-screen antialiased">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
} 
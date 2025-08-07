import './globals.css'
import type { Metadata } from 'next'

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
        {children}
      </body>
    </html>
  )
} 
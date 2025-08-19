import './globals.css';
import type { Metadata } from 'next';
import { SessionProvider } from '@/src/components/auth/SessionProvider';

export const metadata: Metadata = {
  title: 'Video-IA.net - Répertoire de 16 763 Outils IA pour Créateurs',
  description:
    "Découvrez le répertoire le plus complet d'outils d'intelligence artificielle. Plus de 16 000 outils IA organisés par catégories pour créateurs, développeurs et professionnels.",
  keywords:
    'outils IA, intelligence artificielle, créateurs, développeurs, productivité, ChatGPT, Midjourney, assistants IA',
  authors: [{ name: 'Video-IA.net', url: 'https://video-ia.net' }],
  openGraph: {
    title: 'Video-IA.net - 16 763 Outils IA pour Créateurs',
    description:
      "Le répertoire le plus complet d'outils d'intelligence artificielle pour créateurs et professionnels",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='fr' className='scroll-smooth' suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src='https://www.googletagmanager.com/gtag/js?id=G-0W0WQY9CTF'
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0W0WQY9CTF');
          `,
          }}
        />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap'
          rel='stylesheet'
        />
        {/* Critical CSS */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />

        {/* Theme color pour mobile */}
        <meta name='theme-color' content='#0066FF' />
        <meta name='msapplication-TileColor' content='#0066FF' />

        {/* Favicons */}
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />
      </head>
      <body
        className='min-h-screen bg-background text-foreground antialiased'
        suppressHydrationWarning
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

/**
 * Layout Multilingue Principal - Video-IA.net
 * 
 * Layout révolutionnaire avec design system moderne, navigation intelligente,
 * et optimisations performance pour 16,765 outils IA en 7 langues.
 * 
 * Features:
 * - Design system intégré
 * - Navigation moderne avec mega-menu
 * - SEO multilingue optimisé
 * - Performance Core Web Vitals
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import { SupportedLocale, supportedLocales } from '@/middleware'

import ModernHeader from '@/src/components/layout/ModernHeader'
import ModernFooter from '@/src/components/layout/ModernFooter'
import { I18nProvider } from '@/src/lib/i18n/context'
import '../globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    lang: SupportedLocale
  }>
}

/**
 * Validation stricte des paramètres langue
 */
function validateLanguageParam(lang: string): SupportedLocale {
  if (!supportedLocales.includes(lang as SupportedLocale)) {
    notFound()
  }
  return lang as SupportedLocale
}

/**
 * Métadonnées SEO multilingues optimisées
 */
const METADATA_BY_LANGUAGE: Record<SupportedLocale, {
  title: string
  description: string
  keywords: string
}> = {
  'en': {
    title: 'Video-IA.net - Best AI Tools Directory 2025 | 16,765+ AI Tools',
    description: 'Discover the world\'s largest AI tools directory with 16,765+ verified tools for video creation, content generation, automation and more. Reviews, comparisons and expert insights.',
    keywords: 'AI tools directory, artificial intelligence, video AI tools, content creation, automation, machine learning'
  },
  'fr': {
    title: 'Video-IA.net - Meilleur Répertoire d\'Outils IA 2025 | 16 765+ Outils IA',
    description: 'Découvrez le plus grand répertoire d\'outils IA au monde avec 16 765+ outils vérifiés pour création vidéo, génération de contenu, automatisation et plus.',
    keywords: 'répertoire outils IA, intelligence artificielle, outils IA vidéo, création contenu, automatisation'
  },
  'it': {
    title: 'Video-IA.net - Migliore Directory Strumenti AI 2025 | 16.765+ Strumenti AI',
    description: 'Scopri la più grande directory di strumenti AI al mondo con 16.765+ strumenti verificati per creazione video, generazione contenuti, automazione e altro.',
    keywords: 'directory strumenti AI, intelligenza artificiale, strumenti AI video, creazione contenuti'
  },
  'es': {
    title: 'Video-IA.net - Mejor Directorio Herramientas IA 2025 | 16.765+ Herramientas IA',
    description: 'Descubre el directorio de herramientas IA más grande del mundo con 16.765+ herramientas verificadas para creación de video, generación de contenido y automatización.',
    keywords: 'directorio herramientas IA, inteligencia artificial, herramientas IA video, creación contenido'
  },
  'de': {
    title: 'Video-IA.net - Bestes KI-Tools Verzeichnis 2025 | 16.765+ KI-Tools',
    description: 'Entdecken Sie das weltgrößte KI-Tools-Verzeichnis mit 16.765+ verifizierten Tools für Videoerstellung, Content-Generierung und Automatisierung.',
    keywords: 'KI-Tools Verzeichnis, künstliche Intelligenz, Video-KI-Tools, Content-Erstellung'
  },
  'nl': {
    title: 'Video-IA.net - Beste AI Tools Directory 2025 | 16.765+ AI Tools',
    description: 'Ontdek \'s werelds grootste AI-tools directory met 16.765+ geverifieerde tools voor video creatie, content generatie en automatisering.',
    keywords: 'AI-tools directory, kunstmatige intelligentie, video AI-tools, content creatie'
  },
  'pt': {
    title: 'Video-IA.net - Melhor Diretório Ferramentas IA 2025 | 16.765+ Ferramentas IA',
    description: 'Descubra o maior diretório de ferramentas IA do mundo com 16.765+ ferramentas verificadas para criação de vídeo, geração de conteúdo e automação.',
    keywords: 'diretório ferramentas IA, inteligência artificial, ferramentas IA vídeo, criação conteúdo'
  }
}

/**
 * Génération des métadonnées par langue
 */
export async function generateMetadata({ 
  params 
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const validatedLang = validateLanguageParam(lang)
  const metadata = METADATA_BY_LANGUAGE[validatedLang]
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const currentUrl = validatedLang === 'en' ? baseUrl : `${baseUrl}/${validatedLang}`
  
  return {
    title: {
      default: metadata.title,
      template: `%s | ${metadata.title}`
    },
    description: metadata.description,
    keywords: metadata.keywords,
    
    // OpenGraph optimisé
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: currentUrl,
      siteName: 'Video-IA.net',
      locale: `${validatedLang}_${validatedLang.toUpperCase()}`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image-${validatedLang}.jpg`,
          width: 1200,
          height: 630,
          alt: metadata.title
        }
      ]
    },
    
    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [`${baseUrl}/og-image-${validatedLang}.jpg`]
    },
    
    // Canonical & hreflang
    alternates: {
      canonical: currentUrl,
      languages: Object.fromEntries(
        supportedLocales.map(locale => [
          locale,
          locale === 'en' ? baseUrl : `${baseUrl}/${locale}`
        ])
      )
    },
    
    // Robots & indexing
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    
    // Verification & analytics
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION
    },
    
    // App metadata
    applicationName: 'Video-IA.net',
    category: 'Technology',
    classification: 'AI Tools Directory',
    
    // Structured data sera ajouté via JsonLd dans les pages
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no'
    }
  }
}

/**
 * Génération des paramètres statiques pour build
 */
export function generateStaticParams() {
  return supportedLocales.map((lang) => ({
    lang: lang
  }))
}

/**
 * Layout principal avec architecture moderne
 */
export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang } = await params
  const validatedLang = validateLanguageParam(lang)
  
  return (
    <html 
      lang={validatedLang}
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* Critical CSS sera inliné ici */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/api/data-extraction?type=audiences&limit=10" as="fetch" crossOrigin="anonymous" />
        
        {/* Theme color pour mobile */}
        <meta name="theme-color" content="#0066FF" />
        <meta name="msapplication-TileColor" content="#0066FF" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      
      <body 
        className={`${inter.className} antialiased bg-gray-50 text-gray-900`}
        suppressHydrationWarning
      >
        <I18nProvider currentLanguage={validatedLang}>
          {/* Skip to main content pour a11y */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
          >
            Skip to main content
          </a>
          
          {/* Layout structure moderne */}
          <div className="min-h-screen flex flex-col">
            {/* Header moderne avec navigation intelligente */}
            <ModernHeader lang={validatedLang} />
            
            {/* Main content area */}
            <main 
              id="main-content"
              className="flex-1 relative"
              role="main"
            >
              {children}
            </main>
            
            {/* Footer moderne avec liens utiles */}
            <ModernFooter lang={validatedLang} />
          </div>
          
          {/* Service Worker registration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              `
            }}
          />
        </I18nProvider>
      </body>
    </html>
  )
}
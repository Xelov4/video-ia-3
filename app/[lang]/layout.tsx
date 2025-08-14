/**
 * Layout Multilingue Racine - Video-IA.net
 * 
 * Gère le layout principal avec support i18n complet, métadonnées SEO,
 * et optimisations performance pour toutes les langues supportées.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import { SupportedLocale, supportedLocales, defaultLocale } from '@/middleware'

import Header from '@/src/components/layout/Header'
import Footer from '@/src/components/layout/Footer'
import { I18nProvider } from '@/src/lib/i18n/context'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

// Interface pour paramètres de page
interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    lang: SupportedLocale
  }>
}

/**
 * Validation des paramètres langue + edge cases
 */
function validateLanguageParam(lang: string): SupportedLocale {
  if (!supportedLocales.includes(lang as SupportedLocale)) {
    notFound()
  }
  return lang as SupportedLocale
}

/**
 * Métadonnées i18n par langue
 */
const METADATA_BY_LANGUAGE: Record<SupportedLocale, {
  title: string
  description: string
  keywords: string
}> = {
  'en': {
    title: 'Video-IA.net - Best AI Tools Directory 2025',
    description: 'Discover the best AI tools for video creation, editing, and automation. Comprehensive directory with 16,000+ AI tools, reviews, and comparisons.',
    keywords: 'AI tools, artificial intelligence, video AI, machine learning, automation, directory'
  },
  'fr': {
    title: 'Video-IA.net - Meilleurs Outils IA 2025',
    description: 'Découvrez les meilleurs outils IA pour création vidéo, édition et automatisation. Répertoire complet avec 16 000+ outils IA, avis et comparaisons.',
    keywords: 'outils IA, intelligence artificielle, vidéo IA, apprentissage automatique, automatisation, répertoire'
  },
  'it': {
    title: 'Video-IA.net - Migliori Strumenti AI 2025',
    description: 'Scopri i migliori strumenti AI per creazione video, editing e automazione. Directory completa con 16.000+ strumenti AI, recensioni e confronti.',
    keywords: 'strumenti AI, intelligenza artificiale, video AI, machine learning, automazione, directory'
  },
  'es': {
    title: 'Video-IA.net - Mejores Herramientas IA 2025',
    description: 'Descubre las mejores herramientas IA para creación de video, edición y automatización. Directorio completo con 16.000+ herramientas IA, reseñas y comparaciones.',
    keywords: 'herramientas IA, inteligencia artificial, video IA, machine learning, automatización, directorio'
  },
  'de': {
    title: 'Video-IA.net - Beste KI-Tools 2025',
    description: 'Entdecken Sie die besten KI-Tools für Videoerstellung, Bearbeitung und Automatisierung. Umfassendes Verzeichnis mit 16.000+ KI-Tools, Bewertungen und Vergleichen.',
    keywords: 'KI-Tools, künstliche Intelligenz, Video-KI, maschinelles Lernen, Automatisierung, Verzeichnis'
  },
  'nl': {
    title: 'Video-IA.net - Beste AI Tools 2025',
    description: 'Ontdek de beste AI-tools voor video creatie, bewerking en automatisering. Complete directory met 16.000+ AI-tools, reviews en vergelijkingen.',
    keywords: 'AI-tools, kunstmatige intelligentie, video AI, machine learning, automatisering, directory'
  },
  'pt': {
    title: 'Video-IA.net - Melhores Ferramentas IA 2025',
    description: 'Descubra as melhores ferramentas IA para criação de vídeo, edição e automação. Diretório completo com 16.000+ ferramentas IA, avaliações e comparações.',
    keywords: 'ferramentas IA, inteligência artificial, vídeo IA, machine learning, automação, diretório'
  }
}

/**
 * Génération métadonnées SEO par langue
 */
export async function generateMetadata({ 
  params 
}: {
  params: Promise<{ lang: string }
}): Promise<Metadata> {
  const { lang: langParam } = await params
  const lang = validateLanguageParam(langParam)
  const metadata = METADATA_BY_LANGUAGE[lang]
  const isDefault = lang === defaultLocale
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'
  const currentUrl = isDefault ? baseUrl : `${baseUrl}/${lang}`
  
  // Génération des alternate languages pour SEO
  const alternates = {
    canonical: currentUrl,
    languages: Object.fromEntries(
      supportedLocales.map(locale => [
        locale,
        locale === defaultLocale ? baseUrl : `${baseUrl}/${locale}`
      ])
    )
  }
  
  return {
    title: {
      default: metadata.title,
      template: `%s | ${metadata.title}`
    },
    description: metadata.description,
    keywords: metadata.keywords,
    
    // Open Graph
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: currentUrl,
      siteName: 'Video-IA.net',
      locale: lang === 'en' ? 'en_US' : lang === 'fr' ? 'fr_FR' : `${lang}_${lang.toUpperCase()}`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-image-${lang}.jpg`,
          width: 1200,
          height: 630,
          alt: metadata.title
        }
      ]
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [`${baseUrl}/images/twitter-image-${lang}.jpg`]
    },
    
    // Alternates pour SEO multilingue
    alternates,
    
    // Autres optimisations
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
    
    // Vérification propriété site
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION
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
 * Layout Component avec Context i18n
 */
export default async function LanguageLayout({ children, params }: LayoutProps) {
  const { lang: langParam } = await params
  const lang = validateLanguageParam(langParam)
  
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Préchargement DNS pour performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Hreflang tags pour SEO (généré côté server) */}
        {supportedLocales.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'}${locale === defaultLocale ? '' : `/${locale}`}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'}
        />
        
        {/* Schema.org structuré pour SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Video-IA.net",
              "description": METADATA_BY_LANGUAGE[lang].description,
              "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'}${lang === defaultLocale ? '' : `/${lang}`}`,
              "inLanguage": lang,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net'}${lang === defaultLocale ? '' : `/${lang}`}/tools?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Context Provider Global */}
        <I18nProvider currentLanguage={lang}>
          {/* Header avec contexte langue */}
          <Header currentLanguage={lang} />
          
          {/* Contenu principal */}
          <main className="min-h-screen">
            {children}
          </main>
          
          {/* Footer avec contexte langue */}
          <Footer currentLanguage={lang} />
        </I18nProvider>
        
        {/* Analytics et scripts de tracking */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                        custom_map: { custom_parameter: 'language' }
                      });
                      gtag('event', 'page_view', { language: '${lang}' });
                    `
                  }}
                />
              </>
            )}
          </>
        )}
      </body>
    </html>
  )
}


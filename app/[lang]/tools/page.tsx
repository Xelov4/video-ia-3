/**
 * Page Tools - Video-IA.net
 *
 * Page de listing des outils exploitant pleinement l'architecture data-driven
 * avec filtres avancés, pagination optimisée et interface moderne.
 *
 * Features:
 * - Architecture server/client avec données pré-chargées
 * - Filtres multicritères (audience, cas d'usage, catégorie, qualité)
 * - Pagination optimisée (24 outils/page)
 * - Vues multiples (grille/liste)
 * - SEO dynamique et multilingue
 * - Performance avec cache ISR
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SupportedLocale, supportedLocales } from '@/middleware';

import ToolsPageClient from './ToolsPageClient';

import { DataExtractionService } from '@/src/lib/services/dataExtraction';
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories';

// Interface pour paramètres de page
interface ToolsPageProps {
  params: Promise<{
    lang: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    audience?: string;
    useCase?: string;
    minQuality?: string;
    maxQuality?: string;
    hasImage?: string;
    hasVideo?: string;
    sort?: string;
    order?: string;
    view?: string;
  }>;
}

/**
 * Validation des paramètres
 */
function validateLanguageParam(lang: string): SupportedLocale {
  if (!supportedLocales.includes(lang as SupportedLocale)) {
    notFound();
  }
  return lang as SupportedLocale;
}

/**
 * Métadonnées SEO optimisées pour page Tools
 */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    audience?: string;
    useCase?: string;
    page?: string;
  }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { search, category, audience, useCase, page } = await searchParams;
  const validatedLang = validateLanguageParam(lang);

  // Construire titre dynamique basé sur filtres
  let titleSuffix = '';
  if (audience) titleSuffix += ` for ${audience}`;
  if (useCase) titleSuffix += ` - ${useCase}`;
  if (category) titleSuffix += ` in ${category}`;
  if (search) titleSuffix += ` matching "${search}"`;
  if (page && parseInt(page) > 1) titleSuffix += ` - Page ${page}`;

  const seoContent = {
    en: {
      title: `AI Tools Directory${titleSuffix} | Video-IA.net`,
      description: `Browse 16,765+ AI tools with advanced filters. Find the perfect tools by audience, use case, category, and quality rating. Professional reviews and comparisons.`,
      keywords:
        'AI tools directory, AI tools list, AI tools by category, AI tools for developers, AI tools for creators, AI tools comparison',
    },
    fr: {
      title: `Répertoire Outils IA${titleSuffix} | Video-IA.net`,
      description: `Parcourez 16 765+ outils IA avec des filtres avancés. Trouvez les outils parfaits par audience, cas d'usage, catégorie et note qualité. Avis professionnels et comparaisons.`,
      keywords:
        'répertoire outils IA, liste outils IA, outils IA par catégorie, outils IA développeurs, outils IA créateurs, comparaison outils IA',
    },
    it: {
      title: `Directory Strumenti AI${titleSuffix} | Video-IA.net`,
      description: `Sfoglia 16.765+ strumenti AI con filtri avanzati. Trova gli strumenti perfetti per pubblico, caso d'uso, categoria e valutazione qualità. Recensioni professionali e confronti.`,
      keywords:
        'directory strumenti AI, lista strumenti AI, strumenti AI per categoria, strumenti AI sviluppatori',
    },
    es: {
      title: `Directorio Herramientas IA${titleSuffix} | Video-IA.net`,
      description: `Explora 16.765+ herramientas IA con filtros avanzados. Encuentra las herramientas perfectas por audiencia, caso de uso, categoría y calificación de calidad. Reseñas profesionales y comparaciones.`,
      keywords:
        'directorio herramientas IA, lista herramientas IA, herramientas IA por categoría',
    },
    de: {
      title: `KI-Tools Verzeichnis${titleSuffix} | Video-IA.net`,
      description: `Durchsuchen Sie 16.765+ KI-Tools mit erweiterten Filtern. Finden Sie die perfekten Tools nach Zielgruppe, Anwendungsfall, Kategorie und Qualitätsbewertung. Professionelle Bewertungen und Vergleiche.`,
      keywords: 'KI-Tools Verzeichnis, KI-Tools Liste, KI-Tools nach Kategorie',
    },
    nl: {
      title: `AI Tools Directory${titleSuffix} | Video-IA.net`,
      description: `Verken 16.765+ AI-tools met geavanceerde filters. Vind de perfecte tools op publiek, use case, categorie en kwaliteitsbeoordeling. Professionele beoordelingen en vergelijkingen.`,
      keywords: 'AI-tools directory, AI-tools lijst, AI-tools per categorie',
    },
    pt: {
      title: `Diretório Ferramentas IA${titleSuffix} | Video-IA.net`,
      description: `Explore 16.765+ ferramentas IA com filtros avançados. Encontre as ferramentas perfeitas por público, caso de uso, categoria e avaliação de qualidade. Avaliações profissionais e comparações.`,
      keywords:
        'diretório ferramentas IA, lista ferramentas IA, ferramentas IA por categoria',
    },
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://video-ia.net';
  const langPrefix = validatedLang === 'en' ? '' : `/${validatedLang}`;
  const currentUrl = `${baseUrl}${langPrefix}/tools`;

  return {
    title: seoContent[validatedLang]?.title || seoContent['en'].title,
    description: seoContent[validatedLang]?.description || seoContent['en'].description,
    keywords: seoContent[validatedLang]?.keywords || seoContent['en'].keywords,
    openGraph: {
      title: seoContent[validatedLang]?.title || seoContent['en'].title,
      description:
        seoContent[validatedLang]?.description || seoContent['en'].description,
      url: currentUrl,
      siteName: 'Video-IA.net',
      locale: validatedLang,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-tools.jpg`,
          width: 1200,
          height: 630,
          alt: 'AI Tools Directory',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoContent[validatedLang]?.title || seoContent['en'].title,
      description:
        seoContent[validatedLang]?.description || seoContent['en'].description,
      images: [`${baseUrl}/og-tools.jpg`],
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        en: `${baseUrl}/tools`,
        fr: `${baseUrl}/fr/tools`,
        it: `${baseUrl}/it/tools`,
        es: `${baseUrl}/es/tools`,
        de: `${baseUrl}/de/tools`,
        nl: `${baseUrl}/nl/tools`,
        pt: `${baseUrl}/pt/tools`,
      },
    },
  };
}

/**
 * Page principale Tools avec architecture data-driven
 */
export default async function ToolsPage({ params, searchParams }: ToolsPageProps) {
  const { lang } = await params;
  const validatedLang = validateLanguageParam(lang);

  console.log(`🚀 Loading Tools page for language: ${validatedLang}`);

  try {
    // Chargement parallèle des données avec fallbacks gracieux
    const [audiencesResult, useCasesResult, categoriesResult, statsResult] =
      await Promise.allSettled([
        DataExtractionService.extractUniqueAudiences(20),
        DataExtractionService.extractUseCases(25),
        multilingualCategoriesService.getAllCategories(validatedLang, {
          limit: 30,
          includeCounts: true,
        }),
        DataExtractionService.getOverallStats(),
      ]);

    // Extraction des données avec fallbacks
    const audiences =
      audiencesResult.status === 'fulfilled' ? audiencesResult.value : [];
    const useCases = useCasesResult.status === 'fulfilled' ? useCasesResult.value : [];
    const categories =
      categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
    const stats =
      statsResult.status === 'fulfilled'
        ? statsResult.value
        : {
            totalTools: 16765,
            totalCategories: 140,
            totalAudiences: 50,
            totalUseCases: 100,
          };

    console.log(`✅ Tools page data loaded successfully for ${validatedLang}`);
    console.log(
      `📊 Stats: ${stats.totalTools} tools, ${audiences.length} audiences, ${useCases.length} use cases, ${categories.length} categories`
    );

    return (
      <ToolsPageClient
        lang={validatedLang}
        initialSearchParams={await searchParams}
        audiences={audiences}
        useCases={useCases}
        categories={categories}
        stats={stats}
      />
    );
  } catch (error) {
    console.error('❌ Error loading Tools page data:', error);

    // Fallback avec données minimales
    return (
      <ToolsPageClient
        lang={validatedLang}
        initialSearchParams={await searchParams}
        audiences={[]}
        useCases={[]}
        categories={[]}
        stats={{
          totalTools: 16765,
          totalCategories: 140,
          totalAudiences: 50,
          totalUseCases: 100,
        }}
      />
    );
  }
}

/**
 * Configuration ISR et optimisations de performance
 */
export const revalidate = 3600; // Revalidation toutes les heures
export const dynamic = 'force-dynamic'; // Force le rendu dynamique pour les filtres
export const fetchCache = 'force-cache'; // Force la mise en cache des données

/**
 * Génération statique des pages populaires
 */
export async function generateStaticParams() {
  const popularCombinations = [
    // Pages par langue
    { lang: 'en' },
    { lang: 'fr' },
    { lang: 'de' },
    { lang: 'it' },
    { lang: 'es' },
    { lang: 'nl' },
    { lang: 'pt' },

    // Combinaisons populaires avec filtres
    { lang: 'en', category: 'AI Video Tools' },
    { lang: 'en', category: 'AI Writing Tools' },
    { lang: 'en', category: 'AI Image Generation' },
    { lang: 'fr', category: 'Outils IA Vidéo' },
    { lang: 'fr', category: 'Outils IA Rédaction' },
    { lang: 'de', category: 'KI-Video-Tools' },
    { lang: 'de', category: 'KI-Schreib-Tools' },
    { lang: 'it', category: 'Strumenti AI Video' },
    { lang: 'es', category: 'Herramientas IA Video' },
    { lang: 'nl', category: 'AI Video Tools' },
    { lang: 'pt', category: 'Ferramentas IA Vídeo' },
  ];

  return popularCombinations;
}

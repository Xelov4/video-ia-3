import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SupportedLanguage } from '@/src/lib/i18n/types';
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories';
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools';
import { serializePrismaObject } from '@/src/lib/utils/prismaHelpers';
// Phase 2.2: Import des adaptateurs pour corriger tool_count/toolCount
import { adaptCategoryResponse, adaptToolsArray, type Tool } from '@/src/types';

interface CategoryPageProps {
  params: Promise<{ lang: SupportedLanguage; slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  const rawCategory = await multilingualCategoriesService.getCategoryBySlug(slug, lang);
  if (!rawCategory) {
    return { title: 'Category Not Found' };
  }

  // Phase 2.2: Apply adapter to ensure consistent property access
  const category = adaptCategoryResponse(
    rawCategory as unknown as Record<string, unknown>
  );

  const titles = {
    en: `${category.displayName} - AI Tools Category`,
    fr: `${category.displayName} - Catégorie d'Outils IA`,
    es: `${category.displayName} - Categoría de Herramientas IA`,
    de: `${category.displayName} - KI-Tools Kategorie`,
    it: `${category.displayName} - Categoria Strumenti IA`,
    nl: `${category.displayName} - AI-tools Categorie`,
    pt: `${category.displayName} - Categoria de Ferramentas IA`,
  };

  const descriptions = {
    en: `Discover the best AI tools in the ${category.displayName} category. Browse ${category.toolCount} tools with reviews, ratings, and detailed information.`,
    fr: `Découvrez les meilleurs outils IA dans la catégorie ${category.displayName}. Parcourez ${category.toolCount} outils avec avis, notes et informations détaillées.`,
    es: `Descubre las mejores herramientas de IA en la categoría ${category.displayName}. Navega por ${category.toolCount} herramientas con reseñas, calificaciones e información detallada.`,
    de: `Entdecken Sie die besten KI-Tools in der Kategorie ${category.displayName}. Durchsuchen Sie ${category.toolCount} Tools mit Bewertungen, Bewertungen und detaillierten Informationen.`,
    it: `Scopri i migliori strumenti IA nella categoria ${category.displayName}. Sfoglia ${category.toolCount} strumenti con recensioni, valutazioni e informazioni dettagliate.`,
    nl: `Ontdek de beste AI-tools in de categorie ${category.displayName}. Bekijk ${category.toolCount} tools met beoordelingen, beoordelingen en gedetailleerde informatie.`,
    pt: `Descubra as melhores ferramentas de IA na categoria ${category.displayName}. Navegue por ${category.toolCount} ferramentas com avaliações, classificações e informações detalhadas.`,
  };

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `https://video-ia.net/${lang}/c/${slug}`,
      languages: {
        en: `https://video-ia.net/en/c/${slug}`,
        fr: `https://video-ia.net/fr/c/${slug}`,
        es: `https://video-ia.net/es/c/${slug}`,
        de: `https://video-ia.net/de/c/${slug}`,
        it: `https://video-ia.net/it/c/${slug}`,
        nl: `https://video-ia.net/nl/c/${slug}`,
        pt: `https://video-ia.net/pt/c/${slug}`,
      },
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { lang, slug } = await params;

  const rawCategory = await multilingualCategoriesService.getCategoryBySlug(slug, lang);
  if (!rawCategory) {
    notFound();
  }

  // Phase 2.2: Apply adapter for consistent property access
  const category = adaptCategoryResponse(
    rawCategory as unknown as Record<string, unknown>
  );

  // Get tools in this category
  const toolsResult = await multilingualToolsService.getToolsByCategory(slug, lang, {
    page: 1,
    limit: 24,
    sortBy: 'quality_score',
    sortOrder: 'desc',
  });

  const serializedTools = serializePrismaObject(toolsResult.tools);
  // Phase 2.2: Apply adapters to ensure consistent tool properties
  const adaptedTools = adaptToolsArray(
    serializedTools as unknown as Record<string, unknown>[]
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <div className='mb-8'>
          <h1 className='mb-4 text-4xl font-bold text-gray-900'>
            {category.displayName}
          </h1>
          {category.displayDescription && (
            <p className='max-w-3xl text-lg text-gray-600'>
              {category.displayDescription}
            </p>
          )}
          <div className='mt-4 text-sm text-gray-500'>
            {toolsResult.pagination.totalCount} tools available
          </div>
        </div>

        {/* Tools Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {adaptedTools.map((tool: Tool) => (
            <div
              key={tool.id}
              className='overflow-hidden rounded-lg bg-white shadow-md'
            >
              <div className='p-6'>
                <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                  <a
                    href={`/${lang}/t/${tool.slug}`}
                    className='transition-colors hover:text-blue-600'
                  >
                    {tool.displayName}
                  </a>
                </h3>
                <p className='mb-3 line-clamp-2 text-sm text-gray-600'>
                  {tool.displayDescription}
                </p>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>{tool.toolCategory}</span>
                  {tool.qualityScore && (
                    <div className='flex items-center text-sm text-gray-500'>
                      <span className='mr-1 text-yellow-400'>★</span>
                      {tool.qualityScore}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-8 text-center text-sm text-gray-500'>
          Showing {adaptedTools.length} of {toolsResult.pagination.totalCount} tools
        </div>
      </div>
    </div>
  );
}

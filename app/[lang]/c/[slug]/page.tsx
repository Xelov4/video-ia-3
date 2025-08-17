import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLanguage } from '@/src/lib/i18n/types'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { serializePrismaObject } from '@/src/lib/utils/prismaHelpers'

interface CategoryPageProps {
  params: Promise<{ lang: SupportedLanguage; slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  
  const category = await multilingualCategoriesService.getCategoryBySlug(slug, lang)
  if (!category) {
    return { title: 'Category Not Found' }
  }

  const titles = {
    en: `${category.displayName} - AI Tools Category`,
    fr: `${category.displayName} - Catégorie d'Outils IA`,
    es: `${category.displayName} - Categoría de Herramientas IA`,
    de: `${category.displayName} - KI-Tools Kategorie`,
    it: `${category.displayName} - Categoria Strumenti IA`,
    nl: `${category.displayName} - AI-tools Categorie`,
    pt: `${category.displayName} - Categoria de Ferramentas IA`
  }

  const descriptions = {
    en: `Discover the best AI tools in the ${category.displayName} category. Browse ${category.tool_count} tools with reviews, ratings, and detailed information.`,
    fr: `Découvrez les meilleurs outils IA dans la catégorie ${category.displayName}. Parcourez ${category.tool_count} outils avec avis, notes et informations détaillées.`,
    es: `Descubre las mejores herramientas de IA en la categoría ${category.displayName}. Navega por ${category.tool_count} herramientas con reseñas, calificaciones e información detallada.`,
    de: `Entdecken Sie die besten KI-Tools in der Kategorie ${category.displayName}. Durchsuchen Sie ${category.tool_count} Tools mit Bewertungen, Bewertungen und detaillierten Informationen.`,
    it: `Scopri i migliori strumenti IA nella categoria ${category.displayName}. Sfoglia ${category.tool_count} strumenti con recensioni, valutazioni e informazioni dettagliate.`,
    nl: `Ontdek de beste AI-tools in de categorie ${category.displayName}. Bekijk ${category.tool_count} tools met beoordelingen, beoordelingen en gedetailleerde informatie.`,
    pt: `Descubra as melhores ferramentas de IA na categoria ${category.displayName}. Navegue por ${category.tool_count} ferramentas com avaliações, classificações e informações detalhadas.`
  }

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
        pt: `https://video-ia.net/pt/c/${slug}`
      }
    }
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { lang, slug } = await params
  
  const category = await multilingualCategoriesService.getCategoryBySlug(slug, lang)
  if (!category) {
    notFound()
  }

  // Get tools in this category
  const tools = await multilingualToolsService.getToolsByCategory(slug, lang, {
    page: 1,
    limit: 24,
    sortBy: 'quality_score',
    sortOrder: 'desc'
  })

  const serializedTools = serializePrismaObject(tools.tools)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category.displayName}
          </h1>
          {category.displayDescription && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {category.displayDescription}
            </p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            {tools.pagination.totalCount} tools available
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {serializedTools.map((tool: Record<string, unknown>) => (
            <div key={tool.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <a 
                    href={`/${lang}/t/${tool.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {tool.displayName}
                  </a>
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {tool.displayDescription}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {tool.tool_category}
                  </span>
                  {tool.quality_score && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="text-yellow-400 mr-1">★</span>
                      {tool.quality_score}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination would go here */}
      </div>
    </div>
  )
}

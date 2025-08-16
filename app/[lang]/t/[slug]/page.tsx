import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLanguage } from '@/src/lib/i18n/types'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { serializePrismaObject } from '@/src/lib/utils/prismaHelpers'

interface ToolPageProps {
  params: Promise<{ lang: SupportedLanguage; slug: string }>
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  
  const tool = await multilingualToolsService.getToolBySlug(slug, lang)
  if (!tool) {
    return { title: 'Tool Not Found' }
  }

  const titles = {
    en: `${tool.displayName} - AI Tool Review & Information`,
    fr: `${tool.displayName} - Avis et Informations sur l'Outil IA`,
    es: `${tool.displayName} - Reseña e Información de Herramienta IA`,
    de: `${tool.displayName} - KI-Tool Bewertung & Informationen`,
    it: `${tool.displayName} - Recensione e Informazioni Strumento IA`,
    nl: `${tool.displayName} - AI-tool Beoordeling & Informatie`,
    pt: `${tool.displayName} - Avaliação e Informações da Ferramenta IA`
  }

  const descriptions = {
    en: `${tool.displayDescription}. Discover features, pricing, and user reviews for this AI tool.`,
    fr: `${tool.displayDescription}. Découvrez les fonctionnalités, tarifs et avis utilisateurs pour cet outil IA.`,
    es: `${tool.displayDescription}. Descubre características, precios y reseñas de usuarios para esta herramienta de IA.`,
    de: `${tool.displayDescription}. Entdecken Sie Funktionen, Preise und Benutzerbewertungen für dieses KI-Tool.`,
    it: `${tool.displayDescription}. Scopri caratteristiche, prezzi e recensioni degli utenti per questo strumento IA.`,
    nl: `${tool.displayDescription}. Ontdek functies, prijzen en gebruikersbeoordelingen voor dit AI-tool.`,
    pt: `${tool.displayDescription}. Descubra recursos, preços e avaliações de usuários para esta ferramenta de IA.`
  }

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `https://video-ia.net/${lang}/t/${slug}`,
      languages: {
        en: `https://video-ia.net/en/t/${slug}`,
        fr: `https://video-ia.net/fr/t/${slug}`,
        es: `https://video-ia.net/es/t/${slug}`,
        de: `https://video-ia.net/de/t/${slug}`,
        it: `https://video-ia.net/it/t/${slug}`,
        nl: `https://video-ia.net/nl/t/${slug}`,
        pt: `https://video-ia.net/pt/t/${slug}`
      }
    }
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { lang, slug } = await params
  
  const tool = await multilingualToolsService.getToolBySlug(slug, lang)
  if (!tool) {
    notFound()
  }

  const serializedTool = serializePrismaObject(tool)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href={`/${lang}`} className="hover:text-blue-600">
                Home
              </a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <a href={`/${lang}/tools`} className="hover:text-blue-600">
                Tools
              </a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">{tool.displayName}</span>
            </li>
          </ol>
        </nav>

        {/* Tool Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Tool Image */}
            <div className="lg:w-1/3">
              {tool.image_url ? (
                <img 
                  src={tool.image_url} 
                  alt={tool.displayName}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No Image</span>
                </div>
              )}
            </div>

            {/* Tool Info */}
            <div className="lg:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-gray-900">
                  {tool.displayName}
                </h1>
                {tool.is_featured && (
                  <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {tool.displayDescription && (
                <p className="text-lg text-gray-600 mb-6">
                  {tool.displayDescription}
                </p>
              )}

              {tool.displayOverview && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                  <p className="text-gray-600">{tool.displayOverview}</p>
                </div>
              )}

              {/* Tool Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {tool.tool_category && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category</span>
                    <p className="text-gray-900">
                      <a 
                        href={`/${lang}/c/${tool.tool_category}`}
                        className="text-blue-600 hover:underline"
                      >
                        {tool.tool_category}
                      </a>
                    </p>
                  </div>
                )}

                {tool.pricing_type && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Pricing</span>
                    <p className="text-gray-900">{tool.pricing_type}</p>
                  </div>
                )}

                {tool.quality_score && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Quality Score</span>
                    <p className="text-gray-900 flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      {tool.quality_score}/10
                    </p>
                  </div>
                )}

                {tool.view_count && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Views</span>
                    <p className="text-gray-900">{tool.view_count.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Visit Tool
                </a>
                {tool.pricing_url && (
                  <a
                    href={tool.pricing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                  >
                    View Pricing
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        {tool.target_audience && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Target Audience</h3>
            <p className="text-gray-600">{tool.target_audience}</p>
          </div>
        )}

        {tool.use_cases && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Use Cases</h3>
            <p className="text-gray-600">{tool.use_cases}</p>
          </div>
        )}

        {tool.key_features && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
            <p className="text-gray-600">{tool.key_features}</p>
          </div>
        )}

        {tool.tags && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tool.tags.split(',').map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

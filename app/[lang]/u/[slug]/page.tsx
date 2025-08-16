import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SupportedLanguage } from '@/src/lib/i18n/types'
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools'
import { serializePrismaObject } from '@/src/lib/utils/prismaHelpers'

interface UseCasePageProps {
  params: Promise<{ lang: SupportedLanguage; slug: string }>
}

export async function generateMetadata({ params }: UseCasePageProps): Promise<Metadata> {
  const { lang, slug } = await params
  
  // Convert slug to readable use case name
  const useCaseName = slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  const titles = {
    en: `${useCaseName} - AI Tools for This Use Case`,
    fr: `${useCaseName} - Outils IA pour Ce Cas d'Usage`,
    es: `${useCaseName} - Herramientas IA para Este Caso de Uso`,
    de: `${useCaseName} - KI-Tools für diesen Anwendungsfall`,
    it: `${useCaseName} - Strumenti IA per Questo Caso d'Uso`,
    nl: `${useCaseName} - AI-tools voor Dit Gebruiksscenario`,
    pt: `${useCaseName} - Ferramentas de IA para Este Caso de Uso`
  }

  const descriptions = {
    en: `Find the best AI tools for ${useCaseName.toLowerCase()}. Discover solutions that help you accomplish your goals efficiently.`,
    fr: `Trouvez les meilleurs outils IA pour ${useCaseName.toLowerCase()}. Découvrez des solutions qui vous aident à atteindre vos objectifs efficacement.`,
    es: `Encuentra las mejores herramientas de IA para ${useCaseName.toLowerCase()}. Descubre soluciones que te ayudan a lograr tus objetivos de manera eficiente.`,
    de: `Finden Sie die besten KI-Tools für ${useCaseName.toLowerCase()}. Entdecken Sie Lösungen, die Ihnen helfen, Ihre Ziele effizient zu erreichen.`,
    it: `Trova i migliori strumenti IA per ${useCaseName.toLowerCase()}. Scopri soluzioni che ti aiutano a raggiungere i tuoi obiettivi in modo efficiente.`,
    nl: `Vind de beste AI-tools voor ${useCaseName.toLowerCase()}. Ontdek oplossingen die u helpen uw doelen efficiënt te bereiken.`,
    pt: `Encontre as melhores ferramentas de IA para ${useCaseName.toLowerCase()}. Descubra soluções que o ajudam a alcançar seus objetivos de forma eficiente.`
  }

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `https://video-ia.net/${lang}/u/${slug}`,
      languages: {
        en: `https://video-ia.net/en/u/${slug}`,
        fr: `https://video-ia.net/fr/u/${slug}`,
        es: `https://video-ia.net/es/u/${slug}`,
        de: `https://video-ia.net/de/u/${slug}`,
        it: `https://video-ia.net/it/u/${slug}`,
        nl: `https://video-ia.net/nl/u/${slug}`,
        pt: `https://video-ia.net/pt/u/${slug}`
      }
    }
  }
}

export default async function UseCasePage({ params }: UseCasePageProps) {
  const { lang, slug } = await params
  
  // Convert slug to use case filter
  const useCaseFilter = slug.split('-').join(' ')
  
  // Get tools for this use case
  const tools = await multilingualToolsService.searchTools({
    language: lang,
    useCase: useCaseFilter,
    page: 1,
    limit: 24,
    sortBy: 'quality_score',
    sortOrder: 'desc'
  })

  if (!tools.tools.length) {
    notFound()
  }

  const serializedTools = serializePrismaObject(tools.tools)
  const useCaseName = slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Tools for {useCaseName}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Discover the best AI tools designed specifically for {useCaseName.toLowerCase()}. 
            These solutions will help you streamline your workflow and achieve better results.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {tools.pagination.totalCount} tools available for {useCaseName.toLowerCase()}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {serializedTools.map((tool: any) => (
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

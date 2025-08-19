import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SupportedLanguage } from '@/src/lib/i18n/types';
import { multilingualToolsService } from '@/src/lib/database/services/multilingual-tools';
import { serializePrismaObject } from '@/src/lib/utils/prismaHelpers';

interface AudiencePageProps {
  params: Promise<{ lang: SupportedLanguage; slug: string }>;
}

export async function generateMetadata({
  params,
}: AudiencePageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  // Convert slug to readable audience name
  const audienceName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const titles = {
    en: `${audienceName} - AI Tools for Your Needs`,
    fr: `${audienceName} - Outils IA pour Vos Besoins`,
    es: `${audienceName} - Herramientas IA para Tus Necesidades`,
    de: `${audienceName} - KI-Tools für Ihre Bedürfnisse`,
    it: `${audienceName} - Strumenti IA per le Tue Esigenze`,
    nl: `${audienceName} - AI-tools voor Uw Behoeften`,
    pt: `${audienceName} - Ferramentas de IA para Suas Necessidades`,
  };

  const descriptions = {
    en: `Discover AI tools specifically designed for ${audienceName.toLowerCase()}. Find the perfect solutions to enhance your productivity and creativity.`,
    fr: `Découvrez des outils IA spécialement conçus pour ${audienceName.toLowerCase()}. Trouvez les solutions parfaites pour améliorer votre productivité et créativité.`,
    es: `Descubre herramientas de IA diseñadas específicamente para ${audienceName.toLowerCase()}. Encuentra las soluciones perfectas para mejorar tu productividad y creatividad.`,
    de: `Entdecken Sie KI-Tools, die speziell für ${audienceName.toLowerCase()} entwickelt wurden. Finden Sie die perfekten Lösungen, um Ihre Produktivität und Kreativität zu steigern.`,
    it: `Scopri strumenti IA progettati specificamente per ${audienceName.toLowerCase()}. Trova le soluzioni perfette per migliorare la tua produttività e creatività.`,
    nl: `Ontdek AI-tools die specifiek zijn ontworpen voor ${audienceName.toLowerCase()}. Vind de perfecte oplossingen om uw productiviteit en creativiteit te verbeteren.`,
    pt: `Descubra ferramentas de IA projetadas especificamente para ${audienceName.toLowerCase()}. Encontre as soluções perfeitas para melhorar sua produtividade e criatividade.`,
  };

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `https://video-ia.net/${lang}/p/${slug}`,
      languages: {
        en: `https://video-ia.net/en/p/${slug}`,
        fr: `https://video-ia.net/fr/p/${slug}`,
        es: `https://video-ia.net/es/p/${slug}`,
        de: `https://video-ia.net/de/p/${slug}`,
        it: `https://video-ia.net/it/p/${slug}`,
        nl: `https://video-ia.net/nl/p/${slug}`,
        pt: `https://video-ia.net/pt/p/${slug}`,
      },
    },
  };
}

export default async function AudiencePage({ params }: AudiencePageProps) {
  const { lang, slug } = await params;

  // Convert slug to audience filter
  const audienceFilter = slug.split('-').join(' ');

  // Get tools for this audience
  const tools = await multilingualToolsService.searchTools({
    language: lang,
    // Note: audience filtering not supported by current API
    page: 1,
    limit: 24,
    sortBy: 'quality_score',
    sortOrder: 'desc',
  });

  if (!tools.tools.length) {
    notFound();
  }

  const serializedTools = serializePrismaObject(tools.tools);
  const audienceName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <div className='mb-8'>
          <h1 className='mb-4 text-4xl font-bold text-gray-900'>
            AI Tools for {audienceName}
          </h1>
          <p className='max-w-3xl text-lg text-gray-600'>
            Discover the best AI tools specifically designed to meet the needs of{' '}
            {audienceName.toLowerCase()}. Find solutions that enhance your workflow and
            boost productivity.
          </p>
          <div className='mt-4 text-sm text-gray-500'>
            {tools.pagination.totalCount} tools available for{' '}
            {audienceName.toLowerCase()}
          </div>
        </div>

        {/* Tools Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {serializedTools.map((tool: any) => (
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
                  <span className='text-sm text-gray-500'>{tool.tool_category}</span>
                  {tool.quality_score && (
                    <div className='flex items-center text-sm text-gray-500'>
                      <span className='mr-1 text-yellow-400'>★</span>
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
  );
}

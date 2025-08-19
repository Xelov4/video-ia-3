import { Metadata } from 'next';
import { SupportedLanguage } from '@/src/lib/i18n/types';
import {
  multilingualToolsService,
  ToolWithTranslation,
} from '@/src/lib/database/services/multilingual-tools';

interface AudiencesPageProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export async function generateMetadata({
  params,
}: AudiencesPageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    en: 'AI Tools by Target Audience - Find Your Perfect Match',
    fr: 'Outils IA par Public Cible - Trouvez Votre Match Parfait',
    es: 'Herramientas IA por Audiencia Objetivo - Encuentra tu Combinación Perfecta',
    de: 'KI-Tools nach Zielgruppe - Finden Sie Ihren perfekten Match',
    it: 'Strumenti IA per Pubblico Target - Trova la Tua Combinazione Perfetta',
    nl: 'AI-tools per Doelgroep - Vind je Perfecte Match',
    pt: 'Ferramentas de IA por Público-Alvo - Encontre sua Combinação Perfeita',
  };

  const descriptions = {
    en: 'Discover AI tools tailored for specific audiences: content creators, developers, marketers, educators, and more. Find solutions designed for your needs.',
    fr: 'Découvrez des outils IA adaptés à des publics spécifiques : créateurs de contenu, développeurs, marketeurs, éducateurs et plus encore. Trouvez des solutions conçues pour vos besoins.',
    es: 'Descubre herramientas de IA adaptadas para audiencias específicas: creadores de contenido, desarrolladores, especialistas en marketing, educadores y más. Encuentra soluciones diseñadas para tus necesidades.',
    de: 'Entdecken Sie KI-Tools, die für bestimmte Zielgruppen entwickelt wurden: Content Creator, Entwickler, Vermarkter, Pädagogen und mehr. Finden Sie Lösungen, die für Ihre Bedürfnisse entwickelt wurden.',
    it: 'Scopri strumenti IA adattati per pubblici specifici: creatori di contenuti, sviluppatori, marketer, educatori e molto altro. Trova soluzioni progettate per le tue esigenze.',
    nl: 'Ontdek AI-tools die zijn aangepast voor specifieke doelgroepen: content creators, ontwikkelaars, marketeers, docenten en meer. Vind oplossingen die zijn ontworpen voor jouw behoeften.',
    pt: 'Descubra ferramentas de IA adaptadas para públicos específicos: criadores de conteúdo, desenvolvedores, profissionais de marketing, educadores e muito mais. Encontre soluções projetadas para suas necessidades.',
  };

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `https://video-ia.net/${lang}/p`,
      languages: {
        en: 'https://video-ia.net/p',
        fr: 'https://video-ia.net/fr/p',
        es: 'https://video-ia.net/es/p',
        de: 'https://video-ia.net/de/p',
        it: 'https://video-ia.net/it/p',
        nl: 'https://video-ia.net/nl/p',
        pt: 'https://video-ia.net/pt/p',
      },
    },
  };
}

export default async function AudiencesPage({ params }: AudiencesPageProps) {
  const { lang } = await params;

  // Get unique audiences from tools
  const tools = await multilingualToolsService.searchTools({
    language: lang,
    page: 1,
    limit: 1000, // Get more tools to extract audiences
  });

  // Extract unique audiences
  const audiences = new Map<string, { name: string; count: number; slug: string }>();

  tools.tools.forEach((tool: ToolWithTranslation) => {
    if (tool.targetAudience) {
      const audienceName = tool.targetAudience.trim();
      const slug = audienceName.toLowerCase().replace(/\s+/g, '-');

      if (audiences.has(audienceName)) {
        audiences.get(audienceName)!.count++;
      } else {
        audiences.set(audienceName, { name: audienceName, count: 1, slug });
      }
    }
  });

  const serializedAudiences = Array.from(audiences.values()).sort(
    (a, b) => b.count - a.count
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <div className='mb-8'>
          <h1 className='mb-4 text-4xl font-bold text-gray-900'>
            {lang === 'fr'
              ? 'Outils IA par Public Cible'
              : 'AI Tools by Target Audience'}
          </h1>
          <p className='max-w-3xl text-lg text-gray-600'>
            {lang === 'fr'
              ? 'Découvrez des outils IA adaptés à des publics spécifiques. Trouvez des solutions conçues pour vos besoins et votre profil.'
              : 'Discover AI tools tailored for specific audiences. Find solutions designed for your needs and profile.'}
          </p>
        </div>

        {/* Audiences Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {serializedAudiences.map(audience => (
            <div
              key={audience.slug}
              className='overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg'
            >
              <div className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    <a
                      href={`/${lang}/p/${audience.slug}`}
                      className='transition-colors hover:text-blue-600'
                    >
                      {audience.name}
                    </a>
                  </h3>
                  <span className='text-sm text-gray-500'>{audience.count} tools</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>
                    {audience.count} {lang === 'fr' ? 'outils' : 'tools'} disponibles
                  </span>
                  <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                    {lang === 'fr' ? 'Public' : 'Audience'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {serializedAudiences.length === 0 && (
          <div className='py-12 text-center'>
            <p className='text-lg text-gray-500'>
              {lang === 'fr'
                ? 'Aucune audience trouvée pour le moment.'
                : 'No audiences found at the moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

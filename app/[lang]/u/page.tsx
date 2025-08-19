import { Metadata } from 'next';
import { SupportedLanguage } from '@/src/lib/i18n/types';
import {
  multilingualToolsService,
  ToolWithTranslation,
} from '@/src/lib/database/services/multilingual-tools';

interface UseCasesPageProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export async function generateMetadata({
  params,
}: UseCasesPageProps): Promise<Metadata> {
  const { lang } = await params;

  const titles = {
    en: 'AI Tools by Use Case - Find Solutions for Your Needs',
    fr: "Outils IA par Cas d'Usage - Trouvez des Solutions pour Vos Besoins",
    es: 'Herramientas IA por Caso de Uso - Encuentra Soluciones para tus Necesidades',
    de: 'KI-Tools nach Anwendungsfall - Finden Sie Lösungen für Ihre Bedürfnisse',
    it: "Strumenti IA per Caso d'Uso - Trova Soluzioni per le Tue Esigenze",
    nl: 'AI-tools per Gebruiksscenario - Vind Oplossingen voor je Behoeften',
    pt: 'Ferramentas de IA por Caso de Uso - Encontre Soluções para suas Necessidades',
  };

  const descriptions = {
    en: 'Discover AI tools organized by use case: video creation, content writing, image editing, data analysis, and more. Find the perfect solution for your specific needs.',
    fr: "Découvrez des outils IA organisés par cas d'usage : création vidéo, écriture de contenu, édition d'image, analyse de données et plus encore. Trouvez la solution parfaite pour vos besoins spécifiques.",
    es: 'Descubre herramientas de IA organizadas por caso de uso: creación de video, escritura de contenido, edición de imagen, análisis de datos y más. Encuentra la solución perfecta para tus necesidades específicas.',
    de: 'Entdecken Sie KI-Tools nach Anwendungsfall geordnet: Videobearbeitung, Content-Erstellung, Bildbearbeitung, Datenanalyse und mehr. Finden Sie die perfekte Lösung für Ihre spezifischen Bedürfnisse.',
    it: "Scopri strumenti IA organizzati per caso d'uso: creazione video, scrittura di contenuti, editing di immagini, analisi dei dati e molto altro. Trova la soluzione perfetta per le tue esigenze specifiche.",
    nl: 'Ontdek AI-tools georganiseerd per gebruiksscenario: videobewerking, content schrijven, beeldbewerking, data-analyse en meer. Vind de perfecte oplossing voor jouw specifieke behoeften.',
    pt: 'Descubra ferramentas de IA organizadas por caso de uso: criação de vídeo, escrita de conteúdo, edição de imagem, análise de dados e muito mais. Encontre a solução perfeita para suas necessidades específicas.',
  };

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `https://video-ia.net/${lang}/u`,
      languages: {
        en: 'https://video-ia.net/u',
        fr: 'https://video-ia.net/fr/u',
        es: 'https://video-ia.net/es/u',
        de: 'https://video-ia.net/de/u',
        it: 'https://video-ia.net/it/u',
        nl: 'https://video-ia.net/nl/u',
        pt: 'https://video-ia.net/pt/u',
      },
    },
  };
}

export default async function UseCasesPage({ params }: UseCasesPageProps) {
  const { lang } = await params;

  // Get unique use cases from tools
  const tools = await multilingualToolsService.searchTools({
    language: lang,
    page: 1,
    limit: 1000, // Get more tools to extract use cases
  });

  // Extract unique use cases
  const useCases = new Map<string, { name: string; count: number; slug: string }>();

  tools.tools.forEach((tool: ToolWithTranslation) => {
    if (tool.useCases) {
      const useCaseName = tool.useCases.trim();
      const slug = useCaseName.toLowerCase().replace(/\s+/g, '-');

      if (useCases.has(useCaseName)) {
        useCases.get(useCaseName)!.count++;
      } else {
        useCases.set(useCaseName, { name: useCaseName, count: 1, slug });
      }
    }
  });

  const serializedUseCases = Array.from(useCases.values()).sort(
    (a, b) => b.count - a.count
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <div className='mb-8'>
          <h1 className='mb-4 text-4xl font-bold text-gray-900'>
            {lang === 'fr' ? "Outils IA par Cas d'Usage" : 'AI Tools by Use Case'}
          </h1>
          <p className='max-w-3xl text-lg text-gray-600'>
            {lang === 'fr'
              ? "Découvrez des outils IA organisés par cas d'usage. Trouvez la solution parfaite pour vos besoins spécifiques."
              : 'Discover AI tools organized by use case. Find the perfect solution for your specific needs.'}
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {serializedUseCases.map(useCase => (
            <div
              key={useCase.slug}
              className='overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg'
            >
              <div className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    <a
                      href={`/${lang}/u/${useCase.slug}`}
                      className='transition-colors hover:text-blue-600'
                    >
                      {useCase.name}
                    </a>
                  </h3>
                  <span className='text-sm text-gray-500'>{useCase.count} tools</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>
                    {useCase.count} {lang === 'fr' ? 'outils' : 'tools'} disponibles
                  </span>
                  <span className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-800'>
                    {lang === 'fr' ? "Cas d'usage" : 'Use Case'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {serializedUseCases.length === 0 && (
          <div className='py-12 text-center'>
            <p className='text-lg text-gray-500'>
              {lang === 'fr'
                ? "Aucun cas d'usage trouvé pour le moment."
                : 'No use cases found at the moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

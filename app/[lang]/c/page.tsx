import { Metadata } from 'next'
import { SupportedLanguage } from '@/src/lib/i18n/types'
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'
import { serializePrismaObject } from '@/src/lib/utils/prismaHelpers'

interface CategoriesPageProps {
  params: Promise<{ lang: SupportedLanguage }>
}

export async function generateMetadata({ params }: CategoriesPageProps): Promise<Metadata> {
  const { lang } = await params
  
  const titles = {
    en: 'AI Tool Categories - Browse by Type',
    fr: 'Catégories d\'Outils IA - Parcourir par Type',
    es: 'Categorías de Herramientas IA - Navegar por Tipo',
    de: 'KI-Tool Kategorien - Nach Typ durchsuchen',
    it: 'Categorie Strumenti IA - Sfoglia per Tipo',
    nl: 'AI-tool Categorieën - Bladeren op Type',
    pt: 'Categorias de Ferramentas IA - Navegar por Tipo'
  }

  const descriptions = {
    en: 'Explore AI tools organized by category. Find the perfect solution for video creation, content writing, image editing, and more.',
    fr: 'Explorez les outils IA organisés par catégorie. Trouvez la solution parfaite pour la création vidéo, l\'écriture de contenu, l\'édition d\'image et plus encore.',
    es: 'Explora herramientas de IA organizadas por categoría. Encuentra la solución perfecta para creación de video, escritura de contenido, edición de imagen y más.',
    de: 'Entdecken Sie KI-Tools nach Kategorien geordnet. Finden Sie die perfekte Lösung für Videobearbeitung, Content-Erstellung, Bildbearbeitung und mehr.',
    it: 'Esplora strumenti IA organizzati per categoria. Trova la soluzione perfetta per creazione video, scrittura di contenuti, editing di immagini e altro ancora.',
    nl: 'Verken AI-tools georganiseerd per categorie. Vind de perfecte oplossing voor videobewerking, content schrijven, beeldbewerking en meer.',
    pt: 'Explore ferramentas de IA organizadas por categoria. Encontre a solução perfeita para criação de vídeo, escrita de conteúdo, edição de imagem e muito mais.'
  }

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    alternates: {
      canonical: `https://video-ia.net/${lang}/c`,
      languages: {
        en: 'https://video-ia.net/c',
        fr: 'https://video-ia.net/fr/c',
        es: 'https://video-ia.net/es/c',
        de: 'https://video-ia.net/de/c',
        it: 'https://video-ia.net/it/c',
        nl: 'https://video-ia.net/nl/c',
        pt: 'https://video-ia.net/pt/c'
      }
    }
  }
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { lang } = await params
  
  const categories = await multilingualCategoriesService.getAllCategories(lang, {
    includeEmpty: false
  })

  const serializedCategories = serializePrismaObject(categories)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {lang === 'fr' ? 'Catégories d\'Outils IA' : 'AI Tool Categories'}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            {lang === 'fr' 
              ? 'Explorez notre collection complète d\'outils IA organisés par catégorie. Trouvez la solution parfaite pour vos besoins.'
              : 'Explore our comprehensive collection of AI tools organized by category. Find the perfect solution for your needs.'
            }
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {serializedCategories.map((category: any) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <a 
                      href={`/${lang}/c/${category.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {category.displayName || category.name}
                    </a>
                  </h3>
                  <span className="text-sm text-gray-500">
                    {category.tool_count} tools
                  </span>
                </div>
                
                {category.displayDescription && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.displayDescription}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.tool_count} {lang === 'fr' ? 'outils' : 'tools'}
                  </span>
                  {category.is_featured && (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                      ⭐ {lang === 'fr' ? 'En vedette' : 'Featured'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

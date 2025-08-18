/**
 * Single Blog Post Page - Affichage d'un article spécifique
 * 
 * Page pour afficher un article de blog complet avec son contenu,
 * métadonnées, catégories et commentaires.
 * 
 * @author Video-IA.net Development Team
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  CalendarIcon, 
  ClockIcon, 
  EyeIcon, 
  ChatBubbleLeftIcon, 
  UserIcon, 
  ArrowLeftIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { SupportedLocale, supportedLocales } from '@/middleware'

interface BlogPost {
  id: number
  slug: string
  status: string
  postType: string
  featuredImageUrl?: string
  isFeatured: boolean
  allowComments: boolean
  viewCount: number
  readingTimeMinutes?: number
  publishedAt: string
  createdAt: string
  updatedAt: string
  author: {
    id: number
    name: string
    email: string
  }
  translation: {
    title: string
    content: string
    excerpt?: string
    metaTitle?: string
    metaDescription?: string
  }
  postCategories: Array<{
    category: {
      id: number
      name: string
      slug: string
    }
  }>
  postTags: Array<{
    tag: {
      id: number
      name: string
      slug: string
    }
  }>
  _count: {
    comments: number
  }
}

interface BlogPostPageProps {
  params: Promise<{
    lang: SupportedLocale
    slug: string
  }>
}

/**
 * Validation des paramètres de langue
 */
function validateLanguageParam(lang: string): SupportedLocale {
  if (!supportedLocales.includes(lang as SupportedLocale)) {
    notFound()
  }
  return lang as SupportedLocale
}

async function getPost(slug: string, language: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002'
    const response = await fetch(`${baseUrl}/api/blog/posts/${slug}?lang=${language}`, {
      cache: 'no-store' // Pas de cache pour comptabiliser les vues
    })
    
    if (!response.ok) {
      return null
    }
    
    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const validatedLang = validateLanguageParam(resolvedParams.lang)
  const post = await getPost(resolvedParams.slug, validatedLang)
  
  if (!post) {
    return {
      title: 'Article non trouvé | Video-IA.net',
      description: 'L\'article demandé n\'existe pas ou n\'est plus disponible.'
    }
  }

  return {
    title: post.translation.metaTitle || `${post.translation.title} | Video-IA.net`,
    description: post.translation.metaDescription || post.translation.excerpt || 'Article du blog Video-IA.net',
    openGraph: {
      title: post.translation.title,
      description: post.translation.excerpt || 'Article du blog Video-IA.net',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.translation.title,
      description: post.translation.excerpt || 'Article du blog Video-IA.net',
      images: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    }
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params
  const validatedLang = validateLanguageParam(resolvedParams.lang)
  const post = await getPost(resolvedParams.slug, validatedLang)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href={`/${validatedLang}/blog`} 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour au blog
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de l'article */}
        <header className="mb-8">
          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
            
            {post.readingTimeMinutes && (
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                {post.readingTimeMinutes} min de lecture
              </div>
            )}
            
            <div className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-2" />
              {post.viewCount} vues
            </div>
            
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              {post.author.name}
            </div>
            
            {post.allowComments && post._count.comments > 0 && (
              <div className="flex items-center">
                <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                {post._count.comments} commentaires
              </div>
            )}
          </div>

          {/* Titre */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.translation.title}
          </h1>

          {/* Extrait si disponible */}
          {post.translation.excerpt && (
            <div className="text-xl text-gray-600 mb-6 leading-relaxed">
              {post.translation.excerpt}
            </div>
          )}

          {/* Catégories et tags */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            {post.postCategories.length > 0 && (
              <div className="flex items-center">
                <FolderIcon className="w-4 h-4 mr-2 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {post.postCategories.map(({ category }) => (
                    <Link
                      key={category.id}
                      href={`/${validatedLang}/blog?category=${category.slug}`}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {post.postTags.length > 0 && (
              <div className="flex items-center">
                <TagIcon className="w-4 h-4 mr-2 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {post.postTags.slice(0, 5).map(({ tag }) => (
                    <Link
                      key={tag.id}
                      href={`/${validatedLang}/blog?tag=${tag.slug}`}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                  {post.postTags.length > 5 && (
                    <span className="px-2 py-1 text-gray-500 text-sm">
                      +{post.postTags.length - 5} autres
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Image mise en avant */}
          {post.featuredImageUrl && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.featuredImageUrl}
                alt={post.translation.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Contenu de l'article */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div 
            className="prose prose-gray max-w-none prose-lg prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-4"
            dangerouslySetInnerHTML={{ __html: post.translation.content }}
          />
        </div>

        {/* Footer de l'article */}
        <footer className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              <p>
                Publié le {formatDateTime(post.publishedAt)}
                {post.updatedAt !== post.publishedAt && (
                  <span> • Mis à jour le {formatDateTime(post.updatedAt)}</span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {post.isFeatured && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Article en vedette
                </span>
              )}
              
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {post.postType}
              </span>
            </div>
          </div>
        </footer>

        {/* Section commentaires (placeholder) */}
        {post.allowComments && (
          <section className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Commentaires ({post._count.comments})
            </h2>
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Les commentaires seront bientôt disponibles.</p>
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
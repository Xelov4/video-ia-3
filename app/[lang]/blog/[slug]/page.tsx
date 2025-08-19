/**
 * Single Blog Post Page - Affichage d'un article spécifique
 *
 * Page pour afficher un article de blog complet avec son contenu,
 * métadonnées, catégories et commentaires.
 *
 * @author Video-IA.net Development Team
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  ArrowLeftIcon,
  TagIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { SupportedLocale, supportedLocales } from '@/middleware';

interface BlogPost {
  id: number;
  slug: string;
  status: string;
  postType: string;
  featuredImageUrl?: string;
  isFeatured: boolean;
  allowComments: boolean;
  viewCount: number;
  readingTimeMinutes?: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  translation: {
    title: string;
    content: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  postCategories: Array<{
    category: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  postTags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  _count: {
    comments: number;
  };
}

interface BlogPostPageProps {
  params: Promise<{
    lang: SupportedLocale;
    slug: string;
  }>;
}

/**
 * Validation des paramètres de langue
 */
function validateLanguageParam(lang: string): SupportedLocale {
  if (!supportedLocales.includes(lang as SupportedLocale)) {
    notFound();
  }
  return lang as SupportedLocale;
}

async function getPost(slug: string, language: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/blog/posts/${slug}?lang=${language}`, {
      cache: 'no-store', // Pas de cache pour comptabiliser les vues
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const validatedLang = validateLanguageParam(resolvedParams.lang);
  const post = await getPost(resolvedParams.slug, validatedLang);

  if (!post) {
    return {
      title: 'Article non trouvé | Video-IA.net',
      description: "L'article demandé n'existe pas ou n'est plus disponible.",
    };
  }

  return {
    title: post.translation.metaTitle || `${post.translation.title} | Video-IA.net`,
    description:
      post.translation.metaDescription ||
      post.translation.excerpt ||
      'Article du blog Video-IA.net',
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
    },
  };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const validatedLang = validateLanguageParam(resolvedParams.lang);
  const post = await getPost(resolvedParams.slug, validatedLang);

  if (!post) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Breadcrumb */}
      <div className='border-b bg-white'>
        <div className='mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8'>
          <Link
            href={`/${validatedLang}/blog`}
            className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900'
          >
            <ArrowLeftIcon className='mr-2 h-4 w-4' />
            Retour au blog
          </Link>
        </div>
      </div>

      <article className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header de l'article */}
        <header className='mb-8'>
          {/* Métadonnées */}
          <div className='mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600'>
            <div className='flex items-center'>
              <CalendarIcon className='mr-2 h-4 w-4' />
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </div>

            {post.readingTimeMinutes && (
              <div className='flex items-center'>
                <ClockIcon className='mr-2 h-4 w-4' />
                {post.readingTimeMinutes} min de lecture
              </div>
            )}

            <div className='flex items-center'>
              <EyeIcon className='mr-2 h-4 w-4' />
              {post.viewCount} vues
            </div>

            <div className='flex items-center'>
              <UserIcon className='mr-2 h-4 w-4' />
              {post.author.name}
            </div>

            {post.allowComments && post._count.comments > 0 && (
              <div className='flex items-center'>
                <ChatBubbleLeftIcon className='mr-2 h-4 w-4' />
                {post._count.comments} commentaires
              </div>
            )}
          </div>

          {/* Titre */}
          <h1 className='mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl'>
            {post.translation.title}
          </h1>

          {/* Extrait si disponible */}
          {post.translation.excerpt && (
            <div className='mb-6 text-xl leading-relaxed text-gray-600'>
              {post.translation.excerpt}
            </div>
          )}

          {/* Catégories et tags */}
          <div className='mb-6 flex flex-wrap items-center gap-6'>
            {post.postCategories.length > 0 && (
              <div className='flex items-center'>
                <FolderIcon className='mr-2 h-4 w-4 text-gray-500' />
                <div className='flex flex-wrap gap-2'>
                  {post.postCategories.map(({ category }) => (
                    <Link
                      key={category.id}
                      href={`/${validatedLang}/blog?category=${category.slug}`}
                      className='rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 transition-colors hover:bg-blue-200'
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {post.postTags.length > 0 && (
              <div className='flex items-center'>
                <TagIcon className='mr-2 h-4 w-4 text-gray-500' />
                <div className='flex flex-wrap gap-2'>
                  {post.postTags.slice(0, 5).map(({ tag }) => (
                    <Link
                      key={tag.id}
                      href={`/${validatedLang}/blog?tag=${tag.slug}`}
                      className='rounded bg-gray-100 px-2 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200'
                    >
                      #{tag.name}
                    </Link>
                  ))}
                  {post.postTags.length > 5 && (
                    <span className='px-2 py-1 text-sm text-gray-500'>
                      +{post.postTags.length - 5} autres
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Image mise en avant */}
          {post.featuredImageUrl && (
            <div className='relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96'>
              <Image
                src={post.featuredImageUrl}
                alt={post.translation.title}
                fill
                className='object-cover'
                priority
              />
            </div>
          )}
        </header>

        {/* Contenu de l'article */}
        <div className='mb-8 rounded-lg bg-white p-8 shadow-sm'>
          <div
            className='prose prose-gray prose-lg prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-4 max-w-none'
            dangerouslySetInnerHTML={{ __html: post.translation.content }}
          />
        </div>

        {/* Footer de l'article */}
        <footer className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='text-sm text-gray-600'>
              <p>
                Publié le {formatDateTime(post.publishedAt)}
                {post.updatedAt !== post.publishedAt && (
                  <span> • Mis à jour le {formatDateTime(post.updatedAt)}</span>
                )}
              </p>
            </div>

            <div className='flex items-center space-x-4'>
              {post.isFeatured && (
                <span className='rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800'>
                  Article en vedette
                </span>
              )}

              <span className='rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700'>
                {post.postType}
              </span>
            </div>
          </div>
        </footer>

        {/* Section commentaires (placeholder) */}
        {post.allowComments && (
          <section className='mt-8 rounded-lg bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>
              Commentaires ({post._count.comments})
            </h2>
            <div className='py-8 text-center text-gray-500'>
              <ChatBubbleLeftIcon className='mx-auto mb-4 h-12 w-12 text-gray-300' />
              <p>Les commentaires seront bientôt disponibles.</p>
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

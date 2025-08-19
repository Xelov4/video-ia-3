/**
 * Blog Main Page - Liste des articles du blog
 *
 * Page principale du blog affichant la liste des articles publiés.
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
  TagIcon,
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

interface BlogPageProps {
  params: Promise<{
    lang: SupportedLocale;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

/**
 * Métadonnées SEO multilingues
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const validatedLang = validateLanguageParam(lang);

  const seoContent = {
    en: {
      title: 'Blog | Video-IA.net - AI Tools & Technology Articles',
      description:
        'Discover the latest articles about artificial intelligence, video tools and emerging technologies.',
    },
    fr: {
      title: "Blog | Video-IA.net - Articles sur l'IA et les Technologies",
      description:
        "Découvrez les derniers articles sur l'intelligence artificielle, les outils vidéo et les technologies émergentes.",
    },
    es: {
      title: 'Blog | Video-IA.net - Artículos sobre IA y Tecnología',
      description:
        'Descubre los últimos artículos sobre inteligencia artificial, herramientas de video y tecnologías emergentes.',
    },
    it: {
      title: 'Blog | Video-IA.net - Articoli su IA e Tecnologia',
      description:
        "Scopri gli ultimi articoli sull'intelligenza artificiale, strumenti video e tecnologie emergenti.",
    },
    de: {
      title: 'Blog | Video-IA.net - Artikel über KI und Technologie',
      description:
        'Entdecken Sie die neuesten Artikel über künstliche Intelligenz, Video-Tools und neue Technologien.',
    },
    nl: {
      title: 'Blog | Video-IA.net - Artikelen over AI en Technologie',
      description:
        'Ontdek de nieuwste artikelen over kunstmatige intelligentie, video-tools en opkomende technologieën.',
    },
    pt: {
      title: 'Blog | Video-IA.net - Artigos sobre IA e Tecnologia',
      description:
        'Descubra os últimos artigos sobre inteligência artificial, ferramentas de vídeo e tecnologias emergentes.',
    },
  };

  const content = seoContent[validatedLang] || seoContent['en'];

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      type: 'website',
    },
  };
}

async function getPosts(
  searchParams: { [key: string]: string | string[] | undefined },
  language: string
) {
  const params = new URLSearchParams();

  if (searchParams.page) params.set('page', String(searchParams.page));
  if (searchParams.category) params.set('category', String(searchParams.category));
  if (searchParams.tag) params.set('tag', String(searchParams.tag));
  if (searchParams.search) params.set('search', String(searchParams.search));
  if (searchParams.featured) params.set('featured', String(searchParams.featured));

  params.set('lang', language);
  params.set('limit', '12');

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/blog/posts?${params}`, {
      cache: 'no-store', // Pas de cache pour les données fraîches
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: false,
      data: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function truncateContent(content: string, maxLength: number = 150) {
  // Supprimer les balises HTML
  const textContent = content.replace(/<[^>]*>/g, '');
  if (textContent.length <= maxLength) return textContent;
  return textContent.substring(0, maxLength) + '...';
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { lang } = await params;
  const validatedLang = validateLanguageParam(lang);
  const resolvedSearchParams = await searchParams;

  const result = await getPosts(resolvedSearchParams, validatedLang);
  const posts: BlogPost[] = result.data || [];
  const pagination = result.pagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  };

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Séparer les articles en vedette des autres
  const featuredPosts = posts.filter(post => post.isFeatured);
  const regularPosts = posts.filter(post => !post.isFeatured);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header du blog */}
      <div className='border-b bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h1 className='mb-4 text-4xl font-bold text-gray-900'>Blog Video-IA.net</h1>
            <p className='mx-auto max-w-3xl text-xl text-gray-600'>
              Découvrez les derniers articles sur l'intelligence artificielle, les
              outils vidéo et les technologies émergentes
            </p>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Articles en vedette */}
        {featuredPosts.length > 0 && (
          <div className='mb-12'>
            <h2 className='mb-6 text-2xl font-bold text-gray-900'>
              Articles en vedette
            </h2>
            <div className='mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2'>
              {featuredPosts.slice(0, 2).map(post => (
                <FeaturedPostCard key={post.id} post={post} lang={validatedLang} />
              ))}
            </div>
          </div>
        )}

        {/* Liste des articles */}
        {posts.length > 0 ? (
          <>
            <div className='mb-8'>
              <h2 className='mb-6 text-2xl font-bold text-gray-900'>
                {featuredPosts.length > 0 ? 'Tous les articles' : 'Derniers articles'}
              </h2>
              <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                {(featuredPosts.length > 0 ? regularPosts : posts).map(post => (
                  <PostCard key={post.id} post={post} lang={validatedLang} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-12 flex items-center justify-center space-x-2'>
                {hasPrevious && (
                  <Link
                    href={`/blog?page=${currentPage - 1}`}
                    className='rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50'
                  >
                    Précédent
                  </Link>
                )}

                <span className='px-4 py-2 text-gray-700'>
                  Page {currentPage} sur {totalPages}
                </span>

                {hasNext && (
                  <Link
                    href={`/blog?page=${currentPage + 1}`}
                    className='rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50'
                  >
                    Suivant
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className='py-12 text-center'>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>
              Aucun article trouvé
            </h2>
            <p className='text-gray-600'>
              Il n'y a pas encore d'articles publiés sur le blog.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour les articles en vedette
function FeaturedPostCard({ post, lang }: { post: BlogPost; lang: string }) {
  return (
    <Link href={`/${lang}/blog/${post.slug}`} className='group'>
      <article className='overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg'>
        {post.featuredImageUrl && (
          <div className='relative h-64 w-full'>
            <Image
              src={post.featuredImageUrl}
              alt={post.translation.title}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-105'
            />
          </div>
        )}
        <div className='p-6'>
          <div className='mb-3 flex items-center space-x-4 text-sm text-gray-500'>
            <div className='flex items-center'>
              <CalendarIcon className='mr-1 h-4 w-4' />
              {formatDate(post.publishedAt)}
            </div>
            {post.readingTimeMinutes && (
              <div className='flex items-center'>
                <ClockIcon className='mr-1 h-4 w-4' />
                {post.readingTimeMinutes} min
              </div>
            )}
            <div className='flex items-center'>
              <EyeIcon className='mr-1 h-4 w-4' />
              {post.viewCount}
            </div>
          </div>

          <h2 className='mb-3 text-xl font-bold text-gray-900 group-hover:text-blue-600'>
            {post.translation.title}
          </h2>

          <p className='mb-4 text-gray-600'>
            {post.translation.excerpt || truncateContent(post.translation.content, 200)}
          </p>

          <div className='flex items-center justify-between'>
            <div className='flex items-center text-sm text-gray-500'>
              <UserIcon className='mr-1 h-4 w-4' />
              {post.author.name}
            </div>

            {post.postCategories.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {post.postCategories.slice(0, 2).map(({ category }) => (
                  <span
                    key={category.id}
                    className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// Composant pour les articles normaux
function PostCard({ post, lang }: { post: BlogPost; lang: string }) {
  return (
    <Link href={`/${lang}/blog/${post.slug}`} className='group'>
      <article className='flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg'>
        {post.featuredImageUrl && (
          <div className='relative h-48 w-full'>
            <Image
              src={post.featuredImageUrl}
              alt={post.translation.title}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-105'
            />
          </div>
        )}
        <div className='flex flex-1 flex-col p-6'>
          <div className='mb-3 flex items-center space-x-3 text-sm text-gray-500'>
            <div className='flex items-center'>
              <CalendarIcon className='mr-1 h-4 w-4' />
              {formatDate(post.publishedAt)}
            </div>
            {post.readingTimeMinutes && (
              <div className='flex items-center'>
                <ClockIcon className='mr-1 h-4 w-4' />
                {post.readingTimeMinutes} min
              </div>
            )}
          </div>

          <h3 className='mb-3 line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-blue-600'>
            {post.translation.title}
          </h3>

          <p className='mb-4 line-clamp-3 flex-1 text-gray-600'>
            {post.translation.excerpt || truncateContent(post.translation.content, 120)}
          </p>

          <div className='flex items-center justify-between text-sm text-gray-500'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center'>
                <EyeIcon className='mr-1 h-4 w-4' />
                {post.viewCount}
              </div>
              {post.allowComments && post._count.comments > 0 && (
                <div className='flex items-center'>
                  <ChatBubbleLeftIcon className='mr-1 h-4 w-4' />
                  {post._count.comments}
                </div>
              )}
            </div>

            {post.postTags.length > 0 && (
              <div className='flex items-center'>
                <TagIcon className='mr-1 h-4 w-4' />
                <span>{post.postTags.length}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

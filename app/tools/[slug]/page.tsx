/**
 * Tool Detail Page - Complete Database-Driven Revamp
 *
 * Comprehensive detail page for individual AI tools showing all information
 * directly from the database with modern UI and enhanced features.
 *
 * Features:
 * - Complete tool information from database
 * - Dynamic content sections based on available data
 * - Enhanced analytics and statistics
 * - Related tools and recommendations
 * - SEO optimization with database metadata
 * - Click tracking and view counting
 * - Modern responsive design
 *
 * @author Video-IA.net Development Team
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toolsService } from '@/src/lib/database/services/tools';
import { CategoriesService } from '@/src/lib/database/services/categories';
import {
  ArrowTopRightOnSquareIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  ChevronRightIcon,
  HomeIcon,
  ClockIcon,
  TagIcon,
  UserGroupIcon,
  SparklesIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { formatNumber } from '@/src/lib/utils/formatNumbers';

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = await toolsService.getToolBySlug(params.slug).catch(() => null);

  if (!tool) {
    return {
      title: 'Outil non trouvé | Video-IA.net',
      description: "Cet outil d'IA n'existe pas ou a été supprimé de notre répertoire.",
    };
  }

  return {
    title:
      tool.meta_title ||
      `${tool.tool_name} - Outil IA ${tool.tool_category} | Video-IA.net`,
    description:
      tool.meta_description ||
      tool.overview ||
      `Découvrez ${tool.tool_name}, un outil d'intelligence artificielle ${tool.tool_category}. ${tool.tool_description?.substring(0, 120)}...`,
    keywords:
      tool.seo_keywords ||
      `${tool.tool_name}, ${tool.tool_category}, outil IA, intelligence artificielle`,
    openGraph: {
      title: `${tool.tool_name} - Outil IA`,
      description: tool.overview || tool.tool_description?.substring(0, 160) || '',
      type: 'website',
      images: tool.image_url
        ? [{ url: tool.image_url, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.tool_name} - Outil IA`,
      description: tool.overview || tool.tool_description?.substring(0, 160) || '',
      images: tool.image_url ? [tool.image_url] : undefined,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  // Load tool details from database
  const tool = await toolsService.getToolBySlug(params.slug).catch(() => null);

  if (!tool) {
    notFound();
  }

  // Increment view count
  await toolsService.incrementViewCount(tool.id).catch(() => {
    // Silently handle view count errors
  });

  // Load related data from database
  const [relatedTools, categoryInfo, toolStats] = await Promise.all([
    toolsService
      .searchTools({
        category: tool.tool_category || undefined,
        limit: 6,
        sortBy: 'view_count',
        sortOrder: 'desc',
      })
      .catch(() => ({ tools: [], totalCount: 0, hasMore: false })),
    tool.tool_category
      ? CategoriesService.getCategoryByName(tool.tool_category).catch(() => null)
      : Promise.resolve(null),
    toolsService.getToolStatistics().catch(() => ({
      totalTools: 0,
      activeTools: 0,
      featuredTools: 0,
      totalViews: 0,
      totalClicks: 0,
      categories: 0,
    })),
  ]);

  // Process database data
  const hasImage = tool.image_url && tool.image_url.length > 0;
  const qualityScore = tool.quality_score || 0;
  const displayScore = (qualityScore / 2).toFixed(1);
  const features = tool.key_features
    ? tool.key_features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0)
    : [];
  const useCases = tool.use_cases
    ? tool.use_cases
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0)
    : [];
  const tags = tool.tags
    ? tool.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
    : [];

  // Calculate tool performance metrics
  const viewCount = tool.view_count || 0;
  const clickCount = tool.click_count || 0;
  const favoriteCount = tool.favorite_count || 0;
  const clickRate = viewCount > 0 ? ((clickCount / viewCount) * 100).toFixed(1) : '0';

  // Determine tool status and badges
  const isPremium = qualityScore > 8;
  const isFeatured = tool.featured;
  const isActive = tool.is_active;
  const lastUpdated = tool.updated_at ? new Date(tool.updated_at) : null;
  const daysSinceUpdate = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Breadcrumbs */}
      <div className='sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <nav className='flex items-center space-x-2 text-sm'>
            <Link
              href='/'
              className='flex items-center text-gray-500 transition-colors hover:text-blue-600'
            >
              <HomeIcon className='mr-1 h-4 w-4' />
              Accueil
            </Link>
            <ChevronRightIcon className='h-4 w-4 text-gray-400' />
            <Link
              href='/tools'
              className='text-gray-500 transition-colors hover:text-blue-600'
            >
              Outils IA
            </Link>
            {tool.tool_category && categoryInfo && (
              <>
                <ChevronRightIcon className='h-4 w-4 text-gray-400' />
                <Link
                  href={`/categories/${categoryInfo.slug || tool.tool_category.toLowerCase().replace(/\s+/g, '-')}`}
                  className='text-gray-500 transition-colors hover:text-blue-600'
                >
                  {tool.tool_category}
                </Link>
              </>
            )}
            <ChevronRightIcon className='h-4 w-4 text-gray-400' />
            <span className='font-medium text-gray-900'>{tool.tool_name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className='border-b border-gray-200 bg-white'>
        <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
            {/* Tool Image */}
            <div className='lg:col-span-4'>
              <div className='relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl'>
                {hasImage ? (
                  <Image
                    src={tool.image_url!}
                    alt={`${tool.tool_name} logo`}
                    fill
                    className='object-cover'
                    priority
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <div className='flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg'>
                      <span className='text-4xl font-bold text-white'>
                        {tool.tool_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status Badges */}
                <div className='absolute left-4 top-4 space-y-2'>
                  {isFeatured && (
                    <span className='inline-block rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 text-sm font-semibold text-white shadow-lg'>
                      ⭐ Featured
                    </span>
                  )}
                  {isPremium && (
                    <span className='inline-block rounded-full bg-gradient-to-r from-green-400 to-green-500 px-3 py-1 text-sm font-semibold text-white shadow-lg'>
                      Premium
                    </span>
                  )}
                  {!isActive && (
                    <span className='inline-block rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white shadow-lg'>
                      Inactif
                    </span>
                  )}
                </div>

                {/* Quality Score Badge */}
                <div className='absolute bottom-4 right-4'>
                  <div className='rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm'>
                    <div className='flex items-center space-x-1'>
                      <StarSolidIcon className='h-5 w-5 text-yellow-400' />
                      <span className='font-bold text-gray-900'>{displayScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool Info */}
            <div className='lg:col-span-8'>
              <div className='flex h-full flex-col'>
                {/* Header */}
                <div className='mb-6'>
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='flex-1'>
                      <h1 className='mb-2 text-4xl font-bold text-gray-900 md:text-5xl'>
                        {tool.tool_name}
                      </h1>
                      {tool.tool_category && (
                        <Link
                          href={`/categories/${categoryInfo?.slug || tool.tool_category.toLowerCase().replace(/\s+/g, '-')}`}
                          className='inline-block rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white shadow-lg transition-all hover:from-blue-600 hover:to-blue-700'
                        >
                          {tool.tool_category}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {tool.overview && (
                    <p className='mb-6 text-xl leading-relaxed text-gray-600'>
                      {tool.overview}
                    </p>
                  )}

                  {/* Analytics Stats */}
                  <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
                    <div className='rounded-lg bg-gray-50 p-3 text-center'>
                      <div className='mb-1 flex items-center justify-center'>
                        <EyeIcon className='mr-1 h-4 w-4 text-blue-500' />
                        <span className='text-sm font-medium text-gray-600'>Vues</span>
                      </div>
                      <div className='text-lg font-bold text-gray-900'>
                        {formatNumber(viewCount)}
                      </div>
                    </div>
                    <div className='rounded-lg bg-gray-50 p-3 text-center'>
                      <div className='mb-1 flex items-center justify-center'>
                        <LinkIcon className='mr-1 h-4 w-4 text-green-500' />
                        <span className='text-sm font-medium text-gray-600'>Clics</span>
                      </div>
                      <div className='text-lg font-bold text-gray-900'>
                        {formatNumber(clickCount)}
                      </div>
                    </div>
                    <div className='rounded-lg bg-gray-50 p-3 text-center'>
                      <div className='mb-1 flex items-center justify-center'>
                        <HeartIcon className='mr-1 h-4 w-4 text-red-500' />
                        <span className='text-sm font-medium text-gray-600'>
                          Favoris
                        </span>
                      </div>
                      <div className='text-lg font-bold text-gray-900'>
                        {formatNumber(favoriteCount)}
                      </div>
                    </div>
                    <div className='rounded-lg bg-gray-50 p-3 text-center'>
                      <div className='mb-1 flex items-center justify-center'>
                        <ChartBarIcon className='mr-1 h-4 w-4 text-purple-500' />
                        <span className='text-sm font-medium text-gray-600'>Taux</span>
                      </div>
                      <div className='text-lg font-bold text-gray-900'>
                        {clickRate}%
                      </div>
                    </div>
                  </div>

                  {/* Last Updated */}
                  {lastUpdated && (
                    <div className='mb-6 flex items-center text-sm text-gray-500'>
                      <CalendarIcon className='mr-1 h-4 w-4' />
                      <span>
                        Mis à jour le{' '}
                        {lastUpdated.toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {daysSinceUpdate && daysSinceUpdate > 30 && (
                          <span className='ml-2 text-orange-600'>
                            (il y a {daysSinceUpdate} jours)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className='flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0'>
                  {tool.tool_link && (
                    <a
                      href={tool.tool_link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-center font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800'
                    >
                      <ArrowTopRightOnSquareIcon className='mr-2 h-5 w-5' />
                      Visiter {tool.tool_name}
                    </a>
                  )}

                  <button className='flex items-center justify-center rounded-xl border-2 border-gray-300 px-6 py-4 font-semibold text-gray-700 transition-all hover:border-red-300 hover:text-red-600'>
                    <HeartIcon className='mr-2 h-5 w-5' />
                    Ajouter aux favoris
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-3'>
          {/* Main Content */}
          <div className='space-y-8 lg:col-span-2'>
            {/* Description */}
            {tool.tool_description && (
              <section className='rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                <h2 className='mb-6 flex items-center text-2xl font-bold text-gray-900'>
                  <SparklesIcon className='mr-2 h-6 w-6 text-blue-500' />
                  Description
                </h2>
                <div className='prose prose-lg max-w-none leading-relaxed text-gray-700'>
                  {tool.tool_description.split('\n').map(
                    (paragraph, index) =>
                      paragraph.trim() && (
                        <p key={index} className='mb-4'>
                          {paragraph}
                        </p>
                      )
                  )}
                </div>
              </section>
            )}

            {/* Key Features */}
            {features.length > 0 && (
              <section className='rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                <h2 className='mb-6 flex items-center text-2xl font-bold text-gray-900'>
                  <CheckCircleIcon className='mr-2 h-6 w-6 text-green-500' />
                  Fonctionnalités clés
                </h2>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className='flex items-start space-x-3 rounded-lg bg-gray-50 p-3'
                    >
                      <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500'></div>
                      <span className='font-medium text-gray-700'>{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Use Cases */}
            {useCases.length > 0 && (
              <section className='rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                <h2 className='mb-6 flex items-center text-2xl font-bold text-gray-900'>
                  <UserGroupIcon className='mr-2 h-6 w-6 text-purple-500' />
                  Cas d'usage
                </h2>
                <div className='space-y-4'>
                  {useCases.map((useCase, index) => (
                    <div
                      key={index}
                      className='flex items-start space-x-3 rounded-lg bg-purple-50 p-3'
                    >
                      <UserGroupIcon className='mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600' />
                      <span className='font-medium text-gray-700'>{useCase}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Target Audience */}
            {tool.target_audience && (
              <section className='rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                <h2 className='mb-6 flex items-center text-2xl font-bold text-gray-900'>
                  <GlobeAltIcon className='mr-2 h-6 w-6 text-indigo-500' />
                  Public cible
                </h2>
                <div className='rounded-lg bg-indigo-50 p-4'>
                  <p className='font-medium leading-relaxed text-gray-700'>
                    {tool.target_audience}
                  </p>
                </div>
              </section>
            )}

            {/* Database Information */}
            <section className='rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
              <h2 className='mb-6 flex items-center text-2xl font-bold text-gray-900'>
                <ChartBarIcon className='mr-2 h-6 w-6 text-gray-500' />
                Informations techniques
              </h2>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <h3 className='mb-3 text-lg font-semibold text-gray-900'>
                    Statistiques
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>ID de l'outil:</span>
                      <span className='font-mono text-gray-900'>#{tool.id}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Slug:</span>
                      <span className='font-mono text-gray-900'>{tool.slug}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Créé le:</span>
                      <span className='text-gray-900'>
                        {tool.created_at
                          ? new Date(tool.created_at).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Dernière vérification:</span>
                      <span className='text-gray-900'>
                        {tool.last_checked_at
                          ? new Date(tool.last_checked_at).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className='mb-3 text-lg font-semibold text-gray-900'>
                    Performance
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Note qualité:</span>
                      <span className='font-bold text-gray-900'>{qualityScore}/10</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Taux de clic:</span>
                      <span className='font-bold text-gray-900'>{clickRate}%</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Statut:</span>
                      <span
                        className={`font-bold ${isActive ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Mis en avant:</span>
                      <span
                        className={`font-bold ${isFeatured ? 'text-yellow-600' : 'text-gray-600'}`}
                      >
                        {isFeatured ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className='space-y-8 lg:col-span-1'>
            {/* Tool Info Card */}
            <div className='sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
              <h3 className='mb-4 flex items-center text-lg font-semibold text-gray-900'>
                <SparklesIcon className='mr-2 h-5 w-5 text-blue-500' />
                Informations
              </h3>

              <div className='space-y-4'>
                {/* Category */}
                {tool.tool_category && (
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Catégorie</dt>
                    <dd className='mt-1'>
                      <Link
                        href={`/categories/${categoryInfo?.slug || tool.tool_category.toLowerCase().replace(/\s+/g, '-')}`}
                        className='font-medium text-blue-600 transition-colors hover:text-blue-800'
                      >
                        {tool.tool_category}
                      </Link>
                    </dd>
                  </div>
                )}

                {/* Quality Score */}
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Note qualité</dt>
                  <dd className='mt-1 flex items-center'>
                    <div className='mr-2 flex items-center'>
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(qualityScore / 2)
                              ? 'text-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className='font-medium'>{displayScore}/5</span>
                  </dd>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <dt className='mb-2 text-sm font-medium text-gray-500'>Tags</dt>
                    <dd className='flex flex-wrap gap-2'>
                      {tags.slice(0, 8).map((tag, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200'
                        >
                          <TagIcon className='mr-1 h-3 w-3' />
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

                {/* SEO Keywords */}
                {tool.seo_keywords && (
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>Mots-clés SEO</dt>
                    <dd className='mt-1 text-sm text-gray-600'>{tool.seo_keywords}</dd>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {tool.tool_link && (
                <div className='mt-6 border-t border-gray-200 pt-6'>
                  <a
                    href={tool.tool_link}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800'
                  >
                    <ArrowTopRightOnSquareIcon className='mr-2 h-4 w-4' />
                    Essayer maintenant
                  </a>
                </div>
              )}
            </div>

            {/* Related Tools */}
            {relatedTools.tools.length > 0 && (
              <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
                <h3 className='mb-4 flex items-center text-lg font-semibold text-gray-900'>
                  <SparklesIcon className='mr-2 h-5 w-5 text-purple-500' />
                  Outils similaires
                </h3>
                <div className='space-y-4'>
                  {relatedTools.tools.slice(0, 4).map(relatedTool => (
                    <Link
                      key={relatedTool.id}
                      href={`/tools/${relatedTool.slug || relatedTool.id}`}
                      className='block rounded-lg border border-gray-200 p-3 transition-all hover:border-blue-300 hover:bg-blue-50'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200'>
                          {relatedTool.image_url ? (
                            <Image
                              src={relatedTool.image_url}
                              alt={relatedTool.tool_name}
                              width={40}
                              height={40}
                              className='rounded-lg object-cover'
                            />
                          ) : (
                            <span className='text-sm font-medium text-gray-600'>
                              {relatedTool.tool_name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className='flex-1'>
                          <div className='text-sm font-medium text-gray-900'>
                            {relatedTool.tool_name}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {relatedTool.tool_category}
                          </div>
                          <div className='mt-1 flex items-center'>
                            <StarSolidIcon className='mr-1 h-3 w-3 text-yellow-400' />
                            <span className='text-xs text-gray-500'>
                              {((relatedTool.quality_score || 0) / 2).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Database Statistics */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
              <h3 className='mb-4 flex items-center text-lg font-semibold text-gray-900'>
                <ChartBarIcon className='mr-2 h-5 w-5 text-green-500' />
                Statistiques globales
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Total outils:</span>
                  <span className='font-semibold text-gray-900'>
                    {formatNumber(toolStats.totalTools)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Outils actifs:</span>
                  <span className='font-semibold text-gray-900'>
                    {formatNumber(toolStats.activeTools)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Mis en avant:</span>
                  <span className='font-semibold text-gray-900'>
                    {formatNumber(toolStats.featuredTools)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Total vues:</span>
                  <span className='font-semibold text-gray-900'>
                    {formatNumber(toolStats.totalViews)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

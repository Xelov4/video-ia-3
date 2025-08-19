/**
 * Utility functions for URL construction with the new short URL structure
 */

import { SupportedLanguage } from '@/src/lib/i18n/types';

/**
 * Build a localized URL with the new short structure
 */
export function buildLocalizedUrl(
  path: string,
  lang: SupportedLanguage,
  isDefaultLanguage: boolean = false
): string {
  if (isDefaultLanguage || lang === 'en') {
    return path;
  }
  return `/${lang}${path}`;
}

/**
 * Build category URL with short format
 */
export function buildCategoryUrl(slug: string, lang: SupportedLanguage): string {
  const path = `/c/${slug}`;
  return buildLocalizedUrl(path, lang, lang === 'en');
}

/**
 * Build audience (persona) URL with short format
 */
export function buildAudienceUrl(slug: string, lang: SupportedLanguage): string {
  const path = `/p/${slug}`;
  return buildLocalizedUrl(path, lang, lang === 'en');
}

/**
 * Build use case URL with short format
 */
export function buildUseCaseUrl(slug: string, lang: SupportedLanguage): string {
  const path = `/u/${slug}`;
  return buildLocalizedUrl(path, lang, lang === 'en');
}

/**
 * Build tool URL with short format
 */
export function buildToolUrl(slug: string, lang: SupportedLanguage): string {
  const path = `/t/${slug}`;
  return buildLocalizedUrl(path, lang, lang === 'en');
}

/**
 * Build tools listing URL (keeps original structure)
 */
export function buildToolsUrl(lang: SupportedLanguage): string {
  const path = `/tools`;
  return buildLocalizedUrl(path, lang, lang === 'en');
}

/**
 * Build discover page URL
 */
export function buildDiscoverUrl(lang: SupportedLanguage): string {
  const path = `/discover`;
  return buildLocalizedUrl(path, lang, lang === 'en');
}

/**
 * Build homepage URL
 */
export function buildHomeUrl(lang: SupportedLanguage): string {
  if (lang === 'en') {
    return '/';
  }
  return `/${lang}`;
}

/**
 * Convert a string to URL-friendly slug
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert a slug back to readable text
 */
export function fromSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if a URL is using the new short format
 */
export function isShortUrl(url: string): boolean {
  const shortPatterns = ['/c/', '/p/', '/t/', '/u/'];
  return shortPatterns.some(pattern => url.includes(pattern));
}

/**
 * Convert old URL format to new short format
 */
export function convertToShortUrl(url: string): string {
  return url
    .replace('/tools/', '/t/')
    .replace('/categories/', '/c/')
    .replace('/audiences/', '/p/')
    .replace('/use-cases/', '/u/');
}

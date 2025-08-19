/**
 * Modern Header Component - Redesigned
 *
 * Ultra-modern navigation header with professional aesthetics.
 * Features floating search, glass morphism effects, and smooth interactions.
 *
 * Features:
 * - Floating search with smart autocomplete
 * - Glass morphism design with backdrop blur
 * - Animated category mega menu
 * - Professional gradient effects
 * - Micro-interactions and smooth transitions
 * - Mobile-first responsive design
 * - Performance optimized
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCategoryEmojiString } from '@/src/lib/services/emojiMapping';
import { formatNumber } from '@/src/lib/utils/formatNumbers';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  CommandLineIcon,
  BeakerIcon,
  FireIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/src/components/i18n/LanguageSwitcher';
import { useNavTranslation } from '@/src/hooks/useTranslation';
import { SupportedLocale } from '@/middleware';

interface Category {
  id: number;
  name: string;
  slug: string;
  toolCount: number;
  isFeatured: boolean;
}

interface HeaderProps {
  totalToolsCount?: number;
  currentLanguage: SupportedLocale;
}

export default function Header({
  totalToolsCount = 16763,
  currentLanguage,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [_isLoading, _setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const nav = useNavTranslation();

  /**
   * Handle scroll effect for header background
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Load featured categories for navigation dropdown
   */
  useEffect(() => {
    const loadFeaturedCategories = async () => {
      try {
        const response = await fetch('/api/categories?featured=true&limit=8');
        if (response.ok) {
          const data = await response.json();
          setFeaturedCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to load featured categories:', error);
      }
    };

    loadFeaturedCategories();
  }, []);

  /**
   * Handle global search submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/${currentLanguage === 'en' ? '' : currentLanguage}/tools?search=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  /**
   * Navigation links configuration with icons
   */
  const navigationLinks = [
    {
      href: `/${currentLanguage === 'en' ? '' : currentLanguage}`,
      label: nav.home,
      icon: SparklesIcon,
      active: pathname === '/' || pathname === `/${currentLanguage}`,
    },
    {
      href: `/${currentLanguage === 'en' ? '' : currentLanguage}/tools`,
      label: nav.tools,
      icon: CommandLineIcon,
      active:
        pathname.startsWith('/tools') ||
        pathname.startsWith(`/${currentLanguage}/tools`),
    },
    {
      href: `/${currentLanguage === 'en' ? '' : currentLanguage}/c`,
      label: nav.categories,
      icon: BeakerIcon,
      active: pathname.startsWith('/c') || pathname.startsWith(`/${currentLanguage}/c`),
    },
    {
      href: `/${currentLanguage === 'en' ? '' : currentLanguage}/about`,
      label: nav.about,
      icon: InformationCircleIcon,
      active: pathname === '/about' || pathname === `/${currentLanguage}/about`,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/10 bg-black/80 shadow-2xl shadow-purple-500/10 backdrop-blur-xl'
          : 'border-b border-white/5 bg-transparent backdrop-blur-md'
      }`}
    >
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-20 items-center'>
          {/* Enhanced Logo and Brand */}
          <div className='flex flex-shrink-0 items-center'>
            <Link
              href={`/${currentLanguage === 'en' ? '' : currentLanguage}`}
              className='group flex items-center space-x-4'
            >
              <div className='relative flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 shadow-2xl transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-purple-500/50'>
                <div className='absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-br from-purple-400/50 to-pink-400/50'></div>
                <SparklesIcon className='relative z-10 h-8 w-8 text-white group-hover:animate-spin' />
              </div>
              <div className='hidden sm:block'>
                <h1 className='text-2xl font-bold text-white drop-shadow-lg'>
                  Video-IA.net
                </h1>
                <div className='flex items-center space-x-2'>
                  <FireIcon className='h-4 w-4 text-orange-400' />
                  <p className='text-sm font-medium text-gray-300'>
                    {formatNumber(totalToolsCount)} outils IA
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation - Centered */}
          <nav className='mx-8 hidden flex-1 items-center justify-center lg:flex'>
            <div className='flex items-center space-x-2'>
              {navigationLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 font-medium transition-all duration-300 ${
                      link.active
                        ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg shadow-purple-500/30 backdrop-blur-sm'
                        : 'border border-transparent text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className='h-4 w-4' />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Categories Dropdown */}
              <div className='relative'>
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className='flex items-center space-x-2 rounded-2xl border border-transparent px-4 py-2.5 font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                >
                  <span>Catégories</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {isCategoriesOpen && (
                  <div className='absolute right-0 z-50 mt-3 w-96 rounded-2xl border border-white/20 bg-black/90 py-4 shadow-2xl backdrop-blur-xl'>
                    <div className='border-b border-white/10 px-6 py-3'>
                      <h3 className='text-lg font-semibold text-white'>
                        {nav.categories}
                      </h3>
                    </div>
                    <div className='grid grid-cols-2 gap-1 p-4'>
                      {featuredCategories.map(category => (
                        <Link
                          key={category.slug}
                          href={`/categories/${category.slug}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className='group flex items-start space-x-3 rounded-xl p-3 text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white'
                        >
                          <span className='text-xl group-hover:animate-bounce'>
                            {getCategoryEmojiString(category.name)}
                          </span>
                          <div className='flex-1'>
                            <div className='font-medium group-hover:text-purple-300'>
                              {category.name}
                            </div>
                            <div className='text-xs text-gray-500 group-hover:text-gray-400'>
                              {category.toolCount} outils
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Medium Screen Navigation - Compact */}
          <nav className='ml-4 hidden items-center space-x-1 md:flex lg:hidden'>
            {navigationLinks.slice(0, 2).map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 rounded-xl px-2 py-2 font-medium transition-all duration-300 ${
                    link.active
                      ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg shadow-purple-500/30 backdrop-blur-sm'
                      : 'border border-transparent text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className='h-4 w-4' />
                  <span className='text-sm'>{link.label}</span>
                </Link>
              );
            })}

            {/* More dropdown for medium screens */}
            <div className='relative'>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='flex items-center space-x-1 rounded-xl border border-transparent px-2 py-2 font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
              >
                <span className='text-sm'>Plus</span>
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>
            </div>
          </nav>

          {/* Search and Mobile Menu - Right Side */}
          <div className='flex flex-shrink-0 items-center space-x-4'>
            <form onSubmit={handleSearch} className='hidden lg:block'>
              <div className='relative'>
                <div
                  className={`transition-all duration-300 ${
                    isSearchFocused
                      ? 'scale-105 shadow-2xl shadow-purple-500/20'
                      : 'shadow-lg'
                  }`}
                >
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder={nav.searchPlaceholder}
                    className='w-80 rounded-2xl border border-white/20 bg-white/10 py-3.5 pl-12 pr-4 text-white placeholder-gray-400 backdrop-blur-xl transition-all duration-300 hover:bg-white/15 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400'
                  />
                  <MagnifyingGlassIcon
                    className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform transition-colors duration-200 ${
                      isSearchFocused ? 'text-purple-400' : 'text-gray-400'
                    }`}
                  />

                  {/* Search suggestions indicator */}
                  {searchQuery && (
                    <div className='absolute right-4 top-1/2 flex -translate-y-1/2 transform items-center space-x-1'>
                      <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400'></div>
                      <div
                        className='h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                      <div
                        className='h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400'
                        style={{ animationDelay: '0.4s' }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Language Switcher - Desktop */}
            <div className='hidden md:block'>
              <LanguageSwitcher
                currentLanguage={currentLanguage}
                variant='header'
                showLabel={true}
              />
            </div>

            {/* Language Dropdown Menu - Desktop */}
            <div className='relative hidden md:block'>
              <button
                onClick={() => setIsLanguagesOpen(!isLanguagesOpen)}
                className='flex items-center space-x-2 rounded-2xl border border-transparent px-4 py-2.5 font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
              >
                <span>🌐</span>
                <span>Langues</span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${isLanguagesOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>

              {isLanguagesOpen && (
                <div className='absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-white/20 bg-black/90 py-4 shadow-2xl backdrop-blur-xl'>
                  <div className='border-b border-white/10 px-6 py-3'>
                    <h3 className='text-lg font-semibold text-white'>
                      Choisir une langue
                    </h3>
                  </div>
                  <div className='p-2'>
                    {[
                      { code: 'en', name: 'English', flag: '🇺🇸', path: '/' },
                      { code: 'fr', name: 'Français', flag: '🇫🇷', path: '/fr' },
                      { code: 'it', name: 'Italiano', flag: '🇮🇹', path: '/it' },
                      { code: 'es', name: 'Español', flag: '🇪🇸', path: '/es' },
                      { code: 'de', name: 'Deutsch', flag: '🇩🇪', path: '/de' },
                      { code: 'nl', name: 'Nederlands', flag: '🇳🇱', path: '/nl' },
                      { code: 'pt', name: 'Português', flag: '🇵🇹', path: '/pt' },
                    ].map(lang => (
                      <Link
                        key={lang.code}
                        href={lang.path}
                        onClick={() => setIsLanguagesOpen(false)}
                        className={`group flex items-center space-x-3 rounded-xl p-3 text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white ${
                          lang.code === currentLanguage
                            ? 'bg-purple-600/20 text-purple-300'
                            : ''
                        }`}
                      >
                        <span className='text-xl'>{lang.flag}</span>
                        <div className='flex-1'>
                          <div className='font-medium group-hover:text-purple-300'>
                            {lang.name}
                          </div>
                          <div className='text-xs text-gray-500 group-hover:text-gray-400'>
                            {lang.code === currentLanguage
                              ? 'Langue actuelle'
                              : 'Accueil'}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='relative rounded-2xl border border-white/20 bg-white/10 p-3 text-gray-300 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:text-white lg:hidden'
            >
              <div className='relative h-6 w-6'>
                {isMenuOpen ? (
                  <XMarkIcon className='h-6 w-6 animate-spin' />
                ) : (
                  <Bars3Icon className='h-6 w-6' />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className='absolute left-0 right-0 top-full border-t border-white/10 bg-black/95 shadow-2xl backdrop-blur-2xl lg:hidden'>
            <div className='mx-auto max-w-7xl px-4 py-8'>
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className='mb-8'>
                <div className='relative'>
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={nav.searchPlaceholder}
                    className='w-full rounded-2xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder-gray-400 backdrop-blur-xl transition-all duration-300 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400'
                  />
                  <MagnifyingGlassIcon className='absolute left-4 top-4 h-6 w-6 text-gray-400' />
                </div>
              </form>

              {/* Enhanced Mobile Navigation Links */}
              <nav className='space-y-3'>
                {navigationLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 rounded-2xl px-6 py-4 text-lg font-medium transition-all duration-300 ${
                        link.active
                          ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg shadow-purple-500/30'
                          : 'border border-transparent text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className='h-5 w-5' />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                {/* Enhanced Mobile Categories */}
                <div className='mt-8 border-t border-white/10 pt-8'>
                  <h3 className='mb-6 flex items-center space-x-2 text-xl font-bold text-white'>
                    <BeakerIcon className='h-5 w-5 text-purple-400' />
                    <span>{nav.categories}</span>
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {featuredCategories.slice(0, 6).map(category => (
                      <Link
                        key={category.slug}
                        href={`/categories/${category.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className='group rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20'
                      >
                        <div className='mb-2 text-2xl group-hover:animate-bounce'>
                          {getCategoryEmojiString(category.name)}
                        </div>
                        <div className='text-sm font-medium text-white'>
                          {category.name}
                        </div>
                        <div className='mt-1 text-xs text-gray-400'>
                          {category.toolCount} outils
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Language Switcher - Mobile */}
                <div className='mt-6 border-t border-white/10 pt-6'>
                  <h3 className='mb-4 flex items-center space-x-2 text-lg font-bold text-white'>
                    <span>🌐</span>
                    <span>Langue / Language</span>
                  </h3>
                  <LanguageSwitcher
                    currentLanguage={currentLanguage}
                    variant='mobile'
                    showLabel={true}
                    className='w-full'
                  />

                  {/* Mobile Language Menu */}
                  <div className='mt-4 space-y-2'>
                    {[
                      { code: 'en', name: 'English', flag: '🇺🇸', path: '/' },
                      { code: 'fr', name: 'Français', flag: '🇫🇷', path: '/fr' },
                      { code: 'it', name: 'Italiano', flag: '🇮🇹', path: '/it' },
                      { code: 'es', name: 'Español', flag: '🇪🇸', path: '/es' },
                      { code: 'de', name: 'Deutsch', flag: '🇩🇪', path: '/de' },
                      { code: 'nl', name: 'Nederlands', flag: '🇳🇱', path: '/nl' },
                      { code: 'pt', name: 'Português', flag: '🇵🇹', path: '/pt' },
                    ].map(lang => (
                      <Link
                        key={lang.code}
                        href={lang.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`group flex items-center space-x-3 rounded-xl p-3 text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white ${
                          lang.code === currentLanguage
                            ? 'bg-purple-600/20 text-purple-300'
                            : ''
                        }`}
                      >
                        <span className='text-xl'>{lang.flag}</span>
                        <div className='flex-1'>
                          <div className='font-medium group-hover:text-purple-300'>
                            {lang.name}
                          </div>
                          <div className='text-xs text-gray-500 group-hover:text-gray-400'>
                            {lang.code === currentLanguage
                              ? 'Langue actuelle'
                              : 'Accueil'}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Category Dropdown Backdrop */}
      {isCategoriesOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setIsCategoriesOpen(false)}
        />
      )}

      {/* Language Dropdown Backdrop */}
      {isLanguagesOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsLanguagesOpen(false)} />
      )}
    </header>
  );
}

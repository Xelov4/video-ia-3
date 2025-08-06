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

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getCategoryEmojiString } from '@/src/lib/services/emojiMapping'
import { formatNumber } from '@/src/lib/utils/formatNumbers'
import { 
  MagnifyingGlassIcon, 
  Bars3Icon, 
  XMarkIcon, 
  SparklesIcon,
  CommandLineIcon,
  BeakerIcon,
  FireIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface Category {
  id: number
  name: string
  slug: string
  toolCount: number
  isFeatured: boolean
}

interface HeaderProps {
  totalToolsCount?: number
}

export default function Header({ totalToolsCount = 16763 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()

  /**
   * Handle scroll effect for header background
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * Load featured categories for navigation dropdown
   */
  useEffect(() => {
    const loadFeaturedCategories = async () => {
      try {
        const response = await fetch('/api/categories?featured=true&limit=8')
        if (response.ok) {
          const data = await response.json()
          setFeaturedCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Failed to load featured categories:', error)
      }
    }

    loadFeaturedCategories()
  }, [])

  /**
   * Handle global search submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tools?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  /**
   * Navigation links configuration with icons
   */
  const navigationLinks = [
    { 
      href: '/', 
      label: 'Accueil', 
      icon: SparklesIcon,
      active: pathname === '/' 
    },
    { 
      href: '/tools', 
      label: 'Outils IA', 
      icon: CommandLineIcon,
      active: pathname.startsWith('/tools') 
    },
    { 
      href: '/categories', 
      label: 'Catégories', 
      icon: BeakerIcon,
      active: pathname.startsWith('/categories') 
    },
    { 
      href: '/about', 
      label: 'À propos', 
      icon: InformationCircleIcon,
      active: pathname === '/about' 
    },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-purple-500/10' 
        : 'bg-transparent backdrop-blur-md border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          {/* Enhanced Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/50 to-pink-400/50 rounded-3xl animate-pulse"></div>
                <SparklesIcon className="w-8 h-8 text-white relative z-10 group-hover:animate-spin" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  Video-IA.net
                </h1>
                <div className="flex items-center space-x-2">
                  <FireIcon className="w-4 h-4 text-orange-400" />
                  <p className="text-sm text-gray-300 font-medium">
                    {formatNumber(totalToolsCount)} outils IA
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-2">
              {navigationLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-medium transition-all duration-300 ${
                      link.active
                        ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg shadow-purple-500/30 backdrop-blur-sm'
                        : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-medium text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 transition-all duration-300"
                >
                  <span>Catégories</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCategoriesOpen && (
                  <div className="absolute right-0 mt-3 w-96 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-4 z-50">
                    <div className="px-6 py-3 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Catégories Populaires</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-4">
                      {featuredCategories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/categories/${category.slug}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className="p-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 group flex items-start space-x-3"
                        >
                          <span className="text-xl group-hover:animate-bounce">
                            {getCategoryEmojiString(category.name)}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium group-hover:text-purple-300">{category.name}</div>
                            <div className="text-xs text-gray-500 group-hover:text-gray-400">{category.toolCount} outils</div>
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
          <nav className="hidden md:flex lg:hidden items-center space-x-1 ml-4">
            {navigationLinks.slice(0, 2).map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 px-2 py-2 rounded-xl font-medium transition-all duration-300 ${
                    link.active
                      ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg shadow-purple-500/30 backdrop-blur-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              )
            })}
            
            {/* More dropdown for medium screens */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-1 px-2 py-2 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 transition-all duration-300"
              >
                <span className="text-sm">Plus</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </nav>

          {/* Search and Mobile Menu - Right Side */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <form onSubmit={handleSearch} className="hidden lg:block">
              <div className="relative">
                <div className={`transition-all duration-300 ${
                  isSearchFocused 
                    ? 'scale-105 shadow-2xl shadow-purple-500/20' 
                    : 'shadow-lg'
                }`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Rechercher un outil IA..."
                    className="w-80 pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400/50 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-xl hover:bg-white/15"
                  />
                  <MagnifyingGlassIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                    isSearchFocused ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  
                  {/* Search suggestions indicator */}
                  {searchQuery && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Enhanced Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <div className="relative w-6 h-6">
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6 animate-spin" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-8">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un outil IA..."
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400/50 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-xl"
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                </div>
              </form>

              {/* Enhanced Mobile Navigation Links */}
              <nav className="space-y-3">
                {navigationLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-300 ${
                        link.active
                          ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg shadow-purple-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}

                {/* Enhanced Mobile Categories */}
                <div className="border-t border-white/10 pt-8 mt-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    <BeakerIcon className="w-5 h-5 text-purple-400" />
                    <span>Catégories Populaires</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {featuredCategories.slice(0, 6).map((category) => (
                      <Link
                        key={category.slug}
                        href={`/categories/${category.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="p-4 bg-white/10 border border-white/20 rounded-2xl text-center hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm group"
                      >
                        <div className="text-2xl mb-2 group-hover:animate-bounce">
                          {getCategoryEmojiString(category.name)}
                        </div>
                        <div className="font-medium text-white text-sm">{category.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{category.toolCount} outils</div>
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
          className="fixed inset-0 z-40"
          onClick={() => setIsCategoriesOpen(false)}
        />
      )}
    </header>
  )
}
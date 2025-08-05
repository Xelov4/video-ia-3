/**
 * Main Header Component
 * 
 * Comprehensive navigation header for the AI tools directory platform.
 * Features responsive design, search functionality, category navigation,
 * and user-friendly interface elements.
 * 
 * Features:
 * - Responsive navigation menu
 * - Global search functionality
 * - Category dropdown navigation
 * - Statistics display (16,763 tools)
 * - Mobile-optimized design
 * - SEO-friendly structure
 * 
 * @author Video-IA.net Development Team
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

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
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()

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
   * Navigation links configuration
   */
  const navigationLinks = [
    { href: '/', label: 'Accueil', active: pathname === '/' },
    { href: '/tools', label: 'Outils IA', active: pathname.startsWith('/tools') },
    { href: '/categories', label: 'Catégories', active: pathname.startsWith('/categories') },
    { href: '/about', label: 'À propos', active: pathname === '/about' },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Video-IA.net</h1>
                <p className="text-xs text-gray-500">{totalToolsCount.toLocaleString()} outils IA</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  link.active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <span>Catégories populaires</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCategoriesOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Catégories Populaires</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {featuredCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/categories/${category.slug}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.toolCount} outils</div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <Link
                      href="/categories"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Voir toutes les catégories →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden lg:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un outil IA..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </form>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un outil IA..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    link.active
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Categories */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="px-3 text-sm font-semibold text-gray-900 mb-2">Catégories Populaires</h3>
                <div className="space-y-1">
                  {featuredCategories.slice(0, 6).map((category) => (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-xs text-gray-500">{category.toolCount}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
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
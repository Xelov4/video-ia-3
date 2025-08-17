'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { SupportedLocale } from '@/middleware'
import ModernHomepage from '@/src/components/homepage/ModernHomepage'

interface Tool {
  id: number
  toolName: string
  displayName: string
  toolDescription: string | null
  displayDescription: string | null
  toolOverview: string | null
  displayOverview: string | null
  toolCategory: string
  imageUrl: string | null
  slug: string
  featured: boolean
  isNew?: boolean
  qualityScore?: number
  views?: number
  likes?: number
  pricing?: 'free' | 'freemium' | 'paid' | 'enterprise'
  tags?: string[]
  lastUpdated?: string
  category: string
  overview?: string
  description?: string
}

interface Category {
  name: string
  count: number
  icon?: React.ReactNode
}

interface Audience {
  name: string
  count: number
}

interface SimpleHomepageClientProps {
  lang: SupportedLocale
  audiences: Array<{ name: string; count: number }>
  useCases: Array<{ name: string; count: number }>
  categories: Array<{ name: string; slug: string; toolCount?: number }>
  stats: {
    totalTools: number
    totalCategories: number
    totalAudiences: number
    totalUseCases: number
  }
}

export default function SimpleHomepageClient({
  lang,
  audiences: propAudiences,
  categories: propCategories,
  stats
}: SimpleHomepageClientProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(stats?.totalTools || 16765)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch tools
      const toolsResponse = await fetch(`/api/tools?page=1&limit=24&sortBy=featured&sortOrder=desc&lang=${lang}`)
      
      if (!toolsResponse.ok) {
        throw new Error(`HTTP error! status: ${toolsResponse.status}`)
      }

      const toolsData = await toolsResponse.json()
      
      if (toolsData.success && toolsData.data) {
        // Transform tools to match the expected format
        const transformedTools = toolsData.data.map((tool: Record<string, unknown>) => ({
          ...tool,
          category: tool.toolCategory,
          overview: tool.displayOverview || tool.toolOverview,
          description: tool.displayDescription || tool.toolDescription,
          isNew: Math.random() > 0.8, // Mock new status
          qualityScore: Math.floor(Math.random() * 4) + 7, // Mock quality score 7-10
          views: Math.floor(Math.random() * 10000) + 1000, // Mock views
          likes: Math.floor(Math.random() * 500) + 10, // Mock likes
          pricing: ['free', 'freemium', 'paid', 'enterprise'][Math.floor(Math.random() * 4)] as Tool['pricing'],
          tags: ['AI', 'Productivity', 'Creative'].slice(0, Math.floor(Math.random() * 3) + 1)
        }))
        
        setTools(transformedTools)
        setTotalCount(toolsData.pagination?.totalCount || stats?.totalTools || 16765)
      }

      // Transform categories from props
      const transformedCategories = propCategories.map(cat => ({
        name: cat.name,
        count: cat.toolCount || Math.floor(Math.random() * 1000) + 100
      }))
      setCategories(transformedCategories)

      // Use prop audiences or fallback
      setAudiences(propAudiences || [
        { name: 'Developers', count: 892 },
        { name: 'Content Creators', count: 743 },
        { name: 'Marketers', count: 623 },
        { name: 'Designers', count: 512 },
        { name: 'Writers', count: 445 },
        { name: 'Students', count: 334 }
      ])

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Erreur lors du chargement des données')
      
      // Set fallback data on error
      setTools([])
      setCategories(propCategories.map(cat => ({ name: cat.name, count: cat.toolCount || 100 })))
      setAudiences(propAudiences || [])
    } finally {
      setIsLoading(false)
    }
  }, [lang, propAudiences, propCategories, stats?.totalTools])

  useEffect(() => {
    fetchData()
  }, [lang, fetchData])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <ModernHomepage
      tools={tools}
      categories={categories}
      audiences={audiences}
      totalCount={totalCount}
      lang={lang}
    />
  )
}
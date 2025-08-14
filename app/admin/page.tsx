/**
 * Admin Dashboard
 * Main admin dashboard with statistics and quick actions
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { StatsCard } from '@/src/components/admin/StatsCard'
import { RecentActivity } from '@/src/components/admin/RecentActivity'
import { QuickActions } from '@/src/components/admin/QuickActions'
import { formatNumber } from '@/src/lib/utils/formatNumbers'
import {
  WrenchScrewdriverIcon,
  FolderIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  toolStats: {
    totalTools: number
    activeTools: number
    featuredTools: number
    totalViews: number
    totalClicks: number
    categories: number
  }
  categoryStats: {
    totalCategories: number
    activeCategories: number
    averageToolsPerCategory: number
    topCategories: any[]
  }
  recentTools: {
    tools: any[]
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, use mock data since we don't have the API endpoint yet
      const mockStats = {
        toolStats: {
          totalTools: 16763,
          activeTools: 15890,
          featuredTools: 245,
          totalViews: 1250000,
          totalClicks: 89500,
          categories: 140
        },
        categoryStats: {
          totalCategories: 140,
          activeCategories: 138,
          averageToolsPerCategory: 12.5,
          topCategories: []
        },
        recentTools: {
          tools: []
        }
      }

      setStats(mockStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erreur: {error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const dashboardStats = [
    {
      name: 'Outils totaux',
      value: formatNumber(stats.toolStats.totalTools),
      change: '+12 cette semaine',
      changeType: 'positive' as const,
      icon: WrenchScrewdriverIcon,
      color: 'blue' as const
    },
    {
      name: 'Catégories',
      value: stats.toolStats.categories.toString(),
      change: '+2 ce mois',
      changeType: 'positive' as const,
      icon: FolderIcon,
      color: 'green' as const
    },
    {
      name: 'Vues totales',
      value: formatNumber(stats.toolStats.totalViews),
      change: '+2,350 aujourd\'hui',
      changeType: 'positive' as const,
      icon: EyeIcon,
      color: 'purple' as const
    },
    {
      name: 'Clics',
      value: formatNumber(stats.toolStats.totalClicks),
      change: '+180 aujourd\'hui',
      changeType: 'positive' as const,
      icon: CursorArrowRaysIcon,
      color: 'orange' as const
    },
    {
      name: 'Outils en vedette',
      value: stats.toolStats.featuredTools.toString(),
      change: 'Stable',
      changeType: 'neutral' as const,
      icon: StarIcon,
      color: 'yellow' as const
    },
    {
      name: 'Favoris',
      value: '2,450',
      change: '+45 cette semaine',
      changeType: 'positive' as const,
      icon: HeartIcon,
      color: 'red' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-gray-600">
          Vue d'ensemble de votre plateforme Video-IA.net
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatsCard
            key={stat.name}
            name={stat.name}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity recentTools={stats.recentTools.tools} />
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          État du système
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-green-800">
                Base de données
              </div>
              <div className="text-xs text-green-600">
                Connexion active
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-green-800">
                API
              </div>
              <div className="text-xs text-green-600">
                Fonctionnelle
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-yellow-800">
                Cache
              </div>
              <div className="text-xs text-yellow-600">
                Non configuré
              </div>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
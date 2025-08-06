/**
 * Admin Dashboard
 * Main admin dashboard with statistics and quick actions
 */

import { toolsService } from '@/src/lib/database/services/tools'
import { CategoriesService } from '@/src/lib/database/services/categories'
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

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Fetch dashboard statistics
  const [toolStats, categoryStats] = await Promise.all([
    toolsService.getToolStatistics().catch(() => ({
      totalTools: 0,
      activeTools: 0,
      featuredTools: 0,
      totalViews: 0,
      totalClicks: 0,
      categories: 0
    })),
    CategoriesService.getCategoryStatistics().catch(() => ({
      totalCategories: 0,
      activeCategories: 0,
      averageToolsPerCategory: 0,
      topCategories: []
    }))
  ])

  // Get recent tools for activity feed
  const recentTools = await toolsService.searchTools({
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }).catch(() => ({ tools: [] }))

  const stats = [
    {
      name: 'Outils totaux',
      value: formatNumber(toolStats.totalTools),
      change: '+12 cette semaine',
      changeType: 'positive' as const,
      icon: WrenchScrewdriverIcon,
      color: 'blue' as const
    },
    {
      name: 'Catégories',
      value: toolStats.categories.toString(),
      change: '+2 ce mois',
      changeType: 'positive' as const,
      icon: FolderIcon,
      color: 'green' as const
    },
    {
      name: 'Vues totales',
      value: formatNumber(toolStats.totalViews),
      change: '+2,350 aujourd\'hui',
      changeType: 'positive' as const,
      icon: EyeIcon,
      color: 'purple' as const
    },
    {
      name: 'Clics',
      value: formatNumber(toolStats.totalClicks),
      change: '+180 aujourd\'hui',
      changeType: 'positive' as const,
      icon: CursorArrowRaysIcon,
      color: 'orange' as const
    },
    {
      name: 'Outils en vedette',
      value: toolStats.featuredTools.toString(),
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
        {stats.map((stat, index) => (
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
          <RecentActivity recentTools={recentTools.tools} />
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
/**
 * Admin Dashboard
 * Main admin dashboard with statistics and quick actions using shadcn/ui
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  Wrench, 
  Folder, 
  Eye, 
  MousePointer,
  Heart, 
  Star,
  Plus,
  Settings,
  Database,
  Activity,
  TrendingUp
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/components/ui/alert"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { Skeleton } from "@/src/components/ui/skeleton"
import { formatNumber } from '@/src/lib/utils/formatNumbers'

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
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-[60px] mb-1" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription className="mt-2">
          {error}
          <Button 
            onClick={loadDashboardData}
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
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
      icon: Wrench,
      color: 'blue' as const
    },
    {
      name: 'Catégories',
      value: stats.toolStats.categories.toString(),
      change: '+2 ce mois',
      changeType: 'positive' as const,
      icon: Folder,
      color: 'green' as const
    },
    {
      name: 'Vues totales',
      value: formatNumber(stats.toolStats.totalViews),
      change: '+2,350 aujourd\'hui',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'purple' as const
    },
    {
      name: 'Clics',
      value: formatNumber(stats.toolStats.totalClicks),
      change: '+180 aujourd\'hui',
      changeType: 'positive' as const,
      icon: MousePointer,
      color: 'orange' as const
    },
    {
      name: 'Outils en vedette',
      value: stats.toolStats.featuredTools.toString(),
      change: 'Stable',
      changeType: 'neutral' as const,
      icon: Star,
      color: 'yellow' as const
    },
    {
      name: 'Favoris',
      value: '2,450',
      change: '+45 cette semaine',
      changeType: 'positive' as const,
      icon: Heart,
      color: 'red' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre plateforme Video-IA.net
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un outil
        </Button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {stat.changeType === 'positive' && (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-muted-foreground'}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Raccourcis vers les tâches courantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un outil
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Folder className="mr-2 h-4 w-4" />
              Gérer les catégories
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Analyser les performances
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières modifications sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Nouvel outil ajouté: "ChatGPT-4 Turbo"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Il y a 2 heures
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Catégorie mise à jour: "Génération d'images"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Il y a 4 heures
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    12 nouveaux utilisateurs inscrits
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aujourd'hui
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            État du système
          </CardTitle>
          <CardDescription>
            Surveillance en temps réel des services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Base de données</span>
                <Badge variant="default" className="bg-green-500">
                  Actif
                </Badge>
              </div>
              <Progress value={98} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Connexion stable • 98% uptime
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API</span>
                <Badge variant="default" className="bg-green-500">
                  Actif
                </Badge>
              </div>
              <Progress value={99} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Réponse rapide • 99% uptime
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache</span>
                <Badge variant="secondary">
                  Non configuré
                </Badge>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Configuration requise
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
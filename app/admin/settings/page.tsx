/**
 * Admin Settings Page
 */

'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Settings, User, Database, Shield, Globe } from 'lucide-react'

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/admin/login')
    }
  }, [status])

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  const settingsSections = [
    {
      title: 'Profil Utilisateur',
      description: 'Gérez vos informations personnelles et préférences',
      icon: User,
      href: '/admin/settings/profile',
      status: 'Bientôt disponible'
    },
    {
      title: 'Configuration Base de Données',
      description: 'Paramètres de connexion et optimisation',
      icon: Database,
      href: '/admin/settings/database',
      status: 'Bientôt disponible'
    },
    {
      title: 'Sécurité',
      description: 'Authentification, permissions et logs de sécurité',
      icon: Shield,
      href: '/admin/settings/security',
      status: 'Bientôt disponible'
    },
    {
      title: 'Localisation',
      description: 'Gestion des langues et traductions',
      icon: Globe,
      href: '/admin/settings/localization',
      status: 'Bientôt disponible'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Configurez et personnalisez votre espace d'administration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <Card key={section.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{section.status}</span>
                  {section.status === 'Bientôt disponible' && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      En développement
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Session Actuelle</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="font-medium">Nom:</span>
              <span>{session.user?.name || 'Non défini'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{session.user?.email || 'Non défini'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Rôle:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {(session.user as any)?.role || 'Admin'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
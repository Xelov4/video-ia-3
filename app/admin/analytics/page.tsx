'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/admin/login')
    }
  }, [status])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytiques</h1>
        <p className="text-gray-600">Statistiques et métriques du site</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Total Outils</h3>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🔧</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Catégories</h3>
              <p className="text-2xl font-bold text-gray-900">28</p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📁</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Visiteurs (mois)</h3>
              <p className="text-2xl font-bold text-gray-900">12,456</p>
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">👥</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Pages vues</h3>
              <p className="text-2xl font-bold text-gray-900">45,678</p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📊</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Graphiques et Statistiques</h2>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Les graphiques détaillés seront bientôt disponibles.</p>
          <div className="text-sm text-gray-500">
            Prochainement :
            <ul className="mt-2 space-y-1">
              <li>• Graphiques de trafic en temps réel</li>
              <li>• Statistiques des outils les plus populaires</li>
              <li>• Analyse des catégories</li>
              <li>• Rapports d'utilisation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminScraperPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scraper Administration</h1>
        <p className="text-gray-600">Gérez et surveillez le scraper d'outils</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut du Scraper</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Statut</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Actif
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dernière exécution</span>
              <span className="text-sm text-gray-500">Il y a 2 heures</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Outils scrapés</span>
              <span className="text-sm font-medium text-gray-900">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taux de succès</span>
              <span className="text-sm font-medium text-green-600">98.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Lancer un Scraping Manuel
            </button>
            <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Voir les Logs
            </button>
            <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
              Configurer le Scraper
            </button>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Arrêter le Scraper
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Historique des Exécutions</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-600">L'historique détaillé des exécutions sera bientôt disponible.</p>
            <p className="text-sm text-gray-500 mt-2">
              Vous pourrez voir ici les logs, erreurs, et statistiques détaillées de chaque exécution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminArticlesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Articles</h1>
        <p className="text-gray-600">Gérez les articles et contenus du blog</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Section Articles</h2>
          <p className="text-gray-600 mb-4">Cette fonctionnalité sera bientôt disponible.</p>
          <div className="text-sm text-gray-500">
            Ici vous pourrez :
            <ul className="mt-2 space-y-1">
              <li>• Créer de nouveaux articles</li>
              <li>• Éditer les articles existants</li>
              <li>• Gérer les catégories d'articles</li>
              <li>• Planifier les publications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
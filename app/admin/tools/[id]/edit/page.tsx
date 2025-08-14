/**
 * Admin Tool Edit Page
 * Interface for editing AI tool information
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeftIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Tool {
  id: number
  tool_name: string
  tool_category: string
  tool_link: string
  overview: string
  tool_description: string
  target_audience: string
  key_features: string
  use_cases: string
  tags: string
  image_url: string
  slug: string
  is_active: boolean
  featured: boolean
  quality_score: number
  meta_title: string
  meta_description: string
  seo_keywords: string
  view_count: number
  click_count: number
  favorite_count: number
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function AdminToolEditPage({ params }: { params: Promise<{ id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tool, setTool] = useState<Tool | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchTool()
      fetchCategories()
    }
  }, [session, params.id])

  const fetchTool = async () => {
    try {
      const response = await fetch(`/api/tools/${params.id}`)
      if (!response.ok) {
        throw new Error('Outil non trouvé')
      }
      const data = await response.json()
      setTool(data.tool)
    } catch (error) {
      console.error('Error fetching tool:', error)
      setError('Erreur lors du chargement de l\'outil')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tool) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/tools/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tool),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      router.push('/admin/tools?message=Outil mis à jour avec succès')
    } catch (error) {
      console.error('Error updating tool:', error)
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet outil ?')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/tools/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      router.push('/admin/tools?message=Outil supprimé avec succès')
    } catch (error) {
      console.error('Error deleting tool:', error)
      setError('Erreur lors de la suppression')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  if (!session) {
    return null
  }

  if (!tool) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Outil non trouvé</h1>
          <Link href="/admin/tools" className="text-blue-600 hover:text-blue-800">
            Retour à la liste
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/tools"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modifier l'outil</h1>
              <p className="text-gray-600 mt-1">{tool.tool_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Supprimer
            </button>
            <button
              type="submit"
              form="tool-form"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                              <CheckIcon className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form id="tool-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'outil *
              </label>
              <input
                type="text"
                value={tool.tool_name}
                onChange={(e) => setTool({ ...tool, tool_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={tool.tool_category}
                onChange={(e) => setTool({ ...tool, tool_category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien de l'outil
              </label>
              <input
                type="url"
                value={tool.tool_link || ''}
                onChange={(e) => setTool({ ...tool, tool_link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={tool.slug || ''}
                onChange={(e) => setTool({ ...tool, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="nom-de-l-outil"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aperçu
            </label>
            <textarea
              value={tool.overview || ''}
              onChange={(e) => setTool({ ...tool, overview: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description courte de l'outil..."
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description complète
            </label>
            <textarea
              value={tool.tool_description || ''}
              onChange={(e) => setTool({ ...tool, tool_description: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description détaillée de l'outil..."
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Détails et fonctionnalités</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audience cible
              </label>
              <textarea
                value={tool.target_audience || ''}
                onChange={(e) => setTool({ ...tool, target_audience: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Qui est l'audience cible ?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cas d'usage
              </label>
              <textarea
                value={tool.use_cases || ''}
                onChange={(e) => setTool({ ...tool, use_cases: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Quels sont les cas d'usage ?"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fonctionnalités clés
            </label>
            <textarea
              value={tool.key_features || ''}
              onChange={(e) => setTool({ ...tool, key_features: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Liste des fonctionnalités principales..."
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tool.tags || ''}
              onChange={(e) => setTool({ ...tool, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO et métadonnées</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre SEO
              </label>
              <input
                type="text"
                value={tool.meta_title || ''}
                onChange={(e) => setTool({ ...tool, meta_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Titre pour les moteurs de recherche"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score de qualité
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={tool.quality_score || 0}
                onChange={(e) => setTool({ ...tool, quality_score: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description SEO
            </label>
            <textarea
              value={tool.meta_description || ''}
              onChange={(e) => setTool({ ...tool, meta_description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description pour les moteurs de recherche"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mots-clés SEO
            </label>
            <input
              type="text"
              value={tool.seo_keywords || ''}
              onChange={(e) => setTool({ ...tool, seo_keywords: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="mot-clé1, mot-clé2, mot-clé3"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Statut et visibilité</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={tool.is_active}
                onChange={(e) => setTool({ ...tool, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Outil actif
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={tool.featured}
                onChange={(e) => setTool({ ...tool, featured: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Mettre en vedette
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de l'image
            </label>
            <input
              type="url"
              value={tool.image_url || ''}
              onChange={(e) => setTool({ ...tool, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </form>
    </div>
  )
} 
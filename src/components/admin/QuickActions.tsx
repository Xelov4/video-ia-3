/**
 * Quick Actions Component
 * Quick action buttons for common admin tasks
 */

'use client'

import Link from 'next/link'
import {
  PlusIcon,
  WrenchScrewdriverIcon,
  FolderPlusIcon,
  DocumentPlusIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

const actions = [
  {
    name: 'Ajouter un outil',
    description: 'Ajouter un nouvel outil IA',
    href: '/admin/tools/new',
    icon: PlusIcon,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: 'Gérer les outils',
    description: 'Modifier les outils existants',
    href: '/admin/tools',
    icon: WrenchScrewdriverIcon,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: 'Nouvelle catégorie',
    description: 'Créer une catégorie',
    href: '/admin/categories/new',
    icon: FolderPlusIcon,
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    name: 'Nouvel article',
    description: 'Rédiger un article',
    href: '/admin/articles/new',
    icon: DocumentPlusIcon,
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    name: 'Lancer le scraper',
    description: 'Analyser de nouveaux outils',
    href: '/admin/scraper',
    icon: ComputerDesktopIcon,
    color: 'bg-indigo-500 hover:bg-indigo-600'
  }
]

export const QuickActions = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Actions rapides
      </h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`
              flex items-center p-3 rounded-lg text-white transition-colors
              ${action.color}
            `}
          >
            <action.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">
                {action.name}
              </div>
              <div className="text-xs opacity-90">
                {action.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
/**
 * Admin Sidebar Component
 * Navigation sidebar for admin interface
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  FolderIcon,
  DocumentTextIcon,
  CogIcon,
  UsersIcon,
  BookOpenIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: HomeIcon },
  { name: 'Outils IA', href: '/admin/tools', icon: WrenchScrewdriverIcon },
  { name: 'Catégories', href: '/admin/categories', icon: FolderIcon },
  { name: 'Articles', href: '/admin/articles', icon: DocumentTextIcon },
  { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
  { name: 'Scraper', href: '/admin/scraper', icon: ComputerDesktopIcon },
  { name: 'Paramètres', href: '/admin/settings', icon: CogIcon },
]

export const AdminSidebar = () => {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <Link href="/admin" className="flex items-center">
            <div className="text-xl font-bold text-gray-900">
              Video-IA.net
            </div>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0 transition-colors
                    ${isActive
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {session.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {session.user?.name}
              </p>
              <p className="text-xs text-gray-500">
                {session.user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
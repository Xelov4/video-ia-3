/**
 * Admin Header Component
 * Top header for admin interface with user menu and actions
 */

'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  ChevronDownIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'

interface AdminHeaderProps {
  onMenuClick: () => void
}

export const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!session) {
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Menu Button and Title */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors mr-3"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            
            {/* Page Title */}
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
              Administration
            </h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* View Site Link - Hidden on very small screens */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Voir le site
            </Link>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <BellIcon className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <span className="text-sm font-medium text-white">
                    {session.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {session.user?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.user?.role}
                  </div>
                </div>
                <ChevronDownIcon className="w-4 h-4 ml-1 sm:ml-2 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <Link
                      href="/admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-3" />
                      Paramètres
                    </Link>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
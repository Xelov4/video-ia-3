/**
 * Admin Layout
 * Layout wrapper for all admin pages with navigation and authentication
 */

'use client'

import { AdminSidebar } from '@/src/components/admin/AdminSidebar'
import { AdminHeader } from '@/src/components/admin/AdminHeader'
import { useEffect, useState } from 'react'

// Set document title for admin pages
function useAdminMetadata() {
  useEffect(() => {
    document.title = 'Administration | Video-IA.net'
    
    // Set noindex meta tag for admin pages
    const metaRobots = document.querySelector('meta[name="robots"]')
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'robots'
      meta.content = 'noindex, nofollow'
      document.head.appendChild(meta)
    }
  }, [])
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Set admin page metadata
  useAdminMetadata()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-full">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 min-w-0">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
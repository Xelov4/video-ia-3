/**
 * Admin Layout
 * Layout wrapper for all admin pages with navigation and authentication
 */

'use client'

import { AdminSidebar } from '@/src/components/admin/AdminSidebar'
import { AdminHeader } from '@/src/components/admin/AdminHeader'
import { useEffect } from 'react'

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
  // Set admin page metadata
  useAdminMetadata()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-full">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          <AdminHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
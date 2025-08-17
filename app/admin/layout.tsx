/**
 * Admin Layout
 * Layout wrapper for all admin pages with navigation and authentication
 */

'use client'

import { useEffect } from 'react'
import { SidebarProvider, SidebarInset } from "@/src/components/ui/sidebar"
import { AdminSidebar } from '@/src/components/admin/AdminSidebar'
import { AdminHeader } from '@/src/components/admin/AdminHeader'

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
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 space-y-4 p-8 pt-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
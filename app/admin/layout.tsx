/**
 * Admin Layout
 * Layout wrapper for all admin pages with navigation and authentication
 */

import type { Metadata } from 'next'
import { AdminSidebar } from '@/src/components/admin/AdminSidebar'
import { AdminHeader } from '@/src/components/admin/AdminHeader'

export const metadata: Metadata = {
  title: 'Administration | Video-IA.net',
  description: 'Interface d\'administration pour Video-IA.net',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
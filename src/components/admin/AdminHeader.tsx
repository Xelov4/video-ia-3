/**
 * Admin Header Component
 * Top header for admin interface with user menu and actions using shadcn/ui
 */

'use client'

import Link from 'next/link'
import { Bell, Eye } from 'lucide-react'
import { Button } from "@/src/components/ui/button"
import { SidebarTrigger } from "@/src/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb"
import { Separator } from "@/src/components/ui/separator"


export const AdminHeader = () => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/admin">
              Administration
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="ml-auto flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
          <Link href="/" target="_blank">
            <Eye className="h-4 w-4 mr-2" />
            Voir le site
          </Link>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
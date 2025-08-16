'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ChevronRight } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/src/components/ui/breadcrumb'
import { SupportedLanguage } from '@/src/lib/i18n/types'
import { useTranslations } from '@/src/lib/i18n/translations'

interface BreadcrumbItemData {
  label: string
  href?: string
  isCurrentPage?: boolean
  icon?: React.ReactNode
}

interface GlobalBreadcrumbProps {
  lang: SupportedLanguage
  toolName?: string
  categoryName?: string
  customBreadcrumbs?: BreadcrumbItemData[]
  className?: string
}

/**
 * Global Breadcrumb Component - Génère automatiquement les breadcrumbs 
 * basés sur la route actuelle avec support multilingue complet
 */
export default function GlobalBreadcrumb({
  lang,
  toolName,
  categoryName,
  customBreadcrumbs,
  className = ''
}: GlobalBreadcrumbProps) {
  const pathname = usePathname()
  const t = useTranslations(lang)

  const breadcrumbItems = useMemo((): BreadcrumbItemData[] => {
    // Si des breadcrumbs personnalisés sont fournis, les utiliser
    if (customBreadcrumbs) {
      return customBreadcrumbs
    }

    const items: BreadcrumbItemData[] = []
    const pathSegments = pathname.split('/').filter(Boolean)
    
    // Retirer le segment de langue du chemin
    const langIndex = pathSegments.findIndex(segment => 
      ['en', 'fr', 'es', 'de', 'it', 'nl', 'pt'].includes(segment)
    )
    if (langIndex !== -1) {
      pathSegments.splice(langIndex, 1)
    }

    // Toujours commencer par Home
    items.push({
      label: t.breadcrumb.home,
      href: `/${lang}`,
      icon: <Home className="h-4 w-4" />
    })

    // Détecter le type de page basé sur les segments
    if (pathSegments.length === 0) {
      // Page d'accueil - pas d'autres breadcrumbs nécessaires
      items[0].isCurrentPage = true
      return items
    }

    const firstSegment = pathSegments[0]

    // Route: /tools ou /t (listing des outils)
    if (firstSegment === 'tools' || firstSegment === 't') {
      if (pathSegments.length === 1) {
        // Listing des outils
        items.push({
          label: t.breadcrumb.tools,
          isCurrentPage: true
        })
      } else if (pathSegments.length === 2) {
        // Page détail d'un outil
        items.push({
          label: t.breadcrumb.tools,
          href: `/${lang}/tools`
        })
        items.push({
          label: toolName || t.breadcrumb.tool_detail,
          isCurrentPage: true
        })
      }
    }
    
    // Route: /categories ou /c
    else if (firstSegment === 'categories' || firstSegment === 'c') {
      if (pathSegments.length === 1) {
        // Listing des catégories
        items.push({
          label: t.breadcrumb.categories,
          isCurrentPage: true
        })
      } else if (pathSegments.length === 2) {
        // Page d'une catégorie spécifique
        items.push({
          label: t.breadcrumb.categories,
          href: `/${lang}/categories`
        })
        items.push({
          label: categoryName || t.breadcrumb.category_tools,
          isCurrentPage: true
        })
      }
    }
    
    // Route: /search
    else if (firstSegment === 'search') {
      items.push({
        label: t.breadcrumb.search_results,
        isCurrentPage: true
      })
    }
    
    // Route générique - construire basé sur les segments
    else {
      pathSegments.forEach((segment, index) => {
        const isLast = index === pathSegments.length - 1
        const segmentPath = `/${lang}/${pathSegments.slice(0, index + 1).join('/')}`
        
        // Capitaliser et nettoyer le segment pour l'affichage
        const label = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
        
        items.push({
          label,
          href: isLast ? undefined : segmentPath,
          isCurrentPage: isLast
        })
      })
    }

    return items
  }, [pathname, lang, t, toolName, categoryName, customBreadcrumbs])

  // Ne pas afficher si il n'y a qu'un seul élément (Home) et qu'on est sur la page d'accueil
  if (breadcrumbItems.length === 1 && breadcrumbItems[0].isCurrentPage) {
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
              
              <BreadcrumbItem>
                {item.isCurrentPage ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      href={item.href || '#'} 
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

/**
 * Hook pour générer des breadcrumbs personnalisés
 */
export function useBreadcrumbs(
  lang: SupportedLanguage,
  customItems?: Omit<BreadcrumbItemData, 'icon'>[]
): BreadcrumbItemData[] {
  const t = useTranslations(lang)
  
  return useMemo(() => {
    const items: BreadcrumbItemData[] = [
      {
        label: t.breadcrumb.home,
        href: `/${lang}`,
        icon: <Home className="h-4 w-4" />
      }
    ]
    
    if (customItems) {
      items.push(...customItems.map(item => ({
        ...item,
        icon: undefined // Les items personnalisés n'ont pas d'icône par défaut
      })))
    }
    
    return items
  }, [lang, t, customItems])
}
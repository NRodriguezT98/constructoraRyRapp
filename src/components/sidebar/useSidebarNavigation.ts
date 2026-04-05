'use client'

import { useMemo } from 'react'

import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import {
  navigationGroups,
  type NavigationItem,
  type NavigationSubItem,
} from '@/shared/config/navigation.config'

export interface ProcessedNavItem {
  item: NavigationItem
  isModuleActive: boolean
  visibleChildren: NavigationSubItem[]
}

export interface ProcessedNavGroup {
  title: string
  items: ProcessedNavItem[]
}

interface UseSidebarNavigationParams {
  pathname: string
  searchQuery: string
  getMostSpecificMatch: (items: { href: string }[]) => string | null
}

/**
 * Centraliza toda la lógica de filtrado y cálculo de estado activo
 * para los grupos de navegación del sidebar.
 */
export function useSidebarNavigation({
  pathname,
  searchQuery,
  getMostSpecificMatch,
}: UseSidebarNavigationParams): ProcessedNavGroup[] {
  const { puede, esAdmin } = usePermisosQuery()

  return useMemo(() => {
    return navigationGroups
      .map(group => {
        const visibleItems = group.items.filter(
          item =>
            (!searchQuery ||
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              (item.children?.some(
                child =>
                  child.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  child.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
              ) ??
                false)) &&
            (!item.adminOnly || esAdmin) &&
            (item.requiredPermission
              ? puede(
                  item.requiredPermission.modulo,
                  item.requiredPermission.accion
                )
              : true)
        )

        const mostSpecificHref = getMostSpecificMatch(visibleItems)

        const processedItems: ProcessedNavItem[] = visibleItems.map(item => {
          const hasChildren = item.children && item.children.length > 0

          const isModuleActive = hasChildren
            ? pathname === item.href || pathname.startsWith(item.href + '/')
            : item.href === mostSpecificHref

          const visibleChildren: NavigationSubItem[] = hasChildren
            ? (item.children ?? []).filter(child =>
                child.requiredPermission
                  ? puede(
                      child.requiredPermission.modulo,
                      child.requiredPermission.accion
                    )
                  : true
              )
            : []

          return { item, isModuleActive, visibleChildren }
        })

        return { title: group.title, items: processedItems }
      })
      .filter(group => group.items.length > 0)
  }, [pathname, searchQuery, getMostSpecificMatch, puede, esAdmin])
}

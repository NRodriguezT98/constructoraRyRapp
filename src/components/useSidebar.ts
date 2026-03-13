import { useCallback, useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import { useMediaQuery } from '@/shared/hooks'

interface UseSidebarReturn {
  isExpanded: boolean
  isMobile: boolean
  searchQuery: string
  pathname: string
  setSearchQuery: (query: string) => void
  toggleSidebar: () => void
  closeSidebar: () => void
  isActive: (href: string) => boolean
  getMostSpecificMatch: (items: { href: string }[]) => string | null  // ✅ Nueva función
}

/**
 * Hook personalizado para manejar la lógica del Sidebar
 * Separa la lógica de negocio del componente de presentación
 */
export function useSidebar(): UseSidebarReturn {
  // Estados
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Hooks externos
  const pathname = usePathname()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Efecto: Colapsar sidebar en móvil
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false)
    } else {
      setIsExpanded(true)
    }
  }, [isMobile])

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  // Cerrar sidebar (para móvil)
  const closeSidebar = useCallback(() => {
    setIsExpanded(false)
  }, [])

  // Verificar si una ruta está activa
  const isActive = useCallback(
    (href: string) => {
      // Caso especial: Home debe ser match exacto
      if (href === '/') {
        return pathname === '/'
      }

      // Match exacto
      if (pathname === href) {
        return true
      }

      // Para subrutas: pathname debe empezar con href + '/'
      return pathname.startsWith(href + '/')
    },
    [pathname]
  )

  /**
   * Obtiene la ruta MÁS ESPECÍFICA que coincide con pathname
   *
   * Algoritmo:
   * 1. Filtra rutas que coinciden (exactas o subrutas)
   * 2. Cuenta segmentos de path por ruta
   * 3. Retorna ruta con más segmentos
   *
   * Ejemplo:
   * - pathname: "/admin/procesos/xxx/editar"
   * - candidates: ["/admin", "/admin/procesos"]
   * - result: "/admin/procesos" (2 segmentos > 1 segmento)
   *
   * @param items - Lista de items de navegación con propiedad href
   * @returns href de la ruta más específica, o null si no hay matches
   */
  const getMostSpecificMatch = useCallback(
    (items: { href: string }[]) => {
      // Filtrar solo las rutas que coinciden (exactas o subrutas)
      const matches = items.filter(item => {
        if (item.href === '/') {
          return pathname === '/'
        }
        return pathname === item.href || pathname.startsWith(item.href + '/')
      })

      // Si no hay matches, retornar null
      if (matches.length === 0) return null

      // Retornar la ruta con MÁS segmentos (la más específica)
      const mostSpecific = matches.reduce((prev, current) => {
        const prevSegments = prev.href.split('/').filter(Boolean).length
        const currentSegments = current.href.split('/').filter(Boolean).length
        return currentSegments > prevSegments ? current : prev
      })

      return mostSpecific.href
    },
    [pathname]
  )

  return {
    isExpanded,
    isMobile,
    searchQuery,
    pathname,
    setSearchQuery,
    toggleSidebar,
    closeSidebar,
    isActive,
    getMostSpecificMatch,
  }
}

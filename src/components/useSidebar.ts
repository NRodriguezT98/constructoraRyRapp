import { useMediaQuery } from '@/shared/hooks'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface UseSidebarReturn {
  isExpanded: boolean
  isMobile: boolean
  searchQuery: string
  pathname: string
  setSearchQuery: (query: string) => void
  toggleSidebar: () => void
  closeSidebar: () => void
  isActive: (href: string) => boolean
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
      if (href === '/') {
        return pathname === '/'
      }
      return pathname.startsWith(href)
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
  }
}

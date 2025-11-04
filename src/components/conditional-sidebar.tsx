'use client'

import { usePathname } from 'next/navigation'
import { SidebarCompact as Sidebar } from './sidebar-compact'

/**
 * Componente que renderiza el Sidebar condicionalmente
 * Solo se muestra si NO estamos en rutas públicas como /login
 */
export function ConditionalSidebar() {
  const pathname = usePathname()

  // Rutas donde NO debe aparecer el sidebar
  const publicRoutes = ['/login', '/registro', '/reset-password']

  // Verificar si estamos en una ruta pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // No renderizar sidebar en rutas públicas
  if (isPublicRoute) {
    return null
  }

  return <div suppressHydrationWarning><Sidebar /></div>
}

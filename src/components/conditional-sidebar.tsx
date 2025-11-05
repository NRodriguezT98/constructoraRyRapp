'use client'

import { usePathname } from 'next/navigation'
import { SidebarFloatingGlass as Sidebar } from './sidebar-floating-glass'

/**
 * Componente que renderiza el Sidebar condicionalmente
 * Solo se muestra si NO estamos en rutas públicas como /login
 *
 * Usando: SidebarFloatingGlass (Diseño premium con glassmorphism)
 * Características:
 * - Efecto flotante con padding
 * - Glassmorphism completo
 * - Corona 👑 para administradores
 * - Animaciones fluidas
 * - Items más espaciados y respirables
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

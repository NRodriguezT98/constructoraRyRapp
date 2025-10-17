'use client'

import { usePathname } from 'next/navigation'

/**
 * Componente que renderiza el contenedor principal condicionalmente
 * Aplica estilos diferentes para rutas públicas vs rutas autenticadas
 */
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Rutas públicas (sin sidebar, sin fondo gris)
  const publicRoutes = ['/login', '/registro', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    // Layout para rutas públicas (login, etc)
    return <>{children}</>
  }

  // Layout para rutas autenticadas (con sidebar)
  return (
    <main className='flex-1 overflow-auto custom-scrollbar'>
      {children}
    </main>
  )
}

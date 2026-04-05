'use client'

import { usePathname } from 'next/navigation'

import { isPublicUIRoute } from '@/shared/config/public-routes'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isPublicUIRoute(pathname)) {
    // Layout para rutas públicas (login, etc) - CENTRADO
    return (
      <div
        className='flex flex-1 items-center justify-center'
        suppressHydrationWarning
      >
        {children}
      </div>
    )
  }

  // Layout para rutas autenticadas (con sidebar)
  return (
    <main
      className='custom-scrollbar flex-1 overflow-auto'
      suppressHydrationWarning
    >
      {children}
    </main>
  )
}

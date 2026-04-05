'use client'

import { usePathname } from 'next/navigation'

import { isPublicUIRoute } from '@/shared/config/public-routes'

import { SidebarFloatingGlass as Sidebar } from './sidebar-floating-glass'

export function ConditionalSidebar() {
  const pathname = usePathname()

  if (isPublicUIRoute(pathname)) {
    return null
  }

  return (
    <div suppressHydrationWarning>
      <Sidebar />
    </div>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from 'next-themes'

import { useAuth } from '@/contexts/auth-context'
import { useLogout } from '@/hooks/auth'
import { navigationGroups } from '@/shared/config/navigation.config'

/**
 * ViewModel del Sidebar
 * Centraliza toda la lógica de negocio no-navegacional:
 * - Información de usuario (iniciales, nombre, colores de rol)
 * - Logo según tema y estado expandido
 * - Estado de submenús abiertos + auto-expand por ruta
 * - Logout
 */
export function useSidebarViewModel(pathname: string) {
  const { user, perfil } = useAuth()
  const { logout, isLoggingOut } = useLogout({
    showToast: true,
    redirectTo: '/login',
  })
  const { theme, systemTheme } = useTheme()

  // ── Hydration ─────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // ── Usuario ───────────────────────────────────────────────────────
  const initials = useMemo(() => {
    if (perfil?.nombres && perfil?.apellidos) {
      return `${perfil.nombres.charAt(0)}${perfil.apellidos.charAt(0)}`.toUpperCase()
    }
    if (perfil?.nombres) return perfil.nombres.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }, [perfil?.nombres, perfil?.apellidos, user?.email])

  const displayName = useMemo(() => {
    if (perfil?.nombres && perfil?.apellidos)
      return `${perfil.nombres} ${perfil.apellidos}`
    if (perfil?.nombres) return perfil.nombres
    if (user?.email) return user.email.split('@')[0].replace(/[._-]/g, ' ')
    return 'Usuario'
  }, [perfil?.nombres, perfil?.apellidos, user?.email])

  const isAdmin = perfil?.rol === 'Administrador'

  const rolGradient = useMemo(() => {
    switch (perfil?.rol) {
      case 'Administrador':
        return 'from-amber-500 via-yellow-500 to-orange-500'
      case 'Gerencia':
        return 'from-blue-500 to-indigo-500'
      case 'Contabilidad':
        return 'from-emerald-500 to-teal-500'
      case 'Administrador de Obra':
        return 'from-purple-500 to-pink-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }, [perfil?.rol])

  const rolBadgeColor = useMemo(() => {
    switch (perfil?.rol) {
      case 'Administrador':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50'
      case 'Gerencia':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Contabilidad':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'Administrador de Obra':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }, [perfil?.rol])

  // ── Logo ──────────────────────────────────────────────────────────
  const getLogoSrc = useCallback(
    (expanded: boolean): string => {
      if (!mounted) return expanded ? '/images/logo1.png' : '/images/logo2.png'
      const currentTheme = theme === 'system' ? systemTheme : theme
      if (expanded) {
        return currentTheme === 'dark'
          ? '/images/logo1-dark.png'
          : '/images/logo1.png'
      }
      return currentTheme === 'dark'
        ? '/images/logo2-dark.png'
        : '/images/logo2.png'
    },
    [mounted, theme, systemTheme]
  )

  // ── Submenús ──────────────────────────────────────────────────────
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set())

  // Auto-expandir submenú cuando la ruta coincide con un child
  useEffect(() => {
    const toOpen = new Set<string>()
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (
          item.children &&
          item.children.some(
            child =>
              pathname === child.href || pathname.startsWith(child.href + '/')
          )
        ) {
          toOpen.add(item.href)
        }
      }
    }
    // Reemplazar (no acumular): al cambiar de ruta, solo mantener
    // el submenú que corresponde a la ruta activa. El usuario puede
    // abrir otros manualmente con toggleSubmenu.
    setOpenSubmenus(toOpen)
  }, [pathname])

  const toggleSubmenu = useCallback((href: string) => {
    setOpenSubmenus(prev => {
      const next = new Set(prev)
      if (next.has(href)) {
        next.delete(href)
      } else {
        next.add(href)
      }
      return next
    })
  }, [])

  return {
    user,
    perfil,
    initials,
    displayName,
    isAdmin,
    rolGradient,
    rolBadgeColor,
    getLogoSrc,
    openSubmenus,
    toggleSubmenu,
    logout,
    isLoggingOut,
  }
}

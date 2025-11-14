/**
 * ============================================
 * HOOK: useInvalidRoleError
 * ============================================
 *
 * Lógica de negocio para la pantalla de error de rol inválido.
 * Separa la lógica de la UI presentacional.
 */

'use client'

import { useAuth } from '@/contexts/auth-context'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useInvalidRoleError() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  // Determinar tema actual (dark/light)
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Logos según tema
  const logoHorizontal = isDark ? '/images/logo1-dark.png' : '/images/logo1.png'
  const logoCircular = isDark ? '/images/logo2-dark.png' : '/images/logo2.png'

  return {
    mounted,
    handleSignOut,
    handleRefresh,
    logoHorizontal,
    logoCircular,
  }
}

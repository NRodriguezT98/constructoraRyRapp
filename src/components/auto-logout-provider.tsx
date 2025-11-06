/**
 * ============================================
 * AUTO-LOGOUT PROVIDER
 * ============================================
 *
 * Componente que activa el sistema de auto-logout por inactividad.
 * Debe montarse en el layout principal dentro de AuthProvider.
 */

'use client'

import { useAutoLogout } from '@/hooks/useAutoLogout'

export function AutoLogoutProvider() {
  // ✅ CONFIGURACIÓN DE PRODUCCIÓN - 1 hora de inactividad
  useAutoLogout({
    timeoutMinutes: 60,      // 1 hora (60 minutos) de inactividad
    warningMinutes: 10,      // Advertencia 10 minutos antes (a los 50 min)
    enabled: true,           // Sistema activado
  })

  // Este componente no renderiza nada
  return null
}

/**
 * ============================================
 * PÁGINA: Dashboard / Home
 * ============================================
 *
 * ✅ Server Component con autenticación
 * - Middleware valida sesión antes de renderizar
 * - Calcula permisos en el servidor
 * - Pasa permisos como props al componente cliente
 */

import { getServerPermissions } from '@/lib/auth/server'

import { DebugLogsButton } from '@/components/debug/DebugLogsButton'
import DashboardContent from './dashboard-content'

export default async function HomePage() {
  console.log('🏠 [DASHBOARD PAGE] Renderizando página de Dashboard...')

  // Obtener permisos del usuario autenticado
  const permisos = await getServerPermissions()

  console.log('🏠 [DASHBOARD PAGE] Permisos obtenidos:', {
    canView: permisos.canView,
    isAdmin: permisos.isAdmin,
  })

  // Pasar permisos al componente cliente
  return (
    <>
      <DashboardContent {...permisos} />
      <DebugLogsButton />
    </>
  )
}

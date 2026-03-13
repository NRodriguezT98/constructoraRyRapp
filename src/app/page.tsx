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


import DashboardContent from './dashboard-content'

export default async function HomePage() {
  // Obtener permisos del usuario autenticado
  const permisos = await getServerPermissions()

  // Pasar permisos al componente cliente
  return (
    <>
      <DashboardContent {...permisos} />

    </>
  )
}

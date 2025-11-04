/**
 * ============================================
 * PÁGINA: Auditorías
 * ============================================
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Middleware ya validó autenticación
 * - Middleware ya validó permisos (solo Administrador)
 * - No necesita <RequireView> wrapper
 */

import { getServerPermissions } from '@/lib/auth/server'
import { AuditoriasView } from '@/modules/auditorias'

export default async function AuditoriasPage() {
  console.log('📊 [AUDITORIAS PAGE] Server Component renderizando')

  // ✅ Obtener permisos desde el servidor
  const permisos = await getServerPermissions()

  console.log('📊 [AUDITORIAS PAGE] Permisos recibidos:', permisos)

  // ✅ Pasar permisos como props
  return <AuditoriasView {...permisos} />
}

/**
 * ============================================
 * PÁGINA: Panel de Administración (Server Component)
 * ============================================
 *
 * Server Component que obtiene permisos y renderiza el contenido
 */

import { getServerPermissions } from '@/lib/auth/server'

import AdminContent from './admin-content'

export default async function AdminPage() {
  console.log('⚙️ [ADMIN PAGE] Server Component renderizando')

  // Obtener permisos del usuario autenticado
  const permisos = await getServerPermissions()

  console.log('⚙️ [ADMIN PAGE] Permisos recibidos:', permisos)

  // Renderizar contenido con permisos
  return <AdminContent {...permisos} />
}

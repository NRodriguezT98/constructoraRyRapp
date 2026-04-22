/**
 * ============================================
 * PÁGINA: Panel de Administración (Server Component)
 * ============================================
 *
 * Server Component que obtiene permisos y renderiza el contenido
 */

import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'

import AdminContent from './admin-content'

export default async function AdminPage() {
  const permisos = await getServerPermissions('administracion')

  // Solo administradores pueden acceder al panel de administración
  if (!permisos.isAdmin) {
    forbidden()
  }

  return <AdminContent {...permisos} />
}

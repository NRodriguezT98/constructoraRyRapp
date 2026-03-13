/**
 * ============================================
 * PÁGINA: Seed de Tipos de Fuentes de Pago
 * ============================================
 */

import { getServerPermissions } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

import TiposFuentesPagoContent from './tipos-fuentes-pago-content'

export default async function TiposFuentesPagoPage() {
  // Obtener permisos del usuario autenticado
  const permisos = await getServerPermissions()

  // Solo admins pueden acceder
  if (!permisos.canView || !permisos.isAdmin) {
    redirect('/admin')
  }

  return <TiposFuentesPagoContent />
}

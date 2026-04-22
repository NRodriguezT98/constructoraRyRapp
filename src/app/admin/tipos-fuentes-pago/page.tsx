/**
 * ============================================
 * PÁGINA: Seed de Tipos de Fuentes de Pago
 * ============================================
 */

import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'

import TiposFuentesPagoContent from './tipos-fuentes-pago-content'

export default async function TiposFuentesPagoPage() {
  const permisos = await getServerPermissions('administracion')

  if (!permisos.isAdmin) {
    forbidden()
  }

  return <TiposFuentesPagoContent />
}

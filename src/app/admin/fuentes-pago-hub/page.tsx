import { redirect } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'

import { FuentesPagoHubContent } from './fuentes-pago-hub-content'

export const metadata = {
  title: 'Fuentes de Pago - Administración | RyR Constructora',
  description:
    'Hub central para gestión de fuentes de pago, requisitos y configuración',
}

export default async function FuentesPagoHubPage() {
  // Obtener permisos del usuario autenticado
  const permisos = await getServerPermissions()

  // Solo admins pueden acceder
  if (!permisos.canView || !permisos.isAdmin) {
    redirect('/dashboard')
  }

  return <FuentesPagoHubContent />
}

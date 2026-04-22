import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { AbonosPageMain } from '@/modules/abonos'

/**
 * 🎯 RUTA: /abonos/registrar
 *
 * Vista de selección de cliente para registrar un nuevo abono
 * Lista todos los clientes activos (con negociación abierta)
 */
export default async function RegistrarAbonoPage() {
  const { canCreate, isAdmin } = await getServerPermissions('abonos')

  if (!canCreate && !isAdmin) {
    forbidden()
  }

  return <AbonosPageMain />
}

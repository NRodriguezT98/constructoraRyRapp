import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'
import { NuevoUsuarioView } from '@/modules/usuarios/components/NuevoUsuarioView'

export default async function NuevoUsuarioPage() {
  const { canCreate, isAdmin } = await getServerPermissions('usuarios')

  if (!canCreate && !isAdmin) {
    forbidden()
  }

  return <NuevoUsuarioView />
}

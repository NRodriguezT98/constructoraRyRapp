import { getServerPermissions } from '@/lib/auth/server'
import { UsuariosPageMain } from '@/modules/usuarios/components/UsuariosPageMain'

export default async function UsuariosPage() {
  const { canCreate, canEdit, isAdmin } = await getServerPermissions('usuarios')
  return (
    <UsuariosPageMain
      canCreate={canCreate}
      canEdit={canEdit}
      isAdmin={isAdmin}
    />
  )
}

import { getServerPermissions } from '@/lib/auth/server'

import UsuariosContent from './usuarios-content'

export default async function UsuariosPage() {
  const permisos = await getServerPermissions()
  return <UsuariosContent {...permisos} />
}

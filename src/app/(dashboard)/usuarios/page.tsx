import { getServerPermissions } from '@/lib/auth/server'

import UsuariosContent from './usuarios-content'

export default async function UsuariosPage() {
  console.log('👥 [USUARIOS PAGE] Server Component renderizando')
  const permisos = await getServerPermissions()
  console.log('👥 [USUARIOS PAGE] Permisos recibidos:', permisos)
  return <UsuariosContent {...permisos} />
}

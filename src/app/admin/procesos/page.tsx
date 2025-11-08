/**
 * 📄 PÁGINA: LISTA DE PLANTILLAS DE PROCESO (Server Component)
 *
 * Ruta: /admin/procesos
 */

import { getServerPermissions } from '@/lib/auth/server'

import ProcesosContent from './procesos-content'

export const metadata = {
  title: 'Gestión de Procesos | RyR Constructora',
  description: 'Administra las plantillas de proceso de negociación'
}

export default async function ProcesosPage() {
  console.log('🔄 [PROCESOS PAGE] Server Component renderizando')

  // Obtener permisos del usuario autenticado
  const permisos = await getServerPermissions()

  console.log('🔄 [PROCESOS PAGE] Permisos recibidos:', permisos)

  // Renderizar contenido con permisos
  return <ProcesosContent {...permisos} />
}

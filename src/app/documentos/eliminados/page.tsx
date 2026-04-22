/**
 * 🗑️ PÁGINA: Documentos Eliminados (Papelera) — Server Component
 *
 * Solo accesible para Administradores.
 * El guard de permisos se aplica en el servidor antes de renderizar cualquier contenido.
 */

import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'

import DocumentosEliminadosContent from './documentos-eliminados-content'

export default async function DocumentosEliminadosPage() {
  const { isAdmin } = await getServerPermissions('administracion')

  if (!isAdmin) {
    forbidden()
  }

  return <DocumentosEliminadosContent />
}

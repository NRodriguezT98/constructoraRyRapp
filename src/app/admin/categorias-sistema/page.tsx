/**
 * ============================================
 * PÁGINA: Categorías de Sistema
 * ============================================
 */

import { forbidden } from 'next/navigation'

import { getServerPermissions } from '@/lib/auth/server'

import CategoriasSistemaContent from './categorias-sistema-content'

export default async function CategoriasSistemaPage() {
  const permisos = await getServerPermissions('administracion')

  if (!permisos.isAdmin) {
    forbidden()
  }

  return <CategoriasSistemaContent />
}

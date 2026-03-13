/**
 * ============================================
 * PÁGINA: Categorías de Sistema
 * ============================================
 */

import { getServerPermissions } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

import CategoriasSistemaContent from './categorias-sistema-content'

export default async function CategoriasSistemaPage() {
  // Obtener permisos del usuario autenticado
  const permisos = await getServerPermissions()

  // Solo admins pueden acceder
  if (!permisos.canView || !permisos.isAdmin) {
    redirect('/admin')
  }

  return <CategoriasSistemaContent />
}

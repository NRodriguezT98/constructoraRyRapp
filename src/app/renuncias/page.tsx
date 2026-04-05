/**
 * ============================================
 * PÁGINA: Renuncias
 * ============================================
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Middleware ya validó autenticación
 * - Middleware ya validó permisos (Administrador, Gerencia)
 * - No necesita <RequireView> wrapper
 *
 * ARQUITECTURA:
 * - Server Component pasa permisos como props
 * - Client Component maneja UI (usa Framer Motion)
 */

import { getServerPermissions } from '@/lib/auth/server'

import RenunciasContent from './components/renuncias-content'

export default async function RenunciasPage() {
  // ✅ Obtener permisos desde el servidor
  const permisos = await getServerPermissions()

  // ✅ Pasar permisos como props
  return <RenunciasContent {...permisos} />
}

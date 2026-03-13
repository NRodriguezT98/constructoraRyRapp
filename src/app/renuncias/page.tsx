/**
 * ============================================
 * PÁGINA: Renuncias
 * ============================================
 *
 * âœ… PROTEGIDA POR MIDDLEWARE
 * - Middleware ya validó autenticación
 * - Middleware ya validó permisos (Administrador, Gerente)
 * - No necesita <RequireView> wrapper
 *
 * ARQUITECTURA:
 * - Server Component pasa permisos como props
 * - Client Component maneja UI (usa Framer Motion)
 */

import { getServerPermissions } from '@/lib/auth/server'

import RenunciasContent from './components/renuncias-content'

export default async function RenunciasPage() {

  // âœ… Obtener permisos desde el servidor
  const permisos = await getServerPermissions()


  // âœ… Pasar permisos como props
  return <RenunciasContent {...permisos} />
}

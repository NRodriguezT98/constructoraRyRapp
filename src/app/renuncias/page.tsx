/**
 * ============================================
 * PÁGINA: Renuncias
 * ============================================
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
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
  console.log('📋 [RENUNCIAS PAGE] Server Component renderizando')

  // ✅ Obtener permisos desde el servidor
  const permisos = await getServerPermissions()

  console.log('📋 [RENUNCIAS PAGE] Permisos recibidos:', permisos)

  // ✅ Pasar permisos como props
  return <RenunciasContent {...permisos} />
}

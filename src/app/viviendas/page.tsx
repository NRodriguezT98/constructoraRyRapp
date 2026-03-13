/**
 * ============================================
 * PÁGINA: Viviendas
 * ============================================
 *
 * âœ… PROTEGIDA POR MIDDLEWARE
 * - Middleware ya validó autenticación
 * - Middleware ya validó permisos (Administrador, Gerente, Vendedor)
 * - No necesita <RequireView> wrapper
 *
 * ARQUITECTURA:
 * - Server Component (sin 'use client')
 * - Obtiene permisos del servidor
 * - Pasa permisos como props al Client Component
 */

import { getServerPermissions } from '@/lib/auth/server'
import { ViviendasPageMain } from '@/modules/viviendas/components/viviendas-page-main'

export default async function ViviendasPage() {

  // âœ… Obtener permisos desde el servidor
  // No hay query a DB aquí - usa React cache del servicio auth
  const permisos = await getServerPermissions()


  // âœ… Pasar permisos como props
  // El Client Component solo maneja UI
  return <ViviendasPageMain {...permisos} />
}

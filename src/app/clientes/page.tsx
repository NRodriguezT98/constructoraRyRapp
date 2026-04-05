/**
 * ============================================
 * PÁGINA: Clientes
 * ============================================
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Middleware ya validó autenticación
 * - Middleware ya validó permisos (Administrador, Contabilidad, Gerencia, Administrador de Obra)
 * - No necesita <RequireView> wrapper
 *
 * ARQUITECTURA:
 * - Server Component (sin 'use client')
 * - Obtiene permisos del servidor
 * - Pasa permisos como props al Client Component
 */

import { getServerPermissions } from '@/lib/auth/server'
import { ClientesPageMain } from '@/modules/clientes/components'

export default async function ClientesPage() {
  // ✅ Obtener permisos desde el servidor
  // No hay query a DB aquí - usa React cache del servicio auth
  const permisos = await getServerPermissions()

  // ✅ Pasar permisos como props
  // El Client Component solo maneja UI
  return <ClientesPageMain {...permisos} />
}

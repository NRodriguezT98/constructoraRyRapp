/**
 * ============================================
 * PÁGINA: Abonos
 * ============================================
 *
 * âœ… PROTEGIDA POR MIDDLEWARE
 * - Middleware ya validó autenticación
 * - Middleware ya validó permisos (Administrador, Gerente)
 * - No necesita <RequireView> wrapper
 *
 * ARQUITECTURA:
 * - Server Component (sin 'use client')
 * - Obtiene permisos del servidor
 * - Pasa permisos como props al Client Component
 *
 * ðŸŽ¯ RUTA: /abonos
 * Vista principal del módulo de abonos
 * Lista TODOS los abonos del sistema con filtros y búsqueda
 */

import { getServerPermissions } from '@/lib/auth/server'

import { AbonosListPage } from './components/abonos-list-page-new'

export default async function AbonosPage() {

  // âœ… Obtener permisos desde el servidor
  // No hay query a DB aquí - usa React cache del servicio auth
  const permisos = await getServerPermissions()


  // âœ… Pasar permisos como props
  // El Client Component solo maneja UI
  return <AbonosListPage {...permisos} />
}

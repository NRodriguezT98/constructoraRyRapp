/**
 * ============================================
 * PÁGINA: Abonos
 * ============================================
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Middleware ya validó autenticación
 * - Middleware ya validó permisos (Administrador, Gerente)
 * - No necesita <RequireView> wrapper
 *
 * ARQUITECTURA:
 * - Server Component (sin 'use client')
 * - Obtiene permisos del servidor
 * - Pasa permisos como props al Client Component
 *
 * 🎯 RUTA: /abonos
 * Vista principal del módulo de abonos
 * Lista TODOS los abonos del sistema con filtros y búsqueda
 */

import { getServerPermissions } from '@/lib/auth/server'

import { AbonosListPage } from './components/abonos-list-page'

export default async function AbonosPage() {
  console.log('💰 [ABONOS PAGE] Server Component renderizando')

  // ✅ Obtener permisos desde el servidor
  // No hay query a DB aquí - usa React cache del servicio auth
  const permisos = await getServerPermissions()

  console.log('💰 [ABONOS PAGE] Permisos recibidos:', permisos)

  // ✅ Pasar permisos como props
  // El Client Component solo maneja UI
  return <AbonosListPage {...permisos} />
}

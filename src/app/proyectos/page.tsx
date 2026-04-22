/**
 * ============================================
 * PÁGINA: Proyectos
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

import { ProyectosPage } from '../../modules/proyectos/components/proyectos-page-main'

export default async function Proyectos() {
  // ✅ Obtener permisos desde el servidor
  // No hay query a DB aquí - usa React cache del servicio auth
  const permisos = await getServerPermissions('proyectos')

  // ✅ Pasar permisos como props
  // El Client Component solo maneja UI
  return <ProyectosPage {...permisos} />
}

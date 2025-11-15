/**
 * ============================================
 * API ROUTE: Invalidar Sesiones por Cambio de Permisos
 * ============================================
 *
 * POST /api/auth/invalidar-sesiones
 *
 * Fuerza cierre de sesión de usuarios cuando cambian los permisos de su rol.
 * Esto asegura que vean los permisos actualizados en su próximo login.
 *
 * REQUIERE: SERVICE_ROLE_KEY (server-side only)
 */

import { NextResponse } from 'next/server'

import { invalidarSesionPorCambioPermisos } from '@/modules/usuarios/services/permisos-jwt.service'
import type { Rol } from '@/modules/usuarios/types'

export async function POST(request: Request) {
  try {
    const { rol } = await request.json()

    if (!rol) {
      return NextResponse.json(
        { error: 'Falta parámetro: rol es requerido' },
        { status: 400 }
      )
    }

    // Invalidar sesiones de usuarios con ese rol
    await invalidarSesionPorCambioPermisos(rol as Rol)

    return NextResponse.json({
      success: true,
      message: `Sesiones invalidadas para rol: ${rol}`,
    })
  } catch (error) {
    console.error('❌ [API] Error invalidando sesiones:', error)

    return NextResponse.json(
      {
        error: 'Error invalidando sesiones',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

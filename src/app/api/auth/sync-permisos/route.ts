/**
 * ============================================
 * API ROUTE: Sincronizar Permisos al JWT
 * ============================================
 *
 * POST /api/auth/sync-permisos
 *
 * Sincroniza permisos del usuario al JWT metadata.
 * Se ejecuta después del login exitoso.
 *
 * REQUIERE: SERVICE_ROLE_KEY (server-side only)
 */

import { NextResponse } from 'next/server'

import { sincronizarPermisosAlJWT } from '@/modules/usuarios/services/permisos-jwt.service'
import type { Rol } from '@/modules/usuarios/types'

export async function POST(request: Request) {
  try {
    const { userId, rol } = await request.json()

    if (!userId || !rol) {
      return NextResponse.json(
        { error: 'Faltan parámetros: userId y rol son requeridos' },
        { status: 400 }
      )
    }

    // Sincronizar permisos al JWT
    await sincronizarPermisosAlJWT(userId, rol as Rol)

    return NextResponse.json({
      success: true,
      message: 'Permisos sincronizados exitosamente',
    })
  } catch (error) {
    console.error('❌ [API] Error sincronizando permisos:', error)

    return NextResponse.json(
      {
        error: 'Error sincronizando permisos',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

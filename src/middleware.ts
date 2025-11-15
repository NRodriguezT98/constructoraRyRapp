import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createMiddlewareClient } from '@/lib/supabase/middleware'

/**
 * ============================================
 * MIDDLEWARE: Autenticación y Autorización
 * ============================================
 *
 * Intercepta TODAS las requests ANTES de llegar a las páginas.
 * Valida autenticación y permisos en el SERVIDOR.
 *
 * ARQUITECTURA:
 * 1. Rutas públicas → Pasan sin validación
 * 2. Assets estáticos → Pasan sin validación
 * 3. Verificar sesión → Si no hay, redirect a /login
 * 4. Verificar permisos → Si no tiene acceso, redirect a /dashboard
 * 5. Agregar headers con info de usuario → Para Server Components
 */

// ============================================
// CONFIGURACIÓN DE RUTAS
// ============================================

/** Rutas públicas que NO requieren autenticación */
const PUBLIC_ROUTES = ['/login', '/reset-password', '/update-password']

/**
 * Mapeo de rutas a módulo+acción de permisos
 * El middleware consultará permisos_rol en tiempo real
 * Si una ruta no está aquí, es accesible por todos los autenticados
 */
const ROUTE_TO_PERMISSION: Record<string, { modulo: string; accion: string }> = {
  // Módulos principales
  '/viviendas': { modulo: 'viviendas', accion: 'ver' },
  '/clientes': { modulo: 'clientes', accion: 'ver' },
  '/proyectos': { modulo: 'proyectos', accion: 'ver' },
  '/negociaciones': { modulo: 'negociaciones', accion: 'ver' },
  '/documentos': { modulo: 'documentos', accion: 'ver' },

  // Módulos restringidos
  '/abonos': { modulo: 'abonos', accion: 'ver' },
  '/renuncias': { modulo: 'renuncias', accion: 'ver' },
  '/auditorias': { modulo: 'auditorias', accion: 'ver' },

  // Administración
  '/admin': { modulo: 'administracion', accion: 'ver' },
  '/usuarios': { modulo: 'usuarios', accion: 'ver' },
  '/reportes': { modulo: 'reportes', accion: 'ver' },
}

// ============================================
// HELPERS
// ============================================

/** Verificar si una ruta es pública */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

/** Verificar si una ruta es un asset estático */
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.svg') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/) !== null
  )
}

/** Verificar si el usuario tiene acceso a una ruta basado en cache de permisos en JWT */
function canAccessRoute(
  pathname: string,
  userRole: string,
  permisosCache: string[]
): boolean {
  // Administrador siempre tiene acceso (bypass)
  if (userRole === 'Administrador') {
    return true
  }

  // Buscar permiso por coincidencia de prefijo
  for (const [route, permission] of Object.entries(ROUTE_TO_PERMISSION)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      // ✅ OPTIMIZACIÓN: Leer del cache del JWT (0ms, sin query)
      const permisoRequerido = `${permission.modulo}.${permission.accion}`

      // Wildcard para admin
      if (permisosCache.includes('*.*')) {
        return true
      }

      // Verificar permiso específico en cache
      const tienePermiso = permisosCache.includes(permisoRequerido)

      if (!tienePermiso) {
        console.log(`❌ [MIDDLEWARE] Permiso denegado: ${permisoRequerido}`, {
          rol: userRole,
          cache: permisosCache.slice(0, 5), // Primeros 5 para debug
        })
      }

      return tienePermiso
    }
  }

  // Si no está en el mapa, es accesible por todos autenticados
  return true
}

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ============================================
  // 1. ASSETS ESTÁTICOS → Permitir sin validación
  // ============================================

  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  // ============================================
  // 2. RUTAS PÚBLICAS → Permitir sin validación
  // ============================================

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // ============================================
  // 3. CREAR CLIENTE SUPABASE PARA MIDDLEWARE
  // ============================================

  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient(req, res)

    // ============================================
    // 4. VERIFICAR SESIÓN (SEGURO)
    // ============================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      // Sin sesión válida → Redirigir a login con URL de retorno
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'

      // Guardar ruta original para redirect después del login
      if (pathname !== '/') {
        redirectUrl.searchParams.set('redirect', pathname)
      }

      return NextResponse.redirect(redirectUrl)
    }

    // ============================================
    // 5. SI ESTÁ EN /login CON SESIÓN → Redirigir a dashboard
    // ============================================

    if (pathname === '/login') {
      const redirectUrl = req.nextUrl.clone()
      const from = req.nextUrl.searchParams.get('redirect')
      redirectUrl.pathname = from && from !== '/' ? from : '/'
      redirectUrl.searchParams.delete('redirect')
      return NextResponse.redirect(redirectUrl)
    }

    // ============================================
    // 6. OBTENER ROL Y PERMISOS DEL JWT (EDGE RUNTIME COMPATIBLE)
    // ============================================

    let rol = 'Vendedor'
    let nombres = ''
    let email = user.email || ''
    let permisosCache: string[] = [] // ✅ Cache de permisos desde JWT

    // Obtener sesión para acceder al JWT
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Decodificar JWT (compatible con Edge Runtime - sin Buffer)
    if (session?.access_token) {
      try {
        const parts = session.access_token.split('.')
        if (parts.length === 3) {
          // Decodificar base64 sin Buffer (Edge Runtime compatible)
          let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          // Agregar padding si es necesario
          while (base64.length % 4) {
            base64 += '='
          }

          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          const payload = JSON.parse(jsonPayload)

          // Leer claims custom del payload
          rol = payload.user_rol || 'Vendedor'
          nombres = payload.user_nombres || ''
          email = payload.user_email || user.email || ''

          // ✅ OPTIMIZACIÓN: Leer permisos del cache en user_metadata
          permisosCache = payload.user_metadata?.permisos_cache || []
        }
      } catch (error) {
        // Fallback a valores por defecto si falla decodificación
        console.error('❌ [MIDDLEWARE] Error decodificando JWT:', error)
      }
    }

    // ============================================
    // 7. VERIFICAR PERMISOS PARA LA RUTA (DESDE JWT CACHE - 0ms)
    // ============================================

    const hasAccess = canAccessRoute(pathname, rol, permisosCache)

    if (!hasAccess) {
      // Sin permiso → Redirigir a dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // ============================================
    // 8. AGREGAR HEADERS CON INFO DE USUARIO
    // ============================================
    // IMPORTANTE: Headers solo aceptan ASCII, encodear caracteres especiales

    res.headers.set('x-user-id', user.id)
    res.headers.set('x-user-rol', encodeURIComponent(rol))
    res.headers.set('x-user-email', encodeURIComponent(email))
    res.headers.set('x-user-nombres', encodeURIComponent(nombres))

    return res
  } catch (error) {
    // Si hay cualquier error, redirigir a login
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }
}

// ============================================
// CONFIGURACIÓN: QUÉ RUTAS INTERCEPTAR
// ============================================

export const config = {
  /*
   * Interceptar todas las rutas EXCEPTO:
   * - _next/static (archivos estáticos de Next.js)
   * - _next/image (optimización de imágenes)
   * - favicon.ico, robots.txt, etc.
   * - Archivos con extensiones de imagen/CSS/JS
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)).*)',
  ],
}

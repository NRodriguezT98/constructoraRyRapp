import { createMiddlewareClient } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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
const PUBLIC_ROUTES = [
  '/login',
  '/reset-password',
  '/update-password',
]

/**
 * Mapeo de rutas a roles permitidos
 * Si una ruta no está aquí, es accesible por todos los autenticados
 */
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Módulos principales
  '/viviendas': ['Administrador', 'Gerente', 'Vendedor'],
  '/clientes': ['Administrador', 'Gerente', 'Vendedor'],
  '/proyectos': ['Administrador', 'Gerente', 'Vendedor'],

  // Módulos restringidos
  '/abonos': ['Administrador', 'Gerente'],
  '/renuncias': ['Administrador', 'Gerente'],
  '/auditorias': ['Administrador'],

  // Administración
  '/admin': ['Administrador'],
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

/** Verificar si el usuario tiene acceso a una ruta */
function canAccessRoute(pathname: string, userRole: string): boolean {
  // Buscar permiso por coincidencia de prefijo
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return allowedRoles.includes(userRole)
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

  console.log('🔒 [MIDDLEWARE] Interceptando:', pathname)

  // ============================================
  // 1. ASSETS ESTÁTICOS → Permitir sin validación
  // ============================================

  if (isStaticAsset(pathname)) {
    console.log('  ↳ Asset estático, permitir sin validación')
    return NextResponse.next()
  }

  // ============================================
  // 2. RUTAS PÚBLICAS → Permitir sin validación
  // ============================================

  if (isPublicRoute(pathname)) {
    console.log('  ↳ Ruta pública, permitir sin validación')
    return NextResponse.next()
  }

  console.log('  ↳ Ruta protegida, validando autenticación...')  // ============================================
  // 3. CREAR CLIENTE SUPABASE PARA MIDDLEWARE
  // ============================================

  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)

  // ============================================
  // 4. VERIFICAR SESIÓN (SEGURO)
  // ============================================

  // ✅ SEGURO: getUser() valida el token con Supabase Auth
  // (en lugar de getSession() que solo lee cookies)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user || authError) {
    console.log('  ❌ Sin sesión válida, redirigir a /login')
    // Sin sesión válida → Redirigir a login con URL de retorno
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'

    // Guardar ruta original para redirect después del login
    if (pathname !== '/') {
      redirectUrl.searchParams.set('redirect', pathname)
    }

    return NextResponse.redirect(redirectUrl)
  }

  console.log('  ✅ Usuario autenticado:', user.email)

  // ============================================
  // 5. SI ESTÁ EN /login CON SESIÓN → Redirigir según parámetro o a dashboard
  // ============================================

  if (pathname === '/login') {
    const redirectUrl = req.nextUrl.clone()
    const from = req.nextUrl.searchParams.get('redirect')
    redirectUrl.pathname = from && from !== '/' ? from : '/'
    redirectUrl.searchParams.delete('redirect')

    return NextResponse.redirect(redirectUrl)
  }

  // ============================================
  // 6. OBTENER ROL DEL USUARIO DESDE JWT (OPTIMIZADO)
  // ============================================

  // ✅ OPTIMIZACIÓN: Leer desde JWT claims (0 queries DB)
  // Antes: 50 queries/min | Después: 0 queries/min
  const rol = (user as any).app_metadata?.user_rol || 'Vendedor'
  const nombres = (user as any).app_metadata?.user_nombres || ''
  const email = (user as any).app_metadata?.user_email || user.email || ''

  console.log('  ✅ Datos del usuario (desde JWT):', {
    rol,
    nombres,
    email: email || user.email
  })

  // ============================================
  // 7. VERIFICAR PERMISOS PARA LA RUTA
  // ============================================

  const hasAccess = canAccessRoute(pathname, rol)

  if (!hasAccess) {
    console.log('  ⛔ Sin permiso para esta ruta, redirigir a /dashboard')
    // Sin permiso → Redirigir a dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  console.log('  ✅ Acceso autorizado')
  console.log('  📝 Headers agregados: userId, rol, email, nombres')

  // ============================================
  // 8. AGREGAR HEADERS CON INFO DE USUARIO
  // ============================================
  // Estos headers están disponibles en Server Components
  // Evita tener que hacer queries adicionales

  res.headers.set('x-user-id', user.id)
  res.headers.set('x-user-rol', rol)
  res.headers.set('x-user-email', email)
  res.headers.set('x-user-nombres', nombres)

  // ============================================
  // 9. PERMITIR ACCESO
  // ============================================

  return res
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

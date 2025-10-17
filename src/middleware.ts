import { createMiddlewareClient } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Middleware de autenticación para Next.js 15 con Supabase SSR
 * Protege todas las rutas excepto las públicas (login, registro, etc)
 *
 * IMPORTANTE: Usa @supabase/ssr para manejar cookies correctamente
 */
export async function middleware(req: NextRequest) {
  // Rutas públicas (accesibles sin autenticación)
  const publicPaths = ['/login', '/reset-password']
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Rutas de assets (CSS, JS, imágenes, etc)
  const isAsset = req.nextUrl.pathname.startsWith('/_next') ||
                  req.nextUrl.pathname.startsWith('/images') ||
                  req.nextUrl.pathname.startsWith('/favicon.ico') ||
                  req.nextUrl.pathname.startsWith('/icon.svg')

  // Permitir acceso a assets sin verificación
  if (isAsset) {
    return NextResponse.next()
  }

  // Crear respuesta para manejar cookies
  const res = NextResponse.next()

  // Crear cliente de Supabase con manejo correcto de cookies
  const supabase = createMiddlewareClient(req, res)

  // Verificar sesión actual
  const { data: { session } } = await supabase.auth.getSession()

  // Si NO está autenticado y NO está en ruta pública → redirigir a login
  if (!session && !isPublicPath) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    // Guardar la ruta original para redirigir después del login
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si SÍ está autenticado y está intentando acceder a login → redirigir a dashboard
  if (session && isPublicPath) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  // Caso normal: permitir acceso con cookies actualizadas
  return res
}

/**
 * Configuración del matcher
 * Define qué rutas serán procesadas por el middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (optional, if you have API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}

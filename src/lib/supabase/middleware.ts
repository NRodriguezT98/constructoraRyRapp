import { createServerClient, type CookieOptions } from '@supabase/ssr'

import { NextRequest, NextResponse } from 'next/server'

import { supabaseAnonKey, supabaseUrl } from './env'

/**
 * Cliente de Supabase para Middleware de Next.js
 * Maneja cookies correctamente en el contexto del middleware
 */
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        })
        response.cookies.set({
          name,
          value: '',
          ...options,
        })
      },
    },
  })
}

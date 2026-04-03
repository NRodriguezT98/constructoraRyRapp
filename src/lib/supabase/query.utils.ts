/**
 * Supabase Query Utilities
 *
 * Thin helpers to eliminate the repetitive boilerplate in service functions:
 *
 *   const { data, error } = await supabase.from('tabla').select('*')
 *   if (error) throw error
 *   return data
 *
 * Replace with:
 *
 *   return throwOnError(await supabase.from('tabla').select('*'))
 *
 * Errors are rethrown as-is (PostgrestError) so callers / React Query
 * `onError` handlers can read `.message` normally.
 */

import type { PostgrestError } from '@supabase/supabase-js'

// ─── Types ───────────────────────────────────────────────────────────────────

type QueryResult<T> =
  | { data: T; error: null }
  | { data: null; error: PostgrestError }

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Throws if the Supabase query result has an error; otherwise returns `data`.
 *
 * Works for both single-row (`.single()`) and multi-row (`.select()`) queries.
 *
 * @example
 * // Single row
 * const vivienda = throwOnError(
 *   await supabase.from('viviendas').select('*').eq('id', id).single()
 * )
 *
 * @example
 * // Multiple rows
 * const clientes = throwOnError(
 *   await supabase.from('clientes').select('*').eq('proyecto_id', proyectoId)
 * )
 */
export function throwOnError<T>(result: QueryResult<T>): T {
  if (result.error) throw result.error
  return result.data
}

/**
 * Same as `throwOnError` but returns `null` instead of throwing when there is
 * no data (useful for optional lookups that should not crash).
 *
 * @example
 * const perfil = throwOnErrorOrNull(
 *   await supabase.from('perfiles').select('*').eq('user_id', id).maybeSingle()
 * )
 * // perfil is T | null — no throw if row doesn't exist
 */
export function throwOnErrorOrNull<T>(result: {
  data: T | null
  error: PostgrestError | null
}): T | null {
  if (result.error) throw result.error
  return result.data
}

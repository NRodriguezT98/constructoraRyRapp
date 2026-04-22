/**
 * ============================================
 * HOOK: usePermissions
 * ============================================
 *
 * Re-exporta usePermisosQuery con la misma API para
 * mantener compatibilidad con código existente.
 *
 * ⭐ Usar usePermisosQuery directamente en código nuevo.
 */

'use client'

import type { Rol } from '../types'

import {
  useCan as useCanQuery,
  useIsAdmin as useIsAdminQuery,
  usePermisosQuery,
  useRole as useRoleQuery,
} from './usePermisosQuery'

export function usePermissions() {
  return usePermisosQuery()
}

export function useCan() {
  return useCanQuery()
}

export function useIsAdmin(): boolean {
  return useIsAdminQuery()
}

export function useRole(): Rol | undefined {
  return useRoleQuery()
}

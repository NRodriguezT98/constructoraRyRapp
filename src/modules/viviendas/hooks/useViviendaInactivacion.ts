/**
 * 💤 Hook: Inactivación/Reactivación de Viviendas
 *
 * Responsabilidad:
 * - Validar si vivienda puede ser inactivada
 * - Marcar vivienda como inactiva (soft delete)
 * - Validar si vivienda puede ser reactivada
 * - Reactivar vivienda con motivo
 * - Manejar estados de loading/error
 *
 * Uso:
 * ```tsx
 * const { desactivar, reactivar, validando, procesando } = useViviendaInactivacion()
 *
 * // Desactivar
 * await desactivar(viviendaId, 'Motivo...')
 *
 * // Reactivar
 * await reactivar(viviendaId, 'Motivo...')
 * ```
 */

'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import {
    ViviendaInactivacionService,
    type ValidacionEliminacion,
    type ValidacionReactivacion,
} from '../services/viviendas-inactivacion.service'

// ============================================================
// TIPOS
// ============================================================

interface UseViviendaInactivacionReturn {
  // Estado
  validando: boolean
  procesando: boolean
  error: string | null

  // Acciones
  validarEliminacion: (viviendaId: string) => Promise<ValidacionEliminacion>
  desactivar: (viviendaId: string, motivo: string) => Promise<void>
  validarReactivacion: (viviendaId: string) => Promise<ValidacionReactivacion>
  reactivar: (viviendaId: string, motivo: string) => Promise<void>

  // Helpers
  limpiarError: () => void
}

// ============================================================
// HOOK
// ============================================================

export function useViviendaInactivacion(): UseViviendaInactivacionReturn {
  const { user, perfil } = useAuth()
  const router = useRouter()
  const [validando, setValidando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const esAdmin = perfil?.rol === 'Administrador'

  // Validar si vivienda puede ser eliminada
  const validarEliminacion = useCallback(
    async (viviendaId: string): Promise<ValidacionEliminacion> => {
      if (!esAdmin) {
        throw new Error('⛔ Solo los Administradores pueden inactivar viviendas')
      }

      try {
        setValidando(true)
        setError(null)

        const validacion = await ViviendaInactivacionService.validarEliminacion(viviendaId)
        return validacion
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al validar eliminación'
        setError(mensaje)
        throw err
      } finally {
        setValidando(false)
      }
    },
    [esAdmin]
  )

  // Desactivar vivienda (marcar como inactiva)
  const desactivar = useCallback(
    async (viviendaId: string, motivo: string): Promise<void> => {
      if (!esAdmin || !user?.id) {
        throw new Error('⛔ Solo los Administradores pueden inactivar viviendas')
      }

      try {
        setProcesando(true)
        setError(null)

        // Validar motivo mínimo
        if (!motivo || motivo.trim().length < 50) {
          throw new Error('El motivo debe tener al menos 50 caracteres')
        }

        await ViviendaInactivacionService.marcarComoInactiva(viviendaId, {
          motivo: motivo.trim(),
          userId: user.id,
        })

        // Refrescar página o redirigir
        router.refresh()
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al desactivar vivienda'
        setError(mensaje)
        throw err
      } finally {
        setProcesando(false)
      }
    },
    [esAdmin, user, router]
  )

  // Validar si vivienda puede ser reactivada
  const validarReactivacion = useCallback(
    async (viviendaId: string): Promise<ValidacionReactivacion> => {
      if (!esAdmin) {
        throw new Error('⛔ Solo los Administradores pueden reactivar viviendas')
      }

      try {
        setValidando(true)
        setError(null)

        const validacion = await ViviendaInactivacionService.validarReactivacion(viviendaId)
        return validacion
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al validar reactivación'
        setError(mensaje)
        throw err
      } finally {
        setValidando(false)
      }
    },
    [esAdmin]
  )

  // Reactivar vivienda
  const reactivar = useCallback(
    async (viviendaId: string, motivo: string): Promise<void> => {
      if (!esAdmin || !user?.id) {
        throw new Error('⛔ Solo los Administradores pueden reactivar viviendas')
      }

      try {
        setProcesando(true)
        setError(null)

        // Validar motivo mínimo
        if (!motivo || motivo.trim().length < 30) {
          throw new Error('El motivo debe tener al menos 30 caracteres')
        }

        await ViviendaInactivacionService.reactivarVivienda(viviendaId, {
          motivo: motivo.trim(),
          userId: user.id,
        })

        // Refrescar página o redirigir
        router.refresh()
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al reactivar vivienda'
        setError(mensaje)
        throw err
      } finally {
        setProcesando(false)
      }
    },
    [esAdmin, user, router]
  )

  // Limpiar error
  const limpiarError = useCallback(() => {
    setError(null)
  }, [])

  return {
    validando,
    procesando,
    error,
    validarEliminacion,
    desactivar,
    validarReactivacion,
    reactivar,
    limpiarError,
  }
}

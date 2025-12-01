/**
 * 🔄 Hook: Gestión de Conflictos de Viviendas
 *
 * Responsabilidad:
 * - Detectar viviendas inactivas con número duplicado
 * - Validar si vivienda inactiva puede ser reutilizada
 * - Sobrescribir vivienda inactiva con nuevos datos
 * - Validar unicidad de matrícula inmobiliaria
 *
 * Uso:
 * ```tsx
 * const { verificarConflicto, sobrescribir, validarMatricula } = useViviendaConflictos()
 *
 * // Al crear vivienda
 * const conflicto = await verificarConflicto(proyectoId, manzanaId, numero)
 * if (conflicto.existeInactiva && conflicto.puedeReutilizar) {
 *   // Mostrar modal de decisión
 * }
 * ```
 */

'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import {
    ViviendaConflictosService,
    type ConflictoViviendaInactiva,
    type NuevosDatosVivienda,
    type ValidacionMatricula,
} from '../services/viviendas-conflictos.service'

// ============================================================
// TIPOS
// ============================================================

interface UseViviendaConflictosReturn {
  // Estado
  verificando: boolean
  procesando: boolean
  error: string | null

  // Acciones
  verificarConflicto: (
    proyectoId: string,
    manzanaId: string,
    numero: string
  ) => Promise<ConflictoViviendaInactiva>
  sobrescribir: (
    viviendaId: string,
    nuevosDatos: NuevosDatosVivienda
  ) => Promise<void>
  validarMatricula: (
    matricula: string,
    viviendaId?: string
  ) => Promise<ValidacionMatricula>

  // Helpers
  limpiarError: () => void
}

// ============================================================
// HOOK
// ============================================================

export function useViviendaConflictos(): UseViviendaConflictosReturn {
  const { user } = useAuth()
  const router = useRouter()
  const [verificando, setVerificando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar conflicto de número duplicado
  const verificarConflicto = useCallback(
    async (
      proyectoId: string,
      manzanaId: string,
      numero: string
    ): Promise<ConflictoViviendaInactiva> => {
      try {
        setVerificando(true)
        setError(null)

        const conflicto = await ViviendaConflictosService.verificarConflictoCreacion(
          proyectoId,
          manzanaId,
          numero
        )

        return conflicto
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al verificar conflicto'
        setError(mensaje)
        throw err
      } finally {
        setVerificando(false)
      }
    },
    []
  )

  // Sobrescribir vivienda inactiva con nuevos datos
  const sobrescribir = useCallback(
    async (viviendaId: string, nuevosDatos: NuevosDatosVivienda): Promise<void> => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }

      try {
        setProcesando(true)
        setError(null)

        await ViviendaConflictosService.sobrescribirViviendaInactiva(
          viviendaId,
          nuevosDatos,
          user.id
        )

        // Redirigir a la vivienda editada
        router.push(`/viviendas/${viviendaId}`)
        router.refresh()
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al sobrescribir vivienda'
        setError(mensaje)
        throw err
      } finally {
        setProcesando(false)
      }
    },
    [user, router]
  )

  // Validar unicidad de matrícula
  const validarMatricula = useCallback(
    async (matricula: string, viviendaId?: string): Promise<ValidacionMatricula> => {
      try {
        setVerificando(true)
        setError(null)

        const validacion = await ViviendaConflictosService.validarMatriculaUnica(
          matricula,
          viviendaId
        )

        return validacion
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al validar matrícula'
        setError(mensaje)
        throw err
      } finally {
        setVerificando(false)
      }
    },
    []
  )

  // Limpiar error
  const limpiarError = useCallback(() => {
    setError(null)
  }, [])

  return {
    verificando,
    procesando,
    error,
    verificarConflicto,
    sobrescribir,
    validarMatricula,
    limpiarError,
  }
}

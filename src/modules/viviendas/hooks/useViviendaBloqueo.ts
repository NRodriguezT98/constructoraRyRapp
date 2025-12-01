/**
 * 🔐 Hook: Estado de Bloqueo de Vivienda
 *
 * Responsabilidad:
 * - Cargar estado de bloqueo de edición de una vivienda
 * - Determinar campos editables/restringidos/bloqueados
 * - Validar permisos por campo específico
 * - Refrescar estado cuando cambian negociaciones
 *
 * Uso:
 * ```tsx
 * const { estadoBloqueo, cargando, validarCampo } = useViviendaBloqueo(viviendaId)
 * ```
 */

'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useCallback, useEffect, useState } from 'react'
import {
    ViviendaValidacionService,
    type CampoVivienda,
    type EstadoBloqueoVivienda,
    type ValidacionCampo,
} from '../services/viviendas-validacion.service'

// ============================================================
// TIPOS
// ============================================================

interface UseViviendaBloqueoReturn {
  estadoBloqueo: EstadoBloqueoVivienda | null
  cargando: boolean
  error: string | null
  refetch: () => Promise<void>
  validarCampo: (campo: CampoVivienda) => Promise<ValidacionCampo>
  puedeEditarCampo: (campo: CampoVivienda) => boolean
}

// ============================================================
// HOOK
// ============================================================

export function useViviendaBloqueo(viviendaId: string | null): UseViviendaBloqueoReturn {
  const { user, perfil } = useAuth()
  const [estadoBloqueo, setEstadoBloqueo] = useState<EstadoBloqueoVivienda | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const esAdmin = perfil?.rol === 'Administrador'

  // Cargar estado de bloqueo
  const cargarEstadoBloqueo = useCallback(async () => {
    if (!viviendaId) {
      setCargando(false)
      return
    }

    try {
      setCargando(true)
      setError(null)

      const estado = await ViviendaValidacionService.verificarEstadoBloqueo(viviendaId)
      setEstadoBloqueo(estado)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar estado de bloqueo'
      setError(mensaje)
      console.error('❌ Error en useViviendaBloqueo:', err)
    } finally {
      setCargando(false)
    }
  }, [viviendaId])

  // Cargar al montar y cuando cambia viviendaId
  useEffect(() => {
    cargarEstadoBloqueo()
  }, [cargarEstadoBloqueo])

  // Validar campo específico
  const validarCampo = useCallback(
    async (campo: CampoVivienda): Promise<ValidacionCampo> => {
      if (!viviendaId) {
        return {
          puedeEditar: false,
          requiereAdmin: false,
          requiereMotivo: false,
          razon: 'ID de vivienda no válido',
        }
      }

      return ViviendaValidacionService.puedeEditarCampo(viviendaId, campo, esAdmin)
    },
    [viviendaId, esAdmin]
  )

  // Helper: Verificar si puede editar campo (sin async)
  const puedeEditarCampo = useCallback(
    (campo: CampoVivienda): boolean => {
      if (!estadoBloqueo) return false

      // Si está bloqueada completamente, solo campos editables permitidos
      if (estadoBloqueo.bloqueadaCompletamente) {
        return estadoBloqueo.camposEditables.includes(campo)
      }

      // Si el campo está bloqueado, no permitir
      if (estadoBloqueo.camposBloqueados.includes(campo)) {
        return false
      }

      // Si el campo está restringido, solo admin
      if (estadoBloqueo.camposRestringidos.includes(campo)) {
        return esAdmin
      }

      // Si está en editables, permitir
      return estadoBloqueo.camposEditables.includes(campo)
    },
    [estadoBloqueo, esAdmin]
  )

  return {
    estadoBloqueo,
    cargando,
    error,
    refetch: cargarEstadoBloqueo,
    validarCampo,
    puedeEditarCampo,
  }
}

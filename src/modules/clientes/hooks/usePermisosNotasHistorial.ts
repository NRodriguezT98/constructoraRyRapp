/**
 * Hook para calcular permisos de edición de notas de forma SINCRÓNICA
 * No requiere llamadas async - usa datos ya disponibles en eventos
 */

import { useMemo } from 'react'

import { useAuth } from '@/contexts/auth-context'

import type { EventoHistorialHumanizado } from '../types/historial.types'

/**
 * Calcula permisos de edición para notas de forma instantánea
 *
 * @param eventos - Eventos del historial (incluyen metadata.creadoPor)
 * @returns Set con los IDs de notas que el usuario puede editar
 *
 * Ventajas:
 * - ⚡ Cálculo sincrónico (0ms, sin delays)
 * - ✅ No requiere llamadas async a BD
 * - ✅ Botones aparecen instantáneamente
 */
export function usePermisosNotasHistorial(
  eventos: EventoHistorialHumanizado[]
) {
  const { user, perfil } = useAuth()

  const notasEditables = useMemo(() => {
    if (!user || !perfil) return new Set<string>()

    const esAdmin = perfil.rol === 'Administrador'
    const editables = new Set<string>()

    eventos.forEach(evento => {
      // Solo procesar notas manuales
      if (evento.metadata?.esNota && evento.metadata?.notaId) {
        const notaId = evento.metadata.notaId as string
        const creadoPor = evento.metadata.creadoPor as string

        // ✅ Verificación sincrónica: es Admin o es el creador
        if (esAdmin || creadoPor === user.id) {
          editables.add(notaId)
        }
      }
    })

    return editables
  }, [user, perfil, eventos])

  return { notasEditables }
}

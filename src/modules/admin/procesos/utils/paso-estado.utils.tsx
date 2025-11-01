/**
 * 🎨 UTILIDADES DE ESTADO DE PASOS
 *
 * Funciones helper para obtener iconos, badges y clases CSS
 * según el estado del paso del proceso.
 */

import { CheckCircle2, Circle, Lock, X } from 'lucide-react'
import type { ProcesoNegociacion } from '../types'
import { EstadoPaso } from '../types'

// ===================================
// ICONOS POR ESTADO
// ===================================

export function getIconoPorEstado(paso: ProcesoNegociacion, estaBloqueado: boolean) {
  const isCompletado = paso.estado === EstadoPaso.COMPLETADO
  const isOmitido = paso.estado === EstadoPaso.OMITIDO

  if (isCompletado) return <CheckCircle2 className="w-5 h-5 text-green-600" />
  if (isOmitido) return <X className="w-5 h-5 text-gray-400" />
  if (estaBloqueado) return <Lock className="w-5 h-5 text-gray-400" />
  return <Circle className="w-5 h-5 text-gray-300" />
}

// ===================================
// CLASES DE DOT POR ESTADO
// ===================================

export function getClasesDotPorEstado(
  paso: ProcesoNegociacion,
  estaBloqueado: boolean,
  styles: any
) {
  const isCompletado = paso.estado === EstadoPaso.COMPLETADO
  const isEnProceso = paso.estado === EstadoPaso.EN_PROCESO
  const isOmitido = paso.estado === EstadoPaso.OMITIDO

  if (isCompletado) return styles.paso.dot.completado
  if (isEnProceso) return styles.paso.dot.enProceso
  if (isOmitido) return styles.paso.dot.omitido
  if (estaBloqueado) return styles.paso.dot.bloqueado
  return styles.paso.dot.pendiente
}

// ===================================
// CONTENIDO DE DOT
// ===================================

export function getContenidoDot(
  paso: ProcesoNegociacion,
  index: number,
  estaBloqueado: boolean
) {
  const isCompletado = paso.estado === EstadoPaso.COMPLETADO
  const isEnProceso = paso.estado === EstadoPaso.EN_PROCESO

  if (isCompletado) {
    return <CheckCircle2 className="w-4 h-4 text-white" />
  }

  if (isEnProceso) {
    return <Circle className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
  }

  if (estaBloqueado) {
    return <Lock className="w-3 h-3 text-white" />
  }

  return index + 1
}

// ===================================
// BADGES POR ESTADO
// ===================================

interface BadgeInfo {
  element: React.ReactElement
  estado: 'completado' | 'en-proceso' | 'omitido' | 'bloqueado' | 'pendiente'
}

export function getBadgePorEstado(
  paso: ProcesoNegociacion,
  estaBloqueado: boolean,
  styles: any
): BadgeInfo {
  const isCompletado = paso.estado === EstadoPaso.COMPLETADO
  const isEnProceso = paso.estado === EstadoPaso.EN_PROCESO
  const isOmitido = paso.estado === EstadoPaso.OMITIDO

  if (isCompletado) {
    return {
      estado: 'completado',
      element: (
        <span className={styles.paso.badges.completado}>
          ✓ Completado
        </span>
      )
    }
  }

  if (isEnProceso) {
    return {
      estado: 'en-proceso',
      element: (
        <span className={styles.paso.badges.enProceso}>
          <div className={styles.paso.badges.pulseDot} />
          En Proceso
        </span>
      )
    }
  }

  if (isOmitido) {
    return {
      estado: 'omitido',
      element: (
        <span className={styles.paso.badges.omitido}>
          Omitido
        </span>
      )
    }
  }

  if (estaBloqueado) {
    return {
      estado: 'bloqueado',
      element: (
        <span className={styles.paso.badges.bloqueado}>
          <Lock className="w-3 h-3" />
          Bloqueado
        </span>
      )
    }
  }

  return {
    estado: 'pendiente',
    element: (
      <span className={styles.paso.badges.pendiente}>
        Pendiente
      </span>
    )
  }
}

// ===================================
// VALIDACIONES DE ESTADO
// ===================================

export function getEstadoPaso(paso: ProcesoNegociacion, estaBloqueado: boolean) {
  return {
    isCompletado: paso.estado === EstadoPaso.COMPLETADO,
    isEnProceso: paso.estado === EstadoPaso.EN_PROCESO,
    isPendiente: paso.estado === EstadoPaso.PENDIENTE,
    isOmitido: paso.estado === EstadoPaso.OMITIDO,
    isBloqueado: estaBloqueado && paso.estado !== EstadoPaso.COMPLETADO && paso.estado !== EstadoPaso.OMITIDO
  }
}

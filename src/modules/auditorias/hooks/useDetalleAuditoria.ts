/**
 * useDetalleAuditoria - Hook para manejar lógica de modal de detalles
 *
 * ✅ SOLO lógica de negocio
 * ✅ Sin JSX
 * ✅ < 100 líneas
 */

import { useMemo, useState } from 'react'

import type { AuditLogRecord } from '../types'
import { formatearFecha } from '../utils/formatters'

export function useDetalleAuditoria(registro: AuditLogRecord) {
  const [seccionAbierta, setSeccionAbierta] = useState<string>('principal')

  // Toggle sección JSON colapsable
  const toggleSeccion = (seccion: string) => {
    setSeccionAbierta(seccionAbierta === seccion ? '' : seccion)
  }

  // Datos formateados memorizados
  const datosFormateados = useMemo(() => ({
    fechaFormateada: formatearFecha(registro.fechaEvento),
    metadata: registro.metadata || {},
    tieneMetadata: registro.metadata && Object.keys(registro.metadata).length > 0,
    tieneDatosNuevos: !!registro.datosNuevos,
    tieneCambiosEspecificos: registro.cambiosEspecificos && Object.keys(registro.cambiosEspecificos).length > 0
  }), [registro])

  // Verificar si debe mostrar sección JSON
  const mostrarSeccionJson = useMemo(() =>
    datosFormateados.tieneMetadata ||
    datosFormateados.tieneDatosNuevos ||
    datosFormateados.tieneCambiosEspecificos,
    [datosFormateados]
  )

  return {
    seccionAbierta,
    toggleSeccion,
    datosFormateados,
    mostrarSeccionJson
  }
}

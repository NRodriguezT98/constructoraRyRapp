/**
 * 🔍 HOOK: VALIDACIÓN DE BOTÓN DE DESEMBOLSO
 *
 * Valida si se puede mostrar/habilitar el botón de registrar desembolso.
 * Usa useDocumentosPendientesObligatorios (cache compartido con React Query)
 * y filtrarPendientesPorFuente (función pura — única fuente de verdad del filtro).
 */

'use client'

import { useMemo } from 'react'

import { useDocumentosPendientesObligatorios } from '@/modules/clientes/hooks/useDocumentosPendientesObligatorios'
import { filtrarPendientesPorFuente } from '@/modules/clientes/utils/documentos-pendientes.utils'

import type { TipoFuentePago } from '../types'

interface EstadoBoton {
  habilitado: boolean
  texto: string
  tooltipMensaje?: string
  cargando: boolean
}

interface UseValidacionBotonDesembolsoProps {
  fuenteId: string
  clienteId?: string
  tipoFuente: TipoFuentePago
  fuenteCompletada: boolean
}

/**
 * Hook para validar si el botón de desembolso debe estar habilitado.
 * Un documento OBLIGATORIO pendiente que aplique a esta fuente bloquea el botón.
 */
export function useValidacionBotonDesembolso({
  fuenteId,
  clienteId,
  tipoFuente,
  fuenteCompletada,
}: UseValidacionBotonDesembolsoProps): EstadoBoton {
  const esDesembolsoUnico =
    tipoFuente === 'Crédito Hipotecario' ||
    tipoFuente === 'Subsidio Mi Casa Ya' ||
    tipoFuente === 'Subsidio Caja Compensación'

  const textoBoton = esDesembolsoUnico ? 'Registrar Desembolso' : 'Registrar Abono'

  const { data: todosLosPendientes = [], isLoading, isError } = useDocumentosPendientesObligatorios(clienteId)

  return useMemo((): EstadoBoton => {
    if (fuenteCompletada) {
      return { habilitado: false, texto: 'Completada', cargando: false }
    }

    if (!fuenteId || !clienteId) {
      return { habilitado: true, texto: textoBoton, cargando: false }
    }

    if (isLoading) {
      return { habilitado: false, texto: textoBoton, cargando: true }
    }

    if (isError) {
      // Fail-open: no bloquear por errores de red
      return {
        habilitado: true,
        texto: textoBoton,
        tooltipMensaje: 'No se pudo verificar los requisitos. Proceda con precaución.',
        cargando: false,
      }
    }

    const pendientes = filtrarPendientesPorFuente(todosLosPendientes, fuenteId, tipoFuente)

    if (pendientes.length === 0) {
      return { habilitado: true, texto: textoBoton, cargando: false }
    }

    const lista = pendientes.map(p => `• ${p.tipo_documento}`).join('\n')
    return {
      habilitado: false,
      texto: textoBoton,
      tooltipMensaje: `Completa los siguientes documentos antes de registrar:\n\n${lista}`,
      cargando: false,
    }
  }, [fuenteCompletada, fuenteId, clienteId, isLoading, isError, todosLosPendientes, tipoFuente, textoBoton])
}

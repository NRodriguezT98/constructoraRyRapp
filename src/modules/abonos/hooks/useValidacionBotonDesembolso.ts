/**
 * 🔍 HOOK: VALIDACIÓN DE BOTÓN DE DESEMBOLSO
 *
 * Valida si se puede mostrar/habilitar el botón de registrar desembolso
 * usando el sistema dinámico de pasos (validarPreDesembolso).
 */

'use client'

import { useEffect, useState } from 'react'

import { validarPreDesembolso } from '@/modules/fuentes-pago/services/pasos-fuente-pago.service'

import type { TipoFuentePago } from '../types'

interface EstadoBoton {
  habilitado: boolean
  texto: string
  tooltipMensaje?: string
  cargando: boolean
}

interface UseValidacionBotonDesembolsoProps {
  fuenteId: string
  tipoFuente: TipoFuentePago
  fuenteCompletada: boolean
}

/**
 * Hook para validar si el botón de desembolso debe estar habilitado.
 * Usa el sistema dinámico de pasos (requisitos_fuentes_pago_config).
 */
export function useValidacionBotonDesembolso({
  fuenteId,
  tipoFuente,
  fuenteCompletada,
}: UseValidacionBotonDesembolsoProps): EstadoBoton {
  const esDesembolsoUnico =
    tipoFuente === 'Crédito Hipotecario' ||
    tipoFuente === 'Subsidio Mi Casa Ya' ||
    tipoFuente === 'Subsidio Caja Compensación'

  const textoBoton = esDesembolsoUnico ? 'Registrar Desembolso' : 'Registrar Abono'

  const [estadoBoton, setEstadoBoton] = useState<EstadoBoton>({
    habilitado: false,
    texto: textoBoton,
    cargando: true,
  })

  useEffect(() => {
    async function validar() {
      // Fuente completada → deshabilitar
      if (fuenteCompletada) {
        setEstadoBoton({ habilitado: false, texto: 'Completada', cargando: false })
        return
      }

      if (!fuenteId) {
        setEstadoBoton({ habilitado: true, texto: textoBoton, cargando: false })
        return
      }

      try {
        const validacion = await validarPreDesembolso(fuenteId)

        if (validacion.valido) {
          setEstadoBoton({ habilitado: true, texto: textoBoton, cargando: false })
        } else {
          const pendientes = validacion.pasos_pendientes.map(p => `• ${p.titulo}`).join('\n')
          setEstadoBoton({
            habilitado: false,
            texto: textoBoton,
            tooltipMensaje: `Completa los siguientes requisitos antes de registrar:\n\n${pendientes}`,
            cargando: false,
          })
        }
      } catch (error) {
        console.error('Error al validar requisitos del desembolso:', error)
        // Fail-open: no bloquear por errores de red
        setEstadoBoton({
          habilitado: true,
          texto: textoBoton,
          tooltipMensaje: 'No se pudo verificar los requisitos. Proceda con precaución.',
          cargando: false,
        })
      }
    }

    validar()
  }, [fuenteId, fuenteCompletada, textoBoton])

  return estadoBoton
}

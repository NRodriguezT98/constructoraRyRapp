/**
 * 🔍 HOOK: VALIDACIÓN DE BOTÓN DE DESEMBOLSO
 *
 * Valida si se puede mostrar/habilitar el botón de registrar desembolso
 * según el estado del paso del proceso.
 */

'use client'

import { useEffect, useState } from 'react'
import { obtenerInfoPasoRequerido, obtenerNombrePasoRequerido, requiereValidacionPaso } from '../services/validacion-desembolsos.service'
import type { TipoFuentePago } from '../types'

interface EstadoBoton {
  habilitado: boolean
  texto: string
  tooltipMensaje?: string
  pasoRequerido?: {
    nombre: string
    estado: string
  }
  cargando: boolean
}

interface UseValidacionBotonDesembolsoProps {
  negociacionId: string
  tipoFuente: TipoFuentePago
  fuenteCompletada: boolean
}

/**
 * Hook para validar si el botón de desembolso debe estar habilitado
 */
export function useValidacionBotonDesembolso({
  negociacionId,
  tipoFuente,
  fuenteCompletada,
}: UseValidacionBotonDesembolsoProps): EstadoBoton {
  const [estadoBoton, setEstadoBoton] = useState<EstadoBoton>({
    habilitado: false,
    texto: 'Registrar Abono',
    cargando: true,
  })

  useEffect(() => {
    async function validar() {
      // Si la fuente ya está completada, no mostrar botón
      if (fuenteCompletada) {
        setEstadoBoton({
          habilitado: false,
          texto: 'Completada',
          cargando: false,
        })
        return
      }

      // Determinar si es desembolso (Crédito o Subsidios)
      const esDesembolso = requiereValidacionPaso(tipoFuente)
      const textoBoton = esDesembolso ? 'Registrar Desembolso' : 'Registrar Abono'

      // Si es Cuota Inicial (no requiere validación)
      if (!esDesembolso) {
        setEstadoBoton({
          habilitado: true,
          texto: textoBoton,
          cargando: false,
        })
        return
      }

      // Si es desembolso, verificar el paso del proceso
      try {
        const infoPaso = await obtenerInfoPasoRequerido(negociacionId, tipoFuente)
        const nombrePaso = obtenerNombrePasoRequerido(tipoFuente)

        if (!infoPaso) {
          // El paso no existe en el proceso
          setEstadoBoton({
            habilitado: false,
            texto: textoBoton,
            tooltipMensaje: `El paso "${nombrePaso}" no existe en el proceso de esta negociación. Contacte al administrador.`,
            pasoRequerido: {
              nombre: nombrePaso || 'Paso requerido',
              estado: 'No Existe',
            },
            cargando: false,
          })
          return
        }

        // Verificar si el paso está completado
        const pasoCompletado = infoPaso.estado === 'Completado'

        if (pasoCompletado) {
          // Paso completado, habilitar botón
          setEstadoBoton({
            habilitado: true,
            texto: textoBoton,
            pasoRequerido: {
              nombre: infoPaso.nombre,
              estado: infoPaso.estado,
            },
            cargando: false,
          })
        } else {
          // Paso no completado, deshabilitar con tooltip
          setEstadoBoton({
            habilitado: false,
            texto: textoBoton,
            tooltipMensaje: `Complete el paso "${infoPaso.nombre}" (actualmente: ${infoPaso.estado}) en el proceso de compra para habilitar el registro de desembolso.`,
            pasoRequerido: {
              nombre: infoPaso.nombre,
              estado: infoPaso.estado,
            },
            cargando: false,
          })
        }
      } catch (error) {
        console.error('Error al validar paso del proceso:', error)

        // En caso de error, habilitar para no bloquear (fail-safe)
        setEstadoBoton({
          habilitado: true,
          texto: textoBoton,
          tooltipMensaje: 'No se pudo verificar el estado del proceso. Proceda con precaución.',
          cargando: false,
        })
      }
    }

    validar()
  }, [negociacionId, tipoFuente, fuenteCompletada])

  return estadoBoton
}

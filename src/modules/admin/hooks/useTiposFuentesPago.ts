/**
 * HOOK: useTiposFuentesPago
 * Lógica de negocio para gestión de tipos de fuentes de pago
 */

import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { FUENTES_PAGO_CODIGOS } from '@/modules/clientes/types/fuentes-pago'

interface TipoFuente {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  es_subsidio: boolean
  orden: number
  activo: boolean
}

interface ResultadoOperacion {
  tipo: 'success' | 'error' | 'info'
  mensaje: string
  detalle?: string
  fuentes?: TipoFuente[]
}

/** Códigos oficiales de las 4 fuentes de pago del sistema */
const CODIGOS_OFICIALES = Object.values(FUENTES_PAGO_CODIGOS)

export function useTiposFuentesPago() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<ResultadoOperacion | null>(null)

  const verificarFuentes = async () => {
    try {
      setLoading(true)
      setResultado(null)

      const supabase = createClient()

      const { data: fuentesActuales, error: errorConsulta } = await supabase
        .from('tipos_fuentes_pago')
        .select('id,nombre,codigo,descripcion,requiere_entidad,permite_multiples_abonos,es_subsidio,color,icono,orden,activo,created_at,updated_at,created_by,updated_by')
        .order('orden')

      if (errorConsulta) {
        throw new Error(`Error al consultar: ${errorConsulta.message}`)
      }

      const codigosActuales = new Set(fuentesActuales?.map((f) => f.codigo) || [])
      const faltantes = CODIGOS_OFICIALES.filter((cod) => !codigosActuales.has(cod))

      if (faltantes.length === 0) {
        setResultado({
          tipo: 'success',
          mensaje: '✅ Todas las fuentes oficiales existen',
          detalle: `${fuentesActuales?.length || 0} tipos encontrados`,
          fuentes: fuentesActuales || [],
        })
      } else {
        setResultado({
          tipo: 'info',
          mensaje: `⚠️ Faltan ${faltantes.length} fuente(s)`,
          detalle: `Faltantes: ${faltantes.join(', ')}`,
          fuentes: fuentesActuales || [],
        })
      }
    } catch (error) {
      logger.error('Error al verificar:', error)
      setResultado({
        tipo: 'error',
        mensaje: '❌ Error al verificar fuentes',
        detalle: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const crearFuentesPredeterminadas = async () => {
    try {
      setLoading(true)
      setResultado(null)

      // 1. Primero verificar estado actual
      const supabase = createClient()
      const { data: fuentesActuales, error: errorConsulta } = await supabase
        .from('tipos_fuentes_pago')
        .select('id,nombre,codigo,descripcion,requiere_entidad,permite_multiples_abonos,es_subsidio,color,icono,orden,activo,created_at,updated_at,created_by,updated_by')
        .in('codigo', CODIGOS_OFICIALES)
        .order('orden')

      if (errorConsulta) {
        throw new Error(`Error al consultar fuentes actuales: ${errorConsulta.message}`)
      }

      // 2. Analizar diferencias
      const fuentesExistentes = fuentesActuales || []
      const codigosExistentes = new Set(fuentesExistentes.map((f) => f.codigo))
      const faltantes = CODIGOS_OFICIALES.filter((cod) => !codigosExistentes.has(cod))

      // Si existen las 4 y tienen configuración correcta
      if (faltantes.length === 0 && fuentesExistentes.length === CODIGOS_OFICIALES.length) {
        // Verificar si la configuración es idéntica (nombre, descripción, color, icono)
        const configuracionActual = fuentesExistentes.every((fuente) => {
          // Aquí podrías hacer una validación más estricta comparando con FUENTES_OFICIALES
          return fuente.activo === true
        })

        if (configuracionActual) {
          setResultado({
            tipo: 'info',
            mensaje: '✅ Las fuentes ya están instaladas correctamente',
            detalle: 'Las 4 formas de pago ya existen con su configuración actual. No es necesario crearlas de nuevo.',
            fuentes: fuentesExistentes,
          })
          setLoading(false)
          return
        }
      }

      // 3. Ejecutar creación/actualización
      const response = await fetch('/api/admin/seed-tipos-fuentes-pago', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear las fuentes predeterminadas')
      }

      // 4. Mensaje personalizado según lo que pasó
      let mensajeDetalle = ''
      if (faltantes.length > 0) {
        mensajeDetalle = `Se ${faltantes.length === 1 ? 'creó' : 'crearon'} ${faltantes.length} fuente(s) nueva(s)`
      } else {
        mensajeDetalle = `Se actualizó la configuración de ${fuentesExistentes.length} fuente(s)`
      }

      setResultado({
        tipo: 'success',
        mensaje: '✅ Fuentes de pago configuradas exitosamente',
        detalle: mensajeDetalle,
        fuentes: data.fuentes || [],
      })
    } catch (error) {
      logger.error('Error al crear fuentes predeterminadas:', error)
      setResultado({
        tipo: 'error',
        mensaje: '❌ Error al crear las fuentes de pago',
        detalle: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    resultado,
    verificarFuentes,
    crearFuentesPredeterminadas,
  }
}

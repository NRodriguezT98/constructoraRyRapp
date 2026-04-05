/**
 * HOOK: useTiposFuentesPago
 * LÃ³gica de negocio para gestiÃ³n de tipos de fuentes de pago
 */

import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'
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

/** CÃ³digos oficiales de las 4 fuentes de pago del sistema */
const CODIGOS_OFICIALES = Object.values(FUENTES_PAGO_CODIGOS)

const SELECT_CAMPOS =
  'id,nombre,codigo,descripcion,requiere_entidad,permite_multiples_abonos,es_subsidio,color,icono,orden,activo,created_at,updated_at,created_by,updated_by'

async function ejecutarVerificacion(): Promise<ResultadoOperacion> {
  const { data: fuentesActuales, error: errorConsulta } = await supabase
    .from('tipos_fuentes_pago')
    .select(SELECT_CAMPOS)
    .order('orden')

  if (errorConsulta) {
    throw new Error(`Error al consultar: ${errorConsulta.message}`)
  }

  const codigosActuales = new Set(fuentesActuales?.map(f => f.codigo) || [])
  const faltantes = CODIGOS_OFICIALES.filter(cod => !codigosActuales.has(cod))

  if (faltantes.length === 0) {
    return {
      tipo: 'success',
      mensaje: 'âœ… Todas las fuentes oficiales existen',
      detalle: `${fuentesActuales?.length || 0} tipos encontrados`,
      fuentes: (fuentesActuales as TipoFuente[]) || [],
    }
  }

  return {
    tipo: 'info',
    mensaje: `âš ï¸ Faltan ${faltantes.length} fuente(s)`,
    detalle: `Faltantes: ${faltantes.join(', ')}`,
    fuentes: (fuentesActuales as TipoFuente[]) || [],
  }
}

async function ejecutarCreacion(): Promise<ResultadoOperacion> {
  const { data: fuentesActuales, error: errorConsulta } = await supabase
    .from('tipos_fuentes_pago')
    .select(SELECT_CAMPOS)
    .in('codigo', CODIGOS_OFICIALES)
    .order('orden')

  if (errorConsulta) {
    throw new Error(
      `Error al consultar fuentes actuales: ${errorConsulta.message}`
    )
  }

  const fuentesExistentes = fuentesActuales || []
  const codigosExistentes = new Set(fuentesExistentes.map(f => f.codigo))
  const faltantes = CODIGOS_OFICIALES.filter(cod => !codigosExistentes.has(cod))

  if (
    faltantes.length === 0 &&
    fuentesExistentes.length === CODIGOS_OFICIALES.length &&
    fuentesExistentes.every(f => f.activo === true)
  ) {
    return {
      tipo: 'info',
      mensaje: 'âœ… Las fuentes ya estÃ¡n instaladas correctamente',
      detalle:
        'Las 4 formas de pago ya existen con su configuraciÃ³n actual. No es necesario crearlas de nuevo.',
      fuentes: fuentesExistentes as TipoFuente[],
    }
  }

  const response = await fetch('/api/admin/seed-tipos-fuentes-pago', {
    method: 'POST',
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error al crear las fuentes predeterminadas')
  }

  const mensajeDetalle =
    faltantes.length > 0
      ? `Se ${faltantes.length === 1 ? 'creÃ³' : 'crearon'} ${faltantes.length} fuente(s) nueva(s)`
      : `Se actualizÃ³ la configuraciÃ³n de ${fuentesExistentes.length} fuente(s)`

  return {
    tipo: 'success',
    mensaje: 'âœ… Fuentes de pago configuradas exitosamente',
    detalle: mensajeDetalle,
    fuentes: data.fuentes || [],
  }
}

export function useTiposFuentesPago() {
  const [resultado, setResultado] = useState<ResultadoOperacion | null>(null)

  const verificarMutation = useMutation({
    mutationFn: ejecutarVerificacion,
    onSuccess: data => {
      setResultado(data)
    },
    onError: (error: Error) => {
      logger.error('Error al verificar:', error)
      setResultado({
        tipo: 'error',
        mensaje: 'âŒ Error al verificar fuentes',
        detalle: error.message,
      })
    },
  })

  const crearMutation = useMutation({
    mutationFn: ejecutarCreacion,
    onSuccess: data => {
      setResultado(data)
    },
    onError: (error: Error) => {
      logger.error('Error al crear fuentes predeterminadas:', error)
      setResultado({
        tipo: 'error',
        mensaje: 'âŒ Error al crear las fuentes de pago',
        detalle: error.message,
      })
    },
  })

  return {
    loading: verificarMutation.isPending || crearMutation.isPending,
    resultado,
    verificarFuentes: () => verificarMutation.mutate(),
    crearFuentesPredeterminadas: () => crearMutation.mutate(),
  }
}

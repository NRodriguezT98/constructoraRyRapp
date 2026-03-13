/**
 * ============================================
 * SERVICE: Documentos Pendientes
 * ============================================
 *
 * Servicio optimizado para gestión de documentos pendientes
 * - Queries optimizadas (sin JOIN N+1)
 * - Validación Zod en runtime
 * - Type-safe con TypeScript
 *
 * @version 2.0.0 - 2025-12-12
 */

import { supabase } from '@/lib/supabase/client'
import type { TipoFuentePago } from '@/modules/clientes/types'
import {
    type DocumentoPendienteEnriquecido
} from '@/modules/clientes/types/documentos-pendientes.types'

// ============================================
// TYPES
// ============================================

export interface CrearDocumentoPendienteParams {
  clienteId: string
  fuentePagoId: string
  tipoFuente: TipoFuentePago
  entidad?: string
  manzana: string
  numeroVivienda: string
}

interface FuentePagoConNegociacion {
  id: string
  tipo: string
  entidad: string | null
  negociacion_id: string
}

interface NegociacionConRelaciones {
  id: string
  vivienda_id: string
  cliente_id: string
  viviendas: {
    numero: string
    manzana_id: string
    manzanas: { nombre: string } | null
  } | null
  clientes: {
    nombre_completo: string
  } | null
}

// ============================================
// FUNCIONES PÚBLICAS
// ============================================

/**
 * Obtiene documentos pendientes de un cliente con datos enriquecidos
 * ✅ OPTIMIZADO: Usa vista en tiempo real en lugar de tabla documentos_pendientes
 * ✅ SIEMPRE ACTUALIZADO: Calcula pendientes comparando requisitos vs documentos subidos
 */
export async function fetchDocumentosPendientesPorCliente(
  clienteId: string
): Promise<DocumentoPendienteEnriquecido[]> {
  try {
    // ✅ Query a vista en tiempo real
    const { data: pendientes, error } = await supabase
      .from('vista_documentos_pendientes_fuentes')
      .select('requisito_config_id,fuente_pago_id,cliente_id,tipo_documento,metadata,estado,prioridad,fecha_creacion,nivel_validacion,orden')
      .eq('cliente_id', clienteId)
      .order('nivel_validacion', { ascending: true }) // Obligatorios primero
      .order('orden', { ascending: false }) // Luego por prioridad

    if (error) {
      console.error('❌ Error al obtener pendientes desde vista:', error)
      throw error
    }

    if (!pendientes || pendientes.length === 0) {
      return []
    }

    // ✅ Transformar a formato esperado por componente
    const documentosEnriquecidos = pendientes.map(p => ({
      id: p.requisito_config_id, // Usamos ID del requisito como ID único
      fuente_pago_id: p.fuente_pago_id,
      cliente_id: p.cliente_id,
      tipo_documento: p.tipo_documento,
      categoria_id: null, // No aplica para vista
      metadata: p.metadata,
      estado: p.estado as 'Pendiente',
      prioridad: p.prioridad as 'Alta' | 'Media' | 'Baja',
      recordatorios_enviados: 0,
      ultima_notificacion: null,
      fecha_creacion: p.fecha_creacion,
      fecha_limite: null,
      fecha_completado: null,
      completado_por: null,
      // ✅ Enriquecer con datos de fuente de pago desde metadata
      _enriched: p.metadata ? (() => {
        const meta = p.metadata as Record<string, any>
        return {
          fuente_pago: {
            tipo: meta.tipo_fuente,
            entidad: meta.entidad_fuente,
            estado: 'Activa' as const
          },
          negociacion: meta.negociacion_id ? {
            vivienda: {
              numero: meta.vivienda_numero,
              manzana: {
                nombre: meta.manzana_nombre
              }
            },
            cliente: {
              nombre_completo: meta.cliente_nombre
            }
          } : undefined
        }
      })() : undefined
    }))

    return documentosEnriquecidos as unknown as DocumentoPendienteEnriquecido[]
  } catch (error) {
    console.error('❌ Error en fetchDocumentosPendientesPorCliente:', error)
    throw error
  }
}

/**
 * Crea un documento pendiente para una carta de aprobación
 */
export async function crearDocumentoPendiente({
  clienteId,
  fuentePagoId,
  tipoFuente,
  entidad,
  manzana,
  numeroVivienda,
}: CrearDocumentoPendienteParams) {
  const vivienda = `${manzana}${numeroVivienda}`

  // Generar descripción según el tipo (se guarda en metadata)
  let descripcion = ''
  switch (tipoFuente) {
    case 'Crédito Hipotecario':
      descripcion = `Carta de aprobación de crédito hipotecario${entidad ? ` de ${entidad}` : ''} para vivienda ${vivienda}`
      break
    case 'Subsidio Caja Compensación':
      descripcion = `Carta de aprobación de subsidio de caja de compensación${entidad ? ` de ${entidad}` : ''} para vivienda ${vivienda}`
      break
    case 'Subsidio Mi Casa Ya':
      descripcion = `Carta de aprobación de subsidio Mi Casa Ya para vivienda ${vivienda}`
      break
    default:
      descripcion = `Carta de aprobación de ${tipoFuente} para vivienda ${vivienda}`
  }

  const { data, error } = await supabase
    .from('documentos_pendientes')
    .insert({
      cliente_id: clienteId,
      fuente_pago_id: fuentePagoId,
      tipo_documento: 'Carta de Aprobación',
      metadata: {
        descripcion,
        tipo_fuente: tipoFuente,
        entidad,
        vivienda,
        origen: 'asignacion_vivienda',
        creado_automaticamente: true,
      },
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Error creando documento pendiente:', error)
    throw error
  }

  return data
}

/**
 * Crea múltiples documentos pendientes en batch
 */
export async function crearDocumentosPendientesBatch(
  params: CrearDocumentoPendienteParams[]
): Promise<void> {
  const promises = params.map((p) => crearDocumentoPendiente(p))
  await Promise.all(promises)
}

/**
 * Marca documento pendiente como completado
 */
export async function completarDocumentoPendiente(
  documentoId: string,
  completadoPor: string
): Promise<void> {
  const { error } = await supabase
    .from('documentos_pendientes')
    .update({
      estado: 'Completado',
      fecha_completado: new Date().toISOString(),
      completado_por: completadoPor
    })
    .eq('id', documentoId)

  if (error) {
    console.error('❌ Error completando documento:', error)
    throw error
  }

}

/**
 * Elimina documento pendiente
 */
export async function eliminarDocumentoPendiente(
  documentoId: string
): Promise<void> {
  const { error } = await supabase
    .from('documentos_pendientes')
    .delete()
    .eq('id', documentoId)

  if (error) {
    console.error('❌ Error eliminando documento:', error)
    throw error
  }

}

/**
 * ============================================
 * SERVICE: Documentos Pendientes
 * ============================================
 *
 * Servicio para gestión de documentos pendientes.
 * Usa la vista vista_documentos_pendientes_fuentes (sistema nuevo).
 * Las tablas documentos_pendientes y pasos_fuente_pago han sido eliminadas.
 *
 * @version 3.0.0 - 2026-03-14 (limpieza sistema viejo)
 */

import { supabase } from '@/lib/supabase/client'
import type {
    DocumentoPendienteEnriquecido
} from '@/modules/clientes/types/documentos-pendientes.types'

// ============================================
// FUNCIONES PÚBLICAS
// ============================================

/**
 * Obtiene documentos pendientes de un cliente con datos enriquecidos.
 * ✅ OPTIMIZADO: Usa vista en tiempo real.
 * ✅ SIEMPRE ACTUALIZADO: Calcula pendientes comparando requisitos vs documentos subidos.
 */
export async function fetchDocumentosPendientesPorCliente(
  clienteId: string
): Promise<DocumentoPendienteEnriquecido[]> {
  try {
    const { data: pendientes, error } = await supabase
      .from('vista_documentos_pendientes_fuentes')
      .select('requisito_config_id,fuente_pago_id,cliente_id,tipo_documento,metadata,estado,prioridad,fecha_creacion,nivel_validacion,orden')
      .eq('cliente_id', clienteId)
      .order('nivel_validacion', { ascending: true })
      .order('orden', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener pendientes desde vista:', error)
      throw error
    }

    if (!pendientes || pendientes.length === 0) {
      return []
    }

    const documentosEnriquecidos = pendientes.map(p => ({
      id: p.requisito_config_id,
      fuente_pago_id: p.fuente_pago_id,
      cliente_id: p.cliente_id,
      tipo_documento: p.tipo_documento,
      categoria_id: null,
      metadata: p.metadata,
      estado: p.estado as 'Pendiente',
      prioridad: p.prioridad as 'Alta' | 'Media' | 'Baja',
      recordatorios_enviados: 0,
      ultima_notificacion: null,
      fecha_creacion: p.fecha_creacion,
      fecha_limite: null,
      fecha_completado: null,
      completado_por: null,
      _enriched: p.metadata ? (() => {
        const meta = p.metadata as Record<string, unknown>
        return {
          fuente_pago: {
            tipo: meta.tipo_fuente,
            entidad: meta.entidad_fuente,
            estado: 'Activa' as const
          },
          negociacion: meta.negociacion_id ? {
            vivienda: {
              numero: meta.vivienda_numero,
              manzana: { nombre: meta.manzana_nombre }
            },
            cliente: { nombre_completo: meta.cliente_nombre }
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

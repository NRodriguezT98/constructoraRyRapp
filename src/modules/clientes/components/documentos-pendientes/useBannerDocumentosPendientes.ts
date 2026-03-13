/**
 * ============================================
 * HOOK: useBannerDocumentosPendientes
 * ============================================
 *
 * Hook optimizado con React Query para banner de documentos pendientes
 * ✅ Cache automático (5 minutos)
 * ✅ Refetch inteligente
 * ✅ Invalidación quirúrgica
 *
 * @version 2.0.0 - 2025-12-12
 */

import { useDocumentosPendientes } from '@/modules/clientes/hooks/useDocumentosPendientes'

// ============================================
// TYPES (Legacy - Para compatibilidad)
// ============================================

export interface DocumentoPendiente {
  id: string
  fuente_pago_id: string
  tipo_documento: string
  metadata: {
    tipo_fuente: string
    entidad?: string
    monto_aprobado?: number
    vivienda?: {
      numero: string
      manzana: string
    }
    cliente?: {
      nombre_completo: string
    }
  }
  estado: 'Pendiente' | 'Completado' | 'Vencido'
  prioridad: 'Alta' | 'Media' | 'Baja'
  fecha_creacion: string
  fecha_limite?: string
}

// ============================================
// HOOK
// ============================================

export function useBannerDocumentosPendientes(clienteId: string) {
  // ✅ Usar React Query en lugar de useState + useEffect manual
  const {
    data: documentosPendientes = [],
    isLoading: loading,
    error,
    refetch
  } = useDocumentosPendientes(clienteId)

  // ✅ Transformar a formato legacy (compatibilidad con componente existente)
  const documentosFormateados = documentosPendientes.map(doc => ({
    id: doc.id,
    fuente_pago_id: doc.fuente_pago_id,
    tipo_documento: doc.tipo_documento,
    metadata: {
      ...doc.metadata,
      // ✅ Incluir datos enriquecidos para el modal
      vivienda: doc._enriched?.vivienda
        ? {
            numero: String(doc._enriched.vivienda.numero), // ✅ Asegurar string
            manzana: doc._enriched.vivienda.manzana || ''  // ✅ Fallback string vacío
          }
        : undefined,
      cliente: doc._enriched?.cliente
        ? {
            nombre_completo: doc._enriched.cliente.nombre_completo || ''
          }
        : undefined
    },
    estado: doc.estado,
    prioridad: doc.prioridad,
    fecha_creacion: doc.fecha_creacion,
    fecha_limite: doc.fecha_limite
  }))

  return {
    documentosPendientes: documentosFormateados,
    loading,
    error,
    refetch
  }
}

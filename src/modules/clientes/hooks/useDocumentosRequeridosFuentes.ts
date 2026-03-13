/**
 * ============================================
 * HOOK: useDocumentosRequeridosFuentes
 * ============================================
 *
 * Calcula documentos requeridos en TIEMPO REAL
 * consultando requisitos_fuentes_pago_config
 *
 * ✅ NO depende de documentos_pendientes
 * ✅ Fuente de verdad: requisitos_fuentes_pago_config
 * ✅ Calcula diferencia con documentos_cliente
 *
 * @version 3.0.0 - 2025-12-17
 */

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================

export interface DocumentoRequeridoFuente {
  id: string // ID del requisito config
  fuente_pago_id: string
  tipo_fuente: string
  entidad: string
  tipo_documento: string
  nivel_validacion: 'DOCUMENTO_OBLIGATORIO' | 'DOCUMENTO_OPCIONAL'
  prioridad: string
  tiene_documento: boolean
  documento_id?: string
  documento_url?: string
}

export interface FuenteConRequisitos {
  fuenteId: string
  tipo: string
  entidad: string
  requisitos: DocumentoRequeridoFuente[]
  pendientes: DocumentoRequeridoFuente[]
  completados: DocumentoRequeridoFuente[]
  totalObligatorios: number
  obligatoriosPendientes: number
}

// ============================================
// HOOK
// ============================================

export function useDocumentosRequeridosFuentes(clienteId: string) {
  // 1. Obtener fuentes activas del cliente
  const { data: fuentes = [] } = useQuery({
    queryKey: ['fuentes-pago-activas', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fuentes_pago')
        .select(`
          id,
          tipo,
          tipo_fuente_id,
          entidad,
          estado
        `)
        .eq('estado', 'Activa')
        .order('fecha_creacion', { ascending: false })

      if (error) throw error

      // Filtrar por cliente a través de negociaciones
      const fuentesConCliente = []
      for (const fuente of data || []) {
        const { data: negociacion } = await supabase
          .from('negociaciones')
          .select('cliente_id')
          .eq('id', fuente.id)
          .single()

        if (negociacion?.cliente_id === clienteId) {
          fuentesConCliente.push(fuente)
        }
      }

      return fuentesConCliente
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // 2. Obtener TODOS los requisitos configurados
  const { data: todosRequisitos = [] } = useQuery({
    queryKey: ['requisitos-fuentes-config-todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requisitos_fuentes_pago_config')
        .select('id,tipo_fuente,paso_identificador,titulo,descripcion,nivel_validacion,tipo_documento_sugerido,categoria_documento,alcance,orden,activo,version')
        .eq('activo', true)
        .in('nivel_validacion', ['DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL'])
        .order('nivel_validacion')
        .order('orden', { ascending: true })

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 10, // 10 minutos (config cambia poco)
  })

  // 3. Obtener documentos subidos del cliente
  const { data: documentosCliente = [] } = useQuery({
    queryKey: ['documentos-cliente-fuentes', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos_cliente')
        .select('id, tipo_documento, fuente_pago_relacionada, url_storage, estado')
        .eq('entidad_id', clienteId)
        .eq('estado', 'Activo')
        .not('fuente_pago_relacionada', 'is', null)

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 30, // 30 segundos
  })

  // 4. CALCULAR requisitos pendientes en tiempo real
  const fuentesConRequisitos = useQuery({
    queryKey: ['fuentes-requisitos-calculados', clienteId, fuentes, todosRequisitos, documentosCliente],
    queryFn: async () => {
      const resultado: FuenteConRequisitos[] = []

      for (const fuente of fuentes) {
        // Requisitos para este tipo de fuente
        const requisitosParaFuente = todosRequisitos.filter(
          (req) => (req as any).tipo_fuente_id === fuente.tipo_fuente_id
        )

        if (requisitosParaFuente.length === 0) {
          // Fuente sin requisitos (ej: Cuota Inicial)
          continue
        }

        const requisitosConEstado: DocumentoRequeridoFuente[] = requisitosParaFuente.map((req) => {
          // Buscar si existe documento subido para este requisito
          const documentoSubido = documentosCliente.find(
            (doc) =>
              doc.fuente_pago_relacionada === fuente.id &&
              doc.tipo_documento === (req as any).tipo_documento_sistema
          )

          return {
            id: req.id,
            fuente_pago_id: fuente.id,
            tipo_fuente: fuente.tipo,
            entidad: fuente.entidad || '',
            tipo_documento: req.titulo,
            nivel_validacion: req.nivel_validacion as 'DOCUMENTO_OBLIGATORIO' | 'DOCUMENTO_OPCIONAL',
            prioridad: req.nivel_validacion === 'DOCUMENTO_OBLIGATORIO' ? 'Alta' : 'Media',
            tiene_documento: !!documentoSubido,
            documento_id: documentoSubido?.id,
            documento_url: documentoSubido?.url_storage,
          }
        })

        const pendientes = requisitosConEstado.filter((r) => !r.tiene_documento)
        const completados = requisitosConEstado.filter((r) => r.tiene_documento)

        if (pendientes.length > 0) {
          resultado.push({
            fuenteId: fuente.id,
            tipo: fuente.tipo,
            entidad: fuente.entidad || '',
            requisitos: requisitosConEstado,
            pendientes,
            completados,
            totalObligatorios: requisitosConEstado.filter(
              (r) => r.nivel_validacion === 'DOCUMENTO_OBLIGATORIO'
            ).length,
            obligatoriosPendientes: pendientes.filter(
              (r) => r.nivel_validacion === 'DOCUMENTO_OBLIGATORIO'
            ).length,
          })
        }
      }

      return resultado
    },
    enabled: fuentes.length > 0 && todosRequisitos.length > 0,
  })

  return {
    fuentesConRequisitos: fuentesConRequisitos.data || [],
    isLoading: fuentesConRequisitos.isLoading,
    error: fuentesConRequisitos.error,
  }
}

/**
 * ============================================
 * HOOK: useBannerDocumentosPendientes
 * ============================================
 *
 * Lógica para cargar y gestionar documentos pendientes
 * vinculados a fuentes de pago sin carta de aprobación
 *
 * @version 1.0.0 - 2025-11-29
 */

import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================

export interface DocumentoPendiente {
  id: string
  fuente_pago_id: string
  tipo_documento: string
  categoria_id: string
  metadata: {
    tipo_fuente: string
    entidad?: string
    monto_aprobado?: number
    // ✅ Datos para título inteligente
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
  const [documentosPendientes, setDocumentosPendientes] = useState<DocumentoPendiente[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar documentos pendientes con datos de vivienda y cliente
  const fetchDocumentosPendientes = useCallback(async () => {
    try {
      setLoading(true)

      // ✅ JOIN con fuentes_pago → negociaciones → viviendas + clientes
      const { data, error } = await supabase
        .from('documentos_pendientes')
        .select(`
          *,
          fuentes_pago:fuente_pago_id (
            negociacion_id,
            negociaciones:negociacion_id (
              vivienda_id,
              cliente_id,
              viviendas:vivienda_id (
                numero,
                manzanas:manzana_id (
                  nombre
                )
              ),
              clientes:cliente_id (
                nombre_completo
              )
            )
          )
        `)
        .eq('cliente_id', clienteId)
        .eq('estado', 'Pendiente')
        .order('prioridad', { ascending: false })
        .order('fecha_creacion', { ascending: true })

      if (error) {
        console.error('Error cargando documentos pendientes:', error)
        return
      }

      // ✅ Enriquecer metadata con vivienda y cliente
      const documentosEnriquecidos = (data || []).map((doc: any) => {
        const negociacion = doc.fuentes_pago?.negociaciones
        const vivienda = negociacion?.viviendas
        const manzana = vivienda?.manzanas?.nombre || vivienda?.manzanas?.[0]?.nombre
        const cliente = negociacion?.clientes

        return {
          ...doc,
          metadata: {
            ...doc.metadata,
            vivienda: vivienda
              ? {
                  numero: vivienda.numero,
                  manzana: manzana || '',
                }
              : undefined,
            cliente: cliente
              ? {
                  nombre_completo: cliente.nombre_completo,
                }
              : undefined,
          },
        }
      })

      setDocumentosPendientes(documentosEnriquecidos)
    } catch (err) {
      console.error('Error en fetchDocumentosPendientes:', err)
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  // Cargar al montar
  useEffect(() => {
    fetchDocumentosPendientes()
  }, [fetchDocumentosPendientes])

  // Suscripción en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel(`documentos-pendientes-${clienteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documentos_pendientes',
          filter: `cliente_id=eq.${clienteId}`,
        },
        () => {
          fetchDocumentosPendientes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clienteId, fetchDocumentosPendientes])

  return {
    documentosPendientes,
    loading,
    refetch: fetchDocumentosPendientes,
  }
}

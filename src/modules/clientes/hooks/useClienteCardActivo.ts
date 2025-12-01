/**
 * Hook: useClienteCardActivo
 *
 * Gestiona la lógica de carga y cálculo de datos para el card de cliente activo.
 *
 * Responsabilidades:
 * - Cargar negociación activa del cliente desde Supabase
 * - Obtener datos de vivienda, proyecto y manzana
 * - Calcular totales y porcentajes de pago
 * - Procesar historial de abonos
 * - Cargar fuentes de pago configuradas
 * - Formatear datos para visualización
 *
 * ⚠️ Integrado con Supabase y tablas: negociaciones, viviendas, manzanas, proyectos, abonos_historial, fuentes_pago
 */

import { useEffect, useState } from 'react'

export interface FuentePagoCard {
  id: string
  tipo: string
  monto_aprobado: number
  monto_recibido: number
  porcentaje_completado: number
}

export interface DatosNegociacion {
  proyecto: string
  ubicacion: string // ✅ Ciudad/municipio del proyecto
  manzana: string
  numero: string
  valorTotal: number
  valorPagado: number
  saldoPendiente: number
  porcentaje: number
  ultimaCuota: Date | null
  totalAbonos: number
  fuentesPago: FuentePagoCard[]
}

interface UseClienteCardActivoProps {
  clienteId: string
}

export function useClienteCardActivo({ clienteId }: UseClienteCardActivoProps) {
  // =====================================================
  // ESTADO
  // =====================================================
  const [datosVivienda, setDatosVivienda] = useState<DatosNegociacion | null>(null)
  const [cargando, setCargando] = useState(true)

  // =====================================================
  // EFECTOS
  // =====================================================

  /**
   * Cargar datos de la negociación activa al montar o cambiar clienteId
   */
  useEffect(() => {
    cargarDatosNegociacion()
  }, [clienteId])

  // =====================================================
  // FUNCIONES DE LÓGICA
  // =====================================================

  /**
   * Cargar negociación activa del cliente con sus relaciones
   */
  const cargarDatosNegociacion = async () => {
    try {
      setCargando(true)
      // Importar dinámicamente para evitar problemas de SSR
      const { supabase } = await import('@/lib/supabase/client')

      // Obtener negociación activa del cliente con sus relaciones
      const { data: negociacion, error } = await supabase
        .from('negociaciones')
        .select(
          `
            id,
            valor_total,
            total_abonado,
            saldo_pendiente,
            porcentaje_pagado,
            viviendas!negociaciones_vivienda_id_fkey (
              numero,
              manzanas!viviendas_manzana_id_fkey (
                nombre,
                proyectos!manzanas_proyecto_id_fkey (
                  nombre,
                  ubicacion
                )
              )
            ),
            abonos_historial!abonos_historial_negociacion_id_fkey (
              fecha_abono
            )
          `
        )
        .eq('cliente_id', clienteId)
        .eq('estado', 'Activa')
        .order('fecha_negociacion', { ascending: false })
        .limit(1)
        .maybeSingle() // ✅ Permite 0 o 1 resultado sin error

      if (error) {
        console.error('❌ Error consultando negociación activa:', error)
        setDatosVivienda(null)
        return
      }

      if (!negociacion) {
        console.warn('⚠️ Cliente activo sin negociación encontrada')
        setDatosVivienda(null)
        return
      }

      // Obtener última fecha de abono
      const abonos = (negociacion.abonos_historial || []) as Array<{ fecha_abono: string }>
      const ultimaCuota =
        abonos.length > 0
          ? new Date(
              abonos.sort(
                (a, b) => new Date(b.fecha_abono).getTime() - new Date(a.fecha_abono).getTime()
              )[0].fecha_abono
            )
          : null

      // Obtener fuentes de pago de la negociación
      const { data: fuentes, error: errorFuentes } = await supabase
        .from('fuentes_pago')
        .select('id, tipo, monto_aprobado, monto_recibido, porcentaje_completado')
        .eq('negociacion_id', negociacion.id)
        .order('fecha_creacion', { ascending: true })

      if (errorFuentes) {
        console.error('⚠️ Error cargando fuentes de pago:', errorFuentes)
      }

      setDatosVivienda({
        proyecto: negociacion.viviendas?.manzanas?.proyectos?.nombre || 'Sin proyecto',
        ubicacion: negociacion.viviendas?.manzanas?.proyectos?.ubicacion || 'No especifica',
        manzana: negociacion.viviendas?.manzanas?.nombre || '-',
        numero: negociacion.viviendas?.numero || '-',
        valorTotal: negociacion.valor_total || 0,
        valorPagado: negociacion.total_abonado || 0,
        saldoPendiente: negociacion.saldo_pendiente || 0,
        porcentaje: Math.round(negociacion.porcentaje_pagado || 0),
        ultimaCuota,
        totalAbonos: abonos.length,
        fuentesPago: fuentes || [],
      })
    } catch (err) {
      console.error('Error cargando datos de negociación:', err)
      setDatosVivienda(null)
    } finally {
      setCargando(false)
    }
  }

  // =====================================================
  // VALORES COMPUTADOS
  // =====================================================

  // No necesario: saldoPendiente ya viene del hook

  // =====================================================
  // RETORNO
  // =====================================================

  return {
    // Estado
    datosVivienda,
    cargando,

    // Funciones
    cargarDatosNegociacion, // Por si se necesita refrescar manualmente
  }
}

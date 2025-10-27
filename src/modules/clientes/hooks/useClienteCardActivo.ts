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
 * - Formatear datos para visualización
 *
 * ⚠️ Integrado con Supabase y tablas: negociaciones, viviendas, manzanas, proyectos, abonos_historial
 */

import { useEffect, useState } from 'react'

export interface DatosNegociacion {
  proyecto: string
  manzana: string
  numero: string
  valorTotal: number
  valorPagado: number
  porcentaje: number
  ultimaCuota: Date | null
  totalAbonos: number
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
      const { supabase } = await import('@/lib/supabase/client-browser')

      // Obtener negociación activa del cliente con sus relaciones
      const { data: negociacion, error } = await supabase
        .from('negociaciones')
        .select(
          `
            id,
            valor_total,
            total_abonado,
            porcentaje_pagado,
            viviendas!negociaciones_vivienda_id_fkey (
              numero,
              manzanas!viviendas_manzana_id_fkey (
                nombre,
                proyectos!manzanas_proyecto_id_fkey (
                  nombre
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

      setDatosVivienda({
        proyecto: negociacion.viviendas?.manzanas?.proyectos?.nombre || 'Sin proyecto',
        manzana: negociacion.viviendas?.manzanas?.nombre || '-',
        numero: negociacion.viviendas?.numero || '-',
        valorTotal: negociacion.valor_total || 0,
        valorPagado: negociacion.total_abonado || 0,
        porcentaje: Math.round(negociacion.porcentaje_pagado || 0),
        ultimaCuota,
        totalAbonos: abonos.length,
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

  const valorRestante = datosVivienda ? datosVivienda.valorTotal - datosVivienda.valorPagado : 0

  // =====================================================
  // RETORNO
  // =====================================================

  return {
    // Estado
    datosVivienda,
    cargando,

    // Valores computados
    valorRestante,

    // Funciones
    cargarDatosNegociacion, // Por si se necesita refrescar manualmente
  }
}

/**
 * ============================================
 * HOOK: useGenerarReportePDF
 * ============================================
 *
 * ✅ Lógica de negocio para generar reportes PDF
 * Preparar datos y ejecutar service
 *
 * Features:
 * - Transformación de datos al formato del PDF
 * - Manejo de estados (loading, success, error)
 * - Toast notifications
 * - Type-safe con TypeScript
 *
 * @version 1.0.0 - 2025-01-27
 */

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { formatDateShort } from '@/lib/utils/date.utils'
import type { Cliente } from '@/modules/clientes/types'

import { generarReportePDF, type DatosReportePDF } from '../services/pdf-negociacion.service'

// ============================================
// TYPES
// ============================================

interface Negociacion {
  id: string
  valor_negociado: number
  descuento_aplicado?: number
  estado: string
  fecha_inicio?: string
  proyecto?: {
    nombre: string
  }
  vivienda?: {
    manzana?: { codigo: string }
    numero_vivienda: string
    tipo?: string
  }
}

interface FuentePago {
  tipo: string
  monto: number
  entidad?: string
  numero_referencia?: string
  monto_recibido?: number
}

interface Abono {
  id: string
  monto: number
  fecha_abono: string
  metodo_pago?: string
  numero_recibo?: string
}

interface UseGenerarReportePDFProps {
  cliente: Cliente
  negociacion: Negociacion
  fuentesPago: FuentePago[]
  abonos: Abono[]
  totales: {
    totalAbonado: number
    saldoPendiente: number
  }
  diasDesdeUltimoAbono?: number | null
  generadoPor?: string
}

// ============================================
// HOOK
// ============================================

export function useGenerarReportePDF() {
  const [isGenerating, setIsGenerating] = useState(false)

  /**
   * Generar reporte PDF
   */
  const generarReporte = useCallback(
    async (props: UseGenerarReportePDFProps) => {
      const { cliente, negociacion, fuentesPago, abonos, totales, diasDesdeUltimoAbono, generadoPor } = props

      setIsGenerating(true)

      try {
        // Calcular valores
        const valorBase = negociacion.valor_negociado || 0
        const descuento = negociacion.descuento_aplicado || 0
        const valorFinal = valorBase - descuento
        const porcentajePagado = valorFinal > 0 ? (totales.totalAbonado / valorFinal) * 100 : 0

        // Transformar datos al formato del service
        const datosPDF: DatosReportePDF = {
          cliente: {
            nombres: cliente.nombres || '',
            apellidos: cliente.apellidos || '',
            cedula: `${cliente.tipo_documento}-${cliente.numero_documento}` || 'N/A',
            telefono: cliente.telefono || undefined,
            email: cliente.email || undefined,
          },
          vivienda: {
            proyecto: negociacion.proyecto?.nombre || 'Sin proyecto',
            manzana: negociacion.vivienda?.manzana?.codigo || undefined,
            numeroVivienda: negociacion.vivienda?.numero_vivienda || 'N/A',
            tipo: negociacion.vivienda?.tipo || undefined,
          },
          negociacion: {
            valorBase,
            descuento,
            valorFinal,
            totalPagado: totales.totalAbonado,
            saldoPendiente: totales.saldoPendiente,
            porcentajePagado,
            estado: negociacion.estado,
            fechaInicio: negociacion.fecha_inicio ? formatDateShort(negociacion.fecha_inicio) : undefined,
            diasDesdeUltimoAbono,
          },
          fuentesPago: fuentesPago.map((f) => ({
            tipo: f.tipo,
            monto: f.monto,
            entidad: f.entidad,
            referencia: f.numero_referencia,
            montoRecibido: f.monto_recibido || 0,
            porcentajePagado: f.monto > 0 ? ((f.monto_recibido || 0) / f.monto) * 100 : 0,
          })),
          abonos: abonos.map((a) => ({
            fecha: formatDateShort(a.fecha_abono),
            fuente: 'N/A', // TODO: agregar relación fuente en abono
            monto: a.monto,
            metodoPago: a.metodo_pago,
            numeroRecibo: a.numero_recibo,
          })),
          generadoPor,
        }

        // Llamar al service para generar el PDF
        await generarReportePDF(datosPDF)

        toast.success('Reporte generado exitosamente', {
          description: 'El PDF se ha descargado automáticamente',
        })
      } catch (error) {
        console.error('❌ Error generando reporte PDF:', error)
        toast.error('Error al generar reporte', {
          description: 'Ocurrió un error al crear el archivo PDF',
        })
      } finally {
        setIsGenerating(false)
      }
    },
    []
  )

  return {
    generarReporte,
    isGenerating,
  }
}

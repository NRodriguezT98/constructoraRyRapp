/**
 * ============================================
 * HOOK: useViviendaAsignadaTab
 * ============================================
 *
 * ✅ TODA LA LÓGICA DE NEGOCIO
 * Hook principal con toda la lógica del tab de Vivienda Asignada.
 *
 * SEPARACIÓN ESTRICTA:
 * - Hook: Lógica + Estado + Queries + Handlers
 * - Componente: SOLO UI presentacional
 *
 * @version 1.0.0 - 2025-12-11
 */

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { construirURLCliente } from '@/lib/utils/slug.utils'
import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'
import {
    useGenerarReportePDF
} from '@/modules/clientes/hooks'
import {
    useNegociacionDetalle,
    useNegociacionesQuery,
    type NegociacionConValores,
} from '@/modules/clientes/hooks/useNegociacionesQuery'
import type { Cliente } from '@/modules/clientes/types'

import { useEditarFuentesPago } from './useEditarFuentesPago'

// ============================================
// TYPES
// ============================================

interface UseViviendaAsignadaTabProps {
  cliente: Cliente
}

// ============================================
// HOOK
// ============================================

export function useViviendaAsignadaTab({ cliente }: UseViviendaAsignadaTabProps) {
  const router = useRouter()

  // =====================================================
  // REACT QUERY: Lista de negociaciones
  // =====================================================

  const { negociaciones, isLoading, stats, invalidarNegociaciones } = useNegociacionesQuery({
    clienteId: cliente.id,
  })

  // =====================================================
  // VALIDACIÓN: Documento de identidad
  // =====================================================

  const { tieneCedula: tieneDocumentoFisico, cargando: cargandoDoc } = useDocumentoIdentidad({
    clienteId: cliente.id
  })

  // =====================================================
  // ESTADO LOCAL: UI y modales
  // =====================================================

  const [viviendaActiva, setViviendaActiva] = useState<NegociacionConValores | null>(null)
  const [showHistorial, setShowHistorial] = useState(false)
  const [viviendaSeleccionadaId, setViviendaSeleccionadaId] = useState<string | null>(null)

  // Modal de subir carta
  const [modalSubirCartaOpen, setModalSubirCartaOpen] = useState(false)
  const [fuenteParaCarta, setFuenteParaCarta] = useState<{
    id: string
    tipo: string
    entidad?: string
    monto_aprobado: number
    vivienda?: { numero: string; manzana: string }
    cliente?: { nombre_completo: string }
  } | null>(null)

  // Modal de marcar paso completado
  const [modalMarcarPasoOpen, setModalMarcarPasoOpen] = useState(false)
  const [pasoSeleccionado, setPasoSeleccionado] = useState<Record<string, unknown> | null>(null)

  // =====================================================
  // REACT QUERY: Detalle de vivienda activa
  // =====================================================

  const {
    fuentesPago,
    abonos,
    totales,
    diasDesdeUltimoAbono,
    isLoading: isLoadingDetalle,
  } = useNegociacionDetalle({
    negociacionId: viviendaActiva?.id || null,
    enabled: !!viviendaActiva,
  })

  // =====================================================
  // HOOKS: PDF y Edición
  // =====================================================

  const { generarReporte, isGenerating } = useGenerarReportePDF()

  const {
    isModalOpen: isEditarFuentesOpen,
    abrirModal: abrirEditarFuentes,
    cerrarModal: cerrarEditarFuentes,
    guardarFuentes,
  } = useEditarFuentesPago({
    negociacionId: viviendaActiva?.id || '',
  })

  // =====================================================
  // HANDLERS: Navegación y vistas
  // =====================================================

  const verDetalleVivienda = (vivienda: NegociacionConValores) => {
    setViviendaActiva(vivienda)
  }

  const volverALista = () => {
    setViviendaActiva(null)
  }

  const abrirHistorial = (viviendaId: string) => {
    setViviendaSeleccionadaId(viviendaId)
    setShowHistorial(true)
  }

  const cerrarHistorial = () => {
    setShowHistorial(false)
    setViviendaSeleccionadaId(null)
  }

  const handleGenerarPDF = async () => {
    if (!viviendaActiva) return

    try {
      await generarReporte({
        cliente,
        negociacion: viviendaActiva as any,
        fuentesPago,
        abonos,
        totales,
      })
    } catch (error) {
      console.error('Error generando PDF:', error)
    }
  }

  // =====================================================
  // HANDLERS: Modal de carta de aprobación
  // =====================================================

  const abrirModalSubirCarta = (fuenteId: string) => {
    const fuente = fuentesPago.find(f => f.id === fuenteId)
    if (!fuente) return

    const datosParaModal = {
      id: fuente.id,
      tipo: fuente.tipo,
      entidad: fuente.entidad,
      monto_aprobado: fuente.monto,
      vivienda: viviendaActiva?.vivienda
        ? {
            numero: viviendaActiva.vivienda.numero || 'â€”',
            manzana: viviendaActiva.vivienda.manzanas?.nombre || '',
          }
        : undefined,
      cliente: {
        nombre_completo:
          cliente.nombre_completo || `${cliente.nombres} ${cliente.apellidos}`,
      },
    }

    setFuenteParaCarta(datosParaModal)
    setModalSubirCartaOpen(true)
  }

  const cerrarModalSubirCarta = () => {
    setModalSubirCartaOpen(false)
    setFuenteParaCarta(null)
  }

  const handleSuccessSubirCarta = () => {
    invalidarNegociaciones()
  }

  // =====================================================
  // HANDLERS: Modal de marcar paso completado
  // =====================================================

  const abrirModalMarcarPaso = (paso: Record<string, unknown>) => {
    setPasoSeleccionado(paso)
    setModalMarcarPasoOpen(true)
  }

  const cerrarModalMarcarPaso = () => {
    setModalMarcarPasoOpen(false)
    setPasoSeleccionado(null)
  }

  const handleConfirmarPaso = async (datos: { fecha_completado: string; documento_id?: string; observaciones?: string }) => {
    try {
      // TODO: Llamar mutation para marcar paso
      alert('✅ Paso marcado como completado')
      cerrarModalMarcarPaso()
      invalidarNegociaciones()
    } catch (error) {
      console.error('Error marcando paso:', error)
      alert('❌ Error al marcar paso')
    }
  }

  // =====================================================
  // HANDLERS: Navegación externa
  // =====================================================

  const navegarAAsignarVivienda = () => {
    const clienteSlug = construirURLCliente({
      id: cliente.id,
      nombre_completo: cliente.nombre_completo,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
    })
      .split('/')
      .pop()

    const nombreCliente = cliente.nombre_completo || cliente.nombres || ''
    router.push(
      `/clientes/${clienteSlug}/asignar-vivienda?nombre=${encodeURIComponent(nombreCliente)}` as any
    )
  }

  const navegarARegistrarAbono = (viviendaId: string) => {
    const nombreCliente = cliente.nombre_completo || cliente.nombres || ''
    router.push(
      `/abonos?cliente_id=${cliente.id}&negociacion_id=${viviendaId}&cliente_nombre=${encodeURIComponent(nombreCliente)}` as any
    )
  }

  // =====================================================
  // RETURN: Estado y handlers
  // =====================================================

  return {
    // Estado de datos
    viviendas: negociaciones,
    viviendaActiva,
    isLoading,
    isLoadingDetalle,
    stats,

    // Detalle de vivienda activa
    fuentesPago,
    abonos,
    totales,
    diasDesdeUltimoAbono,

    // Modal de historial
    showHistorial,
    viviendaSeleccionadaId,

    // Modal de carta
    modalSubirCartaOpen,
    fuenteParaCarta,

    // Modal de marcar paso
    modalMarcarPasoOpen,
    pasoSeleccionado,

    // Modal de editar fuentes
    isEditarFuentesOpen,

    // PDF
    isGenerating,

    // Handlers - Navegación
    verDetalleVivienda,
    volverALista,
    navegarAAsignarVivienda,
    navegarARegistrarAbono,

    // Handlers - Modales
    abrirHistorial,
    cerrarHistorial,
    abrirModalSubirCarta,
    cerrarModalSubirCarta,
    handleSuccessSubirCarta,
    abrirModalMarcarPaso,
    cerrarModalMarcarPaso,
    handleConfirmarPaso,

    // Handlers - Acciones
    handleGenerarPDF,
    abrirEditarFuentes,
    cerrarEditarFuentes,
    guardarFuentes,
  }
}

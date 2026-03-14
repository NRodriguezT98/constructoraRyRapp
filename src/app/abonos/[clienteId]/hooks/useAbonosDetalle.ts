import { useEffect, useMemo, useState } from 'react'

import { useAbonos } from '@/modules/abonos/hooks'
import { obtenerHistorialAbonos } from '@/modules/abonos/services/abonos.service'
import type { AbonoHistorial, FuentePagoConAbonos } from '@/modules/abonos/types'
import { useDocumentosPendientesObligatorios } from '@/modules/clientes/hooks/useDocumentosPendientesObligatorios'
import { filtrarPendientesPorFuente } from '@/modules/clientes/utils/documentos-pendientes.utils'

/**
 * Hook personalizado para la lógica de negocio del detalle de abonos
 * Maneja: carga de datos, estado del modal, recargas, selección de fuente
 */
export function useAbonosDetalle(clienteId: string) {
  const { negociaciones, isLoading, refrescar } = useAbonos()

  // Estado local
  const [modalAbonoOpen, setModalAbonoOpen] = useState(false)
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState<FuentePagoConAbonos | null>(null)
  const [abonos, setAbonos] = useState<AbonoHistorial[]>([])
  const [loadingAbonos, setLoadingAbonos] = useState(false)

  // Documentos obligatorios pendientes — cache compartido vía React Query
  const { data: pendientesObligatorios = [] } = useDocumentosPendientesObligatorios(clienteId)

  // Buscar la negociación del cliente
  const negociacion = useMemo(
    () => negociaciones.find((n) => n.cliente.id === clienteId),
    [negociaciones, clienteId]
  )

  // Cargar historial de abonos cuando se obtiene la negociación
  useEffect(() => {
    async function cargarAbonos() {
      if (!negociacion?.id) return

      setLoadingAbonos(true)
      try {
        const historial = await obtenerHistorialAbonos({ negociacion_id: negociacion.id })
        setAbonos(historial)
      } catch (error) {
        console.error('Error cargando abonos:', error)
      } finally {
        setLoadingAbonos(false)
      }
    }

    cargarAbonos()
  }, [negociacion?.id])

  // Función para recargar todos los datos
  const recargarDatos = async () => {
    await refrescar()
    if (negociacion?.id) {
      setLoadingAbonos(true)
      try {
        const historial = await obtenerHistorialAbonos({ negociacion_id: negociacion.id })
        setAbonos(historial)
      } catch (error) {
        console.error('Error recargando abonos:', error)
      } finally {
        setLoadingAbonos(false)
      }
    }
  }

  // Handler para abrir modal con fuente específica
  const handleRegistrarAbono = (fuente: FuentePagoConAbonos) => {
    setFuenteSeleccionada(fuente)
    setModalAbonoOpen(true)
  }

  // Handler para cerrar modal
  const handleCerrarModal = () => {
    setModalAbonoOpen(false)
    setFuenteSeleccionada(null)
  }

  // Handler para éxito al registrar abono
  const handleAbonoRegistrado = async () => {
    await recargarDatos()
    handleCerrarModal()
  }

  // Métricas calculadas
  const metricas = useMemo(() => {
    if (!negociacion) return null

    return {
      valorTotal: negociacion.valor_total || 0,
      totalAbonado: negociacion.total_abonado || 0,
      saldoPendiente: negociacion.saldo_pendiente || 0,
      porcentajePagado: negociacion.porcentaje_pagado || 0,
    }
  }, [negociacion])

  // ✅ Validaciones de fuentes de pago
  const validarFuentePago = useMemo(() => {
    if (!negociacion?.fuentes_pago) return {}

    const validaciones: Record<string, {
      puedeRegistrarAbono: boolean
      estaCompletamentePagada: boolean
      razonBloqueo?: string
      documentosObligatoriosPendientes: number
      documentosPendientesNombres: string[]
    }> = {}

    negociacion.fuentes_pago.forEach((fuente) => {
      const saldoPendiente = fuente.saldo_pendiente || 0
      const estaCompletamentePagada = saldoPendiente === 0

      // Función pura: única fuente de verdad del filtro de pendientes por fuente
      const pendientesFuente = filtrarPendientesPorFuente(pendientesObligatorios, fuente.id, fuente.tipo)
      const documentosObligatoriosPendientes = pendientesFuente.length
      const documentosPendientesNombres = [...pendientesFuente]
        .sort((a, b) => {
          // Cartas de aprobación/asignación (ESPECIFICO_FUENTE) van primero
          // Boleta de Registro y docs compartidos (COMPARTIDO_CLIENTE) van al final
          if (a.alcance === 'ESPECIFICO_FUENTE' && b.alcance !== 'ESPECIFICO_FUENTE') return -1
          if (a.alcance !== 'ESPECIFICO_FUENTE' && b.alcance === 'ESPECIFICO_FUENTE') return 1
          return 0
        })
        .map(d => d.tipo_documento || d.tipo_documento_sistema || '')
        .filter(Boolean)

      // Validar si puede registrar abono
      let puedeRegistrarAbono = true
      let razonBloqueo: string | undefined

      // 1. Documentos obligatorios pendientes (máxima prioridad de bloqueo)
      if (documentosObligatoriosPendientes > 0) {
        puedeRegistrarAbono = false
        razonBloqueo =
          `Tiene ${documentosObligatoriosPendientes} documento${documentosObligatoriosPendientes > 1 ? 's' : ''} obligatorio${documentosObligatoriosPendientes > 1 ? 's' : ''} pendiente${documentosObligatoriosPendientes > 1 ? 's' : ''} de aportar`
      }
      // 2. Fuente completamente pagada
      else if (estaCompletamentePagada) {
        puedeRegistrarAbono = false
        razonBloqueo = 'Fuente de pago completamente pagada'
      }
      // 3. Negociación cancelada o en renuncia
      else if (negociacion.estado === 'Cancelada') {
        puedeRegistrarAbono = false
        razonBloqueo = 'Negociación cancelada'
      }
      else if (negociacion.estado === 'Renuncia') {
        puedeRegistrarAbono = false
        razonBloqueo = 'Cliente en proceso de renuncia'
      }
      // 4. Negociación completada
      else if (negociacion.estado === 'Completada') {
        puedeRegistrarAbono = false
        razonBloqueo = 'Negociación completada'
      }

      validaciones[fuente.id] = {
        puedeRegistrarAbono,
        estaCompletamentePagada,
        razonBloqueo,
        documentosObligatoriosPendientes,
        documentosPendientesNombres,
      }
    })

    return validaciones
  }, [negociacion, pendientesObligatorios])

  return {
    // Datos
    negociacion,
    abonos,
    metricas,
    fuenteSeleccionada,

    // Estados de carga
    isLoading,
    loadingAbonos,

    // Estado del modal
    modalAbonoOpen,

    // Validaciones
    validarFuentePago,

    // Handlers
    handleRegistrarAbono,
    handleCerrarModal,
    handleAbonoRegistrado,
    recargarDatos,
  }
}

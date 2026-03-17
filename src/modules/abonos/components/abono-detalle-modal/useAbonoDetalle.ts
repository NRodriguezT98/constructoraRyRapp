'use client'

import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'

// ─── Tipo local compatible con AbonoConInfo de useAbonosList ─────────────────
export interface AbonoParaDetalle {
  id: string
  numero_recibo: number
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_referencia: string | null
  comprobante_url: string | null
  notas: string | null
  fecha_creacion: string
  negociacion: {
    id: string
    estado: 'Activa' | 'Suspendida' | 'Cerrada por Renuncia' | 'Completada'
  }
  cliente: {
    id: string
    nombres: string
    apellidos: string
    numero_documento: string
  }
  vivienda: {
    id: string
    numero: string
    manzana: { identificador: string }
  }
  proyecto: {
    id: string
    nombre: string
  }
  fuente_pago: {
    id: string
    tipo: string
  }
}

interface UseAbonoDetalleProps {
  abono: AbonoParaDetalle | null
  onAnulado?: () => void
}

export function useAbonoDetalle({ abono, onAnulado }: UseAbonoDetalleProps) {
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null)
  const [loadingComprobante, setLoadingComprobante] = useState(false)
  const [generandoRecibo, setGenerandoRecibo] = useState(false)
  const [anulandoAbono, setAnulandoAbono] = useState(false)
  const [showConfirmAnular, setShowConfirmAnular] = useState(false)
  const [errorAnular, setErrorAnular] = useState<string | null>(null)
  const [negociacionFinancials, setNegociacionFinancials] = useState<{
    valorTotal: number
    totalAbonado: number
    saldoPendiente: number
  } | null>(null)

  // Cargar datos financieros de la negociación cuando cambia el abono
  useEffect(() => {
    if (!abono?.negociacion.id) {
      setNegociacionFinancials(null)
      return
    }
    supabase
      .from('negociaciones')
      .select('valor_total, total_abonado, saldo_pendiente')
      .eq('id', abono.negociacion.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setNegociacionFinancials({
            valorTotal: data.valor_total ?? 0,
            totalAbonado: data.total_abonado ?? 0,
            saldoPendiente: data.saldo_pendiente ?? 0,
          })
        }
      })
  }, [abono?.negociacion.id])

  // Construir URL del comprobante cuando cambia el abono
  useEffect(() => {
    if (!abono?.comprobante_url) {
      setComprobanteUrl(null)
      return
    }
    setLoadingComprobante(true)
    // La API route /api/abonos/comprobante hace redirect 302 al signed URL
    setComprobanteUrl(
      `/api/abonos/comprobante?path=${encodeURIComponent(abono.comprobante_url)}`
    )
    setLoadingComprobante(false)
  }, [abono?.comprobante_url])

  // Descargar el comprobante original
  const handleDescargarComprobante = useCallback(() => {
    if (!abono?.comprobante_url) return
    const url = `/api/abonos/comprobante?path=${encodeURIComponent(abono.comprobante_url)}`
    const link = document.createElement('a')
    link.href = url
    link.download = `comprobante-${formatearNumeroRecibo(abono.numero_recibo)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [abono])

  // Generar y descargar el recibo PDF (lazy import para no aumentar bundle)
  const handleGenerarRecibo = useCallback(async () => {
    if (!abono) return
    setGenerandoRecibo(true)
    try {
      const { generarYDescargarRecibo } = await import(
        '../recibo-pdf/generarReciboPDF'
      )
      await generarYDescargarRecibo(abono, {
        valorTotal: negociacionFinancials?.valorTotal,
        totalAbonado: negociacionFinancials?.totalAbonado,
        saldoPendiente: negociacionFinancials?.saldoPendiente,
      })
    } catch {
      // Error silenciado — el usuario ve que el PDF no se generó
    } finally {
      setGenerandoRecibo(false)
    }
  }, [abono, negociacionFinancials])

  // Confirmar y ejecutar anulación
  const handleConfirmarAnular = useCallback(async () => {
    if (!abono) return
    setAnulandoAbono(true)
    setErrorAnular(null)
    try {
      const res = await fetch('/api/abonos/anular', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abonoId: abono.id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al anular el abono')
      }
      setShowConfirmAnular(false)
      onAnulado?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setErrorAnular(msg)
    } finally {
      setAnulandoAbono(false)
    }
  }, [abono, onAnulado])

  const esNegociacionActiva = abono?.negociacion.estado === 'Activa'
  const tieneComprobante = Boolean(abono?.comprobante_url)

  return {
    comprobanteUrl,
    loadingComprobante,
    tieneComprobante,
    esNegociacionActiva,
    generandoRecibo,
    anulandoAbono,
    showConfirmAnular,
    setShowConfirmAnular,
    errorAnular,
    handleDescargarComprobante,
    handleGenerarRecibo,
    handleConfirmarAnular,
  }
}

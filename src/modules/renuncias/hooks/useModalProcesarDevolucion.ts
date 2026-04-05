'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { getTodayDateString } from '@/lib/utils/date.utils'

import { METODOS_DEVOLUCION, type MetodoDevolucion } from '../types'

import { useProcesarDevolucion } from './useRenunciasQuery'

const CELEBRATION_DELAY_MS = 2000

export interface UseModalProcesarDevolucionProps {
  renunciaId: string
  onExitosa?: () => void
}

export function useModalProcesarDevolucion({
  renunciaId,
  onExitosa,
}: UseModalProcesarDevolucionProps) {
  // ── Mutation ───────────────────────────────────────────────────────────
  const procesarMutation = useProcesarDevolucion()

  // ── Formulario ─────────────────────────────────────────────────────────
  const [fechaDevolucion, setFechaDevolucion] = useState(getTodayDateString())
  const [metodoDevolucion, setMetodoDevolucion] = useState<MetodoDevolucion>(
    METODOS_DEVOLUCION[0]
  )
  const [numeroComprobante, setNumeroComprobante] = useState('')
  const [notasCierre, setNotasCierre] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)

  // ── Estado ─────────────────────────────────────────────────────────────
  const procesando = procesarMutation.isPending
  const [error, setError] = useState<string | null>(null)
  const [exitoso, setExitoso] = useState(false)

  // ── Timer auto-cierre ──────────────────────────────────────────────────
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current)
    }
  }, [])

  // ── Validaciones ───────────────────────────────────────────────────────
  const fechaValida = fechaDevolucion.trim().length > 0
  const formularioValido = fechaValida && !procesando

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleComprobanteChange = useCallback((file: File | null) => {
    setComprobante(file)
    setError(null)
  }, [])

  const handleConfirmar = useCallback(async () => {
    if (!formularioValido) return
    setError(null)

    try {
      await procesarMutation.mutateAsync({
        renunciaId,
        dto: {
          fecha_devolucion: fechaDevolucion,
          metodo_devolucion: metodoDevolucion,
          numero_comprobante: numeroComprobante.trim() || undefined,
          notas_cierre: notasCierre.trim() || undefined,
        },
        comprobante: comprobante ?? undefined,
      })

      setExitoso(true)
      celebrationTimerRef.current = setTimeout(() => {
        onExitosa?.()
      }, CELEBRATION_DELAY_MS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }, [
    formularioValido,
    renunciaId,
    fechaDevolucion,
    metodoDevolucion,
    numeroComprobante,
    notasCierre,
    comprobante,
    procesarMutation,
    onExitosa,
  ])

  return {
    // Formulario
    fechaDevolucion,
    setFechaDevolucion,
    metodoDevolucion,
    setMetodoDevolucion,
    numeroComprobante,
    setNumeroComprobante,
    notasCierre,
    setNotasCierre,
    comprobante,
    handleComprobanteChange,
    // Validación
    formularioValido,
    // Estado
    procesando,
    error,
    exitoso,
    handleConfirmar,
    // Constantes
    metodosDisponibles: METODOS_DEVOLUCION,
  }
}

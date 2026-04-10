'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { getTodayDateString } from '@/lib/utils/date.utils'

import { METODOS_DEVOLUCION, type MetodoDevolucion } from '../types'

import { useProcesarDevolucion } from './useRenunciasQuery'

const CELEBRATION_DELAY_MS = 2000
const MAX_FILE_SIZE_MB = 10
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const VALID_FILE_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

export interface UseModalProcesarDevolucionProps {
  renunciaId: string
  /** Fecha mínima permitida para la devolución (YYYY-MM-DD). Igual a fecha_renuncia. */
  fechaRenuncia: string
  onExitosa?: () => void
}

export function useModalProcesarDevolucion({
  renunciaId,
  fechaRenuncia,
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

  // ── Validaciones de fecha ──────────────────────────────────────────────
  const fechaVacia = fechaDevolucion.trim().length === 0
  const fechaAnteriorARenuncia = !fechaVacia && fechaDevolucion < fechaRenuncia
  const fechaFutura = !fechaVacia && fechaDevolucion > getTodayDateString()
  const fechaValida = !fechaVacia && !fechaAnteriorARenuncia && !fechaFutura

  const fechaError: string | null = fechaAnteriorARenuncia
    ? 'La fecha no puede ser anterior al registro de la renuncia'
    : fechaFutura
      ? 'La fecha de devolución no puede ser en el futuro'
      : null

  const formularioValido = fechaValida && !!comprobante && !procesando

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleComprobanteChange = useCallback((file: File | null) => {
    if (file) {
      if (file.size > MAX_FILE_BYTES) {
        setError(`El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB`)
        return
      }
      if (!VALID_FILE_MIME_TYPES.includes(file.type)) {
        setError('Solo se permiten archivos PDF, PNG o JPG')
        return
      }
    }
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
        comprobante,
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
    fechaError,
    // Estado
    procesando,
    error,
    exitoso,
    handleConfirmar,
    // Constantes
    metodosDisponibles: METODOS_DEVOLUCION,
  }
}

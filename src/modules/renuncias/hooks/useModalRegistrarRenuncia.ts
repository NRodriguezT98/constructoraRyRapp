'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useRegistrarRenuncia, useValidarRenuncia } from './useRenunciasQuery'

const MOTIVO_MAX_CHARS = 500
const CELEBRATION_DELAY_MS = 3000

export interface UseModalRegistrarRenunciaProps {
  negociacionId: string
  onExitosa?: () => void
}

export function useModalRegistrarRenuncia({ negociacionId, onExitosa }: UseModalRegistrarRenunciaProps) {
  // ── Queries & mutations ────────────────────────────────────────────────
  const { data: validacion, isLoading: validando } = useValidarRenuncia(negociacionId)
  const registrarMutation = useRegistrarRenuncia()

  // ── Wizard ─────────────────────────────────────────────────────────────
  const [paso, setPaso] = useState(1)

  // ── Formulario ─────────────────────────────────────────────────────────
  const [motivo, setMotivo] = useState('')
  const [retencionMonto, setRetencionMonto] = useState(0)
  const [retencionMotivo, setRetencionMotivo] = useState('')
  const [textoConfirmacion, setTextoConfirmacion] = useState('')
  const [formularioRenuncia, setFormularioRenuncia] = useState<File | null>(null)

  // ── Estado ─────────────────────────────────────────────────────────────
  const registrando = registrarMutation.isPending
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
  const totalAbonado = validacion?.total_abonado ?? 0
  const montoADevolver = Math.max(0, totalAbonado - retencionMonto)

  const motivoValido = motivo.trim().length >= 10
  const retencionValida =
    retencionMonto === 0 || (retencionMonto > 0 && retencionMotivo.trim().length > 0)
  const retencionEnRango = retencionMonto >= 0 && retencionMonto <= totalAbonado

  const paso1Valido = motivoValido && retencionValida && retencionEnRango
  const paso2Valido = textoConfirmacion === 'CONFIRMAR'

  const puedeRegistrar = validacion?.puede_renunciar ?? false

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleMotivoChange = useCallback((valor: string) => {
    if (valor.length <= MOTIVO_MAX_CHARS) {
      setMotivo(valor)
      setError(null)
    }
  }, [])

  const handleRetencionMontoChange = useCallback(
    (valor: number) => {
      const montoSeguro = Math.max(0, Math.min(valor, totalAbonado))
      setRetencionMonto(montoSeguro)
      setError(null)
    },
    [totalAbonado]
  )

  const handleRetencionMotivoChange = useCallback((valor: string) => {
    setRetencionMotivo(valor)
    setError(null)
  }, [])

  const handleFormularioChange = useCallback((file: File | null) => {
    setFormularioRenuncia(file)
    setError(null)
  }, [])

  const irAPaso2 = useCallback(() => {
    if (paso1Valido) {
      setPaso(2)
      setTextoConfirmacion('')
    }
  }, [paso1Valido])

  const volverAPaso1 = useCallback(() => {
    setPaso(1)
    setTextoConfirmacion('')
  }, [])

  const handleConfirmar = useCallback(async () => {
    if (!paso2Valido || registrando) return
    setError(null)

    try {
      await registrarMutation.mutateAsync({
        dto: {
          negociacion_id: negociacionId,
          motivo: motivo.trim(),
          retencion_monto: retencionMonto > 0 ? retencionMonto : undefined,
          retencion_motivo: retencionMonto > 0 ? retencionMotivo.trim() : undefined,
        },
        formularioRenuncia: formularioRenuncia ?? undefined,
      })

      setExitoso(true)
      celebrationTimerRef.current = setTimeout(() => {
        onExitosa?.()
      }, CELEBRATION_DELAY_MS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }, [
    paso2Valido,
    registrando,
    negociacionId,
    motivo,
    retencionMonto,
    retencionMotivo,
    formularioRenuncia,
    registrarMutation,
    onExitosa,
  ])

  return {
    // Validación
    validacion,
    validando,
    puedeRegistrar,
    // Wizard
    paso,
    irAPaso2,
    volverAPaso1,
    // Formulario
    motivo,
    handleMotivoChange,
    motivoMaxChars: MOTIVO_MAX_CHARS,
    retencionMonto,
    handleRetencionMontoChange,
    retencionMotivo,
    handleRetencionMotivoChange,
    formularioRenuncia,
    handleFormularioChange,
    textoConfirmacion,
    setTextoConfirmacion,
    // Calculados
    totalAbonado,
    montoADevolver,
    // Validaciones paso
    motivoValido,
    retencionValida,
    retencionEnRango,
    paso1Valido,
    paso2Valido,
    // Estado
    registrando,
    error,
    exitoso,
    handleConfirmar,
  }
}

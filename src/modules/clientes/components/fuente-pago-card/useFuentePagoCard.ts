/**
 * Hook: useFuentePagoCard
 *
 * ✅ REFACTORIZADO: Simplificado sin lógica de upload
 * Maneja SOLO la lógica del componente FuentePagoCard:
 * - Estado enabled/disabled
 * - Cambios en configuración (monto, entidad, referencia)
 * - Validación de campos
 *
 * Upload delegado a DocumentoUploadCompact (componente genérico)
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import type { TipoFuentePago } from '@/modules/clientes/types'
import type { FuentePagoConfig } from '../asignar-vivienda/types'

interface UseFuentePagoCardProps {
  tipo: TipoFuentePago
  config: FuentePagoConfig | null
  obligatorio?: boolean
  enabledProp?: boolean
  onEnabledChange?: (enabled: boolean) => void
  onChange: (config: FuentePagoConfig | null) => void
}

export function useFuentePagoCard({
  tipo,
  config,
  obligatorio = false,
  enabledProp,
  onEnabledChange,
  onChange,
}: UseFuentePagoCardProps) {
  const [enabled, setEnabled] = useState(enabledProp ?? obligatorio)

  // ✅ Sincronizar estado cuando enabledProp cambia desde el padre
  useEffect(() => {
    if (enabledProp !== undefined) {
      console.log(`🔄 [${tipo}] Sincronizando enabled: ${enabledProp}`)
      setEnabled(enabledProp)
    }
  }, [enabledProp, tipo])

  // ============================================
  // HANDLERS
  // ============================================

  const handleEnabledChange = useCallback((newEnabled: boolean) => {
    setEnabled(newEnabled)
    onEnabledChange?.(newEnabled)

    if (!newEnabled) {
      onChange(null)
    } else {
      onChange({
        tipo,
        monto_aprobado: 0,
        entidad: '',
        numero_referencia: '',
      })
    }
  }, [tipo, onChange, onEnabledChange])

  const handleMontoChange = useCallback((value: string) => {
    const numero = Number(value.replace(/\./g, '').replace(/,/g, ''))
    if (!isNaN(numero) && config) {
      onChange({
        ...config,
        monto_aprobado: numero,
      })
    }
  }, [config, onChange])

  const handleEntidadChange = useCallback((value: string) => {
    if (config) {
      onChange({
        ...config,
        entidad: value,
      })
    }
  }, [config, onChange])

  const handleReferenciaChange = useCallback((value: string) => {
    if (config) {
      onChange({
        ...config,
        numero_referencia: value,
      })
    }
  }, [config, onChange])

  const handleRemoveDocument = useCallback(() => {
    if (config) {
      onChange({
        ...config,
        carta_aprobacion_url: undefined,
      })
    }
  }, [config, onChange])

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    enabled,
    tieneDocumento: !!config?.carta_aprobacion_url,

    // Handlers
    handleEnabledChange,
    handleMontoChange,
    handleEntidadChange,
    handleReferenciaChange,
    handleRemoveDocument,
  }
}

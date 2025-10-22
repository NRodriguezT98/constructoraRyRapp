/**
 * Componente: Footer con botones de navegación - REDISEÑADO
 * UI presentacional pura con diseño minimalista
 */

'use client'

import type { StepNumber } from '@/modules/clientes/components/modals/modal-crear-negociacion/types'
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Loader2,
    X
} from 'lucide-react'
import { pageStyles } from '../styles'

interface FooterNegociacionProps {
  currentStep: StepNumber
  paso1Valido: boolean
  paso2Valido: boolean
  creando: boolean
  onBack: () => void
  onNext: () => void
  onCancel: () => void
  onSubmit: () => void
}

export function FooterNegociacion({
  currentStep,
  paso1Valido,
  paso2Valido,
  creando,
  onBack,
  onNext,
  onCancel,
  onSubmit,
}: FooterNegociacionProps) {
  const isStepValid = currentStep === 1 ? paso1Valido : paso2Valido

  return (
    <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
      {/* Botón izquierdo */}
      {currentStep === 1 ? (
        <button
          type="button"
          onClick={onCancel}
          className={pageStyles.button.ghost}
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancelar</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className={pageStyles.button.secondary}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Anterior</span>
        </button>
      )}

      {/* Indicador de paso centrado */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Paso <span className="font-medium text-gray-900 dark:text-white">{currentStep}</span> de 3
      </div>

      {/* Botón derecho */}
      {currentStep < 3 ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!isStepValid}
          className={pageStyles.button.primary}
        >
          <span>Siguiente</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={creando}
          className={pageStyles.button.success}
        >
          {creando ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Creando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Crear Negociación</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

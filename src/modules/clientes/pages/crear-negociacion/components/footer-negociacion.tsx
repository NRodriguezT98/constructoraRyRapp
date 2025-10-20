/**
 * Componente: Footer con botones de navegación
 * UI presentacional pura
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
    <div className={pageStyles.card.footer}>
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        {/* Botón izquierdo */}
        <div className="flex-1">
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={onCancel}
              className={pageStyles.button.cancel}
            >
              <X className="h-6 w-6" />
              <span className="hidden sm:inline">Cancelar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className={pageStyles.button.back}
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          )}
        </div>

        {/* Indicador de paso (centrado y mejorado) */}
        <div className="flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl border-2 border-white/20">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {currentStep}
            </span>
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">
              de 3
            </span>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <span className="text-sm font-bold text-white/90 uppercase tracking-wide">
            Paso
          </span>
        </div>

        {/* Botón derecho */}
        <div className="flex-1 flex justify-end">
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={onNext}
              disabled={!isStepValid}
              className={pageStyles.button.next}
            >
              <span>Siguiente</span>
              <ArrowRight className="h-6 w-6" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={creando}
              className={pageStyles.button.submit}
            >
              {creando ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="hidden sm:inline">Creando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="hidden sm:inline">Crear Negociación</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

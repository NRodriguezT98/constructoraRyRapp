/**
 * Componente: Footer Premium con Botones de Gradiente
 * UI presentacional con botones premium Cyan→Blue
 */

'use client'

import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react'

import type { StepNumber } from '@/modules/clientes/components/asignar-vivienda/types'

import { pageStyles as s } from '../styles'

interface FooterAsignarViviendaProps {
  currentStep: StepNumber
  paso1Valido: boolean
  paso2Valido: boolean
  creando: boolean
  onBack: () => void
  onNext: () => void
  onCancel: () => void
  onSubmit: () => void
}

export function FooterAsignarVivienda({
  currentStep,
  paso1Valido,
  paso2Valido,
  creando,
  onBack,
  onNext,
  onCancel,
  onSubmit,
}: FooterAsignarViviendaProps) {
  const isStepValid = currentStep === 1 ? paso1Valido : paso2Valido

  return (
    <div className={s.footer.container}>
      {/* Botón izquierdo */}
      <div className={s.footer.actions}>
        {currentStep === 1 ? (
          <button type="button" onClick={onCancel} className={s.button.danger}>
            <X className="h-4 w-4" />
            <span>Cancelar</span>
          </button>
        ) : (
          <button type="button" onClick={onBack} className={s.button.secondary}>
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </button>
        )}
      </div>

      {/* Indicador de paso centrado */}
      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        Paso <span className="text-cyan-600 dark:text-cyan-400">{currentStep}</span> de 3
      </div>

      {/* Botón derecho */}
      <div className={s.footer.actions}>
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={onNext}
            className={s.button.primary}
          >
            <span>Siguiente</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={onSubmit} disabled={creando} className={s.button.success}>
            {creando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Asignando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Asignar Vivienda</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

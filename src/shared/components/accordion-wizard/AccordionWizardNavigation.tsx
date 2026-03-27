'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { getAccordionWizardStyles } from './accordion-wizard.styles'
import type { AccordionWizardNavigationProps } from './accordion-wizard.types'

/**
 * Barra Atrás / Dots / Siguiente dentro de cada sección activa.
 * Muestra spinner + "Verificando..." cuando isValidating=true.
 */
export function AccordionWizardNavigation({
  currentStep,
  totalSteps,
  isFirst,
  isLast,
  isSubmitting,
  isValidating,
  moduleName,
  submitLabel = 'Crear',
  disableSubmit,
  disableSubmitMessage,
  onBack,
  onNext,
  onSubmit,
}: AccordionWizardNavigationProps) {
  const styles = getAccordionWizardStyles(moduleName)
  const busy = isSubmitting || isValidating

  return (
    <div className="space-y-3 pt-2">
      {/* Mensaje cuando submit está deshabilitado */}
      {isLast && disableSubmit && !busy ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 shadow-sm">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm font-medium">
            {disableSubmitMessage || 'No se han detectado cambios para guardar.'}
          </p>
        </div>
      ) : null}

      <div className={styles.navigation.container}>
      {/* Back */}
      {!isFirst ? (
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className={cn(styles.navigation.backButton, 'disabled:opacity-50')}
        >
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>
      ) : (
        <div />
      )}

      {/* Dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isCompleted = step < currentStep
          const isActive = step === currentStep

          return (
            <div
              key={step}
              className={cn(
                styles.navigation.dot,
                'h-2',
                isCompleted ? styles.navigation.dotCompleted : '',
                isActive ? styles.navigation.dotActive : '',
                !isCompleted && !isActive ? styles.navigation.dotPending : ''
              )}
            />
          )
        })}
      </div>

      {/* Next / Submit */}
      {isLast ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || disableSubmit}
          className={styles.navigation.submitButton}
          title={disableSubmit ? 'No se han detectado cambios' : undefined}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {submitLabel}
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={busy}
          className={styles.navigation.nextButton}
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
    </div>
  )
}

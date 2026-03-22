'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pencil } from 'lucide-react'
import { checkAppearAnim, progressBarTransition, sectionExpandAnim } from './accordion-wizard.animations'
import { getAccordionWizardStyles } from './accordion-wizard.styles'
import type { AccordionWizardSectionProps } from './accordion-wizard.types'
import { AccordionWizardSummary } from './AccordionWizardSummary'

/**
 * Sección del accordion con 3 estados visuales:
 * - completed: colapsada con resumen + botón Editar
 * - active: expandida con contenido + barra de progreso + descripción + ícono
 * - pending: colapsada, opaca, sin interacción
 */
export function AccordionWizardSection({
  status,
  stepNumber,
  title,
  description,
  icon: StepIcon,
  fieldCount,
  currentStep,
  totalSteps,
  progress,
  moduleName,
  summaryItems,
  onEdit,
  children,
}: AccordionWizardSectionProps) {
  const styles = getAccordionWizardStyles(moduleName)

  // ── Completed ──────────────────────────────────────────
  if (status === 'completed') {
    return (
      <motion.div
        className={styles.section.completed}
        onClick={onEdit}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onEdit?.()
        }}
        layout
      >
        <div className="flex items-center gap-3">
          {/* Check circle */}
          <motion.div
            className={styles.stepCircle.completed}
            initial={checkAppearAnim.initial}
            animate={checkAppearAnim.animate}
            transition={checkAppearAnim.transition}
          >
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          </motion.div>

          {/* Title + Summary */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </p>
            {summaryItems ? (
              <AccordionWizardSummary items={summaryItems} />
            ) : null}
          </div>

          {/* Edit button */}
          {onEdit ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className={styles.editButton}
              aria-label={`Editar ${title}`}
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </button>
          ) : null}
        </div>
      </motion.div>
    )
  }

  // ── Active ─────────────────────────────────────────────
  if (status === 'active') {
    return (
      <motion.div className={styles.section.active} layout>
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center gap-3">
          <div className={styles.stepCircle.active}>
            {StepIcon ? (
              <StepIcon className={`w-4 h-4 ${styles.stepNumber.active.replace('text-sm font-bold ', '')}`} />
            ) : (
              <span className={styles.stepNumber.active}>{stepNumber}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {currentStep != null && totalSteps != null ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Paso {currentStep} de {totalSteps}
                </p>
              ) : null}
              {fieldCount ? (
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  · {fieldCount.required} obligatorio{fieldCount.required !== 1 ? 's' : ''} · {fieldCount.optional} opcional{fieldCount.optional !== 1 ? 'es' : ''}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Description */}
        {description ? (
          <div className="px-6 pb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-800">
              💡 {description}
            </p>
          </div>
        ) : null}

        {/* Progress bar */}
        {progress != null ? (
          <div className={cn('mx-6', styles.progressBar.track)}>
            <motion.div
              className={styles.progressBar.fill}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              transition={progressBarTransition}
            />
          </div>
        ) : null}

        {/* Expandable content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`section-content-${stepNumber}`}
            initial={sectionExpandAnim.initial}
            animate={sectionExpandAnim.animate}
            exit={sectionExpandAnim.exit}
            transition={sectionExpandAnim.transition}
            className="px-6 pb-5"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }

  // ── Pending ────────────────────────────────────────────
  return (
    <motion.div className={styles.section.pending} layout>
      <div className="flex items-center gap-3">
        <div className={styles.stepCircle.pending}>
          {StepIcon ? (
            <StepIcon className={`w-4 h-4 ${styles.stepNumber.pending.replace('text-sm font-medium ', '')}`} />
          ) : (
            <span className={styles.stepNumber.pending}>{stepNumber}</span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
          {title}
        </p>
      </div>
    </motion.div>
  )
}

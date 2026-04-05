'use client'

import { motion } from 'framer-motion'

import { summaryAppearAnim } from './accordion-wizard.animations'
import type { SummaryItem } from './accordion-wizard.types'

interface AccordionWizardSummaryProps {
  items: SummaryItem[]
}

/**
 * Resumen compacto de una sección completada.
 * Muestra "valor1 · valor2 · valor3" en una línea.
 */
export function AccordionWizardSummary({ items }: AccordionWizardSummaryProps) {
  const visibleItems = items.filter(
    item => item.value != null && item.value !== ''
  )

  if (visibleItems.length === 0) return null

  return (
    <motion.p
      className='max-w-[85%] truncate text-sm text-gray-500 dark:text-gray-400'
      initial={summaryAppearAnim.initial}
      animate={summaryAppearAnim.animate}
      transition={summaryAppearAnim.transition}
    >
      {visibleItems.map((item, i) => (
        <span key={item.label}>
          {i > 0 ? (
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
          ) : null}
          {String(item.value)}
        </span>
      ))}
    </motion.p>
  )
}

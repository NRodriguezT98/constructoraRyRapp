'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronUp, Lock } from 'lucide-react'

import { styles as s } from '../styles'

// ─── Tipos ────────────────────────────────────────────────

type AccordionState = 'active' | 'completed' | 'locked'

interface AccordionSectionProps {
  /** 01 / 02 / 03 */
  number: string
  title: string
  state: AccordionState
  summary?: string // línea de resumen cuando está completado
  onHeaderClick?: () => void // solo funcional en 'completed'
  children?: React.ReactNode
}

// ─── Componente ───────────────────────────────────────────

export function AccordionSection({
  number,
  title,
  state,
  summary,
  onHeaderClick,
  children,
}: AccordionSectionProps) {
  const isOpen = state === 'active'

  if (state === 'locked') {
    return (
      <div className={s.accordion.locked.wrapper}>
        <div className={s.accordion.locked.header}>
          <div className='flex items-center'>
            <span className={s.accordion.locked.number}>{number}</span>
            <span className={s.accordion.locked.title}>{title}</span>
          </div>
          <Lock className={s.accordion.locked.lock} />
        </div>
      </div>
    )
  }

  if (state === 'completed') {
    return (
      <div
        className={s.accordion.completed.wrapper}
        onClick={onHeaderClick}
        role='button'
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onHeaderClick?.()}
        aria-expanded={false}
      >
        <div className={s.accordion.completed.header}>
          <Check className={`${s.accordion.completed.check} h-4 w-4`} />
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1'>
              <span className={s.accordion.completed.number}>{number}</span>
              <span className={s.accordion.completed.title}>{title}</span>
            </div>
            {summary && (
              <p className={s.accordion.completed.summary}>{summary}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Active
  return (
    <div className={s.accordion.active.wrapper}>
      <div className={s.accordion.active.header}>
        <div className='flex items-center'>
          <span className={s.accordion.active.number}>{number}</span>
          <span className={s.accordion.active.title}>{title}</span>
        </div>
        <ChevronUp className={s.accordion.active.chevron} />
      </div>

      <div className={s.accordion.active.divider} />

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key='content'
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className={s.accordion.active.content}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

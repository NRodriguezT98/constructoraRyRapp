'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import { errorShakeAnim } from './accordion-wizard.animations'
import { getAccordionWizardStyles } from './accordion-wizard.styles'
import type {
    AccordionWizardFieldProps,
    AccordionWizardSelectProps,
    AccordionWizardTextareaProps,
} from './accordion-wizard.types'

// ============================================================
// INPUT (Floating Label)
// ============================================================

export const AccordionWizardField = forwardRef<HTMLInputElement, AccordionWizardFieldProps>(
  function AccordionWizardField(
    { label, type = 'text', error, required, moduleName, className, ...rest },
    ref
  ) {
    const styles = getAccordionWizardStyles(moduleName)

    return (
      <motion.div
        className="relative"
        animate={error ? errorShakeAnim.animate : undefined}
        transition={error ? errorShakeAnim.transition : undefined}
      >
        <input
          ref={ref}
          type={type}
          placeholder=" "
          className={cn(
            'peer',
            styles.field.inputBase,
            styles.field.inputFocus,
            error ? styles.field.inputError : '',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${rest.id ?? rest.name}-error` : undefined}
          {...rest}
        />
        <label
          htmlFor={rest.id ?? rest.name}
          className={cn(
            'pointer-events-none absolute left-4 top-3.5 text-sm transition-all duration-200',
            'text-gray-400 dark:text-gray-500',
            'peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:font-medium',
            'peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium',
          )}
        >
          {label}
          {required ? <span className="text-red-400 ml-0.5">*</span> : null}
        </label>
        {error ? (
          <p
            id={`${rest.id ?? rest.name}-error`}
            className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        ) : null}
      </motion.div>
    )
  }
)

// ============================================================
// SELECT (Floating Label)
// ============================================================

export const AccordionWizardSelect = forwardRef<HTMLSelectElement, AccordionWizardSelectProps>(
  function AccordionWizardSelect(
    { label, error, required, moduleName, children, className, ...rest },
    ref
  ) {
    const styles = getAccordionWizardStyles(moduleName)

    return (
      <motion.div
        className="relative"
        animate={error ? errorShakeAnim.animate : undefined}
        transition={error ? errorShakeAnim.transition : undefined}
      >
        <select
          ref={ref}
          required={required}
          className={cn(
            'peer appearance-none',
            styles.field.inputBase,
            styles.field.inputFocus,
            error ? styles.field.inputError : '',
            'pt-5 pb-2',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        >
          <option value="" disabled hidden />
          {children}
        </select>
        <label
          htmlFor={rest.id ?? rest.name}
          className={cn(
            'pointer-events-none absolute left-4 top-1.5 text-[11px] font-medium transition-all duration-200',
            'text-gray-400 dark:text-gray-500',
            // When the select has a real value (valid), show module color
            // The select must have `required` attribute for :invalid/:valid to work
            styles.field.labelValid,
          )}
        >
          {label}
          {required ? <span className="text-red-400 ml-0.5">*</span> : null}
        </label>
        {/* Chevron */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        ) : null}
      </motion.div>
    )
  }
)

// ============================================================
// TEXTAREA (Floating Label)
// ============================================================

export const AccordionWizardTextarea = forwardRef<HTMLTextAreaElement, AccordionWizardTextareaProps>(
  function AccordionWizardTextarea(
    { label, error, required, moduleName, className, ...rest },
    ref
  ) {
    const styles = getAccordionWizardStyles(moduleName)

    return (
      <motion.div
        className="relative"
        animate={error ? errorShakeAnim.animate : undefined}
        transition={error ? errorShakeAnim.transition : undefined}
      >
        <textarea
          ref={ref}
          placeholder=" "
          rows={3}
          className={cn(
            'peer resize-none',
            styles.field.inputBase,
            styles.field.inputFocus,
            error ? styles.field.inputError : '',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        />
        <label
          htmlFor={rest.id ?? rest.name}
          className={cn(
            'pointer-events-none absolute left-4 top-3.5 text-sm transition-all duration-200',
            'text-gray-400 dark:text-gray-500',
            'peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:font-medium',
            'peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium',
          )}
        >
          {label}
          {required ? <span className="text-red-400 ml-0.5">*</span> : null}
        </label>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        ) : null}
      </motion.div>
    )
  }
)

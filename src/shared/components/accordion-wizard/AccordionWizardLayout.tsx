'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { pageEnterAnim } from './accordion-wizard.animations'
import { getAccordionWizardStyles } from './accordion-wizard.styles'
import type { AccordionWizardLayoutProps } from './accordion-wizard.types'
import { AccordionWizardSubmitOverlay } from './AccordionWizardSubmitOverlay'

/**
 * Layout wrapper para páginas de creación con accordion wizard.
 * Proporciona fondo con gradiente sutil, max-width, breadcrumbs,
 * y overlay de loading durante submit.
 */
export function AccordionWizardLayout({
  moduleName,
  breadcrumbs,
  children,
  isSubmitting,
  submitLoadingLabel,
}: AccordionWizardLayoutProps) {
  const styles = getAccordionWizardStyles(moduleName)

  return (
    <div className={styles.page.container}>
      <motion.div
        className={`${styles.page.content} relative`}
        initial={pageEnterAnim.initial}
        animate={pageEnterAnim.animate}
        transition={pageEnterAnim.transition}
      >
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs.container} aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <span key={crumb.label} className="flex items-center gap-2">
                {i > 0 ? (
                  <ChevronRight className={`w-4 h-4 ${styles.breadcrumbs.separator}`} />
                ) : null}
                {isLast || !crumb.href ? (
                  <span className={isLast ? styles.breadcrumbs.current : styles.breadcrumbs.link}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className={styles.breadcrumbs.link}>
                    {crumb.label}
                  </Link>
                )}
              </span>
            )
          })}
        </nav>

        {/* Wizard sections */}
        <div className="space-y-3">
          {children}
        </div>

        {/* Submit loading overlay */}
        <AccordionWizardSubmitOverlay
          isVisible={!!isSubmitting}
          moduleName={moduleName}
          label={submitLoadingLabel}
        />
      </motion.div>
    </div>
  )
}

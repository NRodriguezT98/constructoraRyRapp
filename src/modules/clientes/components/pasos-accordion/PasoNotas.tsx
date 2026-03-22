/**
 * PasoNotas — Paso 4: Notas adicionales del cliente
 * Campo: notas (textarea, opcional)
 */

'use client'

import { motion } from 'framer-motion'
import type { UseFormRegister } from 'react-hook-form'

import {
    AccordionWizardTextarea,
    fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'

interface PasoNotasProps {
  register: UseFormRegister<any>
}

export function PasoNotas({ register }: PasoNotasProps) {
  return (
    <div className="space-y-4">
      <motion.div {...fieldStaggerAnim(0)}>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Agrega cualquier observación o nota relevante sobre el cliente.
        </p>
      </motion.div>

      <motion.div {...fieldStaggerAnim(1)}>
        <AccordionWizardTextarea
          {...register('notas')}
          label="Notas y Observaciones"
          moduleName="clientes"
        />
      </motion.div>
    </div>
  )
}

/**
 * PasoNotas — Paso 4: Notas adicionales del cliente
 * Campo: notas (textarea, opcional)
 */

'use client'

import { motion } from 'framer-motion'
import type { Path, UseFormRegister } from 'react-hook-form'

import {
  AccordionWizardTextarea,
  fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'

import type { ClienteAccordionFormValues } from './cliente-accordion-form.types'

interface PasoNotasProps<TFormValues extends ClienteAccordionFormValues> {
  register: UseFormRegister<TFormValues>
}

export function PasoNotas<TFormValues extends ClienteAccordionFormValues>({
  register,
}: PasoNotasProps<TFormValues>) {
  const notasField = 'notas' as Path<TFormValues>

  return (
    <div className='space-y-4'>
      <motion.div {...fieldStaggerAnim(0)}>
        <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
          Agrega cualquier observación o nota relevante sobre el cliente.
        </p>
      </motion.div>

      <motion.div {...fieldStaggerAnim(1)}>
        <AccordionWizardTextarea
          {...register(notasField)}
          label='Notas y Observaciones'
          moduleName='clientes'
        />
      </motion.div>
    </div>
  )
}

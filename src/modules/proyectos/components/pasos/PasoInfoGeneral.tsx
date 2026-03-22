'use client'

import { AccordionWizardField, AccordionWizardTextarea, fieldStaggerAnim } from '@/shared/components/accordion-wizard'
import { motion } from 'framer-motion'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

interface PasoInfoGeneralProps {
  register: UseFormRegister<any>
  errors: FieldErrors
}

/**
 * Paso 1: Información General (nombre, ubicación, descripción)
 */
export function PasoInfoGeneral({ register, errors }: PasoInfoGeneralProps) {
  return (
    <div className="space-y-4 pt-4">
      <motion.div {...fieldStaggerAnim(0)}>
        <AccordionWizardField
          label="Nombre del proyecto"
          moduleName="proyectos"
          required
          error={errors.nombre?.message as string}
          {...register('nombre')}
        />
      </motion.div>

      <motion.div {...fieldStaggerAnim(1)}>
        <AccordionWizardField
          label="Ubicación"
          moduleName="proyectos"
          required
          error={errors.ubicacion?.message as string}
          {...register('ubicacion')}
        />
      </motion.div>

      <motion.div {...fieldStaggerAnim(2)}>
        <AccordionWizardTextarea
          label="Descripción"
          moduleName="proyectos"
          required
          error={errors.descripcion?.message as string}
          {...register('descripcion')}
        />
      </motion.div>
    </div>
  )
}

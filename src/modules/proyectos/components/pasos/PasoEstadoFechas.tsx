'use client'

import { AccordionWizardField, AccordionWizardSelect, fieldStaggerAnim } from '@/shared/components/accordion-wizard'
import { motion } from 'framer-motion'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

interface PasoEstadoFechasProps {
  register: UseFormRegister<any>
  errors: FieldErrors
  estadoLabels: Record<string, string>
}

/**
 * Paso 2: Estado y Fechas (estado, fecha inicio, fecha fin estimada)
 */
export function PasoEstadoFechas({ register, errors, estadoLabels }: PasoEstadoFechasProps) {
  return (
    <div className="space-y-4 pt-4">
      <motion.div {...fieldStaggerAnim(0)}>
        <AccordionWizardSelect
          label="Estado del proyecto"
          moduleName="proyectos"
          required
          error={errors.estado?.message as string}
          {...register('estado')}
        >
          {Object.entries(estadoLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </AccordionWizardSelect>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div {...fieldStaggerAnim(1)}>
          <AccordionWizardField
            label="Fecha de inicio"
            type="date"
            moduleName="proyectos"
            error={errors.fechaInicio?.message as string}
            {...register('fechaInicio')}
          />
        </motion.div>

        <motion.div {...fieldStaggerAnim(2)}>
          <AccordionWizardField
            label="Fecha fin estimada"
            type="date"
            moduleName="proyectos"
            error={errors.fechaFinEstimada?.message as string}
            {...register('fechaFinEstimada')}
          />
        </motion.div>
      </div>
    </div>
  )
}

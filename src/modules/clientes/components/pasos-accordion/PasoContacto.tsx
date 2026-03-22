/**
 * PasoContacto — Paso 2: Contacto y ubicación del cliente
 * Campos: telefono, email, direccion, departamento, ciudad
 * Cascading: departamento → ciudad (datos locales)
 */

'use client'

import { useEffect, useMemo } from 'react'

import { motion } from 'framer-motion'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

import {
    AccordionWizardField,
    AccordionWizardSelect,
    fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'
import { getCiudadesPorDepartamento, getDepartamentos } from '@/shared/data/colombia-locations'

interface PasoContactoProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
}

export function PasoContacto({ register, errors, watch, setValue }: PasoContactoProps) {
  const departamentos = useMemo(() => getDepartamentos(), [])
  const departamentoSeleccionado = watch('departamento')

  const ciudades = useMemo(() => {
    if (!departamentoSeleccionado) return []
    return getCiudadesPorDepartamento(departamentoSeleccionado)
  }, [departamentoSeleccionado])

  // Reset ciudad cuando cambia departamento
  useEffect(() => {
    if (departamentoSeleccionado) {
      const ciudadActual = watch('ciudad')
      if (ciudadActual && !getCiudadesPorDepartamento(departamentoSeleccionado).includes(ciudadActual)) {
        setValue('ciudad', '')
      }
    }
  }, [departamentoSeleccionado, setValue, watch])

  return (
    <div className="space-y-4">
      {/* Teléfono y Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div {...fieldStaggerAnim(0)}>
          <AccordionWizardField
            {...register('telefono')}
            label="Teléfono"
            type="tel"
            moduleName="clientes"
            error={errors.telefono?.message as string}
          />
        </motion.div>
        <motion.div {...fieldStaggerAnim(1)}>
          <AccordionWizardField
            {...register('email')}
            label="Correo Electrónico"
            type="email"
            moduleName="clientes"
            error={errors.email?.message as string}
          />
        </motion.div>
      </div>

      {/* Información de contacto adicional */}
      <motion.div {...fieldStaggerAnim(2)}>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Al menos teléfono o correo es requerido
        </p>
      </motion.div>

      {/* Teléfono alternativo y Dirección */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div {...fieldStaggerAnim(2)}>
          <AccordionWizardField
            {...register('telefono_alternativo')}
            label="Teléfono Alternativo"
            type="tel"
            moduleName="clientes"
          />
        </motion.div>
        <motion.div {...fieldStaggerAnim(3)}>
          <AccordionWizardField
            {...register('direccion')}
            label="Dirección"
            moduleName="clientes"
          />
        </motion.div>
      </div>

      {/* Departamento y Ciudad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div {...fieldStaggerAnim(4)}>
          <AccordionWizardSelect
            {...register('departamento')}
            label="Departamento"
            required
            moduleName="clientes"
            error={errors.departamento?.message as string}
          >
            {departamentos.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
        <motion.div {...fieldStaggerAnim(5)}>
          <AccordionWizardSelect
            {...register('ciudad')}
            label="Ciudad / Municipio"
            required
            moduleName="clientes"
            error={errors.ciudad?.message as string}
            disabled={!departamentoSeleccionado}
          >
            {ciudades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * PasoContacto — Paso 2: Contacto y ubicación del cliente
 * Campos: telefono, email, direccion, departamento, ciudad
 * Cascading: departamento → ciudad (datos locales)
 */

'use client'

import { useEffect, useMemo } from 'react'

import { motion } from 'framer-motion'
import type {
  FieldErrors,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import {
  AccordionWizardField,
  AccordionWizardSelect,
  fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'
import {
  getCiudadesPorDepartamento,
  getDepartamentos,
} from '@/shared/data/colombia-locations'

import type { ClienteAccordionFormValues } from './cliente-accordion-form.types'

interface PasoContactoProps<TFormValues extends ClienteAccordionFormValues> {
  register: UseFormRegister<TFormValues>
  errors: FieldErrors<TFormValues>
  watch: UseFormWatch<TFormValues>
  setValue: UseFormSetValue<TFormValues>
}

export function PasoContacto<TFormValues extends ClienteAccordionFormValues>({
  register,
  errors,
  watch,
  setValue,
}: PasoContactoProps<TFormValues>) {
  const telefonoField = 'telefono' as Path<TFormValues>
  const emailField = 'email' as Path<TFormValues>
  const telefonoAlternativoField = 'telefono_alternativo' as Path<TFormValues>
  const direccionField = 'direccion' as Path<TFormValues>
  const departamentoField = 'departamento' as Path<TFormValues>
  const ciudadField = 'ciudad' as Path<TFormValues>
  const departamentos = useMemo(() => getDepartamentos(), [])
  const departamentoSeleccionado =
    (watch(departamentoField) as string | undefined) ?? ''

  const ciudades = useMemo(() => {
    if (!departamentoSeleccionado) return []
    return getCiudadesPorDepartamento(departamentoSeleccionado)
  }, [departamentoSeleccionado])

  useEffect(() => {
    if (departamentoSeleccionado) {
      const ciudadActual = (watch(ciudadField) as string | undefined) ?? ''
      if (
        ciudadActual &&
        !getCiudadesPorDepartamento(departamentoSeleccionado).includes(
          ciudadActual
        )
      ) {
        setValue(ciudadField, '' as PathValue<TFormValues, typeof ciudadField>)
      }
    }
  }, [ciudadField, departamentoSeleccionado, setValue, watch])

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <motion.div {...fieldStaggerAnim(0)}>
          <AccordionWizardField
            {...register(telefonoField)}
            label='Teléfono'
            type='tel'
            moduleName='clientes'
            error={errors.telefono?.message as string}
          />
        </motion.div>
        <motion.div {...fieldStaggerAnim(1)}>
          <AccordionWizardField
            {...register(emailField)}
            label='Correo Electrónico'
            type='email'
            moduleName='clientes'
            error={errors.email?.message as string}
          />
        </motion.div>
      </div>

      <motion.div {...fieldStaggerAnim(2)}>
        <p className='mb-3 text-xs text-gray-500 dark:text-gray-400'>
          Al menos teléfono o correo es requerido
        </p>
      </motion.div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <motion.div {...fieldStaggerAnim(2)}>
          <AccordionWizardField
            {...register(telefonoAlternativoField)}
            label='Teléfono Alternativo'
            type='tel'
            moduleName='clientes'
          />
        </motion.div>
        <motion.div {...fieldStaggerAnim(3)}>
          <AccordionWizardField
            {...register(direccionField)}
            label='Dirección'
            moduleName='clientes'
          />
        </motion.div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <motion.div {...fieldStaggerAnim(4)}>
          <AccordionWizardSelect
            {...register(departamentoField)}
            label='Departamento'
            required
            moduleName='clientes'
            error={errors.departamento?.message as string}
          >
            {departamentos.map(departamento => (
              <option key={departamento} value={departamento}>
                {departamento}
              </option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
        <motion.div {...fieldStaggerAnim(5)}>
          <AccordionWizardSelect
            {...register(ciudadField)}
            label='Ciudad / Municipio'
            required
            moduleName='clientes'
            error={errors.ciudad?.message as string}
            disabled={!departamentoSeleccionado}
          >
            {ciudades.map(ciudad => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
      </div>
    </div>
  )
}

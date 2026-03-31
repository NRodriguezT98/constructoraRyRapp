'use client'

import { useEffect, useMemo, useRef } from 'react'

import { motion } from 'framer-motion'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

import { AccordionWizardField, AccordionWizardSelect, AccordionWizardTextarea, fieldStaggerAnim } from '@/shared/components/accordion-wizard'
import { getCiudadesPorDepartamento, getDepartamentos } from '@/shared/data/colombia-locations'

interface PasoInfoGeneralProps {
  register: UseFormRegister<any>
  errors: FieldErrors
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
}

/**
 * Paso 1: Información General (nombre, departamento, ciudad, dirección, descripción)
 */
export function PasoInfoGeneral({ register, errors, watch, setValue }: PasoInfoGeneralProps) {
  const departamentos = useMemo(() => getDepartamentos(), [])
  const departamentoSeleccionado = watch('departamento')

  const ciudades = useMemo(() => {
    if (!departamentoSeleccionado) return []
    return getCiudadesPorDepartamento(departamentoSeleccionado)
  }, [departamentoSeleccionado])

  // Reset ciudad cuando el USUARIO cambia departamento (no en carga inicial del formulario)
  const prevDepartamento = useRef(departamentoSeleccionado)

  useEffect(() => {
    if (
      departamentoSeleccionado &&
      prevDepartamento.current &&
      prevDepartamento.current !== departamentoSeleccionado
    ) {
      const ciudadActual = watch('ciudad')
      if (ciudadActual && !getCiudadesPorDepartamento(departamentoSeleccionado).includes(ciudadActual)) {
        setValue('ciudad', '')
      }
    }
    prevDepartamento.current = departamentoSeleccionado
  }, [departamentoSeleccionado, setValue, watch])

  // ✅ Re-sync: cuando las opciones de ciudad se renderizan en el DOM,
  // re-aplicar el valor interno de RHF al <select>.
  // Resuelve la race condition donde reset() setea ciudad antes de que las <option> existan.
  useEffect(() => {
    if (!ciudades.length) return
    const ciudadEnFormulario = watch('ciudad')
    if (ciudadEnFormulario && ciudades.includes(ciudadEnFormulario)) {
      setValue('ciudad', ciudadEnFormulario, { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciudades, setValue])

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

      {/* Departamento + Ciudad en fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div {...fieldStaggerAnim(1)}>
          <AccordionWizardSelect
            label="Departamento"
            moduleName="proyectos"
            required
            error={errors.departamento?.message as string}
            {...register('departamento')}
          >
            <option value="">Selecciona un departamento</option>
            {departamentos.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
        <motion.div {...fieldStaggerAnim(2)}>
          <AccordionWizardSelect
            label="Ciudad / Municipio"
            moduleName="proyectos"
            required
            error={errors.ciudad?.message as string}
            disabled={!departamentoSeleccionado}
            {...register('ciudad')}
          >
            <option value="">
              {departamentoSeleccionado ? 'Selecciona una ciudad' : 'Primero selecciona un departamento'}
            </option>
            {ciudades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
      </div>

      <motion.div {...fieldStaggerAnim(3)}>
        <AccordionWizardField
          label="Dirección"
          moduleName="proyectos"
          required
          placeholder="Ej: Calle 48 Norte #4E-07"
          error={errors.direccion?.message as string}
          {...register('direccion')}
        />
      </motion.div>

      <motion.div {...fieldStaggerAnim(4)}>
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

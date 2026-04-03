/**
 * PasoInteres — Paso 3: Interés del cliente en un proyecto/vivienda
 * Campos: proyecto_interes_id, vivienda_interes_id, notas_interes
 * Cascading: proyecto → viviendas disponibles
 */

'use client'

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import type {
  FieldErrors,
  Path,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form'

import { proyectosService } from '@/modules/proyectos/services/proyectos.service'
import { viviendasService } from '@/modules/viviendas/services/viviendas.service'
import {
  AccordionWizardSelect,
  AccordionWizardTextarea,
  fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'

import type { ClienteAccordionFormValues } from './cliente-accordion-form.types'

interface PasoInteresProps<TFormValues extends ClienteAccordionFormValues> {
  register: UseFormRegister<TFormValues>
  errors: FieldErrors<TFormValues>
  watch: UseFormWatch<TFormValues>
}

export function PasoInteres<TFormValues extends ClienteAccordionFormValues>({
  register,
  errors,
  watch,
}: PasoInteresProps<TFormValues>) {
  const proyectoInteresField = 'proyecto_interes_id' as Path<TFormValues>
  const viviendaInteresField = 'vivienda_interes_id' as Path<TFormValues>
  const notasInteresField = 'notas_interes' as Path<TFormValues>
  const proyectoId = watch(proyectoInteresField)
  const proyectoIdValue = useMemo(
    () => (typeof proyectoId === 'string' ? proyectoId : ''),
    [proyectoId]
  )

  const { data: proyectos = [] } = useQuery({
    queryKey: ['proyectos-activos'],
    queryFn: () => proyectosService.obtenerProyectos(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: viviendas = [] } = useQuery({
    queryKey: ['viviendas-interes', proyectoIdValue],
    queryFn: () =>
      viviendasService.obtenerViviendasDisponiblesPorProyecto(proyectoIdValue),
    enabled: !!proyectoIdValue,
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className='space-y-4'>
      <motion.div {...fieldStaggerAnim(0)}>
        <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
          Esta sección es opcional. Si el cliente tiene interés en un proyecto
          específico, selecciónalo aquí.
        </p>
      </motion.div>

      <motion.div {...fieldStaggerAnim(1)}>
        <AccordionWizardSelect
          {...register(proyectoInteresField)}
          label='Proyecto de Interés'
          moduleName='clientes'
          error={errors.proyecto_interes_id?.message as string}
        >
          <option value=''>Sin proyecto específico</option>
          {proyectos.map(proyecto => (
            <option key={proyecto.id} value={proyecto.id}>
              {proyecto.nombre}
            </option>
          ))}
        </AccordionWizardSelect>
      </motion.div>

      {proyectoIdValue ? (
        <motion.div {...fieldStaggerAnim(2)}>
          <AccordionWizardSelect
            {...register(viviendaInteresField)}
            label='Vivienda de Interés'
            moduleName='clientes'
            error={errors.vivienda_interes_id?.message as string}
          >
            <option value=''>Sin vivienda específica</option>
            {viviendas.map(vivienda => (
              <option key={vivienda.id} value={vivienda.id}>
                Mz. {vivienda.manzanas?.nombre ?? '?'} - Casa #{vivienda.numero}
              </option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
      ) : null}

      <motion.div {...fieldStaggerAnim(3)}>
        <AccordionWizardTextarea
          {...register(notasInteresField)}
          label='Notas sobre el interés'
          moduleName='clientes'
        />
      </motion.div>
    </div>
  )
}

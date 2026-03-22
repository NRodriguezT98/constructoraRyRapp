/**
 * PasoInteres — Paso 3: Interés del cliente en un proyecto/vivienda
 * Campos: proyecto_interes_id, vivienda_interes_id, notas_interes
 * Cascading: proyecto → viviendas disponibles
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import type { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form'

import { supabase } from '@/lib/supabase/client'
import { proyectosService } from '@/modules/proyectos/services/proyectos.service'
import {
    AccordionWizardSelect,
    AccordionWizardTextarea,
    fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'

interface PasoInteresProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  watch: UseFormWatch<any>
}

export function PasoInteres({ register, errors, watch }: PasoInteresProps) {
  const proyectoId = watch('proyecto_interes_id')

  // Cargar proyectos activos
  const { data: proyectos = [] } = useQuery({
    queryKey: ['proyectos-activos'],
    queryFn: () => proyectosService.obtenerProyectos(),
    staleTime: 5 * 60 * 1000,
  })

  // Cargar viviendas disponibles del proyecto seleccionado
  const { data: viviendas = [] } = useQuery({
    queryKey: ['viviendas-interes', proyectoId],
    queryFn: async () => {
      if (!proyectoId) return []
      // Obtener manzanas del proyecto
      const { data: manzanas } = await supabase
        .from('manzanas')
        .select('id')
        .eq('proyecto_id', proyectoId)
      const ids = manzanas?.map((m) => m.id) ?? []
      if (ids.length === 0) return []
      // Obtener viviendas disponibles
      const { data } = await supabase
        .from('viviendas')
        .select('id, numero, manzana_id, manzanas(nombre)')
        .in('manzana_id', ids)
        .eq('estado', 'Disponible')
        .order('numero')
      return data ?? []
    },
    enabled: !!proyectoId,
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className="space-y-4">
      <motion.div {...fieldStaggerAnim(0)}>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Esta sección es opcional. Si el cliente tiene interés en un proyecto específico, selecciónalo aquí.
        </p>
      </motion.div>

      {/* Proyecto */}
      <motion.div {...fieldStaggerAnim(1)}>
        <AccordionWizardSelect
          {...register('proyecto_interes_id')}
          label="Proyecto de Interés"
          moduleName="clientes"
          error={errors.proyecto_interes_id?.message as string}
        >
          <option value="">Sin proyecto específico</option>
          {proyectos.map((p: any) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </AccordionWizardSelect>
      </motion.div>

      {/* Vivienda (cascading from proyecto) */}
      {proyectoId ? (
        <motion.div {...fieldStaggerAnim(2)}>
          <AccordionWizardSelect
            {...register('vivienda_interes_id')}
            label="Vivienda de Interés"
            moduleName="clientes"
            error={errors.vivienda_interes_id?.message as string}
          >
            <option value="">Sin vivienda específica</option>
            {viviendas.map((v: any) => (
              <option key={v.id} value={v.id}>
                Mz. {v.manzana_nombre ?? v.manzanas?.nombre ?? '?'} - Casa #{v.numero}
              </option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
      ) : null}

      {/* Notas de interés */}
      <motion.div {...fieldStaggerAnim(3)}>
        <AccordionWizardTextarea
          {...register('notas_interes')}
          label="Notas sobre el interés"
          moduleName="clientes"
        />
      </motion.div>
    </div>
  )
}

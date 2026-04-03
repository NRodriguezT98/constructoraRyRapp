/**
 * PasoPersonal — Paso 1: Datos personales del cliente
 * Campos: nombres, apellidos, tipo_documento, numero_documento,
 *         fecha_nacimiento (opcional), estado_civil (opcional)
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'

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
  REGLAS_DOCUMENTO,
  type TipoDocumentoColombia,
} from '@/modules/clientes/utils/validacion-documentos-colombia'
import {
  AccordionWizardField,
  AccordionWizardSelect,
  fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'

import type { ClienteAccordionFormValues } from './cliente-accordion-form.types'

const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PP', label: 'Pasaporte' },
  { value: 'PEP', label: 'PEP' },
]

const ESTADOS_CIVILES = [
  { value: 'Soltero(a)', label: 'Soltero(a)' },
  { value: 'Casado(a)', label: 'Casado(a)' },
  { value: 'Unión libre', label: 'Unión libre' },
  { value: 'Viudo(a)', label: 'Viudo(a)' },
]

interface PasoPersonalProps<TFormValues extends ClienteAccordionFormValues> {
  register: UseFormRegister<TFormValues>
  errors: FieldErrors<TFormValues>
  watch: UseFormWatch<TFormValues>
  setValue: UseFormSetValue<TFormValues>
}

export function PasoPersonal<TFormValues extends ClienteAccordionFormValues>({
  register,
  errors,
  watch,
  setValue,
}: PasoPersonalProps<TFormValues>) {
  const nombresField = 'nombres' as Path<TFormValues>
  const apellidosField = 'apellidos' as Path<TFormValues>
  const tipoDocumentoField = 'tipo_documento' as Path<TFormValues>
  const numeroDocumentoField = 'numero_documento' as Path<TFormValues>
  const fechaNacimientoField = 'fecha_nacimiento' as Path<TFormValues>
  const estadoCivilField = 'estado_civil' as Path<TFormValues>
  const tipoDocumento =
    (watch(tipoDocumentoField) as TipoDocumentoColombia | undefined) ?? 'CC'
  const reglas = REGLAS_DOCUMENTO[tipoDocumento] ?? REGLAS_DOCUMENTO.CC
  const prevTipoRef = useRef(tipoDocumento)

  useEffect(() => {
    if (prevTipoRef.current !== tipoDocumento) {
      setValue(
        numeroDocumentoField,
        '' as PathValue<TFormValues, typeof numeroDocumentoField>,
        {
          shouldValidate: false,
        }
      )
      prevTipoRef.current = tipoDocumento
    }
  }, [numeroDocumentoField, setValue, tipoDocumento])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const controlKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'ArrowLeft',
        'ArrowRight',
        'Enter',
        'Home',
        'End',
      ]
      if (controlKeys.includes(e.key)) return
      if (e.ctrlKey || e.metaKey) return

      if (reglas.soloDigitos) {
        if (!/^\d$/.test(e.key)) e.preventDefault()
      } else if (tipoDocumento === 'NIT') {
        if (!/^[\d-]$/.test(e.key)) e.preventDefault()
      } else if (tipoDocumento === 'PP') {
        if (!/^[a-zA-Z0-9]$/.test(e.key)) e.preventDefault()
      }
    },
    [reglas.soloDigitos, tipoDocumento]
  )

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (tipoDocumento === 'PP') {
        const input = e.currentTarget
        const upper = input.value.toUpperCase()
        if (input.value !== upper) {
          input.value = upper
        }
      }
    },
    [tipoDocumento]
  )

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <motion.div {...fieldStaggerAnim(0)}>
          <AccordionWizardField
            {...register(nombresField)}
            label='Nombres'
            required
            moduleName='clientes'
            error={errors.nombres?.message as string}
          />
        </motion.div>
        <motion.div {...fieldStaggerAnim(1)}>
          <AccordionWizardField
            {...register(apellidosField)}
            label='Apellidos'
            required
            moduleName='clientes'
            error={errors.apellidos?.message as string}
          />
        </motion.div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <motion.div {...fieldStaggerAnim(2)}>
          <AccordionWizardSelect
            {...register(tipoDocumentoField)}
            label='Tipo de Documento'
            required
            moduleName='clientes'
            error={errors.tipo_documento?.message as string}
          >
            {TIPOS_DOCUMENTO.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
        <motion.div {...fieldStaggerAnim(3)}>
          <AccordionWizardField
            {...register(numeroDocumentoField)}
            label='Número de Documento'
            required
            moduleName='clientes'
            error={errors.numero_documento?.message as string}
            inputMode={reglas.inputMode}
            maxLength={reglas.maxLength}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
          <p className='mt-1 text-[11px] text-gray-400 dark:text-gray-500'>
            {reglas.descripcion}
          </p>
        </motion.div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <motion.div {...fieldStaggerAnim(4)}>
          <AccordionWizardField
            {...register(fechaNacimientoField)}
            label='Fecha de Nacimiento'
            type='date'
            moduleName='clientes'
            error={errors.fecha_nacimiento?.message as string}
          />
        </motion.div>
        <motion.div {...fieldStaggerAnim(5)}>
          <AccordionWizardSelect
            {...register(estadoCivilField)}
            label='Estado Civil'
            moduleName='clientes'
            error={errors.estado_civil?.message as string}
          >
            <option value=''>Sin especificar</option>
            {ESTADOS_CIVILES.map(estado => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
      </div>
    </div>
  )
}

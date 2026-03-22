/**
 * PasoPersonal — Paso 1: Datos personales del cliente
 * Campos: nombres, apellidos, tipo_documento, numero_documento,
 *         fecha_nacimiento (opcional), estado_civil (opcional)
 *
 * ✅ Filtrado en tiempo real del número de documento según tipo seleccionado
 * ✅ inputMode dinámico (teclado numérico en móvil para CC, TI, CE, PEP)
 * ✅ maxLength y placeholder dinámicos
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'

import { motion } from 'framer-motion'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

import { REGLAS_DOCUMENTO, type TipoDocumentoColombia } from '@/modules/clientes/utils/validacion-documentos-colombia'
import {
    AccordionWizardField,
    AccordionWizardSelect,
    fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'

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

interface PasoPersonalProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
}

export function PasoPersonal({ register, errors, watch, setValue }: PasoPersonalProps) {
  const tipoDocumento = watch('tipo_documento') as TipoDocumentoColombia
  const reglas = REGLAS_DOCUMENTO[tipoDocumento] ?? REGLAS_DOCUMENTO.CC
  const prevTipoRef = useRef(tipoDocumento)

  // Limpiar numero_documento cuando cambia el tipo de documento
  useEffect(() => {
    if (prevTipoRef.current !== tipoDocumento) {
      setValue('numero_documento', '', { shouldValidate: false })
      prevTipoRef.current = tipoDocumento
    }
  }, [tipoDocumento, setValue])

  /**
   * Filtro en tiempo real: bloquea caracteres inválidos según tipo de documento.
   * - CC, TI, CE, PEP → solo dígitos
   * - NIT → dígitos y guión
   * - PP → letras mayúsculas y dígitos
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de control: backspace, delete, tab, arrows, enter, ctrl+A/C/V/X
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter', 'Home', 'End']
    if (controlKeys.includes(e.key)) return
    if (e.ctrlKey || e.metaKey) return

    if (reglas.soloDigitos) {
      // CC, TI, CE, PEP → solo dígitos
      if (!/^\d$/.test(e.key)) {
        e.preventDefault()
      }
    } else if (tipoDocumento === 'NIT') {
      // NIT → dígitos y un guión
      if (!/^[\d-]$/.test(e.key)) {
        e.preventDefault()
      }
    } else if (tipoDocumento === 'PP') {
      // Pasaporte → letras y dígitos (se convierte a mayúsculas en onInput)
      if (!/^[a-zA-Z0-9]$/.test(e.key)) {
        e.preventDefault()
      }
    }
  }, [reglas.soloDigitos, tipoDocumento])

  /** Para pasaporte: convertir a mayúsculas automáticamente */
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if (tipoDocumento === 'PP') {
      const input = e.currentTarget
      const upper = input.value.toUpperCase()
      if (input.value !== upper) {
        input.value = upper
      }
    }
  }, [tipoDocumento])

  return (
    <div className="space-y-4">
      {/* Nombres y Apellidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div {...fieldStaggerAnim(0)}>
          <AccordionWizardField
            {...register('nombres')}
            label="Nombres"
            required
            moduleName="clientes"
            error={errors.nombres?.message as string}
          />
        </motion.div>
        <motion.div {...fieldStaggerAnim(1)}>
          <AccordionWizardField
            {...register('apellidos')}
            label="Apellidos"
            required
            moduleName="clientes"
            error={errors.apellidos?.message as string}
          />
        </motion.div>
      </div>

      {/* Tipo y Número de Documento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div {...fieldStaggerAnim(2)}>
          <AccordionWizardSelect
            {...register('tipo_documento')}
            label="Tipo de Documento"
            required
            moduleName="clientes"
            error={errors.tipo_documento?.message as string}
          >
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
        <motion.div {...fieldStaggerAnim(3)}>
          <AccordionWizardField
            {...register('numero_documento')}
            label="Número de Documento"
            required
            moduleName="clientes"
            error={errors.numero_documento?.message as string}
            inputMode={reglas.inputMode}
            maxLength={reglas.maxLength}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
          <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
            {reglas.descripcion}
          </p>
        </motion.div>
      </div>

      {/* Fecha Nacimiento y Estado Civil (opcionales) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div {...fieldStaggerAnim(4)}>
          <AccordionWizardField
            {...register('fecha_nacimiento')}
            label="Fecha de Nacimiento"
            type="date"
            moduleName="clientes"
            error={errors.fecha_nacimiento?.message as string}
          />
        </motion.div>
        <motion.div {...fieldStaggerAnim(5)}>
          <AccordionWizardSelect
            {...register('estado_civil')}
            label="Estado Civil"
            moduleName="clientes"
            error={errors.estado_civil?.message as string}
          >
            <option value="">Sin especificar</option>
            {ESTADOS_CIVILES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </AccordionWizardSelect>
        </motion.div>
      </div>
    </div>
  )
}

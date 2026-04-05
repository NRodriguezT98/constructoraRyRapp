/**
 * ProyectosForm - Componente presentacional PREMIUM (orquestador)
 * ✅ Separación de responsabilidades ESTRICTA
 * ✅ Secciones extraídas en form-sections/
 */

'use client'

import { useEffect, useMemo } from 'react'

import { motion } from 'framer-motion'
import { Building2, Loader2 } from 'lucide-react'

import {
  getCiudadesPorDepartamento,
  getDepartamentos,
} from '@/shared/data/colombia-locations'
import { cn } from '@/shared/utils/helpers'

import { useProyectosForm } from '../hooks/useProyectosForm'
import { proyectosFormPremiumStyles as styles } from '../styles/proyectos-form-premium.styles'
import type { ProyectoFormData } from '../types'

import { FormSeccionEstadoFechas } from './form-sections/FormSeccionEstadoFechas'
import { FormSeccionInfoGeneral } from './form-sections/FormSeccionInfoGeneral'
import { FormSeccionManzanas } from './form-sections/FormSeccionManzanas'

interface ProyectosFormProps {
  onSubmit: (data: ProyectoFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<ProyectoFormData>
  isEditing?: boolean
  onHasChanges?: (hasChanges: boolean) => void
  onTotalsChange?: (totals: {
    totalManzanas: number
    totalViviendas: number
  }) => void
}

export function ProyectosForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isEditing = false,
  onHasChanges,
  onTotalsChange,
}: ProyectosFormProps) {
  const {
    register,
    handleSubmit,
    errors,
    touchedFields,
    fields,
    handleAgregarManzana,
    handleEliminarManzana,
    totalManzanas,
    totalViviendas,
    manzanasWatch,
    isFieldChanged,
    canSave,
    getButtonText,
    canRemoveManzana,
    esManzanaEditable,
    esManzanaEliminable,
    obtenerMotivoBloqueado,
    validandoNombre,
    manzanasState,
    watch,
    setValue,
  } = useProyectosForm({ initialData, onSubmit, isEditing, onHasChanges })

  const departamentos = useMemo(() => getDepartamentos(), [])
  const departamentoSeleccionado = watch('departamento')
  const ciudades = useMemo(() => {
    if (!departamentoSeleccionado) return []
    return getCiudadesPorDepartamento(departamentoSeleccionado)
  }, [departamentoSeleccionado])

  useEffect(() => {
    if (departamentoSeleccionado) {
      const ciudadActual = watch('ciudad')
      if (
        ciudadActual &&
        !getCiudadesPorDepartamento(departamentoSeleccionado).includes(
          ciudadActual
        )
      ) {
        setValue('ciudad', '')
      }
    }
  }, [departamentoSeleccionado, setValue, watch])

  useEffect(() => {
    if (onTotalsChange) {
      onTotalsChange({ totalManzanas, totalViviendas })
    }
  }, [totalManzanas, totalViviendas, onTotalsChange])

  return (
    <motion.form
      {...styles.animations.container}
      onSubmit={handleSubmit}
      className={styles.form}
    >
      <div className={styles.grid}>
        {/* COLUMNA IZQUIERDA: Información General + Estado/Fechas */}
        <div className={styles.infoSection.container}>
          <FormSeccionInfoGeneral
            register={register}
            errors={errors}
            touchedFields={touchedFields}
            watch={watch}
            setValue={setValue}
            isEditing={isEditing}
            isFieldChanged={isFieldChanged}
            validandoNombre={validandoNombre}
            departamentos={departamentos}
            ciudades={ciudades}
          />
          <FormSeccionEstadoFechas
            register={register}
            errors={errors}
            touchedFields={touchedFields}
            isEditing={isEditing}
            isFieldChanged={isFieldChanged}
          />
        </div>

        {/* COLUMNA DERECHA: Manzanas */}
        <FormSeccionManzanas
          register={register}
          errors={errors}
          fields={fields}
          manzanasWatch={manzanasWatch}
          manzanasState={manzanasState}
          isEditing={isEditing}
          canRemoveManzana={canRemoveManzana}
          esManzanaEditable={esManzanaEditable}
          esManzanaEliminable={esManzanaEliminable}
          obtenerMotivoBloqueado={obtenerMotivoBloqueado}
          handleAgregarManzana={handleAgregarManzana}
          handleEliminarManzana={handleEliminarManzana}
        />
      </div>

      {/* BOTONES FOOTER */}
      <motion.div
        {...styles.animations.footer}
        className={styles.footer.container}
      >
        <button
          type='button'
          onClick={onCancel}
          disabled={isLoading}
          className={styles.footer.cancelButton}
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={isLoading || !canSave}
          className={cn(
            styles.footer.submitButton,
            !canSave && 'cursor-not-allowed opacity-50'
          )}
        >
          {isLoading ? (
            <>
              <Loader2
                className={cn(styles.footer.submitButtonIcon, 'animate-spin')}
              />
              Guardando...
            </>
          ) : (
            <>
              <Building2 className={styles.footer.submitButtonIcon} />
              {getButtonText(isEditing)}
            </>
          )}
        </button>
      </motion.div>
    </motion.form>
  )
}

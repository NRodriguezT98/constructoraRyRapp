/**
 * PasoUbicacionNuevo - Paso 1: Selección de ubicación
 * ✅ Componente presentacional puro
 * ✅ Lógica en usePasoUbicacion hook
 * ✅ React Query para carga de datos
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Building2, Home, MapPin } from 'lucide-react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

import { cn } from '@/shared/utils/helpers'

import { usePasoUbicacion } from '../hooks/usePasoUbicacion'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'

interface PasoUbicacionProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
}

export function PasoUbicacionNuevo({ register, errors, setValue, watch }: PasoUbicacionProps) {
  // ✅ Hook con toda la lógica
  const {
    proyectos,
    manzanas,
    numerosDisponibles,
    manzanaInfo,
    cargandoProyectos,
    cargandoManzanas,
    cargandoNumeros,
  } = usePasoUbicacion({ setValue, watch })

  // Variables observadas del formulario
  const proyectoSeleccionado = watch('proyecto_id')
  const manzanaSeleccionada = watch('manzana_id')

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {/* Título del paso */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Ubicación de la Vivienda
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Selecciona el proyecto, manzana y número de vivienda disponible
        </p>
      </div>

      {/* Proyecto */}
      <div className={styles.field.container}>
        <label htmlFor="proyecto_id" className={styles.field.label}>
          Proyecto <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <Building2 className={styles.field.inputIcon} />
          <select
            {...register('proyecto_id')}
            id="proyecto_id"
            disabled={cargandoProyectos}
            className={cn(
              styles.field.select,
              errors.proyecto_id && styles.field.inputError
            )}
          >
            <option value="">Selecciona un proyecto</option>
            {proyectos.map(proyecto => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </div>
        {errors.proyecto_id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.proyecto_id.message as string}
          </motion.div>
        )}
      </div>

      {/* Manzana */}
      <div className={styles.field.container}>
        <label htmlFor="manzana_id" className={styles.field.label}>
          Manzana <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <MapPin className={styles.field.inputIcon} />
          <select
            {...register('manzana_id')}
            id="manzana_id"
            disabled={!proyectoSeleccionado || cargandoManzanas}
            className={cn(
              styles.field.select,
              errors.manzana_id && styles.field.inputError
            )}
          >
            <option value="">
              {!proyectoSeleccionado
                ? 'Primero selecciona un proyecto'
                : cargandoManzanas
                ? 'Cargando manzanas...'
                : manzanas.length === 0
                ? 'No hay manzanas disponibles'
                : 'Selecciona una manzana'}
            </option>
            {manzanas.map(manzana => (
              <option
                key={manzana.id}
                value={manzana.id}
                disabled={!manzana.tiene_disponibles}
              >
                Manzana {manzana.nombre} ({manzana.viviendas_disponibles} disponibles)
              </option>
            ))}
          </select>
        </div>
        {errors.manzana_id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.manzana_id.message as string}
          </motion.div>
        )}
        {manzanaInfo && (
          <div className={styles.field.hint}>
            <AlertCircle className={styles.field.hintIcon} />
            Total en manzana: {manzanaInfo.total_viviendas} viviendas •
            Creadas: {manzanaInfo.viviendas_creadas} •
            Disponibles: {manzanaInfo.viviendas_disponibles}
          </div>
        )}
      </div>

      {/* Número de vivienda */}
      <div className={styles.field.container}>
        <label htmlFor="numero" className={styles.field.label}>
          Número de Vivienda <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <Home className={styles.field.inputIcon} />
          <select
            {...register('numero')}
            id="numero"
            disabled={!manzanaSeleccionada || numerosDisponibles.length === 0}
            className={cn(
              styles.field.select,
              errors.numero && styles.field.inputError
            )}
          >
            <option value="">
              {!manzanaSeleccionada
                ? 'Primero selecciona una manzana'
                : numerosDisponibles.length === 0
                ? 'No hay viviendas disponibles'
                : 'Selecciona el número de vivienda'}
            </option>
            {numerosDisponibles.map(num => (
              <option key={num} value={num.toString()}>
                Vivienda #{num}
              </option>
            ))}
          </select>
        </div>
        {errors.numero && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.numero.message as string}
          </motion.div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Selecciona el número de vivienda que deseas crear de las disponibles
        </p>
      </div>
    </motion.div>
  )
}

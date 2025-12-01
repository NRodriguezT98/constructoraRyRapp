/**
 * PasoLegalNuevo - Paso 3: Información legal
 * ✅ Componente presentacional puro
 * ✅ Lógica en usePasoLegal hook
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, FileText, Hash, MapPin, Maximize } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { cn } from '@/shared/utils/helpers'

import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'

interface PasoLegalProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

export function PasoLegalNuevo({ register, errors }: PasoLegalProps) {

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {/* Título del paso */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Información Legal
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Datos catastrales y documentos de la vivienda
        </p>
      </div>

      {/* Matrícula Inmobiliaria */}
      <div className={styles.field.container}>
        <label htmlFor="matricula_inmobiliaria" className={styles.field.label}>
          Matrícula Inmobiliaria <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <FileText className={styles.field.inputIcon} />
          <input
            {...register('matricula_inmobiliaria')}
            id="matricula_inmobiliaria"
            type="text"
            placeholder="Ej: 050-123456"
            className={cn(
              styles.field.input,
              errors.matricula_inmobiliaria && styles.field.inputError
            )}
          />
        </div>
        {errors.matricula_inmobiliaria && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.matricula_inmobiliaria.message as string}
          </motion.div>
        )}
      </div>

      {/* Nomenclatura */}
      <div className={styles.field.container}>
        <label htmlFor="nomenclatura" className={styles.field.label}>
          Nomenclatura <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <MapPin className={styles.field.inputIcon} />
          <input
            {...register('nomenclatura')}
            id="nomenclatura"
            type="text"
            placeholder="Ej: Calle 123 # 45-67"
            className={cn(
              styles.field.input,
              errors.nomenclatura && styles.field.inputError
            )}
          />
        </div>
        {errors.nomenclatura && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.nomenclatura.message as string}
          </motion.div>
        )}
      </div>

      {/* Áreas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Área del Lote */}
        <div className={styles.field.container}>
          <label htmlFor="area_lote" className={styles.field.label}>
            Área del Lote (m²) <span className={styles.field.required}>*</span>
          </label>
          <div className={styles.field.inputWrapper}>
            <Maximize className={styles.field.inputIcon} />
            <input
              {...register('area_lote')}
              id="area_lote"
              type="text"
              inputMode="decimal"
              placeholder="120.50"
              className={cn(
                styles.field.input,
                errors.area_lote && styles.field.inputError
              )}
            />
          </div>
          {errors.area_lote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {errors.area_lote.message as string}
            </motion.div>
          )}
        </div>

        {/* Área Construida */}
        <div className={styles.field.container}>
          <label htmlFor="area_construida" className={styles.field.label}>
            Área Construida (m²) <span className={styles.field.required}>*</span>
          </label>
          <div className={styles.field.inputWrapper}>
            <Maximize className={styles.field.inputIcon} />
            <input
              {...register('area_construida')}
              id="area_construida"
              type="text"
              inputMode="decimal"
              placeholder="80.00"
              className={cn(
                styles.field.input,
                errors.area_construida && styles.field.inputError
              )}
            />
          </div>
          {errors.area_construida && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {errors.area_construida.message as string}
            </motion.div>
          )}
        </div>
      </div>

      {/* Tipo de Vivienda */}
      <div className={styles.field.container}>
        <label htmlFor="tipo_vivienda" className={styles.field.label}>
          Tipo de Vivienda <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <Hash className={styles.field.inputIcon} />
          <select
            {...register('tipo_vivienda')}
            id="tipo_vivienda"
            className={cn(
              styles.field.select,
              errors.tipo_vivienda && styles.field.inputError
            )}
          >
            <option value="">Selecciona un tipo</option>
            <option value="Regular">Regular</option>
            <option value="Irregular">Irregular</option>
          </select>
        </div>
        {errors.tipo_vivienda && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.tipo_vivienda.message as string}
          </motion.div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Regular: Lote rectangular. Irregular: Lote con formas atípicas.
        </p>
      </div>

      {/* Info: Certificado de Tradición */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-3">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          📄 <strong>Nota:</strong> El Certificado de Tradición se gestiona desde el módulo de <strong>Documentos</strong> después de crear la vivienda.
        </p>
      </div>
    </motion.div>
  )
}

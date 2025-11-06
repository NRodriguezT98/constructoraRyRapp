/**
 * PasoLegalNuevo - Paso 3: Información legal
 * ✅ Diseño compacto estándar
 */

'use client'

import { cn } from '@/shared/utils/helpers'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, FileText, Hash, MapPin, Maximize, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'

interface PasoLegalProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  setValue: UseFormSetValue<any>
}

export function PasoLegalNuevo({ register, errors, setValue }: PasoLegalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('📄 [PASO LEGAL] Archivo seleccionado:', file.name, file.type, file.size)

    // Validar tipo
    if (file.type !== 'application/pdf') {
      setFileError('Solo se permiten archivos PDF')
      return
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('El archivo no debe superar los 10MB')
      return
    }

    setFileError('')
    setCertificadoFile(file)
    setValue('certificado_tradicion_file', file)
    console.log('✅ [PASO LEGAL] Archivo guardado en formulario')
  }

  const removeFile = () => {
    console.log('🗑️ [PASO LEGAL] Archivo eliminado')
    setCertificadoFile(null)
    setValue('certificado_tradicion_file', undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
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
              {...register('area_lote', { valueAsNumber: true })}
              id="area_lote"
              type="number"
              step="0.01"
              min="0"
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
              {...register('area_construida', { valueAsNumber: true })}
              id="area_construida"
              type="number"
              step="0.01"
              min="0"
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

      {/* Certificado de Tradición (Opcional) */}
      <div className={styles.field.container}>
        <label htmlFor="certificado" className={styles.field.label}>
          Certificado de Tradición (Opcional)
        </label>

        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {!certificadoFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:border-orange-500 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 transition-all"
            >
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">Seleccionar archivo PDF</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 truncate">
                  {certificadoFile.name}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {(certificadoFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="rounded-lg p-1.5 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {fileError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {fileError}
            </motion.div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formato: PDF • Tamaño máximo: 10MB • Opcional
          </p>
        </div>
      </div>
    </motion.div>
  )
}

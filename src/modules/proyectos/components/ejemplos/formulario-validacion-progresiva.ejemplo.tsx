/**
 * EJEMPLO: VALIDACIÓN PROGRESIVA CORRECTA
 *
 * Estrategia UX:
 * 1. onBlur: Primera validación (cuando sale del campo)
 * 2. onChange: Solo si ya hay error (para confirmar corrección)
 * 3. onSubmit: Validación completa final
 */

'use client'

import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// ============================================================================
// SCHEMA CON VALIDACIONES ESPECÍFICAS
// ============================================================================

const proyectoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/,
      'Solo se permiten letras (con acentos), números, espacios, guiones y guiones bajos'
    ),

  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .optional(),

  estado: z
    .string()
    .min(2, 'El estado es requerido')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),

  // Más campos...
})

type ProyectoFormData = z.infer<typeof proyectoSchema>

// ============================================================================
// COMPONENTE DE CAMPO CON VALIDACIÓN PROGRESIVA
// ============================================================================

interface CampoValidadoProps {
  label: string
  name: keyof ProyectoFormData
  type?: 'text' | 'number' | 'textarea'
  placeholder?: string
  required?: boolean
  register: any
  error?: { message?: string }
  touched?: boolean
  isValidating?: boolean
  isValid?: boolean
  helpText?: string
  maxLength?: number
}

function CampoValidado({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  register,
  error,
  touched,
  isValidating,
  isValid,
  helpText,
  maxLength,
}: CampoValidadoProps) {
  const [currentLength, setCurrentLength] = useState(0)

  // Determinar estado visual
  const showError = touched && error
  const showSuccess = touched && !error && !isValidating && isValid !== false
  const showValidating = isValidating

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            {...register(name)}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={(e) => {
              register(name).onChange(e)
              setCurrentLength(e.target.value.length)
            }}
            className={cn(
              'w-full px-4 py-2 rounded-lg border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'dark:bg-gray-900/50 dark:text-white',
              'resize-none',
              // Estados
              !touched && 'border-gray-300 dark:border-gray-700',
              showError &&
                'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20',
              showSuccess &&
                'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50 dark:bg-green-950/20',
              !showError &&
                !showSuccess &&
                touched &&
                'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20'
            )}
            rows={4}
          />
        ) : (
          <input
            {...register(name)}
            type={type}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={(e) => {
              register(name).onChange(e)
              setCurrentLength(e.target.value.length)
            }}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'dark:bg-gray-900/50 dark:text-white',
              // Estados
              !touched && 'border-gray-300 dark:border-gray-700',
              showError &&
                'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20',
              showSuccess &&
                'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50 dark:bg-green-950/20',
              !showError &&
                !showSuccess &&
                touched &&
                'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20'
            )}
          />
        )}

        {/* Indicadores visuales (derecha del input) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Contador de caracteres */}
          {maxLength && currentLength > 0 && (
            <span
              className={cn(
                'text-xs font-medium',
                currentLength >= maxLength * 0.9
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-400 dark:text-gray-500'
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}

          {/* Spinner validando */}
          {showValidating && (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          )}

          {/* Check verde (válido) */}
          {showSuccess && (
            <CheckCircle2 className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200" />
          )}

          {/* X roja (error) */}
          {showError && (
            <AlertCircle className="w-5 h-5 text-red-500 animate-in fade-in zoom-in duration-200" />
          )}
        </div>
      </div>

      {/* Mensajes de ayuda/error */}
      <div className="min-h-[20px]">
        {/* Error (prioridad alta) */}
        {showError && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1.5 animate-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error.message}</span>
          </p>
        )}

        {/* Texto de ayuda (solo si NO hay error) */}
        {!showError && helpText && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{helpText}</span>
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// FORMULARIO CON VALIDACIÓN PROGRESIVA
// ============================================================================

export function FormularioProyectoProgresivo() {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<ProyectoFormData>({
    resolver: zodResolver(proyectoSchema),
    mode: 'onBlur', // ← CLAVE: Validar al salir del campo
    reValidateMode: 'onChange', // ← Si ya hay error, validar mientras escribe
  })

  const onSubmit = async (data: ProyectoFormData) => {
    console.log('✅ Formulario válido:', data)
    // Aquí guardar en BD
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-6">
        {/* Campo: Nombre del Proyecto */}
        <CampoValidado
          label="Nombre del Proyecto"
          name="nombre"
          placeholder="Ej: Urbanización Los Pinos 2025"
          required
          register={register}
          error={errors.nombre}
          touched={touchedFields.nombre}
          helpText="Solo letras (con acentos), números, espacios y guiones"
          maxLength={100}
        />

        {/* Campo: Estado */}
        <CampoValidado
          label="Estado (Departamento)"
          name="estado"
          placeholder="Ej: Antioquia"
          required
          register={register}
          error={errors.estado}
          touched={touchedFields.estado}
          helpText="Solo letras permitidas"
        />

        {/* Campo: Descripción */}
        <CampoValidado
          label="Descripción"
          name="descripcion"
          type="textarea"
          placeholder="Describe el proyecto..."
          register={register}
          error={errors.descripcion}
          touched={touchedFields.descripcion}
          helpText="Mínimo 10 caracteres para una descripción útil"
          maxLength={500}
        />
      </div>

      {/* Botón Submit */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'px-6 py-2 rounded-lg font-medium transition-all duration-200',
            'flex items-center gap-2',
            'bg-blue-600 hover:bg-blue-700 text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
          )}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : 'Guardar Proyecto'}
        </button>
      </div>

      {/* Resumen de errores (opcional) */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
            Por favor corrige los siguientes errores:
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <strong>{field}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  )
}

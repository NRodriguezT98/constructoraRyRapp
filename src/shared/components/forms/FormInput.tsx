/**
 * COMPONENTE GENÉRICO DE INPUT CON VALIDACIÓN PROGRESIVA
 *
 * Características:
 * - Validación visual automática (onBlur → onChange)
 * - Soporte para validaciones asíncronas
 * - Iconos de estado (✓ ❌ 🔄)
 * - Contador de caracteres
 * - Mensajes de error/ayuda
 * - Accesibilidad completa
 * - Dark mode
 *
 * Uso:
 * <FormInput
 *   label="Nombre del Proyecto"
 *   name="nombre"
 *   register={register}
 *   error={errors.nombre}
 *   touched={touchedFields.nombre}
 *   helpText="Solo letras y números"
 *   maxLength={100}
 * />
 */

'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { useState, type HTMLInputTypeAttribute } from 'react'
import { type FieldError, type UseFormRegisterReturn } from 'react-hook-form'

// ============================================================================
// TIPOS
// ============================================================================

interface FormInputProps {
  // Básicos
  label: string
  name: string
  type?: HTMLInputTypeAttribute
  placeholder?: string
  required?: boolean
  disabled?: boolean
  autoFocus?: boolean

  // React Hook Form
  register: UseFormRegisterReturn
  error?: FieldError
  touched?: boolean

  // Validación asíncrona
  isValidating?: boolean
  isValid?: boolean

  // Ayuda/Formato
  helpText?: string
  maxLength?: number
  prefix?: string // Ej: "$" para precios
  suffix?: string // Ej: "m²" para áreas

  // Estilos
  className?: string
  inputClassName?: string
}

interface FormTextareaProps extends Omit<FormInputProps, 'type' | 'prefix' | 'suffix'> {
  rows?: number
}

// ============================================================================
// COMPONENTE PRINCIPAL: FormInput
// ============================================================================

export function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  disabled,
  autoFocus,
  register,
  error,
  touched,
  isValidating,
  isValid,
  helpText,
  maxLength,
  prefix,
  suffix,
  className,
  inputClassName,
}: FormInputProps) {
  const [currentLength, setCurrentLength] = useState(0)

  // Estados visuales
  const hasError = touched && error
  const isSuccess = touched && !error && !isValidating && isValid !== false
  const isLoading = isValidating

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Prefix (opcional) */}
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium pointer-events-none">
            {prefix}
          </div>
        )}

        {/* Input */}
        <input
          {...register}
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? `${name}-error` : helpText ? `${name}-help` : undefined
          }
          onChange={(e) => {
            register.onChange(e)
            setCurrentLength(e.target.value.length)
          }}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'dark:bg-gray-900/50 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            // Padding para prefix/suffix
            prefix && 'pl-8',
            suffix && 'pr-20',
            // Estados
            !touched && 'border-gray-300 dark:border-gray-700',
            hasError &&
              'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20',
            isSuccess &&
              'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50 dark:bg-green-950/20',
            !hasError &&
              !isSuccess &&
              touched &&
              'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20',
            disabled &&
              'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800',
            inputClassName
          )}
        />

        {/* Suffix (opcional) */}
        {suffix && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium pointer-events-none">
            {suffix}
          </div>
        )}

        {/* Indicadores (derecha) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Contador de caracteres */}
          {maxLength && currentLength > 0 && !isLoading && !hasError && (
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

          {/* Validando */}
          {isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" aria-label="Validando..." />
          )}

          {/* Válido */}
          {isSuccess && (
            <CheckCircle2
              className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200"
              aria-label="Campo válido"
            />
          )}

          {/* Error */}
          {hasError && (
            <AlertCircle
              className="w-5 h-5 text-red-500 animate-in fade-in zoom-in duration-200"
              aria-label="Campo con error"
            />
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="min-h-[20px]" role="alert" aria-live="polite">
        {/* Error */}
        {hasError && (
          <p
            id={`${name}-error`}
            className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1.5 animate-in slide-in-from-top-1 duration-200"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error.message}</span>
          </p>
        )}

        {/* Ayuda */}
        {!hasError && helpText && (
          <p
            id={`${name}-help`}
            className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5"
          >
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{helpText}</span>
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE: FormTextarea
// ============================================================================

export function FormTextarea({
  label,
  name,
  placeholder,
  required,
  disabled,
  autoFocus,
  register,
  error,
  touched,
  isValidating,
  isValid,
  helpText,
  maxLength,
  rows = 4,
  className,
  inputClassName,
}: FormTextareaProps) {
  const [currentLength, setCurrentLength] = useState(0)

  const hasError = touched && error
  const isSuccess = touched && !error && !isValidating && isValid !== false
  const isLoading = isValidating

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Textarea Container */}
      <div className="relative">
        <textarea
          {...register}
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          rows={rows}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? `${name}-error` : helpText ? `${name}-help` : undefined
          }
          onChange={(e) => {
            register.onChange(e)
            setCurrentLength(e.target.value.length)
          }}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'dark:bg-gray-900/50 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'resize-none',
            // Estados
            !touched && 'border-gray-300 dark:border-gray-700',
            hasError &&
              'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20',
            isSuccess &&
              'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50 dark:bg-green-950/20',
            !hasError &&
              !isSuccess &&
              touched &&
              'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20',
            disabled &&
              'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800',
            inputClassName
          )}
        />

        {/* Indicadores (esquina superior derecha) */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {/* Contador */}
          {maxLength && (
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

          {/* Validando */}
          {isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          )}

          {/* Válido */}
          {isSuccess && (
            <CheckCircle2 className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200" />
          )}

          {/* Error */}
          {hasError && (
            <AlertCircle className="w-5 h-5 text-red-500 animate-in fade-in zoom-in duration-200" />
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="min-h-[20px]" role="alert" aria-live="polite">
        {hasError && (
          <p
            id={`${name}-error`}
            className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1.5 animate-in slide-in-from-top-1 duration-200"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error.message}</span>
          </p>
        )}

        {!hasError && helpText && (
          <p
            id={`${name}-help`}
            className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5"
          >
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{helpText}</span>
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE: FormSelect (bonus)
// ============================================================================

interface FormSelectProps
  extends Omit<FormInputProps, 'type' | 'prefix' | 'suffix' | 'maxLength'> {
  options: Array<{ value: string; label: string }>
}

export function FormSelect({
  label,
  name,
  placeholder,
  required,
  disabled,
  register,
  error,
  touched,
  helpText,
  options,
  className,
  inputClassName,
}: FormSelectProps) {
  const hasError = touched && error

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        {...register}
        id={name}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : 'false'}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          'dark:bg-gray-900/50 dark:text-white',
          !touched && 'border-gray-300 dark:border-gray-700',
          hasError &&
            'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/20',
          touched &&
            !hasError &&
            'border-green-300 focus:border-green-500 focus:ring-green-500/20',
          disabled && 'opacity-50 cursor-not-allowed',
          inputClassName
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="min-h-[20px]" role="alert" aria-live="polite">
        {hasError && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error.message}</span>
          </p>
        )}
        {!hasError && helpText && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{helpText}</span>
          </p>
        )}
      </div>
    </div>
  )
}

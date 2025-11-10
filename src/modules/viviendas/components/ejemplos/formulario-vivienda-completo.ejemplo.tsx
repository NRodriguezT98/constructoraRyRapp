/**
 * EJEMPLO DE USO - FORMULARIO CON VALIDACIONES COMPLETAS
 *
 * Integra:
 * 1. Zod (validación síncrona)
 * 2. React Hook Form (gestión de formulario)
 * 3. Validaciones asíncronas (BD)
 * 4. TanStack Query (cache y debouncing)
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useViviendaValidationStatus } from '../hooks/useViviendaValidation'
import { viviendaFormSchema, type ViviendaFormData } from '../schemas/vivienda-form.schema'
import { validarViviendaCompleta } from '../services/vivienda-validation.service'

export function FormularioViviendaEjemplo() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ============================================================================
  // 1. CONFIGURAR REACT HOOK FORM CON ZOD
  // ============================================================================

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm<ViviendaFormData>({
    resolver: zodResolver(viviendaFormSchema), // ← Validación Zod automática
    mode: 'onChange', // Validar mientras escribe
  })

  // ============================================================================
  // 2. OBSERVAR CAMBIOS PARA VALIDACIONES ASÍNCRONAS
  // ============================================================================

  const formValues = watch() // Observa todos los campos
  const validationStatus = useViviendaValidationStatus({
    numero_matricula: formValues.numero_matricula,
    numero_casa: formValues.numero_casa,
    proyecto_id: formValues.proyecto_id,
    manzana_id: formValues.manzana_id,
  })

  // ============================================================================
  // 3. SUBMIT CON VALIDACIÓN COMPLETA
  // ============================================================================

  const onSubmit = async (data: ViviendaFormData) => {
    setIsSubmitting(true)

    try {
      // Validación completa contra BD antes de guardar
      const validacion = await validarViviendaCompleta(data)

      if (!validacion.valid) {
        // Marcar errores en los campos correspondientes
        Object.entries(validacion.errores).forEach(([campo, mensaje]) => {
          setError(campo as any, {
            type: 'manual',
            message: mensaje,
          })
        })

        console.log('Errores de validación:', validacion.errores)
        return
      }

      // TODO: Guardar en BD
      console.log('✅ Datos válidos, guardar:', data)

      // Aquí llamarías a tu service para crear la vivienda
      // await viviendaService.create(data)

    } catch (error) {
      console.error('Error al validar/guardar:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // 4. RENDERIZADO CON INDICADORES VISUALES
  // ============================================================================

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* CAMPO: Número de Matrícula */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Número de Matrícula <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <input
            {...register('numero_matricula')}
            type="text"
            placeholder="ABC-123456"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          {/* INDICADOR DE VALIDACIÓN ASÍNCRONA */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validationStatus.matricula.isValidating && (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            )}
            {!validationStatus.matricula.isValidating &&
              validationStatus.matricula.isValid && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            {!validationStatus.matricula.isValidating &&
              validationStatus.matricula.error && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
          </div>
        </div>

        {/* ERRORES ZOD (síncronos) */}
        {errors.numero_matricula && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.numero_matricula.message}
          </p>
        )}

        {/* ERRORES ASÍNCRONOS (BD) */}
        {validationStatus.matricula.error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationStatus.matricula.error}
          </p>
        )}
      </div>

      {/* CAMPO: Número de Casa */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Número de Casa <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <input
            {...register('numero_casa')}
            type="text"
            placeholder="101"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validationStatus.casa.isValidating && (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            )}
            {!validationStatus.casa.isValidating && validationStatus.casa.isValid && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {!validationStatus.casa.isValidating && validationStatus.casa.error && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>

        {errors.numero_casa && (
          <p className="text-sm text-red-500">{errors.numero_casa.message}</p>
        )}
        {validationStatus.casa.error && (
          <p className="text-sm text-red-500">{validationStatus.casa.error}</p>
        )}
      </div>

      {/* CAMPO: Valor Base */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Valor Base <span className="text-red-500">*</span>
        </label>

        <input
          {...register('valor_base')}
          type="number"
          placeholder="150000000"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        {errors.valor_base && (
          <p className="text-sm text-red-500">{errors.valor_base.message}</p>
        )}
      </div>

      {/* Más campos... */}

      {/* BOTÓN SUBMIT */}
      <div className="flex items-center justify-end gap-3">
        {/* Indicador de validaciones en progreso */}
        {validationStatus.isAnyValidating && (
          <p className="text-sm text-blue-600 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Validando datos...
          </p>
        )}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            validationStatus.isAnyValidating ||
            validationStatus.hasAnyError ||
            !isValid
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : 'Guardar Vivienda'}
        </button>
      </div>
    </form>
  )
}

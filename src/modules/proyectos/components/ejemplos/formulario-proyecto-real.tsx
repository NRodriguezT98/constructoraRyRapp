/**
 * EJEMPLO DE USO REAL: Formulario de Proyecto
 *
 * Usa los componentes genéricos FormInput, FormTextarea, FormSelect
 * Con validación progresiva completa
 */

'use client'

import { cn } from '@/lib/utils'
import { FormInput, FormSelect, FormTextarea } from '@/shared/components/forms/FormInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// ============================================================================
// SCHEMA
// ============================================================================

const proyectoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/,
      'Solo letras (con acentos), números, espacios, guiones y guiones bajos'
    ),

  descripcion: z
    .string()
    .min(10, 'Mínimo 10 caracteres para una descripción útil')
    .max(500, 'Máximo 500 caracteres')
    .optional(),

  estado: z.string().min(1, 'Selecciona un estado'),

  ciudad: z.string().min(1, 'Selecciona una ciudad'),

  direccion: z.string().min(5, 'Dirección demasiado corta'),

  area_total: z.coerce
    .number()
    .positive('El área debe ser positiva')
    .max(1000000, 'Área máxima: 1,000,000 m²'),

  presupuesto: z.coerce
    .number()
    .positive('El presupuesto debe ser positivo')
    .optional(),
})

type ProyectoFormData = z.infer<typeof proyectoSchema>

// ============================================================================
// COMPONENTE
// ============================================================================

export function FormularioProyectoReal() {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<ProyectoFormData>({
    resolver: zodResolver(proyectoSchema),
    mode: 'onBlur', // ← Validar al salir
    reValidateMode: 'onChange', // ← Si hay error, validar mientras corrige
  })

  const onSubmit = async (data: ProyectoFormData) => {
    console.log('✅ Guardando proyecto:', data)
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log('✅ Proyecto guardado!')
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Crear Nuevo Proyecto
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Completa la información básica del proyecto de construcción
        </p>
      </div>

      {/* Campos */}
      <div className="space-y-6">
        {/* Nombre */}
        <FormInput
          label="Nombre del Proyecto"
          name="nombre"
          placeholder="Ej: Urbanización Los Pinos 2025"
          required
          register={register('nombre')}
          error={errors.nombre}
          touched={touchedFields.nombre}
          helpText="Solo letras, números, espacios y guiones permitidos"
          maxLength={100}
        />

        {/* Descripción */}
        <FormTextarea
          label="Descripción"
          name="descripcion"
          placeholder="Describe el proyecto, sus características y objetivos..."
          register={register('descripcion')}
          error={errors.descripcion}
          touched={touchedFields.descripcion}
          helpText="Mínimo 10 caracteres para una descripción útil"
          maxLength={500}
          rows={4}
        />

        {/* Estado y Ciudad (grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Estado (Departamento)"
            name="estado"
            placeholder="Selecciona un estado"
            required
            register={register('estado')}
            error={errors.estado}
            touched={touchedFields.estado}
            options={[
              { value: 'Antioquia', label: 'Antioquia' },
              { value: 'Cundinamarca', label: 'Cundinamarca' },
              { value: 'Valle del Cauca', label: 'Valle del Cauca' },
              { value: 'Atlántico', label: 'Atlántico' },
            ]}
          />

          <FormSelect
            label="Ciudad"
            name="ciudad"
            placeholder="Selecciona una ciudad"
            required
            register={register('ciudad')}
            error={errors.ciudad}
            touched={touchedFields.ciudad}
            options={[
              { value: 'Medellín', label: 'Medellín' },
              { value: 'Bogotá', label: 'Bogotá' },
              { value: 'Cali', label: 'Cali' },
              { value: 'Barranquilla', label: 'Barranquilla' },
            ]}
          />
        </div>

        {/* Dirección */}
        <FormInput
          label="Dirección"
          name="direccion"
          placeholder="Ej: Calle 123 # 45-67"
          required
          register={register('direccion')}
          error={errors.direccion}
          touched={touchedFields.direccion}
          maxLength={200}
        />

        {/* Área y Presupuesto (grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Área Total"
            name="area_total"
            type="number"
            placeholder="5000"
            required
            suffix="m²"
            register={register('area_total')}
            error={errors.area_total}
            touched={touchedFields.area_total}
            helpText="En metros cuadrados"
          />

          <FormInput
            label="Presupuesto Estimado"
            name="presupuesto"
            type="number"
            placeholder="500000000"
            prefix="$"
            register={register('presupuesto')}
            error={errors.presupuesto}
            touched={touchedFields.presupuesto}
            helpText="Opcional - Presupuesto total del proyecto"
          />
        </div>
      </div>

      {/* Resumen de errores (si hay) */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
            Por favor corrige {Object.keys(errors).length} error
            {Object.keys(errors).length > 1 ? 'es' : ''}:
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <strong className="capitalize">
                  {field.replace('_', ' ')}:
                </strong>{' '}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
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
    </form>
  )
}

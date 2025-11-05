/**
 * FormularioConfiguracion - Formulario para crear/editar configuración
 * ✅ React Hook Form + Zod
 * ✅ Formato de moneda
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { AlertCircle, DollarSign, FileText, Tag, Type } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { configuracionService, type ConfiguracionRecargo } from '../services/configuracion.service'

const schema = z.object({
  tipo: z.string().min(1, 'El tipo es obligatorio'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  valor: z.number().min(1, 'El valor debe ser mayor a 0'),
  descripcion: z.string().optional(),
  activo: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  configuracion?: ConfiguracionRecargo | null
  onGuardar: (datos: any) => Promise<boolean>
  onCancelar: () => void
}

export function FormularioConfiguracion({ configuracion, onGuardar, onCancelar }: Props) {
  const esEdicion = !!configuracion

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: '',
      nombre: '',
      valor: 0,
      descripcion: '',
      activo: true,
    },
  })

  // Cargar datos si es edición
  useEffect(() => {
    if (configuracion) {
      reset({
        tipo: configuracion.tipo,
        nombre: configuracion.nombre,
        valor: configuracion.valor,
        descripcion: configuracion.descripcion || '',
        activo: configuracion.activo,
      })
    }
  }, [configuracion, reset])

  const onSubmit = async (datos: FormData) => {
    const exito = await onGuardar(datos)
    if (exito) {
      reset()
      onCancelar()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const valorActual = watch('valor')
  const tiposDisponibles = configuracionService.getTiposDisponibles()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tipo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            {...register('tipo')}
            disabled={esEdicion}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
          >
            <option value="">Selecciona un tipo</option>
            {tiposDisponibles.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
        {errors.tipo && (
          <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            {errors.tipo.message}
          </p>
        )}
      </div>

      {/* Nombre */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            {...register('nombre')}
            type="text"
            placeholder="Ej: Gastos Notariales 2025"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        {errors.nombre && (
          <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            {errors.nombre.message}
          </p>
        )}
      </div>

      {/* Valor */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Valor <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            {...register('valor', { valueAsNumber: true })}
            type="number"
            step="100000"
            min="0"
            placeholder="5000000"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        {errors.valor && (
          <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            {errors.valor.message}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Valor formateado: {formatCurrency(valorActual)}
        </p>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descripción (Opcional)
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <textarea
            {...register('descripcion')}
            rows={3}
            placeholder="Descripción del recargo..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* Activo */}
      <div className="flex items-center gap-3">
        <input
          {...register('activo')}
          id="activo"
          type="checkbox"
          className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        />
        <label htmlFor="activo" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          Configuración activa
        </label>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancelar}
          className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </motion.button>
      </div>
    </form>
  )
}

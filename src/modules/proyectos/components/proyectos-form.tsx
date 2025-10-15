'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Building,
    MapPin,
    FileText,
    Plus,
    Trash2,
    Home
} from 'lucide-react'
import { inputs, buttons } from '../../../shared/styles/classes'
import { cn } from '../../../shared/utils/helpers'
import type { ProyectoFormData } from '../types'

// Schema completo de validación
const manzanaSchema = z.object({
    nombre: z.string().min(1, 'El nombre de la manzana es obligatorio'),
    totalViviendas: z.number().min(1, 'Mínimo 1 vivienda').max(100, 'Máximo 100 viviendas')
})

const proyectoSchema = z.object({
    nombre: z.string().min(3, 'El nombre del proyecto es obligatorio (mínimo 3 caracteres)').max(255, 'Máximo 255 caracteres'),
    descripcion: z.string().min(10, 'La descripción es obligatoria (mínimo 10 caracteres)'),
    ubicacion: z.string().min(5, 'La ubicación es obligatoria (mínimo 5 caracteres)').max(500, 'Máximo 500 caracteres'),
    manzanas: z.array(manzanaSchema).min(1, 'Debe agregar al menos una manzana')
})

type ProyectoFormSchema = z.infer<typeof proyectoSchema>

interface ProyectosFormProps {
    onSubmit: (data: ProyectoFormData) => void | Promise<void>
    onCancel: () => void
    isLoading?: boolean
    initialData?: Partial<ProyectoFormData>
}

export function ProyectosForm({ onSubmit, onCancel, isLoading, initialData }: ProyectosFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors }
    } = useForm<ProyectoFormSchema>({
        resolver: zodResolver(proyectoSchema),
        defaultValues: {
            nombre: initialData?.nombre || '',
            descripcion: initialData?.descripcion || '',
            ubicacion: initialData?.ubicacion || '',
            manzanas: initialData?.manzanas || []
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'manzanas'
    })

    const handleAgregarManzana = () => {
        append({
            nombre: `${String.fromCharCode(65 + fields.length)}`,
            totalViviendas: 0
        })
    }

    const onSubmitForm = (data: ProyectoFormSchema) => {
        // Completar con valores por defecto para los campos no incluidos en el formulario
        const formDataCompleto: ProyectoFormData = {
            ...data,
            // Agregar campos faltantes a las manzanas
            manzanas: data.manzanas.map(m => ({
                ...m,
                precioBase: 0,
                superficieTotal: 0,
                ubicacion: ''
            })),
            // Campos del proyecto con valores por defecto
            fechaInicio: new Date().toISOString(),
            fechaFinEstimada: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            presupuesto: 0,
            estado: 'en_planificacion',
            responsable: 'RyR Constructora',
            telefono: '+57 300 000 0000',
            email: 'info@ryrconstrucora.com'
        }
        onSubmit(formDataCompleto)
    }

    const totalManzanas = fields.length
    const totalViviendas = watch('manzanas')?.reduce((sum, m) => sum + (m.totalViviendas || 0), 0) || 0

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
            {/* Información General */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Información del Proyecto
                </h3>

                <div className="grid grid-cols-1 gap-6">
                    {/* Nombre */}
                    <div>
                        <label className="flex text-sm font-medium mb-2 items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Building className="w-4 h-4" />
                            Nombre del Proyecto <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('nombre')}
                            className={cn(inputs.base, inputs.default, errors.nombre && 'border-red-500 focus:border-red-500')}
                            placeholder="Ej: Urbanización Las Américas II"
                        />
                        {errors.nombre && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                <span>⚠️</span> {errors.nombre.message}
                            </p>
                        )}
                    </div>

                    {/* Ubicación */}
                    <div>
                        <label className="flex text-sm font-medium mb-2 items-center gap-2 text-gray-700 dark:text-gray-300">
                            <MapPin className="w-4 h-4" />
                            Ubicación <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('ubicacion')}
                            className={cn(inputs.base, inputs.default, errors.ubicacion && 'border-red-500 focus:border-red-500')}
                            placeholder="Dirección completa del proyecto"
                        />
                        {errors.ubicacion && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                <span>⚠️</span> {errors.ubicacion.message}
                            </p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="flex text-sm font-medium mb-2 items-center gap-2 text-gray-700 dark:text-gray-300">
                            <FileText className="w-4 h-4" />
                            Descripción <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('descripcion')}
                            className={cn(inputs.base, inputs.default, 'min-h-[120px]', errors.descripcion && 'border-red-500 focus:border-red-500')}
                            placeholder="Describe las características principales del proyecto..."
                            rows={5}
                        />
                        {errors.descripcion && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                <span>⚠️</span> {errors.descripcion.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Manzanas */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-t pt-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Home className="w-5 h-5 text-blue-600" />
                            Manzanas del Proyecto <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {totalManzanas} {totalManzanas === 1 ? 'manzana' : 'manzanas'} • {totalViviendas} {totalViviendas === 1 ? 'vivienda' : 'viviendas'} total
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAgregarManzana}
                        className={cn(buttons.base, buttons.primary, buttons.sm, 'flex items-center gap-2')}
                    >
                        <Plus className="w-4 h-4" />
                        Agregar Manzana
                    </button>
                </div>

                {errors.manzanas && !Array.isArray(errors.manzanas) && (
                    <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <span>⚠️</span> {errors.manzanas.message}
                    </p>
                )}

                {fields.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No hay manzanas agregadas
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Haz clic en "Agregar Manzana" para comenzar
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Home className="w-4 h-4 text-blue-600" />
                                        Manzana {index + 1}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nombre */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                            Nombre/Letra <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register(`manzanas.${index}.nombre`)}
                                            className={cn(inputs.base, inputs.default, 'text-sm', errors.manzanas?.[index]?.nombre && 'border-red-500')}
                                            placeholder="A"
                                        />
                                        {errors.manzanas?.[index]?.nombre && (
                                            <p className="text-xs text-red-500 mt-1">{errors.manzanas[index]?.nombre?.message}</p>
                                        )}
                                    </div>

                                    {/* Total Viviendas */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                            N° Viviendas <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            {...register(`manzanas.${index}.totalViviendas`, { valueAsNumber: true })}
                                            className={cn(inputs.base, inputs.default, 'text-sm', errors.manzanas?.[index]?.totalViviendas && 'border-red-500')}
                                            placeholder="0"
                                            min="1"
                                        />
                                        {errors.manzanas?.[index]?.totalViviendas && (
                                            <p className="text-xs text-red-500 mt-1">{errors.manzanas[index]?.totalViviendas?.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className={cn(buttons.base, buttons.secondary, buttons.md)}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(buttons.base, buttons.primary, buttons.md, 'min-w-[140px]')}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Guardando...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Crear Proyecto
                        </span>
                    )}
                </button>
            </div>
        </form>
    )
}

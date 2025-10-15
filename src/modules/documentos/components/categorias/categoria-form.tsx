'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { X, Folder, FileCheck, Camera, Receipt, FileText, FileSignature, Palette } from 'lucide-react'
import { COLORES_CATEGORIA, type CategoriaFormData } from '../../../../types/documento.types'
import { CategoriaIcon } from '../shared/categoria-icon'

interface CategoriaFormProps {
    categoria?: any // Para edición
    onSubmit: (data: CategoriaFormData) => Promise<void>
    onCancel: () => void
}

// Íconos disponibles para categorías
const ICONOS_DISPONIBLES = [
    { nombre: 'Folder', icono: 'Folder', label: 'Carpeta' },
    { nombre: 'FileCheck', icono: 'FileCheck', label: 'Licencia' },
    { nombre: 'FileText', icono: 'FileText', label: 'Documento' },
    { nombre: 'FileSignature', icono: 'FileSignature', label: 'Contrato' },
    { nombre: 'Receipt', icono: 'Receipt', label: 'Factura' },
    { nombre: 'Camera', icono: 'Camera', label: 'Fotografía' },
    { nombre: 'Image', icono: 'Image', label: 'Imagen' },
    { nombre: 'Building2', icono: 'Building2', label: 'Edificio' },
    { nombre: 'Hammer', icono: 'Hammer', label: 'Construcción' },
    { nombre: 'Ruler', icono: 'Ruler', label: 'Plano' },
]

export function CategoriaForm({ categoria, onSubmit, onCancel }: CategoriaFormProps) {
    const [guardando, setGuardando] = useState(false)
    const [colorSeleccionado, setColorSeleccionado] = useState(categoria?.color || 'blue')
    const [iconoSeleccionado, setIconoSeleccionado] = useState(categoria?.icono || 'Folder')

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CategoriaFormData>({
        defaultValues: {
            nombre: categoria?.nombre || '',
            descripcion: categoria?.descripcion || '',
            color: categoria?.color || 'blue',
            icono: categoria?.icono || 'Folder',
        },
    })

    const onSubmitForm = async (data: CategoriaFormData) => {
        setGuardando(true)
        try {
            await onSubmit({
                ...data,
                color: colorSeleccionado,
                icono: iconoSeleccionado,
            })
        } finally {
            setGuardando(false)
        }
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(onSubmitForm)}
            className="space-y-6"
        >
            {/* Preview de la categoría */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <CategoriaIcon icono={iconoSeleccionado} color={colorSeleccionado} size={32} />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vista previa</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {register('nombre').name || 'Nueva Categoría'}
                    </p>
                </div>
            </div>

            {/* Nombre */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                </label>
                <input
                    {...register('nombre')}
                    type="text"
                    placeholder="Ej: Licencias y Permisos"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                />
                {errors.nombre && (
                    <p className="mt-1 text-sm text-red-500">{errors.nombre.message}</p>
                )}
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción (opcional)
                </label>
                <textarea
                    {...register('descripcion')}
                    rows={3}
                    placeholder="Describe el tipo de documentos de esta categoría..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                />
                {errors.descripcion && (
                    <p className="mt-1 text-sm text-red-500">{errors.descripcion.message}</p>
                )}
            </div>

            {/* Selector de Color */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Color
                </label>
                <div className="grid grid-cols-6 gap-3">
                    {COLORES_CATEGORIA.map(({ value, label, class: bgClass }) => (
                        <motion.button
                            key={value}
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setColorSeleccionado(value)
                                setValue('color', value)
                            }}
                            className={`
                relative p-4 rounded-xl transition-all
                ${colorSeleccionado === value
                                    ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900'
                                    : 'hover:ring-2 hover:ring-gray-300'
                                }
              `}
                            title={label}
                        >
                            <div className={`w-full h-8 rounded-lg ${bgClass}`} />
                            {colorSeleccionado === value && (
                                <motion.div
                                    layoutId="color-selected"
                                    className="absolute inset-0 border-2 border-blue-500 rounded-xl"
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Selector de Ícono */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Ícono
                </label>
                <div className="grid grid-cols-5 gap-3">
                    {ICONOS_DISPONIBLES.map(({ nombre, icono, label }) => (
                        <motion.button
                            key={nombre}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setIconoSeleccionado(icono)
                                setValue('icono', icono)
                            }}
                            className={`
                relative p-4 rounded-xl transition-all flex items-center justify-center
                ${iconoSeleccionado === icono
                                    ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
              `}
                            title={label}
                        >
                            <CategoriaIcon icono={icono} color={colorSeleccionado} size={24} />
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={guardando}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/30"
                >
                    {guardando ? 'Guardando...' : categoria ? 'Actualizar' : 'Crear Categoría'}
                </button>
            </div>
        </motion.form>
    )
}

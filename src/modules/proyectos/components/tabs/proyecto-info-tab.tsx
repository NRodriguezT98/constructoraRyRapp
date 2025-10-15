'use client'

import { Info } from 'lucide-react'
import { Proyecto } from '../../types'

interface ProyectoInfoTabProps {
    proyecto: Proyecto
}

/**
 * Tab de información del proyecto
 * Componente de presentación puro
 */
export function ProyectoInfoTab({ proyecto }: ProyectoInfoTabProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Información del Proyecto
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Detalles generales y configuración
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Nombre del Proyecto
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold">
                        {proyecto.nombre}
                    </p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Ubicación
                    </label>
                    <p className="text-gray-900 dark:text-white">
                        {proyecto.ubicacion}
                    </p>
                </div>

                <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Descripción
                    </label>
                    <p className="text-gray-700 dark:text-gray-300">
                        {proyecto.descripcion}
                    </p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Responsable
                    </label>
                    <p className="text-gray-900 dark:text-white">
                        {proyecto.responsable}
                    </p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Estado
                    </label>
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {proyecto.estado}
                    </span>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Teléfono
                    </label>
                    <p className="text-gray-900 dark:text-white">
                        {proyecto.telefono}
                    </p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Email
                    </label>
                    <p className="text-gray-900 dark:text-white">
                        {proyecto.email}
                    </p>
                </div>
            </div>
        </div>
    )
}

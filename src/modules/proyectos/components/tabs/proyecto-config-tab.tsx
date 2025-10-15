'use client'

import { Settings } from 'lucide-react'
import { Proyecto } from '../../types'

interface ProyectoConfigTabProps {
    proyecto: Proyecto
}

/**
 * Tab de configuración del proyecto
 * Componente de presentación puro
 */
export function ProyectoConfigTab({ proyecto }: ProyectoConfigTabProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Configuración
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ajustes y preferencias del proyecto
                    </p>
                </div>
            </div>

            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                    Configuración en desarrollo...
                </p>
            </div>
        </div>
    )
}

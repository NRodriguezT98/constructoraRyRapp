/**
 * AuditoriaEstado - Badge de estado del proyecto
 * Muestra el estado con colores y animaciones
 */

'use client'

import { CheckCircle2, Clock, Pause } from 'lucide-react'

interface AuditoriaEstadoProps {
  estado: string
}

const ESTADO_CONFIG = {
  en_proceso: {
    label: 'En Proceso',
    icon: Clock,
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
  },
  en_planificacion: {
    label: 'En Planificación',
    icon: Clock,
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
  },
  en_construccion: {
    label: 'En Construcción',
    icon: Clock,
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-300',
  },
  completado: {
    label: 'Completado',
    icon: CheckCircle2,
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
  },
  pausado: {
    label: 'Pausado',
    icon: Pause,
    gradient: 'from-gray-500 to-slate-500',
    bg: 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
    border: 'border-gray-200 dark:border-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
  },
}

export function AuditoriaEstado({ estado }: AuditoriaEstadoProps) {
  const config = ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG] || ESTADO_CONFIG.en_proceso
  const Icon = config.icon

  return (
    <div className={`p-4 rounded-xl ${config.bg} border ${config.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-0.5">
              Estado
            </p>
            <p className={`text-base font-bold ${config.text}`}>
              {config.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient} animate-pulse`} />
        </div>
      </div>
    </div>
  )
}

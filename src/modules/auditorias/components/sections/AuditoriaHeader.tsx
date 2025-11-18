/**
 * AuditoriaHeader - Header reutilizable para modales de auditoría
 * Muestra: Acción, Usuario, Fecha
 */

'use client'

import { formatDateTimeForDisplay } from '@/lib/utils/date.utils'
import { Archive, ArchiveRestore, CheckCircle2, Edit3, Trash2 } from 'lucide-react'

interface AuditoriaHeaderProps {
  accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'archivado' | 'restaurado'
  usuario: {
    nombre: string
    email: string
    rol?: string
  }
  fecha: string
  modulo?: string
}

const ACCION_CONFIG = {
  CREATE: {
    label: 'Creación',
    icon: CheckCircle2,
    color: 'from-green-500 via-emerald-500 to-teal-500',
    badgeColor: 'bg-green-500',
    textColor: 'text-green-100',
  },
  UPDATE: {
    label: 'Actualización',
    icon: Edit3,
    color: 'from-blue-500 via-indigo-500 to-purple-500',
    badgeColor: 'bg-blue-500',
    textColor: 'text-blue-100',
  },
  DELETE: {
    label: 'Eliminación',
    icon: Trash2,
    color: 'from-red-500 via-rose-500 to-pink-500',
    badgeColor: 'bg-red-500',
    textColor: 'text-red-100',
  },
  archivado: {
    label: 'Archivado',
    icon: Archive,
    color: 'from-amber-500 via-orange-500 to-yellow-500',
    badgeColor: 'bg-amber-500',
    textColor: 'text-amber-100',
  },
  restaurado: {
    label: 'Restaurado',
    icon: ArchiveRestore,
    color: 'from-green-500 via-emerald-500 to-teal-500',
    badgeColor: 'bg-green-500',
    textColor: 'text-green-100',
  },
}

export function AuditoriaHeader({ accion, usuario, fecha, modulo }: AuditoriaHeaderProps) {
  const config = ACCION_CONFIG[accion] || ACCION_CONFIG.UPDATE
  const Icon = config.icon

  return (
    <div className={`relative h-32 bg-gradient-to-br ${config.color} p-6 rounded-t-2xl`}>
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

      <div className="relative z-10">
        {/* Badge de Acción */}
        <div className="flex items-center gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
            <Icon className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">{config.label}</span>
          </div>
          {modulo && (
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
              {modulo}
            </span>
          )}
        </div>

        {/* Usuario y Fecha */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {usuario.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{usuario.nombre}</p>
              <p className={`text-xs ${config.textColor}`}>
                {usuario.rol || 'Administrador'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium text-white/80 uppercase tracking-wide mb-1">
              Fecha
            </p>
            <p className="text-sm font-bold text-white">
              {formatDateTimeForDisplay(fecha)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

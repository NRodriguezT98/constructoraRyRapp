/**
 * CreacionProyectoRenderer - Renderer para acción CREATE en módulo proyectos
 * ✅ Diseño compacto sin scroll
 * ✅ Labels claros tipo formulario
 * ✅ Información organizada campo por campo
 */

'use client'

import { Building2, DollarSign, FileText, Home, Mail, MapPin, Phone, TrendingUp, User } from 'lucide-react'

interface CreacionProyectoRendererProps {
  metadata: any
  datosNuevos?: any
}

export function CreacionProyectoRenderer({ metadata, datosNuevos }: CreacionProyectoRendererProps) {
  const proyecto = {
    nombre: metadata.proyecto_nombre || datosNuevos?.nombre,
    ubicacion: metadata.proyecto_ubicacion || datosNuevos?.ubicacion,
    descripcion: metadata.proyecto_descripcion || datosNuevos?.descripcion,
    estado: metadata.proyecto_estado || datosNuevos?.estado,
    presupuesto: metadata.proyecto_presupuesto || datosNuevos?.presupuesto,
    responsable: metadata.proyecto_responsable || datosNuevos?.responsable,
    telefono: metadata.proyecto_telefono || datosNuevos?.telefono,
    email: metadata.proyecto_email || datosNuevos?.email,
  }

  const manzanas = metadata.manzanas_detalle || datosNuevos?.manzanas || []
  const totalViviendas = metadata.total_viviendas_planificadas || 0

  // Helper para formatear estado
  const formatEstado = (estado: string) => {
    const estados: Record<string, string> = {
      en_proceso: 'En Proceso',
      completado: 'Completado',
      pausado: 'Pausado',
      en_planificacion: 'En Planificación',
      en_construccion: 'En Construcción',
    }
    return estados[estado] || estado
  }

  return (
    <div className="space-y-3 px-4 py-3">
      {/* Datos Principales del Proyecto */}
      <div className="space-y-2">
        {/* Nombre del Proyecto */}
        <div className="flex items-start gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nombre del Proyecto:</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{proyecto.nombre}</p>
          </div>
        </div>

        {/* Ubicación */}
        {proyecto.ubicacion && (
          <div className="flex items-start gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
            <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Ubicación:</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{proyecto.ubicacion}</p>
            </div>
          </div>
        )}

        {/* Descripción */}
        {proyecto.descripcion && (
          <div className="flex items-start gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
            <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Descripción:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{proyecto.descripcion}</p>
            </div>
          </div>
        )}

        {/* Estado Inicial */}
        {proyecto.estado && (
          <div className="flex items-start gap-2 py-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Estado Inicial:</p>
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 capitalize">
                {formatEstado(proyecto.estado)}
              </p>
            </div>
          </div>
        )}

        {/* Presupuesto */}
        {(proyecto.presupuesto && proyecto.presupuesto > 0) ? (
          <div className="flex items-start gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Presupuesto:</p>
              <p className="text-sm font-bold text-green-900 dark:text-green-100">
                ${proyecto.presupuesto.toLocaleString()}
              </p>
            </div>
          </div>
        ) : null}

        {/* Responsable */}
        {proyecto.responsable && proyecto.responsable !== 'RyR Constructora' && (
          <div className="flex items-start gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Responsable:</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{proyecto.responsable}</p>
            </div>
          </div>
        )}

        {/* Teléfono */}
        {proyecto.telefono && proyecto.telefono !== '+57 300 000 0000' && (
          <div className="flex items-start gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
            <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Teléfono:</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{proyecto.telefono}</p>
            </div>
          </div>
        )}

        {/* Email */}
        {proyecto.email && proyecto.email !== 'info@ryrconstrucora.com' && (
          <div className="flex items-start gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
            <Mail className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email:</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{proyecto.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Manzanas y Viviendas */}
      {manzanas.length > 0 && (
        <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Distribución de Viviendas:</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                {manzanas.length} manzana{manzanas.length !== 1 ? 's' : ''}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                {totalViviendas} viviendas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {manzanas.slice(0, 4).map((manzana: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800"
              >
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                  Mz. {manzana.nombre}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  {manzana.numero_viviendas || 0} viv.
                </span>
              </div>
            ))}
          </div>

          {manzanas.length > 4 && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-1.5">
              +{manzanas.length - 4} manzana{manzanas.length - 4 !== 1 ? 's' : ''} más
            </p>
          )}
        </div>
      )}
    </div>
  )
}

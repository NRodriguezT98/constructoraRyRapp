/**
 * ProyectoDetalleRender - Renderizado de detalles de auditoría para módulo Proyectos
 *
 * ✅ Componente presentacional puro
 * ✅ < 150 líneas
 * ✅ Sin lógica compleja
 */

'use client'

import { motion } from 'framer-motion'
import { Building2, DollarSign, Home, MapPin, Phone, User } from 'lucide-react'
import { formatearDinero } from '../../utils/formatters'
import { InfoCard } from '../shared'

interface ProyectoDetalleRenderProps {
  metadata: Record<string, any>
}

export function ProyectoDetalleRender({ metadata }: ProyectoDetalleRenderProps) {
  const manzanas = metadata.manzanas_detalle || []

  // Verificar si hay información adicional
  const hasAdditionalInfo =
    (metadata.proyecto_estado && metadata.proyecto_estado !== 'en_planificacion') ||
    (metadata.proyecto_presupuesto && metadata.proyecto_presupuesto > 0) ||
    (metadata.proyecto_responsable && metadata.proyecto_responsable !== 'RyR Constructora') ||
    (metadata.proyecto_telefono && metadata.proyecto_telefono !== '+57 300 000 0000') ||
    (metadata.proyecto_email && metadata.proyecto_email !== 'info@ryrconstrucora.com')

  return (
    <div className="space-y-3">
      {/* Header Principal */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <div className="space-y-2">
          {/* Nombre */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide block">
                Proyecto
              </label>
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {metadata.proyecto_nombre || 'N/A'}
              </h3>
            </div>
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-2 pt-1.5 border-t border-blue-200 dark:border-blue-800">
            <MapPin className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Ubicación
              </label>
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {metadata.proyecto_ubicacion || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {metadata.proyecto_descripcion && (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Descripción
          </label>
          <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700 leading-snug line-clamp-2">
            {metadata.proyecto_descripcion}
          </p>
        </div>
      )}

      {/* Información Adicional */}
      {hasAdditionalInfo && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Información Adicional
          </label>
          <div className="grid grid-cols-2 gap-2">
            {metadata.proyecto_estado && metadata.proyecto_estado !== 'en_planificacion' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">📊</span>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-gray-500 dark:text-gray-400 block">Estado</label>
                  <span className="text-xs font-bold text-gray-900 dark:text-white capitalize truncate block">
                    {metadata.proyecto_estado}
                  </span>
                </div>
              </div>
            )}

            {metadata.proyecto_presupuesto && metadata.proyecto_presupuesto > 0 && (
              <InfoCard
                icon={DollarSign}
                label="Presupuesto"
                value={metadata.proyecto_presupuesto_formateado || formatearDinero(metadata.proyecto_presupuesto)}
                color="green"
              />
            )}

            {metadata.proyecto_responsable && metadata.proyecto_responsable !== 'RyR Constructora' && (
              <InfoCard
                icon={User}
                label="Responsable"
                value={metadata.proyecto_responsable}
                color="purple"
              />
            )}

            {metadata.proyecto_telefono && metadata.proyecto_telefono !== '+57 300 000 0000' && (
              <InfoCard
                icon={Phone}
                label="Teléfono"
                value={metadata.proyecto_telefono}
                color="cyan"
              />
            )}

            {metadata.proyecto_email && metadata.proyecto_email !== 'info@ryrconstrucora.com' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 col-span-2">
                <div className="w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">✉️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-gray-500 dark:text-gray-400 block">Email</label>
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                    {metadata.proyecto_email}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manzanas */}
      {manzanas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Manzanas
            </label>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                <Building2 className="w-3 h-3" />
                {metadata.total_manzanas || manzanas.length}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold">
                <Home className="w-3 h-3" />
                {metadata.total_viviendas_planificadas || 0}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {manzanas.map((manzana: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-2 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      Mz. {manzana.nombre}
                    </h4>
                    <span className="text-base flex-shrink-0">🏘️</span>
                  </div>
                  <div className="flex items-center justify-between px-1.5 py-1 rounded bg-white/50 dark:bg-gray-950/50">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400">Viviendas</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {manzana.numero_viviendas || 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

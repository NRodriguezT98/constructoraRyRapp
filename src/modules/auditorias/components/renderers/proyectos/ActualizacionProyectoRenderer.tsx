/**
 * ActualizacionProyectoRenderer - Renderer para actualizaciones de proyectos
 *
 * ✅ Muestra diferencias campo por campo
 * ✅ Resalta cambios con colores (rojo=anterior, verde=nuevo)
 * ✅ Compara estados, manzanas, datos generales
 * ✅ Diseño profesional con glassmorphism
 */

'use client'

import { ArrowRight, Building, FileText, MapPin, TrendingUp } from 'lucide-react'

import { AuditoriaEstado } from '../../sections/AuditoriaEstado'

interface ActualizacionProyectoRendererProps {
  metadata?: any
  datosNuevos?: any
  datosAnteriores?: any
}

export function ActualizacionProyectoRenderer({
  metadata,
  datosNuevos,
  datosAnteriores,
}: ActualizacionProyectoRendererProps) {
  // Datos del proyecto
  const proyectoNuevo = datosNuevos?.proyecto || {}
  const proyectoAnterior = datosAnteriores?.proyecto || {}

  // Detectar campos modificados
  const camposModificados = []

  if (proyectoNuevo.nombre !== proyectoAnterior.nombre) {
    camposModificados.push({
      campo: 'Nombre del Proyecto',
      icon: Building,
      anterior: proyectoAnterior.nombre,
      nuevo: proyectoNuevo.nombre,
    })
  }

  if (proyectoNuevo.ubicacion !== proyectoAnterior.ubicacion) {
    camposModificados.push({
      campo: 'Ubicación',
      icon: MapPin,
      anterior: proyectoAnterior.ubicacion,
      nuevo: proyectoNuevo.ubicacion,
    })
  }

  if (proyectoNuevo.descripcion !== proyectoAnterior.descripcion) {
    camposModificados.push({
      campo: 'Descripción',
      icon: FileText,
      anterior: proyectoAnterior.descripcion,
      nuevo: proyectoNuevo.descripcion,
    })
  }

  if (proyectoNuevo.estado !== proyectoAnterior.estado) {
    camposModificados.push({
      campo: 'Estado',
      icon: TrendingUp,
      anterior: proyectoAnterior.estado,
      nuevo: proyectoNuevo.estado,
      esEstado: true,
    })
  }

  // Manzanas modificadas
  const manzanasNuevas = datosNuevos?.manzanas || []
  const manzanasAnteriores = datosAnteriores?.manzanas || []
  const manzanasAgregadas = manzanasNuevas.filter(
    (m: any) => !manzanasAnteriores.find((a: any) => a.nombre === m.nombre)
  )
  const manzanasEliminadas = manzanasAnteriores.filter(
    (m: any) => !manzanasNuevas.find((n: any) => n.nombre === m.nombre)
  )

  return (
    <div className="space-y-4 p-6">
      {/* Resumen de cambios */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {camposModificados.length} campo{camposModificados.length !== 1 ? 's' : ''} modificado
          {camposModificados.length !== 1 ? 's' : ''}
          {manzanasAgregadas.length > 0 && ` • ${manzanasAgregadas.length} manzana${manzanasAgregadas.length !== 1 ? 's' : ''} agregada${manzanasAgregadas.length !== 1 ? 's' : ''}`}
          {manzanasEliminadas.length > 0 && ` • ${manzanasEliminadas.length} manzana${manzanasEliminadas.length !== 1 ? 's' : ''} eliminada${manzanasEliminadas.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Campos modificados */}
      {camposModificados.length > 0 && (
        <div className="space-y-3">
          {camposModificados.map((cambio, index) => {
            const Icon = cambio.icon

            if (cambio.esEstado) {
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{cambio.campo}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Estado anterior</p>
                      <AuditoriaEstado estado={cambio.anterior} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Estado nuevo</p>
                      <AuditoriaEstado estado={cambio.nuevo} />
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{cambio.campo}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="px-2 py-1 rounded bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 flex-1">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-0.5">Anterior:</p>
                      <p className="text-sm text-red-900 dark:text-red-100 line-through">
                        {cambio.anterior || '(vacío)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="px-2 py-1 rounded bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-800 flex-1">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-0.5">Nuevo:</p>
                      <p className="text-sm text-green-900 dark:text-green-100 font-semibold">
                        {cambio.nuevo || '(vacío)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Manzanas agregadas */}
      {manzanasAgregadas.length > 0 && (
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
              <Building className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">Manzanas agregadas</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {manzanasAgregadas.map((manzana: any, idx: number) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700"
              >
                <p className="text-sm font-bold text-green-900 dark:text-green-100">{manzana.nombre}</p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {manzana.cantidad_viviendas || 0} viviendas
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manzanas eliminadas */}
      {manzanasEliminadas.length > 0 && (
        <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/50">
              <Building className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-red-900 dark:text-red-100">Manzanas eliminadas</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {manzanasEliminadas.map((manzana: any, idx: number) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 line-through"
              >
                <p className="text-sm font-bold text-red-900 dark:text-red-100">{manzana.nombre}</p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {manzana.cantidad_viviendas || 0} viviendas
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin cambios (edge case) */}
      {camposModificados.length === 0 && manzanasAgregadas.length === 0 && manzanasEliminadas.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
          <FileText className="w-4 h-4 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No se detectaron cambios en los datos del proyecto
          </p>
        </div>
      )}
    </div>
  )
}

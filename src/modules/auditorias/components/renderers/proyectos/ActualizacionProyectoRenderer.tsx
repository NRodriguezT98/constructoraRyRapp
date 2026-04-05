/**
 * ActualizacionProyectoRenderer - Renderer para actualizaciones de proyectos
 *
 * ✅ Muestra diferencias campo por campo
 * ✅ Resalta cambios con colores (rojo=anterior, verde=nuevo)
 * ✅ Compara estados, manzanas, datos generales
 * ✅ Diseño profesional con glassmorphism
 */

'use client'

import {
  ArrowRight,
  Building,
  FileText,
  MapPin,
  TrendingUp,
} from 'lucide-react'

import type { RendererAuditoriaProps } from '@/modules/auditorias/types'

import { AuditoriaEstado } from '../../sections/AuditoriaEstado'

type ProyectoDiff = {
  nombre?: string
  ubicacion?: string
  descripcion?: string
  estado?: string
}
type ManzanaChange = { nombre: string; cantidad_viviendas?: number }

export function ActualizacionProyectoRenderer({
  datosNuevos,
  datosAnteriores,
}: RendererAuditoriaProps) {
  const proyectoNuevo = (datosNuevos?.proyecto ?? {}) as ProyectoDiff
  const proyectoAnterior = (datosAnteriores?.proyecto ?? {}) as ProyectoDiff

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
  const manzanasNuevas = (datosNuevos?.manzanas ?? []) as ManzanaChange[]
  const manzanasAnteriores = (datosAnteriores?.manzanas ??
    []) as ManzanaChange[]
  const manzanasAgregadas = manzanasNuevas.filter(
    m => !manzanasAnteriores.find(a => a.nombre === m.nombre)
  )
  const manzanasEliminadas = manzanasAnteriores.filter(
    m => !manzanasNuevas.find(n => n.nombre === m.nombre)
  )

  return (
    <div className='space-y-4 p-6'>
      {/* Resumen de cambios */}
      <div className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-950/30'>
        <TrendingUp className='h-4 w-4 text-blue-600 dark:text-blue-400' />
        <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
          {camposModificados.length} campo
          {camposModificados.length !== 1 ? 's' : ''} modificado
          {camposModificados.length !== 1 ? 's' : ''}
          {manzanasAgregadas.length > 0 &&
            ` • ${manzanasAgregadas.length} manzana${manzanasAgregadas.length !== 1 ? 's' : ''} agregada${manzanasAgregadas.length !== 1 ? 's' : ''}`}
          {manzanasEliminadas.length > 0 &&
            ` • ${manzanasEliminadas.length} manzana${manzanasEliminadas.length !== 1 ? 's' : ''} eliminada${manzanasEliminadas.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Campos modificados */}
      {camposModificados.length > 0 && (
        <div className='space-y-3'>
          {camposModificados.map((cambio, index) => {
            const Icon = cambio.icon

            if (cambio.esEstado) {
              return (
                <div
                  key={index}
                  className='relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'
                >
                  <div className='mb-3 flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50'>
                      <Icon className='h-4 w-4 text-white' />
                    </div>
                    <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                      {cambio.campo}
                    </p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='flex-1'>
                      <p className='mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400'>
                        Estado anterior
                      </p>
                      <AuditoriaEstado estado={cambio.anterior ?? ''} />
                    </div>
                    <ArrowRight className='h-5 w-5 flex-shrink-0 text-gray-400' />
                    <div className='flex-1'>
                      <p className='mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400'>
                        Estado nuevo
                      </p>
                      <AuditoriaEstado estado={cambio.nuevo ?? ''} />
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={index}
                className='relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'
              >
                <div className='mb-3 flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50'>
                    <Icon className='h-4 w-4 text-white' />
                  </div>
                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                    {cambio.campo}
                  </p>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-start gap-2'>
                    <div className='flex-1 rounded border border-red-300 bg-red-100 px-2 py-1 dark:border-red-800 dark:bg-red-950/50'>
                      <p className='mb-0.5 text-xs font-medium text-red-600 dark:text-red-400'>
                        Anterior:
                      </p>
                      <p className='text-sm text-red-900 line-through dark:text-red-100'>
                        {cambio.anterior ?? '(vacío)'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center justify-center'>
                    <ArrowRight className='h-4 w-4 text-gray-400' />
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='flex-1 rounded border border-green-300 bg-green-100 px-2 py-1 dark:border-green-800 dark:bg-green-950/50'>
                      <p className='mb-0.5 text-xs font-medium text-green-600 dark:text-green-400'>
                        Nuevo:
                      </p>
                      <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                        {cambio.nuevo ?? '(vacío)'}
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
        <div className='relative overflow-hidden rounded-xl border border-green-200/50 bg-green-50 p-4 backdrop-blur-xl dark:border-green-800/50 dark:bg-green-950/30'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'>
              <Building className='h-4 w-4 text-white' />
            </div>
            <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
              Manzanas agregadas
            </p>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            {manzanasAgregadas.map((manzana, idx: number) => (
              <div
                key={idx}
                className='rounded-lg border border-green-300 bg-green-100 px-3 py-2 dark:border-green-700 dark:bg-green-900/50'
              >
                <p className='text-sm font-bold text-green-900 dark:text-green-100'>
                  {manzana.nombre}
                </p>
                <p className='text-xs text-green-700 dark:text-green-300'>
                  {manzana.cantidad_viviendas || 0} viviendas
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manzanas eliminadas */}
      {manzanasEliminadas.length > 0 && (
        <div className='relative overflow-hidden rounded-xl border border-red-200/50 bg-red-50 p-4 backdrop-blur-xl dark:border-red-800/50 dark:bg-red-950/30'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/50'>
              <Building className='h-4 w-4 text-white' />
            </div>
            <p className='text-sm font-semibold text-red-900 dark:text-red-100'>
              Manzanas eliminadas
            </p>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            {manzanasEliminadas.map((manzana, idx: number) => (
              <div
                key={idx}
                className='rounded-lg border border-red-300 bg-red-100 px-3 py-2 line-through dark:border-red-700 dark:bg-red-900/50'
              >
                <p className='text-sm font-bold text-red-900 dark:text-red-100'>
                  {manzana.nombre}
                </p>
                <p className='text-xs text-red-700 dark:text-red-300'>
                  {manzana.cantidad_viviendas || 0} viviendas
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin cambios (edge case) */}
      {camposModificados.length === 0 &&
        manzanasAgregadas.length === 0 &&
        manzanasEliminadas.length === 0 && (
          <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50'>
            <FileText className='h-4 w-4 text-gray-400' />
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              No se detectaron cambios en los datos del proyecto
            </p>
          </div>
        )}
    </div>
  )
}

/**
 * ============================================
 * COMPONENTE: FuentePagoCardProgress
 * ============================================
 *
 * Componente especializado para progreso de validación.
 * Responsabilidades:
 * - Mostrar progreso circular
 * - Lista de pasos/documentos
 * - Estados de validación
 */

import { memo } from 'react'

import { AlertCircle, CheckCircle, Eye, Upload } from 'lucide-react'

import type { NivelValidacion } from '../../types'

export interface Paso {
  id: string
  titulo: string
  descripcion?: string
  completado: boolean
  tiene_documento: boolean
  documento_id?: string
}

export interface Progreso {
  porcentaje: number
  completados: number
  pendientes: number
  total: number
}

interface FuentePagoCardProgressProps {
  pasos: Paso[]
  progreso: Progreso
  validacion: NivelValidacion
  tieneRequisitos: boolean
  onAbrirModalSubida?: (paso: Paso) => void
  onVerDocumento?: (documentoId: string) => void
}

export const FuentePagoCardProgress = memo(function FuentePagoCardProgress({
  pasos,
  progreso,
  validacion: _validacion,
  tieneRequisitos,
  onAbrirModalSubida,
  onVerDocumento,
}: FuentePagoCardProgressProps) {
  // Si no requiere documentos (Cuota Inicial)
  if (!tieneRequisitos) {
    return (
      <div className='rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20'>
        <div className='flex items-center gap-2'>
          <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
          <div className='flex-1'>
            <p className='text-xs font-semibold text-green-900 dark:text-green-100'>
              Lista para recibir pagos
            </p>
            <p className='mt-0.5 text-[10px] text-green-700 dark:text-green-300'>
              No requiere documentos. Puedes registrar abonos directamente.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si no hay pasos configurados
  if (pasos.length === 0) {
    return (
      <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20'>
        <div className='flex items-center gap-2'>
          <AlertCircle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
          <div className='flex-1'>
            <p className='text-xs font-semibold text-amber-900 dark:text-amber-100'>
              ⚠️ Requisitos no configurados
            </p>
            <p className='mt-1 text-[10px] text-amber-700 dark:text-amber-300'>
              Esta fuente requiere validación de documentos, pero los pasos no
              se han creado. Contacta al administrador para configurar los
              requisitos.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar progreso y lista de pasos
  return (
    <div className='space-y-3'>
      {/* Header con progreso */}
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
          Documentación requerida
        </h4>
        <div className='flex items-center gap-2'>
          <div className='text-xs text-gray-600 dark:text-gray-400'>
            {progreso.completados} de {progreso.total} completados
          </div>
          <div className='text-sm font-bold text-blue-600 dark:text-blue-400'>
            {progreso.porcentaje}%
          </div>
        </div>
      </div>

      {/* Lista de pasos */}
      <div className='space-y-2'>
        {pasos.map(paso => (
          <div
            key={paso.id}
            className={`rounded-lg border-2 p-2 transition-all ${
              paso.completado
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
            }`}
          >
            <div className='flex items-start justify-between'>
              <div className='flex flex-1 items-start gap-2'>
                {paso.completado ? (
                  <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400' />
                ) : (
                  <div className='mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 border-gray-300 dark:border-gray-600' />
                )}
                <div className='min-w-0 flex-1'>
                  <p
                    className={`text-xs font-semibold ${
                      paso.completado
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {paso.titulo}
                  </p>
                  {paso.descripcion && (
                    <p className='mt-0.5 text-[10px] text-gray-600 dark:text-gray-400'>
                      {paso.descripcion}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción - Diseño mejorado */}
              <div className='ml-2 flex items-center gap-2'>
                {paso.tiene_documento ? (
                  <div className='flex items-center gap-2'>
                    {/* Badge de éxito */}
                    <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                      <CheckCircle className='h-3 w-3' />
                      Subido
                    </span>
                    {/* Botón ver documento */}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        if (paso.documento_id) {
                          onVerDocumento?.(paso.documento_id)
                        }
                      }}
                      className='inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-700 shadow-sm transition-all hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                      title='Ver documento'
                    >
                      <Eye className='h-3 w-3' />
                      Ver
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onAbrirModalSubida?.(paso)
                    }}
                    className='inline-flex transform items-center gap-1 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-[11px] font-medium text-white shadow-md transition-all hover:scale-105 hover:from-cyan-600 hover:to-blue-600 hover:shadow-lg'
                    title='Subir documento'
                  >
                    <Upload className='h-3.5 w-3.5' />
                    Subir Documento
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

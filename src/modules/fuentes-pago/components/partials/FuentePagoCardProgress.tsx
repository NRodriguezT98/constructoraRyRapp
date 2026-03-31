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

interface Paso {
  id: string
  titulo: string
  descripcion?: string
  completado: boolean
  tiene_documento: boolean
  documento_id?: string
}

interface Progreso {
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
  validacion,
  tieneRequisitos,
  onAbrirModalSubida,
  onVerDocumento,
}: FuentePagoCardProgressProps) {
  // Si no requiere documentos (Cuota Inicial)
  if (!tieneRequisitos) {
    return (
      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-green-900 dark:text-green-100">
              Lista para recibir pagos
            </p>
            <p className="text-[10px] text-green-700 dark:text-green-300 mt-0.5">
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
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">
              ⚠️ Requisitos no configurados
            </p>
            <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">
              Esta fuente requiere validación de documentos, pero los pasos no se han creado.
              Contacta al administrador para configurar los requisitos.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar progreso y lista de pasos
  return (
    <div className="space-y-3">
      {/* Header con progreso */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Documentación requerida
        </h4>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {progreso.completados} de {progreso.total} completados
          </div>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {progreso.porcentaje}%
          </div>
        </div>
      </div>

      {/* Lista de pasos */}
      <div className="space-y-2">
        {pasos.map((paso) => (
          <div
            key={paso.id}
            className={`p-2 rounded-lg border-2 transition-all ${
              paso.completado
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {paso.completado ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${
                    paso.completado ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {paso.titulo}
                  </p>
                  {paso.descripcion && (
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                      {paso.descripcion}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción - Diseño mejorado */}
              <div className="flex items-center gap-2 ml-2">
                {paso.tiene_documento ? (
                  <div className="flex items-center gap-2">
                    {/* Badge de éxito */}
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Subido
                    </span>
                    {/* Botón ver documento */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onVerDocumento?.(paso.documento_id!)
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-[10px] font-medium shadow-sm"
                      title="Ver documento"
                    >
                      <Eye className="w-3 h-3" />
                      Ver
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAbrirModalSubida?.(paso)
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all text-[11px] font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                    title="Subir documento"
                  >
                    <Upload className="w-3.5 h-3.5" />
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

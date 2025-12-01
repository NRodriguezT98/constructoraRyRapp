/**
 * ConfirmarCambiosDocumentoModal - Modal para confirmar cambios en documentos
 *
 * ✅ Componente presentacional puro
 * ✅ Diseño tipo diff/comparación profesional
 * ✅ Visualización clara de antes/después
 */

'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Calendar, CheckCircle2, FileText, Folder, Loader2, Pencil, X } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { ResumenCambiosDocumento } from '../../hooks/useDetectarCambiosDocumento'

interface ConfirmarCambiosDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cambios: ResumenCambiosDocumento
  isLoading?: boolean
  nombreCategoria?: string
}

export function ConfirmarCambiosDocumentoModal({
  isOpen,
  onClose,
  onConfirm,
  cambios,
  isLoading = false,
  nombreCategoria,
}: ConfirmarCambiosDocumentoModalProps) {
  if (!isOpen) {
    return null
  }

  const getIconForField = (campo: string) => {
    switch (campo) {
      case 'titulo':
        return <FileText className="w-5 h-5" />
      case 'descripcion':
        return <Pencil className="w-5 h-5" />
      case 'categoria_id':
        return <Folder className="w-5 h-5" />
      case 'fecha_documento':
      case 'fecha_vencimiento':
        return <Calendar className="w-5 h-5" />
      default:
        return <Pencil className="w-5 h-5" />
    }
  }

  const formatValue = (campo: string, valor: string | null) => {
    if (!valor || valor === 'Sin fecha' || valor === 'Sin categoría' || valor === 'Sin descripción' || valor === 'Sin vencimiento') {
      return valor
    }

    // Si es una fecha ISO, formatearla
    if (campo.includes('fecha') && valor.includes('-')) {
      try {
        return formatDateCompact(valor)
      } catch {
        return valor
      }
    }

    // Si es categoría, mostrar nombre legible
    if (campo === 'categoria_id' && nombreCategoria) {
      return nombreCategoria
    }

    return valor
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => {
          if (!isLoading) onClose()
        }}
      />

      {/* Modal - Compacto */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compacto */}
        <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 px-4 py-3">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Revisar Cambios</h3>
                <p className="text-xs text-green-50 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{cambios.totalCambios} modificación{cambios.totalCambios !== 1 ? 'es' : ''} detectada{cambios.totalCambios !== 1 ? 's' : ''}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg p-1.5 text-white/80 transition-all hover:bg-white/20 hover:text-white disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body con scroll - Compacto */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4">
          <div className="space-y-2.5">
            {cambios.cambios.map((cambio, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
              >
                {/* Header del campo - Compacto */}
                <div className="bg-gray-100 dark:bg-gray-700/50 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="text-green-600 dark:text-green-400">
                      {getIconForField(cambio.campo)}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {cambio.label}
                    </span>
                  </div>
                </div>

                {/* Comparación Antes/Después - Compacto y Responsive */}
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-2 md:gap-3 items-center">
                    {/* ANTES */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                          Anterior
                        </span>
                      </div>
                      <div className="p-2.5 rounded-md bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50">
                        {formatValue(cambio.campo, cambio.valorAnterior) === cambio.valorAnterior?.toString() ? (
                          <p className="text-xs text-gray-600 dark:text-gray-400 break-words line-through decoration-red-500">
                            {cambio.valorAnterior}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic break-words">
                            {formatValue(cambio.campo, cambio.valorAnterior)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* FLECHA - Responsive (horizontal en móvil, vertical en desktop) */}
                    <div className="flex md:flex-col items-center justify-center">
                      <div className="p-1.5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                        <ArrowRight className="w-4 h-4 text-white md:rotate-0" />
                      </div>
                    </div>

                    {/* DESPUÉS */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                          Nuevo
                        </span>
                      </div>
                      <div className="p-2.5 rounded-md bg-white dark:bg-gray-800 border border-green-200 dark:border-green-900/50">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300 break-words">
                          {formatValue(cambio.campo, cambio.valorNuevo)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer fijo - Compacto */}
        <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ¿Confirmas estos cambios?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 font-medium transition-all hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-sm text-white font-semibold shadow-lg shadow-green-500/30 transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-90 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar y Guardar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

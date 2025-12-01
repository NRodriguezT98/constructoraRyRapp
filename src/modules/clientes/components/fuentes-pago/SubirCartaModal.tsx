'use client'

/**
 * ============================================
 * MODAL: Subir Carta de Aprobación
 * ============================================
 *
 * ✅ MODAL PRE-CONFIGURADO COMPACTO
 * Upload especializado para cartas de aprobación de fuentes de pago
 *
 * Features:
 * - Título EDITABLE con sugerencia inteligente
 * - Categoría "Cartas de Aprobación" bloqueada
 * - Metadata para vinculación automática
 * - Diseño COMPACTO sin scroll
 * - Colores del módulo clientes (cyan/azul)
 *
 * @version 2.0.0 - 2025-12-01
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, FileText, Upload, X } from 'lucide-react'

import { useSubirCartaModal } from './useSubirCartaModal'

// ============================================
// TYPES
// ============================================

export interface DatosFuente {
  id: string
  tipo: string
  entidad?: string
  monto_aprobado: number
  // Datos para título inteligente
  vivienda?: {
    numero: string
    manzana: string
  }
  cliente?: {
    nombre_completo: string
  }
}

interface SubirCartaModalProps {
  isOpen: boolean
  onClose: () => void
  fuente: DatosFuente
  clienteId: string
  onSuccess?: () => void
}

// ============================================
// COMPONENTE
// ============================================

export function SubirCartaModal({
  isOpen,
  onClose,
  fuente,
  clienteId,
  onSuccess,
}: SubirCartaModalProps) {
  const {
    archivo,
    isDragging,
    isUploading,
    errorArchivo,
    titulo,
    setTitulo,
    tituloSugerido,
    tituloHeader,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleSubmit,
    limpiarArchivo,
  } = useSubirCartaModal({ fuente, clienteId, onClose, onSuccess })

  if (!isOpen) return null

  const formatMoney = (valor: number) => `$${valor.toLocaleString('es-CO')}`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal - COMPACTO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden"
        >
          {/* Header - COMPACTO con colores del módulo clientes (cyan/azul) */}
          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{tituloHeader}</h2>
                  <p className="text-cyan-100 text-xs">
                    {fuente.tipo}{fuente.entidad && ` • ${fuente.entidad}`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isUploading}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Content - COMPACTO sin scroll */}
          <div className="p-4 space-y-3">
            {/* Metadata compacta */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
              <div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Tipo</p>
                <p className="text-sm text-cyan-900 dark:text-cyan-100 font-semibold">{fuente.tipo}</p>
              </div>
              {fuente.entidad && (
                <div>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Entidad</p>
                  <p className="text-sm text-cyan-900 dark:text-cyan-100 font-semibold">{fuente.entidad}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Monto</p>
                <p className="text-sm text-cyan-900 dark:text-cyan-100 font-semibold">{formatMoney(fuente.monto_aprobado)}</p>
              </div>
              {fuente.vivienda && (
                <div>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Vivienda</p>
                  <p className="text-sm text-cyan-900 dark:text-cyan-100 font-semibold">
                    {fuente.vivienda.manzana}{fuente.vivienda.numero}
                  </p>
                </div>
              )}
            </div>

            {/* Categoría (solo lectura) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <input
                type="text"
                value="Cartas de Aprobación"
                disabled
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Título (EDITABLE con sugerencia inteligente) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Título del documento
                <span className="ml-1 text-xs font-normal text-gray-500">(editable)</span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder={tituloSugerido}
                disabled={isUploading}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border-2 border-cyan-200 dark:border-cyan-800 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {titulo !== tituloSugerido && (
                <button
                  onClick={() => setTitulo(tituloSugerido)}
                  className="mt-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  ← Restaurar sugerencia
                </button>
              )}
            </div>

            {/* Zona de upload compacta */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Archivo (PDF, JPG, PNG • Max 10MB)
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-all ${
                  isDragging
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
                    : 'border-gray-300 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600'
                } ${archivo ? 'bg-green-50 dark:bg-green-950/20 border-green-400' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <div className="p-4 text-center">
                  {archivo ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          {archivo.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {(archivo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(URL.createObjectURL(archivo), '_blank')
                          }}
                          disabled={isUploading}
                          className="px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-950/50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Ver
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            limpiarArchivo()
                          }}
                          disabled={isUploading}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cambiar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Arrastra un archivo o haz clic
                      </p>
                    </>
                  )}
                </div>
              </div>
              {errorArchivo && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errorArchivo}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                disabled={isUploading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!archivo || isUploading || !titulo.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Subiendo...
                  </span>
                ) : (
                  'Subir Carta'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

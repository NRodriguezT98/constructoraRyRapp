'use client'

/**
 * 📚 MODAL DE HISTORIAL DE VERSIONES
 *
 * Muestra todas las versiones de un documento con:
 * - Información de cada versión
 * - Opciones para ver/descargar
 * - Opción de restaurar versión anterior
 */

import { useAuth } from '@/contexts/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Download, Eye, RotateCcw, Trash2, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DocumentosClienteService } from '../services/documentos-cliente.service'
import type { DocumentoCliente } from '../types'
import { DocumentoEliminarVersionModal } from './documento-eliminar-version-modal'

interface DocumentoVersionesModalProps {
  isOpen: boolean
  documentoId: string
  onClose: () => void
  onVersionRestaurada?: () => void
}

export function DocumentoVersionesModal({
  isOpen,
  documentoId,
  onClose,
  onVersionRestaurada
}: DocumentoVersionesModalProps) {
  const { user } = useAuth()
  const [versiones, setVersiones] = useState<DocumentoCliente[]>([])
  const [cargando, setCargando] = useState(false)
  const [restaurando, setRestaurando] = useState<string | null>(null)
  const [versionAEliminar, setVersionAEliminar] = useState<DocumentoCliente | null>(null)
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)

  useEffect(() => {
    if (isOpen && documentoId) {
      cargarVersiones()
    }
  }, [isOpen, documentoId])

  const cargarVersiones = async () => {
    setCargando(true)
    try {
      const data = await DocumentosClienteService.obtenerVersiones(documentoId)
      setVersiones(data)
    } catch (error) {
      console.error('Error al cargar versiones:', error)
      toast.error('Error al cargar historial de versiones')
    } finally {
      setCargando(false)
    }
  }

  const handleVerDocumento = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDescargar = async (documento: DocumentoCliente) => {
    try {
      const response = await fetch(documento.url_storage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = documento.nombre_original
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Descarga iniciada')
    } catch (error) {
      console.error('Error al descargar:', error)
      toast.error('Error al descargar el documento')
    }
  }

  const handleRestaurar = async (versionId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión')
      return
    }

    setRestaurando(versionId)
    try {
      await DocumentosClienteService.restaurarVersion(versionId, user.id)
      toast.success('Versión restaurada correctamente')
      await cargarVersiones()
      onVersionRestaurada?.()
    } catch (error) {
      console.error('Error al restaurar versión:', error)
      toast.error('Error al restaurar la versión')
    } finally {
      setRestaurando(null)
    }
  }

  const handleAbrirModalEliminar = (version: DocumentoCliente) => {
    setVersionAEliminar(version)
    setModalEliminarAbierto(true)
  }

  const handleConfirmarEliminar = async (motivo: string) => {
    if (!versionAEliminar || !user) return

    try {
      await DocumentosClienteService.eliminarVersion(
        versionAEliminar.id,
        user.id,
        motivo
      )
      toast.success(`Versión ${versionAEliminar.version} eliminada correctamente`)
      await cargarVersiones()
      onVersionRestaurada?.() // Refrescar lista también
      setModalEliminarAbierto(false)
      setVersionAEliminar(null)
    } catch (error: any) {
      console.error('Error al eliminar versión:', error)
      toast.error(error.message || 'Error al eliminar la versión')
      throw error // Re-lanzar para que el modal maneje el estado
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearTamano = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Historial de Versiones
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/90 mt-1">
              {versiones[0]?.titulo || 'Documento'}
            </p>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-100px)] p-6">
            {cargando ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              </div>
            ) : versiones.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron versiones
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {versiones.map((version, index) => {
                  const esActual = version.es_version_actual
                  const esOriginal = version.version === 1
                  const cambios = (typeof version.metadata === 'object' && version.metadata !== null)
                    ? (version.metadata as any).cambios
                    : undefined

                  return (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        relative rounded-xl border-2 p-5 transition-all
                        ${esActual
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
                        }
                      `}
                    >
                      {/* Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-bold
                          ${esActual
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }
                        `}>
                          VERSIÓN {version.version}
                          {esActual && ' (Actual)'}
                          {esOriginal && ' (Original)'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatearFecha(version.fecha_creacion)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          <span>Subido por usuario</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Archivo:</strong> {version.nombre_original} • {formatearTamano(version.tamano_bytes)}
                      </div>

                      {cambios && (
                        <div className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                          <strong className="text-blue-900 dark:text-blue-100">Cambios:</strong>
                          <p className="text-blue-800 dark:text-blue-200 mt-1">{cambios}</p>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleVerDocumento(version.url_storage)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDescargar(version)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </button>
                        {!esActual && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestaurar(version.id)}
                              disabled={restaurando === version.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <RotateCcw className={`w-4 h-4 ${restaurando === version.id ? 'animate-spin' : ''}`} />
                              {restaurando === version.id ? 'Restaurando...' : 'Restaurar'}
                            </button>
                            {/* 🆕 Botón Eliminar - Solo para versiones NO actuales */}
                            <button
                              type="button"
                              onClick={() => handleAbrirModalEliminar(version)}
                              disabled={versiones.length <= 2} // Mínimo 2 versiones activas
                              title={versiones.length <= 2 ? 'Debe mantener al menos 2 versiones' : 'Eliminar versión'}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 🆕 Modal de confirmación de eliminación */}
      <DocumentoEliminarVersionModal
        isOpen={modalEliminarAbierto}
        version={versionAEliminar?.version || 0}
        onClose={() => {
          setModalEliminarAbierto(false)
          setVersionAEliminar(null)
        }}
        onConfirmar={handleConfirmarEliminar}
      />
    </AnimatePresence>
  )
}

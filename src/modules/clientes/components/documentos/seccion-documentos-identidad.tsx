'use client'

/**
 * ============================================
 * SECCIÓN DOCUMENTOS DE IDENTIDAD
 * ============================================
 *
 * Sección especializada para gestión de documento de identidad del cliente.
 * Usa el sistema modular de documentos (documentos_cliente).
 *
 * REFACTORIZADO: Eliminado sistema legacy (documento_identidad_url)
 * Ahora usa documentos_cliente con es_documento_identidad=true
 */

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Eye, FileText, RefreshCw, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'
import { useEliminarDocumento } from '@/modules/documentos/hooks/useEliminarDocumento'
import { ConfirmacionModal } from '@/shared/components/modals'

interface SeccionDocumentosIdentidadProps {
  clienteId: string
  onOpenUploadModal: () => void // Callback para abrir modal de upload genérico
}

export default function SeccionDocumentosIdentidad({
  clienteId,
  onOpenUploadModal,
}: SeccionDocumentosIdentidadProps) {
  // ✅ Hook con lógica de documento de identidad
  const { tieneCedula, documentoIdentidad, cargando } = useDocumentoIdentidad({ clienteId })

  // ✅ Hook para eliminar documento con confirmación inteligente
  const { abrirConfirmacion, cerrarConfirmacion, ejecutarEliminacion, confirmacion, eliminando } = useEliminarDocumento()

  const handleEliminar = () => {
    if (!documentoIdentidad) return
    abrirConfirmacion(documentoIdentidad, 'cliente')
  }

  const handleVerDocumento = () => {
    if (documentoIdentidad?.url_storage) {
      window.open(documentoIdentidad.url_storage, '_blank', 'noopener,noreferrer')
    }
  }

  if (cargando) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documentos de Identidad (Requeridos)
          </h3>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documentos de Identidad (Requeridos)
          </h3>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              La cédula de ciudadanía es requerida para iniciar procesos de negociación.
            </p>
          </div>
        </div>

        {/* Card de Cédula */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 rounded-xl p-6 transition-all ${
            tieneCedula
              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
              : 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <FileText className={`w-5 h-5 flex-shrink-0 ${
                  tieneCedula ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`} />
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Cédula de Ciudadanía
                </h4>
                {tieneCedula ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                )}
              </div>

              {tieneCedula ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Documento cargado
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span className="break-all">{documentoIdentidad?.nombre_archivo || 'documento.pdf'}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    El cliente puede iniciar negociaciones
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      No subida
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Requerido para iniciar negociaciones
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-end">
              {tieneCedula ? (
                <>
                  <button
                    onClick={handleVerDocumento}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Ver documento"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={onOpenUploadModal}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                    title="Reemplazar documento"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reemplazar
                  </button>
                  <button
                    onClick={handleEliminar}
                    disabled={!!eliminando}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Eliminar documento"
                  >
                    <Trash2 className="w-4 h-4" />
                    {eliminando ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenUploadModal}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Subir Cédula de Ciudadanía
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      {/* Modal de confirmación de eliminación */}
      <ConfirmacionModal
        isOpen={confirmacion.isOpen}
        onClose={cerrarConfirmacion}
        onConfirm={async () => {
          await ejecutarEliminacion('cliente', () => {
            toast.success('Cédula eliminada correctamente')
          })
        }}
        variant={confirmacion.esDocumentoCritico ? 'warning' : 'danger'}
        title="¿Eliminar cédula de ciudadanía?"
        message={
          confirmacion.detectando
            ? 'Verificando el tipo de documento…'
            : 'Esto bloqueará la creación de negociaciones hasta que subas una nueva. El documento puede recuperarse desde el panel de administración.'
        }
        confirmText="Sí, eliminar"
        isLoading={confirmacion.detectando || eliminando}
        loadingText={confirmacion.detectando ? 'Verificando…' : 'Eliminando…'}
      />
    </>
  )
}

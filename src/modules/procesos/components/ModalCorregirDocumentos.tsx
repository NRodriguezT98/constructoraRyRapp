/**
 * Modal: Corregir Documentos
 *
 * Permite reemplazar documentos subidos incorrectamente
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { format } from 'date-fns'
import { AlertCircle, FileEdit, FileText, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'



import { corregirDocumento, puedeCorregirDocumentos, type PermisosCorreccion } from '../services/correcciones.service'

interface DocumentoParaCorregir {
  id: string
  nombre_archivo: string
  fecha_subida: string
  categoria_id: string
  url_storage: string
}

interface ModalCorregirDocumentosProps {
  paso: {
    id: string
    nombre: string
  }
  documentos: DocumentoParaCorregir[]
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface DocumentoEditando {
  documentoId: string
  motivo: string
  nuevoArchivo: File | null
}

export function ModalCorregirDocumentos({
  paso,
  documentos,
  open,
  onClose,
  onSuccess
}: ModalCorregirDocumentosProps) {

  const [modoEdicion, setModoEdicion] = useState(false)
  const [editando, setEditando] = useState<Map<string, DocumentoEditando>>(new Map())
  const [guardando, setGuardando] = useState(false)
  const [permisos, setPermisos] = useState<PermisosCorreccion | null>(null)

  // Validar permisos al abrir modal
  useEffect(() => {
    if (open && paso.id) {
      puedeCorregirDocumentos(paso.id, true) // true = esAdmin (ya validado en botón)
        .then(setPermisos)
        .catch(err => {
          console.error('Error al validar permisos:', err)
          toast.error('Error al validar permisos')
        })
    }
  }, [open, paso.id])

  const handleHabilitarModoEdicion = () => {
    setModoEdicion(true)
  }

  const handleCancelarModoEdicion = () => {
    setModoEdicion(false)
    setEditando(new Map())
  }

  const handleSeleccionarArchivo = (documentoId: string, file: File | null) => {
    setEditando(prev => {
      const nuevo = new Map(prev)
      const actual = nuevo.get(documentoId) || { documentoId, motivo: '', nuevoArchivo: null }

      if (file) {
        nuevo.set(documentoId, { ...actual, nuevoArchivo: file })
      } else {
        nuevo.delete(documentoId)
      }

      return nuevo
    })
  }

  const handleCambiarMotivo = (documentoId: string, motivo: string) => {
    setEditando(prev => {
      const nuevo = new Map(prev)
      const actual = nuevo.get(documentoId) || { documentoId, motivo: '', nuevoArchivo: null }
      nuevo.set(documentoId, { ...actual, motivo })
      return nuevo
    })
  }

  const handleGuardarCambios = useCallback(async () => {
    const cambios = Array.from(editando.values()).filter(e => e.nuevoArchivo)

    if (cambios.length === 0) {
      toast.error('No hay cambios para guardar')
      return
    }

    // Validar motivos
    const sinMotivo = cambios.filter(c => c.motivo.trim().length < 10)
    if (sinMotivo.length > 0) {
      toast.error('Todos los documentos deben tener un motivo (mínimo 10 caracteres)')
      return
    }

    try {
      setGuardando(true)

      // Procesar cada reemplazo
      for (const cambio of cambios) {
        const documento = documentos.find(d => d.id === cambio.documentoId)
        if (!documento || !cambio.nuevoArchivo) continue

        await corregirDocumento({
          documentoAnteriorId: cambio.documentoId,
          nuevoArchivo: cambio.nuevoArchivo,
          motivo: cambio.motivo.trim(),
          pasoId: paso.id,
          categoriaId: documento.categoria_id
        })
      }

      toast.success(`${cambios.length} documento(s) corregido(s) exitosamente`)
      onSuccess()
      handleClose()

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al corregir documentos'
      toast.error(mensaje)
      console.error('Error al corregir documentos:', error)

    } finally {
      setGuardando(false)
    }
  }, [editando, documentos, paso.id, onSuccess])

  const handleClose = () => {
    setModoEdicion(false)
    setEditando(new Map())
    onClose()
  }

  const documentosParaReemplazar = Array.from(editando.values()).filter(e => e.nuevoArchivo)
  const puedeGuardar = documentosParaReemplazar.length > 0 &&
                       documentosParaReemplazar.every(d => d.motivo.trim().length >= 10) &&
                       !guardando

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-orange-600" />
            Corregir Documentos
          </DialogTitle>
          <DialogDescription>
            {paso.nombre}
          </DialogDescription>
        </DialogHeader>

        {!modoEdicion ? (
          /* Modal de confirmación inicial */
          <div className="space-y-4 py-4">
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    ⚠️ Habilitar Modo de Corrección
                  </h4>
                  <p className="text-sm text-orange-800 mb-3">
                    Estás por modificar documentos de este paso.
                  </p>
                  <div className="space-y-2 text-sm text-orange-800">
                    <p><strong>⚠️ Solo usa esto si subiste archivos INCORRECTOS</strong>, no para actualizaciones legítimas.</p>
                    <p>Los documentos anteriores serán marcados como reemplazados y ya no serán visibles en el proceso.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advertencia Admin sobre pasos posteriores */}
            {permisos?.requiereConfirmacionAdmin && permisos.razon && (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Confirmación de Administrador Requerida
                    </h4>
                    <p className="text-sm text-amber-800">
                      {permisos.razon}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                onClick={handleHabilitarModoEdicion}
                className="w-full"
                size="lg"
              >
                Habilitar Correcciones
              </Button>
            </div>
          </div>
        ) : (
          /* Modo edición activo */
          <div className="space-y-4">
            {/* Header del modo edición */}
            <div className="bg-orange-100 border-2 border-orange-500 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-900">
                    Modo Corrección Activo
                  </span>
                </div>
                <span className="text-sm text-orange-700">
                  {documentosParaReemplazar.length} documento(s) para reemplazar
                </span>
              </div>
            </div>

            {/* Lista de documentos */}
            <div className="space-y-4">
              {documentos.map(doc => {
                const edicion = editando.get(doc.id)
                const tieneNuevoArchivo = edicion?.nuevoArchivo

                return (
                  <div
                    key={doc.id}
                    className={`border rounded-lg p-4 ${
                      tieneNuevoArchivo ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Documento actual */}
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.nombre_archivo}</p>
                        <p className="text-sm text-gray-600">
                          Subido: {format(new Date(doc.fecha_subida), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </div>

                    {/* Input para nuevo archivo */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">
                          {tieneNuevoArchivo ? '✅ Nuevo archivo seleccionado' : 'Nuevo archivo'}
                        </Label>
                        <div className="mt-1">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleSeleccionarArchivo(doc.id, e.target.files?.[0] || null)}
                            className="hidden"
                            id={`file-${doc.id}`}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                              disabled={guardando}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {tieneNuevoArchivo ? 'Cambiar archivo' : 'Seleccionar archivo'}
                            </Button>

                            {tieneNuevoArchivo && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSeleccionarArchivo(doc.id, null)}
                                disabled={guardando}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {edicion?.nuevoArchivo && (
                            <p className="text-sm text-green-700 mt-2 flex items-center gap-1">
                              📄 {edicion.nuevoArchivo.name}
                              <span className="text-gray-500">
                                ({(edicion.nuevoArchivo.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Motivo (solo si hay archivo nuevo) */}
                      {tieneNuevoArchivo && (
                        <div>
                          <Label className="text-sm font-medium">
                            Motivo del reemplazo *
                            <span className="text-xs text-gray-500 ml-2">
                              ({(edicion?.motivo || '').length}/10 caracteres mínimo)
                            </span>
                          </Label>
                          <Textarea
                            value={edicion?.motivo || ''}
                            onChange={(e) => handleCambiarMotivo(doc.id, e.target.value)}
                            placeholder="Ej: Se subió documento incorrecto. Debía ser..."
                            rows={2}
                            className="resize-none mt-1"
                            disabled={guardando}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Warning */}
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
              <p className="text-sm text-orange-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Los documentos anteriores serán marcados como "reemplazados" y quedarán en el historial solo para administradores.
                </span>
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {modoEdicion ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelarModoEdicion}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarCambios}
                disabled={!puedeGuardar}
              >
                {guardando ? 'Guardando...' : `Guardar Cambios (${documentosParaReemplazar.length})`}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Info({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      strokeWidth={2}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

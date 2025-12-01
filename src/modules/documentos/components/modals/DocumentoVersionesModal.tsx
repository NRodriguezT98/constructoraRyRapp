'use client'

/**
 * 📚 MODAL DE HISTORIAL DE VERSIONES (PROYECTOS)
 *
 * Timeline vertical mostrando todas las versiones de un documento
 * - Versión actual destacada
 * - Acciones: Ver, Descargar, Restaurar (con motivo), Eliminar (Admin)
 * - Diseño compacto con tema verde/esmeralda
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, Calendar, Download, Eye, FileText, History, Loader2, RotateCcw, Trash2, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { useDocumentoVersiones } from '@/modules/proyectos/hooks/useDocumentoVersiones'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import type { EstadoVersion } from '@/types/documento.types'
import { EstadoVersionAlert, EstadoVersionBadge } from '../shared/EstadoVersionBadge'
import { MarcarEstadoVersionModal, type AccionEstado } from './MarcarEstadoVersionModal'

interface DocumentoVersionesModalProps {
  isOpen: boolean
  documentoId: string
  onClose: () => void
  onVersionRestaurada?: () => void
  tipoEntidad?: 'proyecto' | 'vivienda' | 'cliente' // 🆕 Determina qué tabla usar
  moduleName?: ModuleName // 🎨 Tema del módulo (determina colores)
}

export function DocumentoVersionesModal({
  isOpen,
  documentoId,
  onClose,
  onVersionRestaurada,
  tipoEntidad = 'proyecto', // 🆕 Default a proyecto para mantener compatibilidad
  moduleName = 'proyectos' // 🎨 Default a proyectos (verde/esmeralda)
}: DocumentoVersionesModalProps) {
  // 🎨 Obtener tema dinámico según módulo
  const theme = moduleThemes[moduleName]

  // Estado local para modal de estados de versión
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false)
  const [accionEstado, setAccionEstado] = useState<AccionEstado>('erronea')
  const [versionSeleccionada, setVersionSeleccionada] = useState<{
    id: string
    numero: number
  } | null>(null)

  // 🎯 Estado para dropdown de Estado (con portal)
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null)
  const [posicionDropdown, setPosicionDropdown] = useState({ top: 0, left: 0 })
  const botonEstadoRef = useRef<HTMLButtonElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownAbierto && !botonEstadoRef.current?.contains(e.target as Node)) {
        setDropdownAbierto(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownAbierto])

  const {
    versiones,
    cargando,
    restaurando,
    eliminando,
    perfil,
    mostrarModalMotivo,
    versionARestaurar,
    motivoRestauracion,
    setMotivoRestauracion,
    versionAEliminar,
    motivoEliminacion,
    setMotivoEliminacion,
    setVersionAEliminar,
    handleVerDocumento,
    handleDescargar,
    solicitarRestauracion,
    cancelarRestauracion,
    handleRestaurar,
    handleEliminar,
    confirmarEliminacion,
  } = useDocumentoVersiones({
    documentoId,
    isOpen,
    onVersionRestaurada,
    onClose, // ✅ Pasar callback de cierre
    tipoEntidad, // 🆕 Pasar tipo de entidad al hook
  })

  const esAdministrador = perfil?.rol === 'Administrador'

  // Handlers para modal de estados
  const abrirModalEstado = (versionId: string, versionNumero: number, accion: AccionEstado) => {
    setVersionSeleccionada({ id: versionId, numero: versionNumero })
    setAccionEstado(accion)
    setModalEstadoOpen(true)
  }

  const cerrarModalEstado = () => {
    setModalEstadoOpen(false)
    setVersionSeleccionada(null)
  }

  // Formatear nombre de usuario
  const formatearNombreUsuario = (email: string | null, usuario?: any) => {
    if (usuario?.nombres && usuario?.apellidos) {
      return `${usuario.nombres} ${usuario.apellidos}`
    }
    if (!email) return 'Usuario desconocido'
    if (email.includes('@')) {
      return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    return email
  }

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <div key="modal-versiones" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
        >
          {/* Header - Gradiente dinámico según módulo */}
          <div className={`sticky top-0 z-10 bg-gradient-to-r ${theme.classes.gradient.triple} px-6 py-4 rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Historial de Versiones
                  </h2>
                  <p className="text-sm text-white/90 mt-0.5">
                    {versiones.length} {versiones.length === 1 ? 'versión encontrada' : 'versiones encontradas'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-6">
            {cargando ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Cargando versiones...</p>
              </div>
            ) : versiones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay versiones disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versiones.map((version, index) => {
                  const esActual = version.es_version_actual
                  const esOriginal = version.version === 1
                  const cambios = version.metadata && typeof version.metadata === 'object'
                    ? (version.metadata as any).cambios
                    : null
                  const estadoVersion = (version.estado_version as EstadoVersion) || 'valida'

                  // 🆒 OPCIÓN C: Numeración secuencial visual (v1, v2, v3) + original para auditoría
                  const versionSecuencial = versiones.length - index // De mayor a menor (actual = 1)
                  const versionOriginal = version.version
                  const tieneDiferencia = versionSecuencial !== versionOriginal

                  return (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        relative rounded-xl border-2 p-4 transition-all
                        ${esActual
                          ? `bg-gradient-to-br ${theme.classes.gradient.background} dark:${theme.classes.gradient.backgroundDark} ${theme.classes.border.light} shadow-lg ${theme.classes.shadow}`
                          : 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      {/* Timeline indicator */}
                      {index < versiones.length - 1 && (
                        <div className="absolute left-[1.875rem] top-full h-4 w-0.5 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600" />
                      )}

                      {/* Header con badges */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold
                            ${esActual
                              ? `${theme.classes.badge.primary} text-white shadow-sm`
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }
                          `}>
                            <FileText className="w-3.5 h-3.5" />
                            Versión {versionSecuencial}
                            {tieneDiferencia && (
                              <span className="text-[10px] opacity-70 ml-0.5">
                                (orig. v{versionOriginal})
                              </span>
                            )}
                          </span>
                          {esActual && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${theme.classes.badge.secondary} text-white shadow-sm`}>
                              ✓ Actual
                            </span>
                          )}
                          {esOriginal && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-500 text-white shadow-sm">
                              ⭐ Original
                            </span>
                          )}
                          <EstadoVersionBadge estado={estadoVersion} size="md" />
                        </div>
                      </div>

                      {/* Título */}
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                        {version.titulo}
                      </h3>

                      {/* Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {/* Fecha */}
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDateCompact(version.fecha_creacion)} •{' '}
                            {new Date(version.fecha_creacion).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>

                        {/* Usuario */}
                        <div className="flex items-center gap-2 text-xs">
                          <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatearNombreUsuario(version.subido_por, version.usuario)}
                          </span>
                        </div>
                      </div>

                      {/* Descripción/Cambios */}
                      {(cambios || version.descripcion) && (
                        <div className="mb-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                            {cambios || version.descripcion}
                          </p>
                        </div>
                      )}

                      {/* Alerta de estado de versión */}
                      {estadoVersion !== 'valida' && (
                        <div className="mb-3">
                          <EstadoVersionAlert
                            estado={estadoVersion}
                            motivo={version.motivo_estado}
                            versionCorrectaId={version.version_corrige_a}
                          />
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Ver */}
                        <button
                          onClick={() => handleVerDocumento(version)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${theme.classes.button.primary} text-white transition-colors shadow-sm`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>

                        {/* Descargar */}
                        <button
                          onClick={() => handleDescargar(version)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </button>

                        {/* Restaurar (solo versiones antiguas) */}
                        {!esActual && (
                          <button
                            onClick={() => solicitarRestauracion(version.id, version.version)}
                            disabled={restaurando === version.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${theme.classes.button.secondary} text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {restaurando === version.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Restaurando...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" />
                                Restaurar
                              </>
                            )}
                          </button>
                        )}

                        {/* Estado de versión (Admin) */}
                        {esAdministrador && (
                          <>
                            <button
                              ref={version.id === dropdownAbierto ? botonEstadoRef : null}
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setPosicionDropdown({
                                  top: rect.bottom + window.scrollY + 4,
                                  left: rect.left + window.scrollX
                                })
                                setDropdownAbierto(dropdownAbierto === version.id ? null : version.id)
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              Estado
                            </button>

                            {/* Dropdown renderizado en portal */}
                            {dropdownAbierto === version.id && createPortal(
                              <div
                                style={{
                                  position: 'absolute',
                                  top: `${posicionDropdown.top}px`,
                                  left: `${posicionDropdown.left}px`,
                                  zIndex: 9999
                                }}
                                className="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700"
                              >
                                <div className="p-1">
                                  <button
                                    onClick={() => {
                                      abrirModalEstado(version.id, versionSecuencial, 'erronea')
                                      setDropdownAbierto(null)
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    ⚠️ Marcar como Errónea
                                  </button>
                                  <button
                                    onClick={() => {
                                      abrirModalEstado(version.id, versionSecuencial, 'obsoleta')
                                      setDropdownAbierto(null)
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
                                  >
                                    📦 Marcar como Obsoleta
                                  </button>
                                  {estadoVersion !== 'valida' && (
                                    <button
                                      onClick={() => {
                                        abrirModalEstado(version.id, versionSecuencial, 'restaurar')
                                        setDropdownAbierto(null)
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    >
                                      ♻️ Restaurar a Válida
                                    </button>
                                  )}
                                </div>
                              </div>,
                              document.body
                            )}
                          </>
                        )}

                        {/* Eliminar (solo Admin) */}
                        {esAdministrador && (
                          <button
                            onClick={() => handleEliminar(version.id, version.version)}
                            disabled={eliminando === version.id}
                            title={esActual ? '⚠️ No se puede eliminar la versión actual' : 'Eliminar esta versión'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {eliminando === version.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Eliminando...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal de confirmación de restauración */}
        {mostrarModalMotivo && versionARestaurar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={cancelarRestauracion}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Confirmar Restauración
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Estás a punto de restaurar una versión anterior.
                  Esto creará una nueva versión con el contenido de la versión seleccionada.
                </p>

                <div>
                  <label htmlFor="motivo-restauracion" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Motivo de la restauración *
                  </label>
                  <textarea
                    id="motivo-restauracion"
                    value={motivoRestauracion}
                    onChange={(e) => setMotivoRestauracion(e.target.value)}
                    placeholder="Ej: Se requiere volver a la versión anterior por error en la actualización"
                    rows={3}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-orange-600"
                    autoFocus
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Explica por qué necesitas restaurar esta versión
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={cancelarRestauracion}
                    className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRestaurar(versionARestaurar.id)}
                    disabled={!motivoRestauracion.trim() || restaurando === versionARestaurar.id}
                    className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                  >
                    {restaurando === versionARestaurar.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Restaurando...
                      </div>
                    ) : (
                      'Confirmar Restauración'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 🗑️ MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (Admin Only) */}
        {versionAEliminar && (
          <motion.div
            key="modal-eliminar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header - Rojo (peligro) */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Eliminar Versión {versionAEliminar.numero}</h3>
                    <p className="text-xs text-red-100">Acción de Administrador - Requiere motivo</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Advertencia si es versión actual */}
                {versionAEliminar.esActual && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                          ⚠️ Esta es la Versión ACTUAL
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Al eliminarla, la versión anterior se marcará como actual automáticamente
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje de confirmación */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ¿Estás seguro de eliminar la <span className="font-semibold text-gray-900 dark:text-white">Versión {versionAEliminar.numero}</span>?
                  <br />
                  Esta acción <span className="font-semibold text-red-600 dark:text-red-400">se puede revertir</span> pero se requiere un motivo detallado.
                </p>

                {/* Campo de motivo */}
                <div>
                  <label htmlFor="motivo-eliminacion" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Motivo de eliminación * <span className="text-xs text-gray-500">(mínimo 20 caracteres)</span>
                  </label>
                  <textarea
                    id="motivo-eliminacion"
                    value={motivoEliminacion}
                    onChange={(e) => setMotivoEliminacion(e.target.value)}
                    placeholder="Ej: Versión cargada incorrectamente con datos duplicados del proyecto anterior"
                    rows={3}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-red-600"
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Explica por qué eliminas esta versión
                    </p>
                    <p className={`text-xs font-medium ${motivoEliminacion.length >= 20 ? 'text-green-600 dark:text-green-500' : 'text-gray-400'}`}>
                      {motivoEliminacion.length}/20
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setVersionAEliminar(null)
                      setMotivoEliminacion('')
                    }}
                    className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarEliminacion}
                    disabled={motivoEliminacion.length < 20 || eliminando === versionAEliminar.id}
                    className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                  >
                    {eliminando === versionAEliminar.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Eliminando...
                      </div>
                    ) : (
                      'Confirmar Eliminación'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 🎨 MODAL DE ESTADOS DE VERSIÓN (Admin Only) */}
        {modalEstadoOpen && versionSeleccionada && (
          <MarcarEstadoVersionModal
            isOpen={modalEstadoOpen}
            documentoId={versionSeleccionada.id}
            proyectoId={documentoId} // El documentoId del padre es el proyectoId
            documentoPadreId={documentoId} // ✅ ID del documento padre para invalidar query correcta
            accion={accionEstado}
            versionActual={versionSeleccionada.numero}
            versionesDisponibles={
              versiones?.map(v => ({
                id: v.id,
                version: v.version,
                titulo: v.titulo || 'Sin título'
              })) || []
            }
            onClose={cerrarModalEstado}
            onSuccess={() => {
              // Refrescar datos (el hook del modal ya invalida queries)
              cerrarModalEstado()
            }}
          />
        )}
      </div>
    </AnimatePresence>
  )

  // Renderizar en Portal
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}

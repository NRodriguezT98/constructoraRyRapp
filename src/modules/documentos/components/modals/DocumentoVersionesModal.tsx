'use client'

/**
 * 📚 MODAL DE HISTORIAL DE VERSIONES (PROYECTOS)
 *
 * Timeline vertical mostrando todas las versiones de un documento
 * - Versión actual destacada
 * - Acciones: Ver, Descargar, Restaurar (con motivo), Eliminar (Admin)
 * - Diseño compacto con tema verde/esmeralda
 */

import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Download,
  Eye,
  FileText,
  History,
  Loader2,
  RotateCcw,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { EstadoVersion } from '@/modules/documentos/types/documento.types'
import { useDocumentoVersiones } from '@/modules/proyectos/hooks/useDocumentoVersiones'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

import {
  EstadoVersionAlert,
  EstadoVersionBadge,
} from '../shared/EstadoVersionBadge'

import {
  MarcarEstadoVersionModal,
  type AccionEstado,
} from './MarcarEstadoVersionModal'

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
  moduleName = 'proyectos', // 🎨 Default a proyectos (verde/esmeralda)
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
      if (
        dropdownAbierto &&
        !botonEstadoRef.current?.contains(e.target as Node)
      ) {
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
  const abrirModalEstado = (
    versionId: string,
    versionNumero: number,
    accion: AccionEstado
  ) => {
    setVersionSeleccionada({ id: versionId, numero: versionNumero })
    setAccionEstado(accion)
    setModalEstadoOpen(true)
  }

  const cerrarModalEstado = () => {
    setModalEstadoOpen(false)
    setVersionSeleccionada(null)
  }

  // Formatear nombre de usuario
  const formatearNombreUsuario = (
    email: string | null,
    usuario?: { nombres?: string; apellidos?: string }
  ) => {
    if (usuario?.nombres && usuario?.apellidos) {
      return `${usuario.nombres} ${usuario.apellidos}`
    }
    if (!email) return 'Usuario desconocido'
    if (email.includes('@')) {
      return email
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    return email
  }

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <div
        key='modal-versiones'
        className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className='relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
        >
          {/* Header - Gradiente dinámico según módulo */}
          <div
            className={`sticky top-0 z-10 bg-gradient-to-r ${theme.classes.gradient.triple} rounded-t-2xl px-6 py-4`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                  <History className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    Historial de Versiones
                  </h2>
                  <p className='mt-0.5 text-sm text-white/90'>
                    {versiones.length}{' '}
                    {versiones.length === 1
                      ? 'versión encontrada'
                      : 'versiones encontradas'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className='rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className='max-h-[calc(90vh-5rem)] overflow-y-auto p-6'>
            {cargando ? (
              <div className='flex flex-col items-center justify-center py-12'>
                <Loader2 className='mb-3 h-8 w-8 animate-spin text-green-600' />
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Cargando versiones...
                </p>
              </div>
            ) : versiones.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12'>
                <FileText className='mb-3 h-12 w-12 text-gray-400 dark:text-gray-600' />
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  No hay versiones disponibles
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {versiones.map((version, index) => {
                  const esActual = version.es_version_actual
                  const esOriginal = version.version === 1
                  const cambios =
                    version.metadata && typeof version.metadata === 'object'
                      ? (version.metadata as Record<string, unknown>).cambios
                      : null
                  const estadoVersion =
                    ((version as unknown as Record<string, unknown>)
                      .estado_version as EstadoVersion) || 'valida'

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
                      className={`relative rounded-xl border-2 p-4 transition-all ${
                        esActual
                          ? `bg-gradient-to-br ${theme.classes.gradient.background} dark:${theme.classes.gradient.backgroundDark} ${theme.classes.border.light} shadow-lg ${theme.classes.shadow}`
                          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-gray-600'
                      } `}
                    >
                      {/* Timeline indicator */}
                      {index < versiones.length - 1 && (
                        <div className='absolute left-[1.875rem] top-full h-4 w-0.5 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600' />
                      )}

                      {/* Header con badges */}
                      <div className='mb-3 flex items-start justify-between'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                              esActual
                                ? `${theme.classes.badge.primary} text-white shadow-sm`
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            } `}
                          >
                            <FileText className='h-3.5 w-3.5' />
                            Versión {versionSecuencial}
                            {tieneDiferencia && (
                              <span className='ml-0.5 text-[10px] opacity-70'>
                                (orig. v{versionOriginal})
                              </span>
                            )}
                          </span>
                          {esActual && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${theme.classes.badge.secondary} text-white shadow-sm`}
                            >
                              ✓ Actual
                            </span>
                          )}
                          {esOriginal && (
                            <span className='inline-flex items-center gap-1 rounded-lg bg-yellow-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm'>
                              ⭐ Original
                            </span>
                          )}
                          <EstadoVersionBadge
                            estado={estadoVersion}
                            size='md'
                          />
                        </div>
                      </div>

                      {/* Título */}
                      <h3 className='mb-2 text-sm font-bold text-gray-900 dark:text-white'>
                        {version.titulo}
                      </h3>

                      {/* Metadata */}
                      <div className='mb-3 grid grid-cols-1 gap-2 md:grid-cols-2'>
                        {/* Fecha */}
                        <div className='flex items-center gap-2 text-xs'>
                          <Calendar className='h-3.5 w-3.5 text-gray-500 dark:text-gray-400' />
                          <span className='text-gray-600 dark:text-gray-400'>
                            {formatDateCompact(version.fecha_creacion)} •{' '}
                            {new Date(
                              version.fecha_creacion
                            ).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>

                        {/* Usuario */}
                        <div className='flex items-center gap-2 text-xs'>
                          <User className='h-3.5 w-3.5 text-gray-500 dark:text-gray-400' />
                          <span className='text-gray-600 dark:text-gray-400'>
                            {formatearNombreUsuario(
                              version.subido_por,
                              version.usuario
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Descripción/Cambios */}
                      {(cambios || version.descripcion) && (
                        <div className='mb-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800/50'>
                          <p className='text-xs italic text-gray-700 dark:text-gray-300'>
                            {String(cambios || version.descripcion || '')}
                          </p>
                        </div>
                      )}

                      {/* Alerta de estado de versión */}
                      {estadoVersion !== 'valida' && (
                        <div className='mb-3'>
                          <EstadoVersionAlert
                            estado={estadoVersion}
                            motivo={
                              (version as unknown as Record<string, unknown>)
                                .motivo_estado as string | undefined
                            }
                            versionCorrectaId={
                              (version as unknown as Record<string, unknown>)
                                .version_corrige_a as string | undefined
                            }
                          />
                        </div>
                      )}

                      {/* Acciones */}
                      <div className='flex flex-wrap items-center gap-2'>
                        {/* Ver */}
                        <button
                          onClick={() => handleVerDocumento(version)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${theme.classes.button.primary} text-white shadow-sm transition-colors`}
                        >
                          <Eye className='h-3.5 w-3.5' />
                          Ver
                        </button>

                        {/* Descargar */}
                        <button
                          onClick={() => handleDescargar(version)}
                          className='inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700'
                        >
                          <Download className='h-3.5 w-3.5' />
                          Descargar
                        </button>

                        {/* Restaurar (solo versiones antiguas) */}
                        {!esActual && (
                          <button
                            onClick={() =>
                              solicitarRestauracion(version.id, version.version)
                            }
                            disabled={restaurando === version.id}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${theme.classes.button.secondary} text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {restaurando === version.id ? (
                              <>
                                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                Restaurando...
                              </>
                            ) : (
                              <>
                                <RotateCcw className='h-3.5 w-3.5' />
                                Restaurar
                              </>
                            )}
                          </button>
                        )}

                        {/* Estado de versión (Admin) */}
                        {esAdministrador && (
                          <>
                            <button
                              ref={
                                version.id === dropdownAbierto
                                  ? botonEstadoRef
                                  : null
                              }
                              onClick={e => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect()
                                setPosicionDropdown({
                                  top: rect.bottom + window.scrollY + 4,
                                  left: rect.left + window.scrollX,
                                })
                                setDropdownAbierto(
                                  dropdownAbierto === version.id
                                    ? null
                                    : version.id
                                )
                              }}
                              className='inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-purple-700'
                            >
                              <AlertCircle className='h-3.5 w-3.5' />
                              Estado
                            </button>

                            {/* Dropdown renderizado en portal */}
                            {dropdownAbierto === version.id &&
                              createPortal(
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: `${posicionDropdown.top}px`,
                                    left: `${posicionDropdown.left}px`,
                                    zIndex: 9999,
                                  }}
                                  className='w-48 rounded-lg border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800'
                                >
                                  <div className='p-1'>
                                    <button
                                      onClick={() => {
                                        abrirModalEstado(
                                          version.id,
                                          versionSecuencial,
                                          'erronea'
                                        )
                                        setDropdownAbierto(null)
                                      }}
                                      className='w-full rounded-md px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-red-50 dark:text-gray-300 dark:hover:bg-red-900/20'
                                    >
                                      ⚠️ Marcar como Errónea
                                    </button>
                                    <button
                                      onClick={() => {
                                        abrirModalEstado(
                                          version.id,
                                          versionSecuencial,
                                          'obsoleta'
                                        )
                                        setDropdownAbierto(null)
                                      }}
                                      className='w-full rounded-md px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900/20'
                                    >
                                      📦 Marcar como Obsoleta
                                    </button>
                                    {estadoVersion !== 'valida' && (
                                      <button
                                        onClick={() => {
                                          abrirModalEstado(
                                            version.id,
                                            versionSecuencial,
                                            'restaurar'
                                          )
                                          setDropdownAbierto(null)
                                        }}
                                        className='w-full rounded-md px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-green-50 dark:text-gray-300 dark:hover:bg-green-900/20'
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
                            onClick={() =>
                              handleEliminar(version.id, version.version)
                            }
                            disabled={eliminando === version.id}
                            title={
                              esActual
                                ? '⚠️ No se puede eliminar la versión actual'
                                : 'Eliminar esta versión'
                            }
                            className='inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            {eliminando === version.id ? (
                              <>
                                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                Eliminando...
                              </>
                            ) : (
                              <>
                                <Trash2 className='h-3.5 w-3.5' />
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
            className='fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
            onClick={cancelarRestauracion}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className='w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
            >
              {/* Header */}
              <div className='bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4'>
                <h3 className='flex items-center gap-2 text-lg font-bold text-white'>
                  <RotateCcw className='h-5 w-5' />
                  Confirmar Restauración
                </h3>
              </div>

              {/* Content */}
              <div className='space-y-4 p-6'>
                <p className='text-sm text-gray-700 dark:text-gray-300'>
                  Estás a punto de restaurar una versión anterior. Esto creará
                  una nueva versión con el contenido de la versión seleccionada.
                </p>

                <div>
                  <label
                    htmlFor='motivo-restauracion'
                    className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'
                  >
                    Motivo de la restauración *
                  </label>
                  <textarea
                    id='motivo-restauracion'
                    value={motivoRestauracion}
                    onChange={e => setMotivoRestauracion(e.target.value)}
                    placeholder='Ej: Se requiere volver a la versión anterior por error en la actualización'
                    rows={3}
                    className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-orange-600'
                    autoFocus
                  />
                  <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>
                    Explica por qué necesitas restaurar esta versión
                  </p>
                </div>

                {/* Botones */}
                <div className='flex gap-3 pt-2'>
                  <button
                    onClick={cancelarRestauracion}
                    className='flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRestaurar(versionARestaurar.id)}
                    disabled={
                      !motivoRestauracion.trim() ||
                      restaurando === versionARestaurar.id
                    }
                    className='flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-700 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {restaurando === versionARestaurar.id ? (
                      <div className='flex items-center justify-center gap-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
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
            key='modal-eliminar'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className='relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
            >
              {/* Header - Rojo (peligro) */}
              <div className='bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                    <Trash2 className='h-5 w-5 text-white' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-white'>
                      Eliminar Versión {versionAEliminar.numero}
                    </h3>
                    <p className='text-xs text-red-100'>
                      Acción de Administrador - Requiere motivo
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className='space-y-4 p-6'>
                {/* Advertencia si es versión actual */}
                {versionAEliminar.esActual && (
                  <div className='rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20'>
                    <div className='flex gap-3'>
                      <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500' />
                      <div className='flex-1'>
                        <h4 className='text-sm font-semibold text-amber-900 dark:text-amber-100'>
                          ⚠️ Esta es la Versión ACTUAL
                        </h4>
                        <p className='mt-1 text-xs text-amber-700 dark:text-amber-300'>
                          Al eliminarla, la versión anterior se marcará como
                          actual automáticamente
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje de confirmación */}
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  ¿Estás seguro de eliminar la{' '}
                  <span className='font-semibold text-gray-900 dark:text-white'>
                    Versión {versionAEliminar.numero}
                  </span>
                  ?
                  <br />
                  Esta acción{' '}
                  <span className='font-semibold text-red-600 dark:text-red-400'>
                    se puede revertir
                  </span>{' '}
                  pero se requiere un motivo detallado.
                </p>

                {/* Campo de motivo */}
                <div>
                  <label
                    htmlFor='motivo-eliminacion'
                    className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'
                  >
                    Motivo de eliminación *{' '}
                    <span className='text-xs text-gray-500'>
                      (mínimo 20 caracteres)
                    </span>
                  </label>
                  <textarea
                    id='motivo-eliminacion'
                    value={motivoEliminacion}
                    onChange={e => setMotivoEliminacion(e.target.value)}
                    placeholder='Ej: Versión cargada incorrectamente con datos duplicados del proyecto anterior'
                    rows={3}
                    className='w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-red-600'
                    autoFocus
                  />
                  <div className='mt-1.5 flex items-center justify-between'>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      Explica por qué eliminas esta versión
                    </p>
                    <p
                      className={`text-xs font-medium ${motivoEliminacion.length >= 20 ? 'text-green-600 dark:text-green-500' : 'text-gray-400'}`}
                    >
                      {motivoEliminacion.length}/20
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className='flex gap-3 pt-2'>
                  <button
                    onClick={() => {
                      setVersionAEliminar(null)
                      setMotivoEliminacion('')
                    }}
                    className='flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarEliminacion}
                    disabled={
                      motivoEliminacion.length < 20 ||
                      eliminando === versionAEliminar.id
                    }
                    className='flex-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/20 transition-all hover:from-red-700 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {eliminando === versionAEliminar.id ? (
                      <div className='flex items-center justify-center gap-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
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
                titulo: v.titulo || 'Sin título',
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
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}

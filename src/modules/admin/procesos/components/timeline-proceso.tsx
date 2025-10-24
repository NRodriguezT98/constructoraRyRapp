'use client'

/**
 * 📊 TIMELINE DE PROCESO DE NEGOCIACIÓN
 *
 * Muestra el progreso del proceso de compra del cliente.
 * Diseño premium con timeline vertical y glassmorphism.
 */

import { useAuth } from '@/contexts/auth-context'
import { createBrowserClient } from '@supabase/ssr'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Circle,
    Clock,
    Download,
    FileText,
    Loader2,
    Play,
    Upload,
    X
} from 'lucide-react'
import { useState } from 'react'
import { useProcesoNegociacion } from '../hooks'
import { procesosStyles as styles } from '../styles/procesos.styles'
import type { ProcesoNegociacion } from '../types'
import { EstadoPaso } from '../types'

interface TimelineProcesoProps {
  negociacionId: string
}

export function TimelineProceso({ negociacionId }: TimelineProcesoProps) {
  const { user } = useAuth()
  const {
    pasos,
    progreso,
    loading,
    error,
    actualizando,
    completarPaso,
    iniciarPaso,
    agregarDocumento,
    puedeCompletar,
    limpiarError
  } = useProcesoNegociacion({ negociacionId })

  const [pasoExpandido, setPasoExpandido] = useState<string | null>(null)
  const [subiendoDoc, setSubiendoDoc] = useState<string | null>(null)

  // ===================================
  // HANDLERS
  // ===================================

  const togglePaso = (pasoId: string) => {
    setPasoExpandido(prev => prev === pasoId ? null : pasoId)
  }

  const handleIniciar = async (pasoId: string) => {
    await iniciarPaso(pasoId)
  }

  const handleCompletar = async (pasoId: string) => {
    if (!confirm('¿Marcar este paso como completado?')) return

    await completarPaso(pasoId, {
      notas: 'Completado manualmente'
    })
  }

  const handleAdjuntarDocumento = async (pasoId: string, documentoId: string, documentoNombre: string, file: File) => {
    if (!user) {
      alert('❌ No hay usuario autenticado')
      return
    }

    setSubiendoDoc(documentoId)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      console.log('📤 Subiendo documento:', {
        pasoId,
        documentoId,
        documentoNombre,
        fileName: file.name,
        size: file.size
      })

      // 1. Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ El archivo no puede superar los 10MB')
        return
      }

      // 2. Validar tipo de archivo
      const extensionesPermitidas = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()

      if (!extensionesPermitidas.includes(extension)) {
        alert('❌ Tipo de archivo no permitido. Usa: PDF, JPG, PNG, DOC, DOCX')
        return
      }

      // 3. Construir path del storage
      // Formato: userId/procesos/negociacionId/pasoId/documentoNombre_timestamp.ext
      const timestamp = Date.now()
      const nombreLimpio = documentoNombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/\s+/g, '_') // Espacios -> guión bajo
        .replace(/[^a-zA-Z0-9_]/g, '') // Solo alfanuméricos

      const storagePath = `${user.id}/procesos/${negociacionId}/${pasoId}/${nombreLimpio}_${timestamp}${extension}`

      console.log('📁 Path de subida:', storagePath)

      // 4. Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos-procesos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true // Permitir sobrescribir
        })

      if (uploadError) {
        console.error('❌ Error en Storage:', uploadError)
        throw uploadError
      }

      console.log('✅ Archivo subido:', uploadData)

      // 5. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos-procesos')
        .getPublicUrl(storagePath)

      console.log('🔗 URL pública:', publicUrl)

      // 6. Guardar URL en proceso
      const exito = await agregarDocumento(pasoId, documentoId, publicUrl)

      if (!exito) {
        throw new Error('No se pudo guardar la URL del documento')
      }

      console.log('✅ Documento agregado al proceso')

      // 7. 🆕 TAMBIÉN guardar en documentos_cliente para que aparezca en pestaña "Documentos"
      const { data: negociacion } = await supabase
        .from('negociaciones')
        .select('cliente_id')
        .eq('id', negociacionId)
        .single()

      if (negociacion?.cliente_id) {
        const { error: insertError } = await supabase
          .from('documentos_cliente')
          .insert({
            cliente_id: negociacion.cliente_id,
            categoria_id: null, // Usuario asignará categoría manualmente desde pestaña Documentos
            titulo: documentoNombre,
            descripcion: `Subido desde proceso - Paso ${pasoId}`,
            nombre_archivo: `${nombreLimpio}_${timestamp}${extension}`,
            nombre_original: file.name,
            tamano_bytes: file.size,
            tipo_mime: file.type,
            url_storage: publicUrl,
            subido_por: user.id,
            es_importante: false,
            es_version_actual: true,
            version: 1,
            estado: 'activo',
            etiquetas: ['Proceso', 'Negociación']
          })

        if (insertError) {
          console.warn('⚠️ No se pudo guardar en documentos_cliente:', insertError)
          console.error('Detalle del error:', insertError)
        } else {
          console.log('✅ Documento también guardado en documentos_cliente')
        }
      } else {
        console.warn('⚠️ No se encontró cliente_id para la negociación')
      }

      alert(`✅ Documento "${documentoNombre}" subido correctamente`)

    } catch (error: any) {
      console.error('❌ Error completo:', error)
      alert(`❌ Error al subir documento: ${error.message || 'Error desconocido'}`)
    } finally {
      setSubiendoDoc(null)
    }
  }

  // ===================================
  // RENDER: LOADING
  // ===================================

  if (loading) {
    return (
      <div className={styles.loading.container}>
        <Loader2 className={styles.loading.spinner} />
      </div>
    )
  }

  // ===================================
  // RENDER: SIN PROCESO
  // ===================================

  if (!loading && pasos.length === 0) {
    return (
      <div className={styles.empty.container}>
        <FileText className={styles.empty.icon} />
        <h3 className={styles.empty.title}>No hay proceso configurado</h3>
        <p className={styles.empty.description}>
          Esta negociación aún no tiene un proceso asignado.
          Contacta al administrador para configurar el proceso.
        </p>
      </div>
    )
  }

  // ===================================
  // RENDER: PRINCIPAL
  // ===================================

  return (
    <div className="space-y-6">
      {/* Header con Progreso */}
      <Header progreso={progreso} />

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.error.container}
          >
            <AlertCircle className={styles.error.icon} />
            <div className={styles.error.content}>
              <p className={styles.error.title}>Error</p>
              <p className={styles.error.message}>{error}</p>
            </div>
            <button onClick={limpiarError} className={styles.error.close}>
              <X className={styles.error.closeIcon} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline de Pasos */}
      <div className={styles.timeline.container}>
        <div className={styles.timeline.list}>
          {/* Línea conectora */}
          <div className={styles.timeline.line} />

          {/* Pasos */}
          {pasos.map((paso, index) => (
            <PasoItem
              key={paso.id}
              paso={paso}
              index={index}
              isExpanded={pasoExpandido === paso.id}
              onToggle={() => togglePaso(paso.id)}
              onIniciar={() => handleIniciar(paso.id)}
              onCompletar={() => handleCompletar(paso.id)}
              onAdjuntarDocumento={handleAdjuntarDocumento}
              puedeCompletar={puedeCompletar(paso)}
              deshabilitado={actualizando}
              subiendoDoc={subiendoDoc}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ===================================
// COMPONENTE: HEADER CON PROGRESO
// ===================================

interface HeaderProps {
  progreso: any
}

function Header({ progreso }: HeaderProps) {
  if (!progreso) return null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Proceso de Compra
        </h2>
        <span className="rounded-full bg-white/20 backdrop-blur-xl px-4 py-2 text-sm font-semibold text-white">
          {progreso.porcentajeCompletado}% Completado
        </span>
      </div>

      {/* Barra de Progreso */}
      <div className="mb-4 h-3 overflow-hidden rounded-full bg-white/20 backdrop-blur-xl">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progreso.porcentajeCompletado}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg"
        />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
        <div className="text-center">
          <div className="text-2xl font-bold">{progreso.pasosCompletados}</div>
          <div className="text-xs text-white/80">Completados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{progreso.pasosEnProceso}</div>
          <div className="text-xs text-white/80">En Proceso</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{progreso.pasosPendientes}</div>
          <div className="text-xs text-white/80">Pendientes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{progreso.totalPasos}</div>
          <div className="text-xs text-white/80">Total Pasos</div>
        </div>
      </div>
    </div>
  )
}

// ===================================
// COMPONENTE: PASO ITEM
// ===================================

interface PasoItemProps {
  paso: ProcesoNegociacion
  index: number
  isExpanded: boolean
  onToggle: () => void
  onIniciar: () => void
  onCompletar: () => void
  onAdjuntarDocumento: (pasoId: string, documentoId: string, documentoNombre: string, file: File) => Promise<void>
  puedeCompletar: boolean
  deshabilitado: boolean
  subiendoDoc: string | null
}

function PasoItem({
  paso,
  index,
  isExpanded,
  onToggle,
  onIniciar,
  onCompletar,
  onAdjuntarDocumento,
  puedeCompletar,
  deshabilitado,
  subiendoDoc
}: PasoItemProps) {
  const isCompletado = paso.estado === EstadoPaso.COMPLETADO
  const isEnProceso = paso.estado === EstadoPaso.EN_PROCESO
  const isPendiente = paso.estado === EstadoPaso.PENDIENTE
  const isOmitido = paso.estado === EstadoPaso.OMITIDO

  // Iconos según estado
  const getIcon = () => {
    if (isCompletado) return <CheckCircle2 className="w-5 h-5 text-green-600" />
    if (isEnProceso) return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
    if (isOmitido) return <X className="w-5 h-5 text-gray-400" />
    return <Circle className="w-5 h-5 text-gray-300" />
  }

  // Color del dot según estado
  const getDotClasses = () => {
    if (isCompletado) return 'bg-gradient-to-br from-green-500 to-emerald-600'
    if (isEnProceso) return 'bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse'
    if (isOmitido) return 'bg-gray-400'
    return 'bg-gray-300'
  }

  // Badge de estado
  const getBadge = () => {
    if (isCompletado) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          ✓ Completado
        </span>
      )
    }
    if (isEnProceso) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
          ⏱ En Proceso
        </span>
      )
    }
    if (isOmitido) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
          Omitido
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
        Pendiente
      </span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={styles.timeline.item.container}
    >
      {/* Dot */}
      <div className={`${styles.timeline.item.dot} ${getDotClasses()}`}>
        {index + 1}
      </div>

      {/* Contenido */}
      <div className={styles.timeline.item.content}>
        <div
          onClick={onToggle}
          className="cursor-pointer rounded-xl bg-white/80 backdrop-blur-xl border border-gray-200/50 p-4 hover:shadow-lg transition-all"
        >
          {/* Header del Paso */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getIcon()}
                <h3 className={styles.timeline.item.title}>{paso.nombre}</h3>
              </div>
              {paso.descripcion && (
                <p className={styles.timeline.item.description}>{paso.descripcion}</p>
              )}
            </div>

            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {getBadge()}

            {paso.esObligatorio && (
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                Obligatorio
              </span>
            )}
          </div>

          {/* Fechas */}
          {(paso.fechaInicio || paso.fechaCompletado) && (
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-200">
              {paso.fechaInicio && (
                <span>Iniciado: {new Date(paso.fechaInicio).toLocaleDateString()}</span>
              )}
              {paso.fechaCompletado && (
                <span>Completado: {new Date(paso.fechaCompletado).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>

        {/* Contenido Expandido */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-xl bg-gray-50 p-4 space-y-4">
                {/* Documentos Requeridos */}
                {paso.documentosRequeridos && paso.documentosRequeridos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Documentos Requeridos:
                    </h4>
                    <div className="space-y-2">
                      {paso.documentosRequeridos.map(doc => {
                        const subido = paso.documentosUrls?.[doc.id] || paso.documentosUrls?.[doc.nombre]

                        return (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {doc.nombre}
                                  {doc.obligatorio && (
                                    <span className="ml-2 text-xs text-red-600">*</span>
                                  )}
                                </div>
                                {doc.descripcion && (
                                  <div className="text-xs text-gray-500">{doc.descripcion}</div>
                                )}
                              </div>
                            </div>

                            {subido ? (
                              <a
                                href={subido}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            ) : (
                              <div className="relative">
                                <input
                                  type="file"
                                  id={`upload-${doc.id}`}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      onAdjuntarDocumento(paso.id, doc.id, doc.nombre, file)
                                      // Limpiar input para permitir re-upload del mismo archivo
                                      e.target.value = ''
                                    }
                                  }}
                                  disabled={subiendoDoc === doc.id}
                                />
                                <label
                                  htmlFor={`upload-${doc.id}`}
                                  className={`
                                    p-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2
                                    ${subiendoDoc === doc.id
                                      ? 'bg-blue-100 text-blue-400'
                                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                                    }
                                  `}
                                >
                                  {subiendoDoc === doc.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                </label>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Notas */}
                {paso.notas && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Notas:</h4>
                    <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
                      {paso.notas}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  {isPendiente && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onIniciar()
                      }}
                      disabled={deshabilitado}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Iniciar Paso
                    </button>
                  )}

                  {(isPendiente || isEnProceso) && puedeCompletar && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCompletar()
                      }}
                      disabled={deshabilitado}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Marcar Completado
                    </button>
                  )}

                  {!puedeCompletar && (isPendiente || isEnProceso) && (
                    <div className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Completa los requisitos para avanzar
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

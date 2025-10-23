/**
 * 📋 COMPONENTE: FORMULARIO DE PLANTILLA
 *
 * Formulario completo para crear/editar plantillas de proceso
 * con gestión de pasos, documentos y condiciones.
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    FileText,
    GripVertical,
    Plus,
    Save,
    Settings,
    Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGestionProcesos } from '../hooks'
import { TipoFuentePago, type PasoPlantilla } from '../types'

interface FormularioPlantillaProps {
  plantillaId?: string // Si existe, estamos editando
}

// Estilos específicos para el formulario
const formStyles = {
  page: 'min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
  header: 'relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 mb-8 shadow-xl',
  headerPattern: 'absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]',
  headerContent: 'relative z-10 flex items-center gap-6',
  content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  card: 'rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 p-8 mb-6 shadow-lg'
}

export function FormularioPlantilla({ plantillaId }: FormularioPlantillaProps) {
  const router = useRouter()
  const {
    plantillaActual,
    cargarPlantilla,
    crearNuevaPlantilla,
    actualizarPlantillaActual,
    agregarPaso,
    actualizarPaso,
    eliminarPaso,
    guardando,
    error
  } = useGestionProcesos()

  // Estado del formulario
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [esPredeterminado, setEsPredeterminado] = useState(false)
  const [pasos, setPasos] = useState<PasoPlantilla[]>([])
  const [pasoExpandido, setPasoExpandido] = useState<string | null>(null)

  // Cargar plantilla si estamos editando
  useEffect(() => {
    if (plantillaId) {
      cargarPlantilla(plantillaId)
    }
  }, [plantillaId, cargarPlantilla])

  // Sincronizar estado local con plantillaActual
  useEffect(() => {
    if (plantillaActual) {
      setNombre(plantillaActual.nombre)
      setDescripcion(plantillaActual.descripcion || '')
      setEsPredeterminado(plantillaActual.esPredeterminado)
      setPasos(plantillaActual.pasos)
    }
  }, [plantillaActual])

  // Handler para guardar
  const handleGuardar = async () => {
    if (!nombre.trim()) {
      alert('❌ El nombre es obligatorio')
      return
    }

    if (pasos.length === 0) {
      alert('❌ Debes agregar al menos un paso')
      return
    }

    // Validar orden de pasos
    const pasosOrdenados = pasos.map((paso, index) => ({
      ...paso,
      orden: index + 1
    }))

    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      pasos: pasosOrdenados,
      esPredeterminado
    }

    try {
      if (plantillaId) {
        await actualizarPlantillaActual(datos)
        alert('✅ Plantilla actualizada exitosamente')
      } else {
        const nueva = await crearNuevaPlantilla(datos)
        if (nueva) {
          alert('✅ Plantilla creada exitosamente')
          router.push('/admin/procesos')
        }
      }
    } catch (err) {
      console.error('Error al guardar:', err)
      alert('❌ Error al guardar la plantilla')
    }
  }

  // Handler para agregar paso
  const handleAgregarPaso = () => {
    const nuevoPaso: PasoPlantilla = {
      id: `temp_${Date.now()}`,
      orden: pasos.length + 1,
      nombre: '',
      descripcion: '',
      obligatorio: true,
      permiteOmitir: false,
      condiciones: {
        fuentesPagoRequeridas: [],
        dependeDe: [],
        diasMinimoDespuesDe: undefined,
        fechaMinimaCompletado: undefined
      },
      documentos: [],
      diasEstimados: undefined,
      instrucciones: ''
    }

    setPasos([...pasos, nuevoPaso])
    setPasoExpandido(nuevoPaso.id)
  }

  // Handler para eliminar paso
  const handleEliminarPaso = (pasoId: string) => {
    if (confirm('¿Estás seguro de eliminar este paso?')) {
      setPasos(pasos.filter(p => p.id !== pasoId))
      if (pasoExpandido === pasoId) {
        setPasoExpandido(null)
      }
    }
  }

  // Handler para actualizar paso
  const handleActualizarPaso = (pasoId: string, cambios: Partial<PasoPlantilla>) => {
    setPasos(pasos.map(p =>
      p.id === pasoId ? { ...p, ...cambios } : p
    ))
  }

  // Handler para agregar documento a paso
  const handleAgregarDocumento = (pasoId: string) => {
    const nuevoDoc = {
      id: `doc_${Date.now()}`,
      nombre: '',
      descripcion: '',
      obligatorio: true,
      tiposArchivo: ['application/pdf'],
      ejemploUrl: undefined
    }

    setPasos(pasos.map(p =>
      p.id === pasoId
        ? { ...p, documentos: [...p.documentos, nuevoDoc] }
        : p
    ))
  }

  // Handler para eliminar documento
  const handleEliminarDocumento = (pasoId: string, docId: string) => {
    setPasos(pasos.map(p =>
      p.id === pasoId
        ? { ...p, documentos: p.documentos.filter(d => d.id !== docId) }
        : p
    ))
  }

  // Handler para actualizar documento
  const handleActualizarDocumento = (
    pasoId: string,
    docId: string,
    cambios: Partial<typeof pasos[0]['documentos'][0]>
  ) => {
    setPasos(pasos.map(p =>
      p.id === pasoId
        ? {
            ...p,
            documentos: p.documentos.map(d =>
              d.id === docId ? { ...d, ...cambios } : d
            )
          }
        : p
    ))
  }

  return (
    <div className={formStyles.page}>
      {/* Header con gradiente */}
      <div className={formStyles.header}>
        <div className={formStyles.headerPattern} />

        <div className={formStyles.headerContent}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20
                     backdrop-blur-sm transition-all duration-200 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-3">
              {plantillaId ? 'Editar Plantilla' : 'Nueva Plantilla de Proceso'}
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              {plantillaId
                ? 'Modifica los pasos y configuración de la plantilla'
                : 'Define los pasos que los clientes deben completar en el proceso de compra'
              }
            </p>
          </div>

          <button
            onClick={handleGuardar}
            disabled={guardando || !nombre.trim() || pasos.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-blue-600
                     hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed
                     font-medium transition-all duration-200 shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>{guardando ? 'Guardando...' : 'Guardar Plantilla'}</span>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className={formStyles.content}>
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Información básica */}
        <div className={formStyles.card}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Información Básica
              </h2>
              <p className="text-sm text-gray-500">
                Nombre y descripción de la plantilla
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Plantilla *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Proceso Venta Vivienda VIS"
                className="w-full px-4 py-3 rounded-lg border border-gray-300
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente esta plantilla..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 resize-none"
              />
            </div>

            {/* Es predeterminado */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="esPredeterminado"
                checked={esPredeterminado}
                onChange={(e) => setEsPredeterminado(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600
                         focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="esPredeterminado" className="text-sm text-gray-700">
                Establecer como plantilla predeterminada
              </label>
            </div>
          </div>
        </div>

        {/* Lista de pasos */}
        <div className={formStyles.card}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Pasos del Proceso
                </h2>
                <p className="text-sm text-gray-500">
                  {pasos.length} {pasos.length === 1 ? 'paso' : 'pasos'} definidos
                </p>
              </div>
            </div>

            <button
              onClick={handleAgregarPaso}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                       hover:from-blue-600 hover:to-indigo-700
                       transition-all duration-200 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Paso</span>
            </button>
          </div>

          {/* Lista de pasos */}
          {pasos.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full
                            bg-gray-100 mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                No hay pasos definidos
              </p>
              <button
                onClick={handleAgregarPaso}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Agregar el primer paso
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {pasos.map((paso, index) => (
                  <PasoItem
                    key={paso.id}
                    paso={paso}
                    index={index}
                    isExpanded={pasoExpandido === paso.id}
                    onToggle={() => setPasoExpandido(
                      pasoExpandido === paso.id ? null : paso.id
                    )}
                    onUpdate={(cambios) => handleActualizarPaso(paso.id, cambios)}
                    onDelete={() => handleEliminarPaso(paso.id)}
                    onAgregarDocumento={() => handleAgregarDocumento(paso.id)}
                    onEliminarDocumento={(docId) => handleEliminarDocumento(paso.id, docId)}
                    onActualizarDocumento={(docId, cambios) =>
                      handleActualizarDocumento(paso.id, docId, cambios)
                    }
                    pasosDisponibles={pasos.filter(p => p.id !== paso.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE: PASO ITEM
// ============================================

interface PasoItemProps {
  paso: PasoPlantilla
  index: number
  isExpanded: boolean
  onToggle: () => void
  onUpdate: (cambios: Partial<PasoPlantilla>) => void
  onDelete: () => void
  onAgregarDocumento: () => void
  onEliminarDocumento: (docId: string) => void
  onActualizarDocumento: (docId: string, cambios: any) => void
  pasosDisponibles: PasoPlantilla[]
}

function PasoItem({
  paso,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAgregarDocumento,
  onEliminarDocumento,
  onActualizarDocumento,
  pasosDisponibles
}: PasoItemProps) {
  const hasErrors = !paso.nombre.trim()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`rounded-lg border-2 transition-all duration-200 ${
        hasErrors
          ? 'border-red-300 bg-red-50/50'
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      {/* Header del paso */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 p-4 cursor-pointer"
      >
        <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

        <div className="flex items-center justify-center w-8 h-8 rounded-full
                      bg-gradient-to-br from-blue-500 to-indigo-600 text-white
                      font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {paso.nombre || <span className="text-gray-400 italic">Sin nombre</span>}
          </p>
          {paso.descripcion && (
            <p className="text-sm text-gray-500 truncate">{paso.descripcion}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {paso.obligatorio && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              Obligatorio
            </span>
          )}
          {paso.documentos.length > 0 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {paso.documentos.length} {paso.documentos.length === 1 ? 'doc' : 'docs'}
            </span>
          )}
          {hasErrors && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Contenido expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Campos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Paso *
                  </label>
                  <input
                    type="text"
                    value={paso.nombre}
                    onChange={(e) => onUpdate({ nombre: e.target.value })}
                    placeholder="Ej: Firma de Promesa de Compraventa"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={paso.descripcion}
                    onChange={(e) => onUpdate({ descripcion: e.target.value })}
                    placeholder="Describe este paso..."
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Días estimados */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días Estimados
                  </label>
                  <input
                    type="number"
                    value={paso.diasEstimados || ''}
                    onChange={(e) => onUpdate({
                      diasEstimados: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    placeholder="Ej: 15"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Días mínimos después de */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días Mínimos Después De
                  </label>
                  <input
                    type="number"
                    value={paso.condiciones.diasMinimoDespuesDe || ''}
                    onChange={(e) => onUpdate({
                      condiciones: {
                        ...paso.condiciones,
                        diasMinimoDespuesDe: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    placeholder="Ej: 1"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paso.obligatorio}
                    onChange={(e) => onUpdate({ obligatorio: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600
                             focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm text-gray-700">Obligatorio</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paso.permiteOmitir}
                    onChange={(e) => onUpdate({ permiteOmitir: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600
                             focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm text-gray-700">Permite Omitir</span>
                </label>
              </div>

              {/* Fuentes de pago requeridas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuentes de Pago Requeridas
                  <span className="ml-2 text-xs text-gray-500">
                    (vacío = aplica a todas)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(TipoFuentePago).map(fuente => (
                    <label
                      key={fuente}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300
                               bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={paso.condiciones.fuentesPagoRequeridas.includes(fuente)}
                        onChange={(e) => {
                          const nuevasFuentes = e.target.checked
                            ? [...paso.condiciones.fuentesPagoRequeridas, fuente]
                            : paso.condiciones.fuentesPagoRequeridas.filter(f => f !== fuente)

                          onUpdate({
                            condiciones: {
                              ...paso.condiciones,
                              fuentesPagoRequeridas: nuevasFuentes
                            }
                          })
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600
                                 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{fuente}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Depende de */}
              {pasosDisponibles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depende de (pasos previos)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {pasosDisponibles
                      .filter(p => p.orden < paso.orden)
                      .map(pasoDisponible => (
                        <label
                          key={pasoDisponible.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300
                                   bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={paso.condiciones.dependeDe.includes(pasoDisponible.id)}
                            onChange={(e) => {
                              const nuevasDependencias = e.target.checked
                                ? [...paso.condiciones.dependeDe, pasoDisponible.id]
                                : paso.condiciones.dependeDe.filter(d => d !== pasoDisponible.id)

                              onUpdate({
                                condiciones: {
                                  ...paso.condiciones,
                                  dependeDe: nuevasDependencias
                                }
                              })
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600
                                     focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {pasoDisponible.orden}. {pasoDisponible.nombre}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* Documentos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Documentos Requeridos
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAgregarDocumento()
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm
                             bg-blue-50 text-blue-600 hover:bg-blue-100
                             transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Documento</span>
                  </button>
                </div>

                {paso.documentos.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No hay documentos requeridos
                  </p>
                ) : (
                  <div className="space-y-2">
                    {paso.documentos.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />

                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={doc.nombre}
                            onChange={(e) => onActualizarDocumento(doc.id, {
                              nombre: e.target.value
                            })}
                            placeholder="Nombre del documento"
                            className="w-full px-3 py-1.5 text-sm rounded border border-gray-300
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />

                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={doc.obligatorio}
                                onChange={(e) => onActualizarDocumento(doc.id, {
                                  obligatorio: e.target.checked
                                })}
                                className="w-3 h-3 rounded border-gray-300 text-blue-600"
                              />
                              <span>Obligatorio</span>
                            </label>
                          </div>
                        </div>

                        <button
                          onClick={() => onEliminarDocumento(doc.id)}
                          className="p-1.5 rounded hover:bg-red-100 text-red-600
                                   transition-colors flex-shrink-0"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón eliminar paso */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-red-50 text-red-600 hover:bg-red-100
                           transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Paso</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

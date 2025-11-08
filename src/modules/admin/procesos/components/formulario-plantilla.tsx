/**
 * 📋 COMPONENTE: FORMULARIO DE PLANTILLA
 *
 * Formulario completo para crear/editar plantillas de proceso
 * con gestión de pasos, documentos y condiciones.
 */

'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion, Reorder } from 'framer-motion'
import { AlertCircle, ArrowLeft, FileText, Plus, Save, Settings } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { useModal } from '@/shared/components/modals'


import { useGestionProcesos } from '../hooks'
import { type PasoPlantilla } from '../types'

import { FormularioInfoBasica } from './formulario-info-basica'
import { formularioPlantillaStyles as styles } from './formulario-plantilla.styles'
import { PasoPlantillaItem } from './paso-plantilla-item'

interface FormularioPlantillaProps {
  plantillaId?: string // Si existe, estamos editando
}

export function FormularioPlantilla({ plantillaId }: FormularioPlantillaProps) {
  const router = useRouter()
  const { confirm } = useModal()
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
  const handleEliminarPaso = async (pasoId: string) => {
    const confirmed = await confirm({
      title: '¿Eliminar paso?',
      message: 'Se eliminará este paso de la plantilla.',
      confirmText: 'Eliminar',
      variant: 'danger'
    })

    if (confirmed) {
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

  // Handler para reordenar pasos mediante drag & drop
  const handleReordenar = (nuevoPasos: PasoPlantilla[]) => {
    setPasos(nuevoPasos)
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
    <div className={styles.page}>
      {/* Header con gradiente */}
      <div className={styles.header.container}>
        <div className={styles.header.pattern} />

        <div className={styles.header.content}>
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
      <div className={styles.content}>
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
        <div className={styles.card.base}>
          <div className={styles.card.header.container}>
            <div className={styles.card.header.left}>
              <div className={styles.card.header.iconBox}>
                <Settings className={styles.card.header.icon} />
              </div>
              <div className={styles.card.header.textContainer}>
                <h2 className={styles.card.header.title}>
                  Información Básica
                </h2>
                <p className={styles.card.header.subtitle}>
                  Nombre y descripción de la plantilla
                </p>
              </div>
            </div>
          </div>

          <FormularioInfoBasica
            nombre={nombre}
            descripcion={descripcion}
            esPredeterminado={esPredeterminado}
            onNombreChange={setNombre}
            onDescripcionChange={setDescripcion}
            onPredeterminadoChange={setEsPredeterminado}
          />
        </div>

        {/* Lista de pasos */}
        <div className={styles.card.base}>
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
            <Reorder.Group
              axis="y"
              values={pasos}
              onReorder={handleReordenar}
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {pasos.map((paso, index) => (
                  <PasoPlantillaItem
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
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  )
}

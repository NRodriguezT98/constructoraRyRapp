/**
 * EditarViviendaModal - Modal PROFESIONAL para editar viviendas
 * ✅ Componente presentacional puro
 * ✅ React Hook Form + React Query
 * ✅ Reutiliza EXACTAMENTE estructura de nueva-vivienda-view
 * ✅ Wizard con validación por paso (Zod schemas)
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Compass,
  DollarSign,
  FileText,
  Home,
  Loader2,
  MapPin
} from 'lucide-react'

import { ConfirmarCambiosModal } from '@/shared/components/modulos/ConfirmarCambiosModal'
import { Modal } from '@/shared/components/ui/Modal'
import { cn } from '@/shared/utils/helpers'

import { useEditarVivienda } from '../hooks/useEditarVivienda'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'
import type { Vivienda } from '../types'

import { PasoFinancieroNuevo } from './paso-financiero-nuevo'
import { PasoLegalNuevo } from './paso-legal-nuevo'
import { PasoLinderosNuevo } from './paso-linderos-nuevo'
import { PasoUbicacionNuevo } from './paso-ubicacion-nuevo'

// Mapeo de iconos por key del hook
const iconMap = {
  ubicacion: MapPin,
  linderos: Compass,
  legal: FileText,
  financiero: DollarSign,
  resumen: CheckCircle,
}

// Configuración de categorías para el modal de confirmación
const categoriasConfig = {
  linderos: {
    titulo: 'Linderos',
    icono: Compass,
  },
  legal: {
    titulo: 'Información Legal',
    icono: FileText,
  },
  financiero: {
    titulo: 'Información Financiera',
    icono: DollarSign,
  },
}

interface EditarViviendaModalProps {
  isOpen: boolean
  vivienda: Vivienda | null
  onClose: () => void
  onSuccess?: (viviendaActualizada: Vivienda) => void
}

export function EditarViviendaModal({
  isOpen,
  vivienda,
  onClose,
  onSuccess,
}: EditarViviendaModalProps) {
  const {
    // React Hook Form
    register,
    errors,
    setValue,
    watch,

    // Estado del wizard
    pasoActual,
    progreso,
    esPrimerPaso,
    esUltimoPaso,
    pasosCompletados,
    pasos,

    // Datos
    previewData,
    resumenFinanciero,
    cambiosDetectados,

    // Datos del servidor (React Query)
    proyectos,
    manzanas,
    gastosNotariales,
    configuracionRecargos,

    // Estados de carga
    cargandoProyectos,
    validandoMatricula,
    submitting,
    hayFormularioConCambios,

    // Modal confirmación
    mostrarModalConfirmacion,
    setMostrarModalConfirmacion,

    // Acciones
    irSiguiente,
    irAtras,
    irAPaso,
    cancelar,
    mostrarConfirmacion,
    confirmarYGuardar,
  } = useEditarVivienda({
    vivienda,
    onSuccess: (viviendaActualizada) => {
      onSuccess?.(viviendaActualizada)
      onClose()
    },
    onCancel: onClose,
  })

  const handleCerrar = () => {
    if (hayFormularioConCambios) {
      cancelar()
    } else {
      onClose()
    }
  }

  // Si no hay vivienda, no renderizar
  if (!vivienda) return null

  // Nombres para el preview (usar datos pre-cargados de vivienda en modo edición)
  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || ''
  const manzanaNombre = vivienda.manzanas?.nombre || ''

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCerrar}
        title={`Editando Mz. ${vivienda.manzanas?.nombre || ''} Casa #${vivienda.numero}`}
        description={vivienda.manzanas?.proyectos?.nombre || ''}
        size="xl"
        gradientColor="orange"
        icon={<Home className="w-6 h-6 text-white" />}
        closeOnEscape={!hayFormularioConCambios}
        closeOnBackdrop={!hayFormularioConCambios}
        noContentScroll={true}
      >
      {cargandoProyectos ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cargando datos de la vivienda...
            </p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            // 🚨 PREVENIR AUTO-SUBMIT: No permitir submit con Enter
            e.preventDefault()
            e.stopPropagation()
            return false
          }}
          className="flex flex-col h-full"
        >
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar px-6 py-3">
            {/* STEPPER HORIZONTAL */}
            <div className={styles.stepper.container}>
              <div className={styles.stepper.list}>
                {pasos.map((paso, index) => {
                  const Icon = iconMap[paso.key as keyof typeof iconMap]
                  const completado = pasosCompletados.includes(paso.id)
                  const activo = paso.id === pasoActual
                  const inactivo = !completado && !activo

                  return (
                    <div key={paso.id} className={styles.stepper.step.container}>
                      {/* Conector (línea entre pasos) */}
                      {index < pasos.length - 1 && (
                        <div
                          className={cn(
                            styles.stepper.step.connector,
                            completado || activo
                              ? styles.stepper.step.connectorCompleted
                              : styles.stepper.step.connectorInactive
                          )}
                        />
                      )}

                      {/* Icono */}
                      <div className={styles.stepper.step.iconWrapper}>
                        <button
                          onClick={() => irAPaso(paso.id)}
                          className={cn(
                            styles.stepper.step.iconCircle,
                            completado && styles.stepper.step.iconCircleCompleted,
                            activo && styles.stepper.step.iconCircleActive,
                            inactivo && styles.stepper.step.iconCircleInactive
                          )}
                          type="button"
                          disabled={inactivo}
                        >
                          {completado ? (
                            <Check className={styles.stepper.step.checkIcon} />
                          ) : (
                            <Icon className={styles.stepper.step.icon} />
                          )}
                        </button>
                      </div>

                      {/* Label */}
                      <span
                        className={cn(
                          styles.stepper.step.label,
                          completado && styles.stepper.step.labelCompleted,
                          activo && styles.stepper.step.labelActive,
                          inactivo && styles.stepper.step.labelInactive
                        )}
                      >
                        {paso.titulo}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CONTENIDO DEL PASO ACTUAL */}
            <motion.div
              {...styles.animations.step}
              key={pasoActual}
              className={styles.content.container}
            >
              <div className="w-full max-w-4xl mx-auto">
                <div className={styles.content.formColumn}>
                  <AnimatePresence mode="wait">
                    {(() => {
                      switch (pasoActual) {
                        case 1:
                          return (
                            <PasoUbicacionNuevo
                              key="paso-1"
                              register={register}
                              errors={errors}
                              setValue={setValue}
                              watch={watch}
                              mode="edit"
                              viviendaActual={vivienda}
                            />
                          )
                        case 2:
                          return (
                            <PasoLinderosNuevo key="paso-2" register={register} errors={errors} />
                          )
                        case 3:
                          return (
                            <PasoLegalNuevo
                              key="paso-3"
                            register={register}
                            errors={errors}
                          />
                          )
                        case 4:
                          return (
                            <PasoFinancieroNuevo
                              key="paso-4"
                              register={register}
                              errors={errors}
                              watch={watch}
                              setValue={setValue}
                              resumenFinanciero={resumenFinanciero}
                              configuracionRecargos={configuracionRecargos}
                          />
                        )
                        default:
                          return null
                      }
                    })()}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* BOTONES DE NAVEGACIÓN - FUERA DEL SCROLL, PEGADO AL FONDO */}
          <div className="sticky bottom-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-3 shadow-2xl shadow-orange-500/10">
            <div className={styles.navigation.content}>
              {/* Botón Atrás */}
              <button
                onClick={irAtras}
                disabled={esPrimerPaso || submitting}
                className={styles.navigation.backButton}
                type="button"
              >
                <ChevronLeft className={styles.navigation.backIcon} />
                Atrás
              </button>

              {/* Indicador de paso */}
              <div className={styles.navigation.stepIndicator}>
                Paso {pasoActual} de {pasos.length}
              </div>

              {/* Botones Siguiente / Submit */}
              {!esUltimoPaso ? (
                <button
                  onClick={irSiguiente}
                  disabled={submitting || validandoMatricula}
                  className={styles.navigation.nextButton}
                  type="button"
                >
                  {validandoMatricula ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className={styles.navigation.nextIcon} />
                    </>
                  )}
                </button>
              ) : (
                <div className="relative group">
                  <button
                    onClick={mostrarConfirmacion}
                    disabled={submitting || cambiosDetectados.length === 0}
                    className={cn(
                      styles.navigation.submitButton,
                      cambiosDetectados.length === 0 && 'opacity-50 cursor-not-allowed'
                    )}
                    type="button"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className={styles.navigation.submitIcon + ' animate-spin'} />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className={styles.navigation.submitIcon} />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                  {cambiosDetectados.length === 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      No hay cambios para guardar
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </Modal>

    {/* MODAL DE CONFIRMACIÓN DE CAMBIOS */}
    {mostrarModalConfirmacion && (
      <ConfirmarCambiosModal
        isOpen={mostrarModalConfirmacion}
        onClose={() => {
          // Solo cerrar la modal de confirmación, NO la modal principal
          setMostrarModalConfirmacion(false)
        }}
        onConfirm={confirmarYGuardar}
        cambios={cambiosDetectados}
        categoriasConfig={categoriasConfig}
        moduleName="viviendas"
        tituloEntidad={`Vivienda ${vivienda.numero}`}
        isLoading={submitting}
      />
    )}
  </>
  )
}

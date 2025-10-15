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
    Loader2,
    MapPin,
    Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { PASOS_FORMULARIO } from '../constants'
import { useViviendaForm } from '../hooks/useViviendaForm'
import { navigationClasses, wizardClasses } from '../styles/vivienda-form.styles'
import type { PasoFormulario } from '../types'
import { PasoFinanciero } from './paso-financiero'
import { PasoLegal } from './paso-legal'
import { PasoLinderos } from './paso-linderos'
import { PasoResumen } from './paso-resumen'
import { PasoUbicacion } from './paso-ubicacion'

interface FormularioViviendaProps {
  viviendaId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Componente principal del formulario de viviendas
 * Wizard multi-paso con validación y navegación
 */
export function FormularioVivienda({ viviendaId, onSuccess, onCancel }: FormularioViviendaProps) {
  const {
    // Estado del wizard
    pasoActual,
    pasosCompletados,

    // Datos
    formData,
    errores,
    resumenFinanciero,

    // Datos de selección
    proyectos,
    manzanas,
    manzanaSeleccionada,
    numerosDisponibles,
    configuracionRecargos,

    // Estados de carga
    loading,
    loadingProyectos,
    loadingManzanas,
    validandoMatricula,

    // Acciones
    actualizarCampo,
    seleccionarProyecto,
    seleccionarManzana,
    toggleEsquinera,
    avanzarPaso,
    retrocederPaso,
    irAPaso,
    submitFormulario,
  } = useViviendaForm()

  const pasoIndex = PASOS_FORMULARIO.findIndex((p) => p.id === pasoActual)
  const isFirstStep = pasoIndex === 0
  const isLastStep = pasoIndex === PASOS_FORMULARIO.length - 1

  const handleSubmit = async () => {
    const result = await submitFormulario()

    if (result.success) {
      toast.success(result.mensaje)
      onSuccess?.()
    } else {
      toast.error(result.mensaje)
    }
  }

  const handleCancel = () => {
    onCancel?.()
  }

  // Proyecto seleccionado
  const proyectoSeleccionado = proyectos.find((p) => p.id === formData.proyecto_id)

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Stepper */}
      <div className={wizardClasses.stepper}>
        {PASOS_FORMULARIO.map((paso, index) => {
          const isActive = paso.id === pasoActual
          const isCompleted = pasosCompletados.includes(paso.id)

          // Mapear icono según el paso
          const Icon =
            paso.icono === 'MapPin'
              ? MapPin
              : paso.icono === 'Compass'
                ? Compass
                : paso.icono === 'FileText'
                  ? FileText
                  : paso.icono === 'DollarSign'
                    ? DollarSign
                    : CheckCircle

          return (
            <div key={paso.id} className={wizardClasses.stepItem}>
              {/* Círculo del paso */}
              <button
                type="button"
                onClick={() => irAPaso(paso.id)}
                disabled={!isCompleted && !isActive}
                className={`
                  ${wizardClasses.stepCircle.base}
                  ${isActive && wizardClasses.stepCircle.active}
                  ${isCompleted && wizardClasses.stepCircle.completed}
                  ${!isActive && !isCompleted && wizardClasses.stepCircle.inactive}
                  ${isCompleted || isActive ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </button>

              {/* Label del paso */}
              <div>
                <div
                  className={`
                    ${wizardClasses.stepLabel.base}
                    ${isActive && wizardClasses.stepLabel.active}
                    ${isCompleted && wizardClasses.stepLabel.completed}
                    ${!isActive && !isCompleted && wizardClasses.stepLabel.inactive}
                  `}
                >
                  {paso.label}
                </div>
                <p className="ml-3 hidden text-xs text-gray-500 dark:text-gray-400 lg:block">
                  {paso.descripcion}
                </p>
              </div>

              {/* Línea conectora */}
              {index < PASOS_FORMULARIO.length - 1 && (
                <div
                  className={`
                    ${wizardClasses.stepLine.base}
                    ${isCompleted ? wizardClasses.stepLine.completed : wizardClasses.stepLine.inactive}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenido del paso actual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pasoActual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={wizardClasses.content}
        >
          {renderPasoActual(pasoActual)}
        </motion.div>
      </AnimatePresence>

      {/* Navegación */}
      <div className={navigationClasses.container}>
        <button
          type="button"
          onClick={retrocederPaso}
          disabled={isFirstStep}
          className={navigationClasses.button.secondary}
        >
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </button>

        <button
          type="button"
          onClick={isLastStep ? handleSubmit : avanzarPaso}
          disabled={loading}
          className={navigationClasses.button.primary}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isLastStep ? (
            <>
              <Save className="h-4 w-4" />
              Crear Vivienda
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )

  // Función auxiliar para renderizar el paso actual
  function renderPasoActual(paso: PasoFormulario) {
    switch (paso) {
      case 'ubicacion':
        return (
          <PasoUbicacion
            proyectos={proyectos}
            manzanas={manzanas}
            manzanaSeleccionada={manzanaSeleccionada}
            numerosDisponibles={numerosDisponibles}
            proyectoId={formData.proyecto_id}
            manzanaId={formData.manzana_id}
            numeroVivienda={formData.numero}
            errores={errores}
            loadingProyectos={loadingProyectos}
            loadingManzanas={loadingManzanas}
            onProyectoChange={seleccionarProyecto}
            onManzanaChange={seleccionarManzana}
            onNumeroChange={(numero) => actualizarCampo('numero', numero)}
          />
        )

      case 'linderos':
        return (
          <PasoLinderos
            linderoNorte={formData.lindero_norte || ''}
            linderoSur={formData.lindero_sur || ''}
            linderoOriente={formData.lindero_oriente || ''}
            linderoOccidente={formData.lindero_occidente || ''}
            errores={errores}
            onChange={actualizarCampo}
          />
        )

      case 'legal':
        return (
          <PasoLegal
            matriculaInmobiliaria={formData.matricula_inmobiliaria || ''}
            nomenclatura={formData.nomenclatura || ''}
            areaLote={formData.area_lote}
            areaConstruida={formData.area_construida}
            tipoVivienda={formData.tipo_vivienda}
            certificadoFile={formData.certificado_tradicion_file}
            errores={errores}
            onChange={actualizarCampo}
          />
        )

      case 'financiero':
        return (
          <PasoFinanciero
            valorBase={formData.valor_base}
            esEsquinera={formData.es_esquinera || false}
            recargoEsquinera={formData.recargo_esquinera || 0}
            resumen={resumenFinanciero}
            configuracionRecargos={configuracionRecargos}
            errores={errores}
            onChange={actualizarCampo}
            onToggleEsquinera={toggleEsquinera}
          />
        )

      case 'resumen':
        return (
          <PasoResumen
            formData={formData}
            resumen={resumenFinanciero}
            proyecto={proyectoSeleccionado}
            manzana={manzanaSeleccionada}
          />
        )
    }
  }
}

/**
 * Modal para Crear Negociación con Cierre Financiero
 *
 * FLUJO (3 pasos):
 * 1. Información Básica (Cliente, Vivienda, Valores)
 * 2. Fuentes de Pago (Configuración completa del financiamiento)
 * 3. Revisión y Confirmación
 *
 * ⚠️ VALIDACIÓN CRÍTICA: Suma de fuentes = Valor total vivienda
 *
 * Al crear:
 * - Negociación con estado "Cierre Financiero"
 * - Todas las fuentes de pago configuradas
 * - Cliente pasa a estado "Activo"
 * - Vivienda marcada como "reservada"
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Sparkles,
    X,
} from 'lucide-react'

import { StepperNegociacion } from '@/modules/clientes/components'

import { Paso1InfoBasica, Paso2FuentesPago, Paso3Revision } from './components'
import { useModalNegociacion } from './hooks'
import { animations, modalStyles } from './styles'
import type { ModalCrearNegociacionProps } from './types'

export function ModalCrearNegociacion(props: ModalCrearNegociacionProps) {
  const modal = useModalNegociacion(props)

  // 🐛 DEBUG: Verificar que estamos usando el modal refactorizado
  console.log('📍 Modal Refactorizado Activo - Viviendas:', modal.viviendas.length, modal.viviendas)

  if (!props.isOpen) return null

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div {...animations.backdrop} className={modalStyles.backdrop} onClick={modal.handleClose} />

      {/* Modal */}
      <div className={modalStyles.container}>
        <motion.div {...animations.modal} className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={modalStyles.header.container}>
            <div>
              <h2 className={modalStyles.header.title}>
                <Sparkles className="h-6 w-6 text-blue-600" />
                Crear Negociación con Cierre Financiero
              </h2>
              <p className={modalStyles.header.subtitle}>
                Configura el financiamiento completo en 3 pasos
              </p>
            </div>
            <button onClick={modal.handleClose} className={modalStyles.header.closeButton}>
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Stepper */}
          <div className={modalStyles.stepper.container}>
            <StepperNegociacion
              currentStep={modal.currentStep}
              completedSteps={modal.completedSteps}
            />
          </div>

          {/* Content */}
          <div className={modalStyles.content.container}>
            <AnimatePresence mode="wait">
              {modal.currentStep === 1 && (
                <Paso1InfoBasica
                  key="paso1"
                  clienteNombre={props.clienteNombre}
                  proyectos={modal.proyectos}
                  viviendas={modal.viviendas}
                  cargandoProyectos={modal.cargandoProyectos}
                  cargandoViviendas={modal.cargandoViviendas}
                  proyectoSeleccionado={modal.proyectoSeleccionado}
                  viviendaId={modal.viviendaId}
                  valorNegociado={modal.valorNegociado}
                  descuentoAplicado={modal.descuentoAplicado}
                  valorTotal={modal.valorTotal}
                  notas={modal.notas}
                  viviendaIdProp={props.viviendaId}
                  onProyectoChange={modal.setProyectoSeleccionado}
                  onViviendaChange={modal.setViviendaId}
                  onValorNegociadoChange={modal.setValorNegociado}
                  onDescuentoChange={modal.setDescuentoAplicado}
                  onNotasChange={modal.setNotas}
                />
              )}

              {modal.currentStep === 2 && (
                <Paso2FuentesPago
                  key="paso2"
                  fuentes={modal.fuentes}
                  valorTotal={modal.valorTotal}
                  totalFuentes={modal.totalFuentes}
                  diferencia={modal.diferencia}
                  sumaCierra={modal.sumaCierra}
                  onFuenteEnabledChange={modal.handleFuenteEnabledChange}
                  onFuenteConfigChange={modal.handleFuenteConfigChange}
                />
              )}

              {modal.currentStep === 3 && (
                <Paso3Revision
                  key="paso3"
                  clienteNombre={props.clienteNombre}
                  proyectoNombre={modal.proyectos.find((p) => p.id === modal.proyectoSeleccionado)?.nombre || ''}
                  vivienda={modal.viviendas.find((v) => v.id === modal.viviendaId)}
                  valorNegociado={modal.valorNegociado}
                  descuentoAplicado={modal.descuentoAplicado}
                  valorTotal={modal.valorTotal}
                  notas={modal.notas}
                  fuentes={modal.fuentesActivas
                    .filter((f) => f.config !== null)
                    .map((f) => ({ tipo: f.tipo, config: f.config! }))}
                />
              )}
            </AnimatePresence>

            {/* Error */}
            {modal.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={modalStyles.error.container + ' mt-6'}
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                  <p className={modalStyles.error.text + ' mt-1 whitespace-pre-line'}>
                    {modal.error}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className={modalStyles.footer.container}>
            <button
              type="button"
              onClick={modal.currentStep === 1 ? modal.handleClose : modal.handleBack}
              className={modalStyles.button.secondary}
            >
              {modal.currentStep === 1 ? (
                <>
                  <X className="h-5 w-5" />
                  Cancelar
                </>
              ) : (
                <>
                  <ArrowLeft className="h-5 w-5" />
                  Anterior
                </>
              )}
            </button>

            {modal.currentStep < 3 ? (
              <button
                type="button"
                onClick={modal.handleNext}
                disabled={modal.currentStep === 1 ? !modal.paso1Valido : !modal.paso2Valido}
                className={modalStyles.button.primary}
              >
                <span>Siguiente</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={modal.handleSubmit}
                disabled={modal.creando}
                className={modalStyles.button.success}
              >
                {modal.creando ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Crear Negociación</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

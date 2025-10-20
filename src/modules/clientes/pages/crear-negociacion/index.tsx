/**
 * Página: Crear Negociación con Cierre Financiero
 *
 * Vista completa para crear negociación con 3 pasos:
 * 1. Información Básica (Cliente, Vivienda, Valores)
 * 2. Fuentes de Pago (Configuración completa del financiamiento)
 * 3. Revisión y Confirmación
 *
 * ⚠️ ARQUITECTURA LIMPIA:
 * - Lógica: hooks/useCrearNegociacionPage.ts
 * - UI Componentes: components/
 * - Estilos: styles.ts
 * - Reutiliza: Hooks y componentes del modal refactorizado
 */

'use client'

import { StepperNegociacion } from '@/modules/clientes/components'
import {
    Paso1InfoBasica,
    Paso2FuentesPago,
    Paso3Revision,
} from '@/modules/clientes/components/modals/modal-crear-negociacion/components'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import {
    BreadcrumbsNegociacion,
    FooterNegociacion,
    HeaderNegociacion,
} from './components'
import { useCrearNegociacionPage } from './hooks'
import { animations, pageStyles } from './styles'

interface CrearNegociacionPageProps {
  clienteId: string
  clienteNombre?: string
  viviendaId?: string
  valorVivienda?: number
}

export function CrearNegociacionPage({
  clienteId,
  clienteNombre,
  viviendaId,
  valorVivienda,
}: CrearNegociacionPageProps) {
  const page = useCrearNegociacionPage({
    clienteId,
    viviendaId,
    valorVivienda,
  })

  return (
    <motion.div {...animations.page} className={pageStyles.container}>
      <div className={pageStyles.inner}>
        {/* Breadcrumbs */}
        <BreadcrumbsNegociacion
          clienteId={clienteId}
          clienteNombre={clienteNombre}
        />

        {/* Header */}
        <HeaderNegociacion
          clienteId={clienteId}
          clienteNombre={clienteNombre}
        />

        {/* Card Principal */}
        <div className={pageStyles.card.wrapper}>
          {/* Stepper */}
          <div className={pageStyles.card.stepper}>
            <StepperNegociacion
              currentStep={page.currentStep}
              completedSteps={page.completedSteps}
            />
          </div>

          {/* Contenido por Paso */}
          <div className={pageStyles.card.content}>
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {page.currentStep === 1 && (
                  <Paso1InfoBasica
                    key="paso1"
                  clienteNombre={clienteNombre}
                  proyectos={page.proyectos}
                  viviendas={page.viviendas}
                  cargandoProyectos={page.cargandoProyectos}
                  cargandoViviendas={page.cargandoViviendas}
                  proyectoSeleccionado={page.proyectoSeleccionado}
                  viviendaId={page.viviendaId}
                  valorNegociado={page.valorNegociado}
                  descuentoAplicado={page.descuentoAplicado}
                  valorTotal={page.valorTotal}
                  notas={page.notas}
                    viviendaIdProp={viviendaId}
                    onProyectoChange={page.setProyectoSeleccionado}
                    onViviendaChange={page.setViviendaId}
                    onValorNegociadoChange={page.setValorNegociado}
                    onDescuentoChange={page.setDescuentoAplicado}
                    onNotasChange={page.setNotas}
                  />
                )}

                {page.currentStep === 2 && (
                  <Paso2FuentesPago
                    key="paso2"
                    fuentes={page.fuentes}
                    valorTotal={page.valorTotal}
                    totalFuentes={page.totalFuentes}
                    diferencia={page.diferencia}
                    sumaCierra={page.sumaCierra}
                    onFuenteEnabledChange={page.handleFuenteEnabledChange}
                    onFuenteConfigChange={page.handleFuenteConfigChange}
                  />
                )}

                {page.currentStep === 3 && (
                  <Paso3Revision
                    key="paso3"
                    clienteNombre={clienteNombre}
                    proyectoNombre={
                      page.proyectos.find((p) => p.id === page.proyectoSeleccionado)?.nombre || ''
                    }
                    vivienda={page.viviendas.find((v) => v.id === page.viviendaId)}
                    valorNegociado={page.valorNegociado}
                    descuentoAplicado={page.descuentoAplicado}
                    valorTotal={page.valorTotal}
                    notas={page.notas}
                    fuentes={page.fuentesActivas
                      .filter((f) => f.config !== null)
                      .map((f) => ({ tipo: f.tipo, config: f.config! }))}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Error */}
          {page.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={pageStyles.error.container}
            >
              <AlertCircle className={pageStyles.error.icon} />
              <p className={pageStyles.error.text}>
                {page.error}
              </p>
            </motion.div>
          )}

          {/* Footer con Botones */}
          <FooterNegociacion
            currentStep={page.currentStep}
            paso1Valido={page.paso1Valido}
            paso2Valido={page.paso2Valido}
            creando={page.creando}
            onBack={page.handleBack}
            onNext={page.handleNext}
            onCancel={page.handleCancel}
            onSubmit={page.handleSubmit}
          />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Página: Crear Negociación - REDISEÑADA ✨
 *
 * Vista completa para crear negociación con 3 pasos:
 * 1. Información Básica (Cliente, Vivienda, Valores)
 * 2. Fuentes de Pago (Configuración completa del financiamiento)
 * 3. Revisión y Confirmación
 *
 * ✨ MEJORAS IMPLEMENTADAS:
 * - #1: Validación en tiempo real con feedback visual
 * - #2: Sidebar sticky con resumen financiero siempre visible
 * - #3: Progreso visual por paso con barras de completitud
 * - Diseño minimalista y moderno
 * - Grid layout con sidebar
 *
 * ⚠️ ARQUITECTURA LIMPIA:
 * - Lógica: hooks/useCrearNegociacionPage.ts
 * - UI Componentes: components/
 * - Estilos: styles.ts
 * - Reutiliza: Hooks y componentes del modal refactorizado
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import { StepperNegociacion } from '@/modules/clientes/components'
import {
    Paso1InfoBasica,
    Paso2FuentesPago,
    Paso3Revision,
} from '@/modules/clientes/components/asignar-vivienda/components'

import {
    BreadcrumbsNegociacion,
    FooterNegociacion,
    HeaderNegociacion,
    SidebarResumen,
} from './components'
import { useCrearNegociacionPage } from './hooks'
import { pageStyles } from './styles'

interface CrearNegociacionPageProps {
  clienteId: string
  clienteSlug?: string // Slug para breadcrumbs (opcional para backward compatibility)
  clienteNombre?: string
  viviendaId?: string
  valorVivienda?: number
}

export function CrearNegociacionPage({
  clienteId,
  clienteSlug,
  clienteNombre,
  viviendaId,
  valorVivienda,
}: CrearNegociacionPageProps) {
  const page = useCrearNegociacionPage({
    clienteId,
    viviendaId,
    valorVivienda,
  })

  // Calcular vivienda seleccionada para sidebar
  const viviendaSeleccionada = page.viviendas.find((v) => v.id === page.viviendaId)
  const viviendaNumero = viviendaSeleccionada
    ? `${viviendaSeleccionada.manzana_nombre ? `Manzana ${viviendaSeleccionada.manzana_nombre} - ` : ''}Casa ${viviendaSeleccionada.numero}`
    : undefined

  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.inner}>
        {/* Breadcrumbs */}
        <BreadcrumbsNegociacion
          clienteId={clienteSlug || clienteId}
          clienteNombre={clienteNombre}
        />

        {/* Header */}
        <HeaderNegociacion
          clienteId={clienteId}
          clienteNombre={clienteNombre}
        />

        {/* Stepper */}
        <div className={pageStyles.stepper.container}>
          <div className={pageStyles.stepper.wrapper}>
            <StepperNegociacion
              currentStep={page.currentStep}
              completedSteps={page.completedSteps}
            />
          </div>
        </div>

        {/* Layout Principal: Grid con Sidebar */}
        <div className={pageStyles.mainLayout.container}>
          {/* Contenido Principal */}
          <div className={pageStyles.mainLayout.content}>
            {/* Error Global */}
            {page.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={pageStyles.alert.error}
              >
                <AlertCircle className={pageStyles.alert.icon} />
                <div className={pageStyles.alert.content}>
                  <h4 className={`${pageStyles.alert.title} text-red-900 dark:text-red-100`}>
                    Error
                  </h4>
                  <p className={`${pageStyles.alert.message} text-red-700 dark:text-red-300`}>
                    {page.error}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Card de Contenido */}
            <div className={pageStyles.card.base}>
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
                    validacionCampos={page.validacionCampos}
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
                    vivienda={viviendaSeleccionada}
                    valorNegociado={page.valorNegociado}
                    descuentoAplicado={page.descuentoAplicado}
                    valorTotal={page.valorTotal}
                    notas={page.notas}
                    fuentes={page.fuentesActivas
                      .filter((f) => f.config !== null)
                      .map((f) => ({ tipo: f.tipo, config: f.config! }))}
                    goToStep={page.goToStep}
                  />
                )}
              </AnimatePresence>

              {/* Footer de Navegación */}
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

          {/* Sidebar Sticky con Resumen (Mejora #2) */}
          <div className={pageStyles.mainLayout.sidebar}>
            <SidebarResumen
              currentStep={page.currentStep}
              viviendaNumero={viviendaNumero}
              valorVivienda={page.valorNegociado}
              descuentoAplicado={page.descuentoAplicado}
              valorTotal={page.valorTotal}
              fuentesConfiguradas={page.fuentesActivas
                .filter((f) => f.enabled && f.config !== null)
                .map((f) => ({ tipo: f.tipo, config: f.config! }))}
              totalFuentes={page.totalFuentes}
              sumaCierra={page.sumaCierra}
              progressStep1={page.progressStep1}
              progressStep2={page.progressStep2}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

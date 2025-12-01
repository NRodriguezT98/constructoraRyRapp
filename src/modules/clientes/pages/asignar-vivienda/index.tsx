/**
 * Página: Asignar Vivienda - DISEÑO PREMIUM ✨
 *
 * Vista completa con 3 pasos + glassmorphism:
 * 1. Información Básica (Cliente, Vivienda, Valores)
 * 2. Fuentes de Pago (Configuración completa del financiamiento)
 * 3. Revisión y Confirmación
 *
 * ✨ DISEÑO PREMIUM:
 * - Glassmorphism con backdrop-blur-xl
 * - Gradientes Cyan→Blue→Indigo (módulo Clientes)
 * - Animaciones Framer Motion fluidas
 * - Sidebar sticky con resumen financiero
 * - Progreso visual por paso
 *
 * ⚠️ ARQUITECTURA LIMPIA:
 * - Lógica: hooks/useAsignarViviendaPage.ts
 * - UI: components/ (presentacional puro)
 * - Estilos: styles.ts (centralizados)
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import { StepperAsignarVivienda } from '@/modules/clientes/components'
import {
    Paso1InfoBasicaRefactored,
    Paso2FuentesPago,
    Paso3Revision,
} from '@/modules/clientes/components/asignar-vivienda/components'

import {
    FooterAsignarVivienda,
    HeaderAsignarVivienda,
    SidebarResumen,
} from './components'
import { useAsignarViviendaPage } from './hooks'
import { animations, pageStyles as s } from './styles'

interface AsignarViviendaPageProps {
  clienteId: string
  clienteSlug?: string
  clienteNombre?: string
  viviendaId?: string
  valorVivienda?: number
}

export function AsignarViviendaPage({
  clienteId,
  clienteSlug,
  clienteNombre,
  viviendaId,
  valorVivienda,
}: AsignarViviendaPageProps) {
  const page = useAsignarViviendaPage({
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
    <motion.div {...animations.page} className={s.container}>
      <div className={s.inner}>
        {/* Header con Breadcrumbs Integrados */}
        <HeaderAsignarVivienda clienteId={clienteSlug || clienteId} clienteNombre={clienteNombre} />

        {/* Stepper Glassmorphism */}
        <div className={s.stepper.container}>
          <div className={s.stepper.wrapper}>
            <StepperAsignarVivienda
              currentStep={page.currentStep}
              completedSteps={page.completedSteps}
            />
          </div>
        </div>

        {/* Layout Principal: Grid con Sidebar */}
        <div className={s.mainLayout.container}>
          {/* Contenido Principal */}
          <div className={s.mainLayout.content}>
            {/* Error Global */}
            {page.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={s.alert.error}
              >
                <AlertCircle className={s.alert.icon} />
                <div className={s.alert.content}>
                  <h4 className={s.alert.title}>Error</h4>
                  <p className={s.alert.message}>{page.error}</p>
                </div>
              </motion.div>
            )}

            {/* Card de Contenido Glassmorphism */}
            <div className={s.card.base}>
              <AnimatePresence mode="wait">
                {page.currentStep === 1 && (
                  <Paso1InfoBasicaRefactored
                    key="paso1"
                    register={page.register}
                    errors={page.errors}
                    touchedFields={page.touchedFields}
                    setValue={page.setValue}
                    watch={page.watch}
                    clienteNombre={clienteNombre}
                    proyectos={page.proyectos}
                    viviendas={page.viviendas}
                    cargandoProyectos={page.cargandoProyectos}
                    cargandoViviendas={page.cargandoViviendas}
                    viviendaIdProp={viviendaId}
                    onProyectoChange={page.setProyectoSeleccionado}
                    onViviendaChange={page.setViviendaId}
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
                    erroresFuentes={page.erroresFuentes}
                    mostrarErrores={page.mostrarErroresPaso2}
                    clienteId={clienteId}
                    clienteNombre={clienteNombre}
                    manzana={page.manzanaVivienda}
                    numeroVivienda={page.numeroVivienda}
                    tieneCartasAhora={page.tieneCartasAhora}
                    onFuenteEnabledChange={page.handleFuenteEnabledChange}
                    onFuenteConfigChange={page.handleFuenteConfigChange}
                    onTieneCartaAhoraChange={page.handleTieneCartaAhoraChange}
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
              <FooterAsignarVivienda
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

          {/* Sidebar Sticky Premium */}
          <div className={s.mainLayout.sidebar}>
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
    </motion.div>
  )
}

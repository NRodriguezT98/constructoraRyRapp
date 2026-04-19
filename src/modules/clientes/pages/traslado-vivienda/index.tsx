/**
 * TrasladoViviendaPage
 *
 * Formulario acordeón de 3 pasos para trasladar a un cliente
 * de su vivienda actual a una nueva vivienda.
 *
 * Patrón: idéntico a AsignarViviendaV2Page.
 */

'use client'

import { useMemo } from 'react'

import { ArrowRightLeft } from 'lucide-react'

import {
  AccordionWizardHero,
  AccordionWizardLayout,
  AccordionWizardNavigation,
  AccordionWizardSection,
  AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'

import {
  SeccionDestinoFuentes,
  SeccionOrigenTraslado,
  SeccionRevisionTraslado,
} from './components'
import { PASOS_TRASLADO, useTrasladoVivienda } from './hooks'

interface TrasladoViviendaPageProps {
  clienteId: string
  clienteNombre?: string
  clienteSlug?: string
  negociacionId: string
}

export function TrasladoViviendaPage({
  clienteId,
  clienteNombre = 'Cliente',
  clienteSlug,
  negociacionId,
}: TrasladoViviendaPageProps) {
  const {
    // Wizard
    pasos,
    pasoActual,
    getEstadoPaso,
    summaryPaso1,
    summaryPaso2,
    showSuccess,
    isValidating,
    irSiguiente,
    irAtras,
    irAPaso,

    // Paso 1
    cargandoValidacion,
    validacion,
    fuentesObligatorias,
    motivo,
    setMotivo,
    autorizadoPor,
    setAutorizadoPor,
    paso1Valido: _paso1Valido,
    errorMotivo,
    errorAutorizadoPor,

    // Paso 2
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaDestinoId,
    viviendaDestinoSeleccionada,
    cargandoProyectos,
    cargandoViviendas,
    setProyectoSeleccionado,
    setViviendaDestinoId,
    valorBaseDestino,
    gastosNotarialesDestino,
    recargoEsquineraDestino,
    valorTotalDestino,
    diferenciaPrecio,
    valorOrigenTotal,

    // Fuentes
    cargandoTipos,
    tiposConCampos,
    fuentes,
    totalFuentes,
    diferencia,
    sumaCierra,
    erroresFuentes,
    mostrarErroresFuentes,
    handleFuenteEnabledChange,
    handleFuenteConfigChange,

    // Submit
    handleSubmitFinal,
    ejecutando,
    errorApi,
  } = useTrasladoVivienda({
    clienteId,
    clienteSlug,
    clienteNombre,
    negociacionId,
  })

  const proyectoDestinoNombre = useMemo(
    () => proyectos.find(p => p.id === proyectoSeleccionado)?.nombre ?? '',
    [proyectos, proyectoSeleccionado]
  )

  return (
    <AccordionWizardLayout
      moduleName='clientes'
      breadcrumbs={[
        { label: 'Clientes', href: '/clientes' },
        {
          label: clienteNombre,
          href: `/clientes/${clienteSlug ?? clienteId}`,
        },
        { label: 'Traslado de Vivienda' },
      ]}
      isSubmitting={ejecutando}
      submitLoadingLabel='Ejecutando traslado...'
    >
      {/* Hero */}
      <AccordionWizardHero
        icon={ArrowRightLeft}
        title='Traslado de Vivienda'
        subtitle={`Registra el traslado de vivienda para ${clienteNombre}. Completa cada sección en orden.`}
        moduleName='clientes'
        estimatedTime='~5 minutos'
        totalSteps={PASOS_TRASLADO.length}
      />

      {/* ── Paso 1: Negociación Actual ──────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(1)}
        stepNumber={1}
        title={pasos[0].title}
        description={pasos[0].description}
        icon={pasos[0].icon}
        fieldCount={{ required: 2, optional: 0 }}
        currentStep={pasoActual}
        totalSteps={PASOS_TRASLADO.length}
        moduleName='clientes'
        summaryItems={summaryPaso1}
        onEdit={() => irAPaso(1)}
      >
        <SeccionOrigenTraslado
          cargandoValidacion={cargandoValidacion}
          validacion={validacion}
          fuentesObligatorias={fuentesObligatorias}
          motivo={motivo}
          autorizadoPor={autorizadoPor}
          setMotivo={setMotivo}
          setAutorizadoPor={setAutorizadoPor}
          errorMotivo={errorMotivo}
          errorAutorizadoPor={errorAutorizadoPor}
        />
        <AccordionWizardNavigation
          currentStep={1}
          totalSteps={PASOS_TRASLADO.length}
          isFirst
          isLast={false}
          isValidating={pasoActual === 1 && isValidating}
          moduleName='clientes'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 2: Nueva Vivienda y Fuentes ───────── */}
      <AccordionWizardSection
        status={getEstadoPaso(2)}
        stepNumber={2}
        title={pasos[1].title}
        description={pasos[1].description}
        icon={pasos[1].icon}
        fieldCount={{ required: 1, optional: 0 }}
        currentStep={pasoActual}
        totalSteps={PASOS_TRASLADO.length}
        moduleName='clientes'
        summaryItems={summaryPaso2}
        onEdit={() => irAPaso(2)}
      >
        <SeccionDestinoFuentes
          proyectos={proyectos}
          viviendas={viviendas}
          proyectoSeleccionado={proyectoSeleccionado}
          viviendaDestinoId={viviendaDestinoId}
          viviendaDestinoSeleccionada={viviendaDestinoSeleccionada}
          cargandoProyectos={cargandoProyectos}
          cargandoViviendas={cargandoViviendas}
          setProyectoSeleccionado={setProyectoSeleccionado}
          setViviendaDestinoId={setViviendaDestinoId}
          valorBaseDestino={valorBaseDestino}
          gastosNotarialesDestino={gastosNotarialesDestino}
          recargoEsquineraDestino={recargoEsquineraDestino}
          valorTotalDestino={valorTotalDestino}
          diferenciaPrecio={diferenciaPrecio}
          valorOrigenTotal={valorOrigenTotal}
          fuentesObligatorias={fuentesObligatorias}
          cargandoTipos={cargandoTipos}
          tiposConCampos={tiposConCampos}
          fuentes={fuentes}
          totalFuentes={totalFuentes}
          diferencia={diferencia}
          sumaCierra={sumaCierra}
          erroresFuentes={erroresFuentes}
          mostrarErroresFuentes={mostrarErroresFuentes}
          handleFuenteEnabledChange={handleFuenteEnabledChange}
          handleFuenteConfigChange={handleFuenteConfigChange}
        />
        <AccordionWizardNavigation
          currentStep={2}
          totalSteps={PASOS_TRASLADO.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 2 && isValidating}
          moduleName='clientes'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 3: Revisión y Confirmación ────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(3)}
        stepNumber={3}
        title={pasos[2].title}
        description={pasos[2].description}
        icon={pasos[2].icon}
        currentStep={pasoActual}
        totalSteps={PASOS_TRASLADO.length}
        moduleName='clientes'
        onEdit={() => irAPaso(3)}
      >
        <SeccionRevisionTraslado
          negociacionOrigen={validacion.negociacionOrigen}
          fuentesConAbonos={validacion.fuentesConAbonos}
          viviendaDestinoSeleccionada={viviendaDestinoSeleccionada}
          proyectoDestinoNombre={proyectoDestinoNombre}
          valorTotalDestino={valorTotalDestino}
          fuentes={fuentes}
          tiposConCampos={tiposConCampos}
          motivo={motivo}
          autorizadoPor={autorizadoPor}
          errorApi={errorApi}
          onEditarPaso1={() => irAPaso(1)}
          onEditarPaso2={() => irAPaso(2)}
        />
        <AccordionWizardNavigation
          currentStep={3}
          totalSteps={PASOS_TRASLADO.length}
          isFirst={false}
          isLast
          isSubmitting={ejecutando}
          isValidating={isValidating}
          moduleName='clientes'
          submitLabel='Confirmar Traslado'
          onBack={irAtras}
          onNext={irSiguiente}
          onSubmit={handleSubmitFinal}
        />
      </AccordionWizardSection>

      {/* Success */}
      <AccordionWizardSuccess
        isVisible={showSuccess}
        moduleName='clientes'
        title='¡Traslado ejecutado!'
        subtitle='Redirigiendo al perfil del cliente...'
      />
    </AccordionWizardLayout>
  )
}

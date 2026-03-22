/**
 * NuevoClienteAccordionView — Orquestador del wizard accordion de 4 pasos
 * para crear cliente. Componente presentacional puro.
 */

'use client'

import { UserRoundPlus } from 'lucide-react'

import {
    AccordionWizardHero,
    AccordionWizardLayout,
    AccordionWizardNavigation,
    AccordionWizardSection,
    AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'

import { PASOS_CLIENTE, useNuevoClienteAccordion } from '../hooks/useNuevoClienteAccordion'
import { PasoContacto, PasoInteres, PasoNotas, PasoPersonal } from './pasos-accordion'

interface NuevoClienteAccordionViewProps {
  canCreate: boolean
}

export function NuevoClienteAccordionView({ canCreate }: NuevoClienteAccordionViewProps) {
  const {
    pasos,
    pasoActual,
    getEstadoPaso,
    progress,
    irSiguiente,
    irAtras,
    irAPaso,
    summaryPaso1,
    summaryPaso2,
    summaryPaso3,
    summaryPaso4,
    register,
    errors,
    setValue,
    watch,
    handleSubmit,
    isSubmitting,
    isValidating,
    showSuccess,
  } = useNuevoClienteAccordion()

  if (!canCreate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          No tienes permisos para crear clientes.
        </p>
      </div>
    )
  }

  return (
    <AccordionWizardLayout
      moduleName="clientes"
      breadcrumbs={[
        { label: 'Clientes', href: '/clientes' },
        { label: 'Nuevo Cliente' },
      ]}
      isSubmitting={isSubmitting}
      submitLoadingLabel="Creando Cliente..."
    >
      {/* Hero Header */}
      <AccordionWizardHero
        icon={UserRoundPlus}
        title="Nuevo Cliente"
        subtitle="Registra la información del cliente paso a paso. Solo los campos marcados con * son obligatorios."
        moduleName="clientes"
        estimatedTime="~2 minutos"
        totalSteps={PASOS_CLIENTE.length}
      />

      {/* ── Paso 1: Datos Personales ──────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(1)}
        stepNumber={1}
        title={pasos[0].title}
        description={pasos[0].description}
        icon={pasos[0].icon}
        fieldCount={{ required: 3, optional: 2 }}
        currentStep={pasoActual}
        totalSteps={PASOS_CLIENTE.length}
        progress={pasoActual === 1 ? progress : undefined}
        moduleName="clientes"
        summaryItems={summaryPaso1}
        onEdit={() => irAPaso(1)}
      >
        <PasoPersonal register={register} errors={errors} watch={watch} setValue={setValue} />
        <AccordionWizardNavigation
          currentStep={1}
          totalSteps={PASOS_CLIENTE.length}
          isFirst
          isLast={false}
          isValidating={pasoActual === 1 && isValidating}
          moduleName="clientes"
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 2: Contacto y Ubicación ──────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(2)}
        stepNumber={2}
        title={pasos[1].title}
        description={pasos[1].description}
        icon={pasos[1].icon}
        fieldCount={{ required: 2, optional: 4 }}
        currentStep={pasoActual}
        totalSteps={PASOS_CLIENTE.length}
        progress={pasoActual === 2 ? progress : undefined}
        moduleName="clientes"
        summaryItems={summaryPaso2}
        onEdit={() => irAPaso(2)}
      >
        <PasoContacto
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />
        <AccordionWizardNavigation
          currentStep={2}
          totalSteps={PASOS_CLIENTE.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 2 && isValidating}
          moduleName="clientes"
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 3: Interés Inicial ───────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(3)}
        stepNumber={3}
        title={pasos[2].title}
        description={pasos[2].description}
        icon={pasos[2].icon}
        fieldCount={{ required: 0, optional: 3 }}
        currentStep={pasoActual}
        totalSteps={PASOS_CLIENTE.length}
        progress={pasoActual === 3 ? progress : undefined}
        moduleName="clientes"
        summaryItems={summaryPaso3}
        onEdit={() => irAPaso(3)}
      >
        <PasoInteres
          register={register}
          errors={errors}
          watch={watch}
        />
        <AccordionWizardNavigation
          currentStep={3}
          totalSteps={PASOS_CLIENTE.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 3 && isValidating}
          moduleName="clientes"
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 4: Notas ─────────────────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(4)}
        stepNumber={4}
        title={pasos[3].title}
        description={pasos[3].description}
        icon={pasos[3].icon}
        fieldCount={{ required: 0, optional: 1 }}
        currentStep={pasoActual}
        totalSteps={PASOS_CLIENTE.length}
        moduleName="clientes"
        summaryItems={summaryPaso4}
        onEdit={() => irAPaso(4)}
      >
        <PasoNotas register={register} />
        <AccordionWizardNavigation
          currentStep={4}
          totalSteps={PASOS_CLIENTE.length}
          isFirst={false}
          isLast
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          moduleName="clientes"
          submitLabel="Crear Cliente"
          onBack={irAtras}
          onNext={irSiguiente}
          onSubmit={handleSubmit}
        />
      </AccordionWizardSection>

      {/* Success celebration */}
      <AccordionWizardSuccess
        isVisible={showSuccess}
        moduleName="clientes"
        title="¡Cliente creado!"
        subtitle="Redirigiendo al listado de clientes..."
      />
    </AccordionWizardLayout>
  )
}

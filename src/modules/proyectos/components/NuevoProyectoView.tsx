'use client'

import { FolderPlus } from 'lucide-react'

import {
  AccordionWizardHero,
  AccordionWizardLayout,
  AccordionWizardNavigation,
  AccordionWizardSection,
  AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'

import { PASOS_PROYECTO, useNuevoProyecto } from '../hooks/useNuevoProyecto'

import { PasoEstadoFechas, PasoInfoGeneral, PasoManzanas } from './pasos'

interface NuevoProyectoViewProps {
  canCreate: boolean
}

export function NuevoProyectoView({ canCreate }: NuevoProyectoViewProps) {
  const {
    pasos,
    pasoActual,
    getEstadoPaso,
    irSiguiente,
    irAtras,
    irAPaso,
    summaryPaso1,
    summaryPaso2,
    summaryPaso3,
    register,
    errors,
    watch,
    setValue,
    fields,
    handleAgregarManzana,
    handleEliminarManzana,
    manzanasWatch,
    totalManzanas,
    totalViviendas,
    handleSubmit,
    isSubmitting,
    isValidating,
    showSuccess,
    estadoLabels,
    canAgregarManzana,
  } = useNuevoProyecto()

  if (!canCreate) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500 dark:text-gray-400'>
          No tienes permisos para crear proyectos.
        </p>
      </div>
    )
  }

  return (
    <AccordionWizardLayout
      moduleName='proyectos'
      breadcrumbs={[
        { label: 'Proyectos', href: '/proyectos' },
        { label: 'Nuevo Proyecto' },
      ]}
      isSubmitting={isSubmitting}
      submitLoadingLabel='Creando Proyecto...'
    >
      {/* Hero Header */}
      <AccordionWizardHero
        icon={FolderPlus}
        title='Nuevo Proyecto'
        subtitle='Define la información general del proyecto de construcción, su estado y la distribución de manzanas.'
        moduleName='proyectos'
        estimatedTime='~3 minutos'
        totalSteps={PASOS_PROYECTO.length}
      />

      {/* Paso 1: Información General */}
      <AccordionWizardSection
        status={getEstadoPaso(1)}
        stepNumber={1}
        title={pasos[0].title}
        description={pasos[0].description}
        icon={pasos[0].icon}
        fieldCount={{ required: 5, optional: 0 }}
        currentStep={pasoActual}
        totalSteps={PASOS_PROYECTO.length}
        moduleName='proyectos'
        summaryItems={summaryPaso1}
        onEdit={() => irAPaso(1)}
      >
        <PasoInfoGeneral
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />
        <AccordionWizardNavigation
          currentStep={1}
          totalSteps={PASOS_PROYECTO.length}
          isFirst
          isLast={false}
          isValidating={pasoActual === 1 && isValidating}
          moduleName='proyectos'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* Paso 2: Estado y Fechas */}
      <AccordionWizardSection
        status={getEstadoPaso(2)}
        stepNumber={2}
        title={pasos[1].title}
        description={pasos[1].description}
        icon={pasos[1].icon}
        fieldCount={{ required: 1, optional: 2 }}
        currentStep={pasoActual}
        totalSteps={PASOS_PROYECTO.length}
        moduleName='proyectos'
        summaryItems={summaryPaso2}
        onEdit={() => irAPaso(2)}
      >
        <PasoEstadoFechas
          register={register}
          errors={errors}
          estadoLabels={estadoLabels}
        />
        <AccordionWizardNavigation
          currentStep={2}
          totalSteps={PASOS_PROYECTO.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 2 && isValidating}
          moduleName='proyectos'
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* Paso 3: Manzanas */}
      <AccordionWizardSection
        status={getEstadoPaso(3)}
        stepNumber={3}
        title={pasos[2].title}
        description={pasos[2].description}
        icon={pasos[2].icon}
        fieldCount={{ required: 1, optional: 0 }}
        currentStep={pasoActual}
        totalSteps={PASOS_PROYECTO.length}
        moduleName='proyectos'
        summaryItems={summaryPaso3}
        onEdit={() => irAPaso(3)}
      >
        <PasoManzanas
          register={register}
          errors={errors}
          fields={fields}
          manzanasWatch={manzanasWatch}
          totalManzanas={totalManzanas}
          totalViviendas={totalViviendas}
          onAgregar={handleAgregarManzana}
          onEliminar={handleEliminarManzana}
          canAgregar={canAgregarManzana}
        />
        <AccordionWizardNavigation
          currentStep={3}
          totalSteps={PASOS_PROYECTO.length}
          isFirst={false}
          isLast
          isSubmitting={isSubmitting}
          isValidating={pasoActual === 3 && isValidating}
          moduleName='proyectos'
          submitLabel='Crear Proyecto'
          onBack={irAtras}
          onNext={irSiguiente}
          onSubmit={handleSubmit}
        />
      </AccordionWizardSection>

      {/* Success celebration */}
      <AccordionWizardSuccess
        isVisible={showSuccess}
        moduleName='proyectos'
        title='¡Proyecto creado!'
        subtitle='Redirigiendo al listado de proyectos...'
      />
    </AccordionWizardLayout>
  )
}

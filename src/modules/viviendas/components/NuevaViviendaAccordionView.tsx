/**
 * NuevaViviendaAccordionView — Orquestador del wizard accordion de 5 pasos
 * para crear vivienda. Componente presentacional puro.
 *
 * ✅ Usa componentes paso existentes dentro de AccordionWizardSection
 * ✅ Separación de responsabilidades (lógica en useNuevaViviendaAccordion)
 */

'use client'

import { useEffect, useState } from 'react'

import { HousePlus } from 'lucide-react'

import { proyectosService } from '@/modules/proyectos/services/proyectos.service'
import {
    AccordionWizardHero,
    AccordionWizardLayout,
    AccordionWizardNavigation,
    AccordionWizardSection,
    AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'

import { PASOS_VIVIENDA, useNuevaViviendaAccordion } from '../hooks/useNuevaViviendaAccordion'
import { viviendasService } from '../services/viviendas.service'

// Componentes paso existentes (reutilizados)
import { PasoFinancieroNuevo } from './paso-financiero-nuevo'
import { PasoLegalNuevo } from './paso-legal-nuevo'
import { PasoLinderosNuevo } from './paso-linderos-nuevo'
import { PasoResumenNuevo } from './paso-resumen-nuevo'
import { PasoUbicacionNuevo } from './paso-ubicacion-nuevo'

export function NuevaViviendaAccordionView() {
  // Nombres para el resumen (paso 5)
  const [proyectoNombre, setProyectoNombre] = useState<string | null>(null)
  const [manzanaNombre, setManzanaNombre] = useState<string | null>(null)

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
    formData,
    resumenFinanciero,
    gastosNotariales,
    configuracionRecargos,
    handleSubmit,
    isSubmitting,
    isValidating,
    showSuccess,
  } = useNuevaViviendaAccordion()

  // ── Cargar nombres para preview ─────────────────────
  const proyectoId = watch('proyecto_id')
  const manzanaId = watch('manzana_id')

  useEffect(() => {
    if (!proyectoId) { setProyectoNombre(null); return }
    proyectosService.obtenerProyectos().then((proyectos) => {
      const p = proyectos.find((x) => x.id === proyectoId)
      setProyectoNombre(p?.nombre ?? null)
    }).catch(() => setProyectoNombre(null))
  }, [proyectoId])

  useEffect(() => {
    if (!manzanaId || !proyectoId) { setManzanaNombre(null); return }
    viviendasService.obtenerManzanasDisponibles(proyectoId).then((manzanas) => {
      const m = manzanas.find((x) => x.id === manzanaId)
      setManzanaNombre(m ? `Manzana ${m.nombre}` : null)
    }).catch(() => setManzanaNombre(null))
  }, [manzanaId, proyectoId])

  return (
    <AccordionWizardLayout
      moduleName="viviendas"
      breadcrumbs={[
        { label: 'Viviendas', href: '/viviendas' },
        { label: 'Nueva Vivienda' },
      ]}
      isSubmitting={isSubmitting}
      submitLoadingLabel="Creando Vivienda..."
    >
      {/* Hero Header */}
      <AccordionWizardHero
        icon={HousePlus}
        title="Nueva Vivienda"
        subtitle="Registra una vivienda dentro de un proyecto existente. Configura ubicación, linderos, datos legales y financieros."
        moduleName="viviendas"
        estimatedTime="~4 minutos"
        totalSteps={PASOS_VIVIENDA.length}
      />

      {/* ── Paso 1: Ubicación ──────────────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(1)}
        stepNumber={1}
        title={pasos[0].title}
        description={pasos[0].description}
        icon={pasos[0].icon}
        fieldCount={{ required: 3, optional: 0 }}
        currentStep={pasoActual}
        totalSteps={PASOS_VIVIENDA.length}
        progress={pasoActual === 1 ? progress : undefined}
        moduleName="viviendas"
        summaryItems={summaryPaso1}
        onEdit={() => irAPaso(1)}
      >
        <PasoUbicacionNuevo
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
        />
        <AccordionWizardNavigation
          currentStep={1}
          totalSteps={PASOS_VIVIENDA.length}
          isFirst
          isLast={false}
          isValidating={pasoActual === 1 && isValidating}
          moduleName="viviendas"
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 2: Linderos ───────────────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(2)}
        stepNumber={2}
        title={pasos[1].title}
        description={pasos[1].description}
        icon={pasos[1].icon}
        fieldCount={{ required: 0, optional: 4 }}
        currentStep={pasoActual}
        totalSteps={PASOS_VIVIENDA.length}
        progress={pasoActual === 2 ? progress : undefined}
        moduleName="viviendas"
        summaryItems={summaryPaso2}
        onEdit={() => irAPaso(2)}
      >
        <PasoLinderosNuevo
          register={register}
          errors={errors}
        />
        <AccordionWizardNavigation
          currentStep={2}
          totalSteps={PASOS_VIVIENDA.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 2 && isValidating}
          moduleName="viviendas"
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 3: Información Legal ──────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(3)}
        stepNumber={3}
        title={pasos[2].title}
        description={pasos[2].description}
        icon={pasos[2].icon}
        fieldCount={{ required: 0, optional: 4 }}
        currentStep={pasoActual}
        totalSteps={PASOS_VIVIENDA.length}
        progress={pasoActual === 3 ? progress : undefined}
        moduleName="viviendas"
        summaryItems={summaryPaso3}
        onEdit={() => irAPaso(3)}
      >
        <PasoLegalNuevo
          register={register}
          errors={errors}
        />
        <AccordionWizardNavigation
          currentStep={3}
          totalSteps={PASOS_VIVIENDA.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 3 && isValidating}
          moduleName="viviendas"
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 4: Información Financiera ─────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(4)}
        stepNumber={4}
        title={pasos[3].title}
        description={pasos[3].description}
        icon={pasos[3].icon}
        fieldCount={{ required: 1, optional: 1 }}
        currentStep={pasoActual}
        totalSteps={PASOS_VIVIENDA.length}
        progress={pasoActual === 4 ? progress : undefined}
        moduleName="viviendas"
        summaryItems={summaryPaso4}
        onEdit={() => irAPaso(4)}
      >
        <PasoFinancieroNuevo
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          resumenFinanciero={resumenFinanciero}
          configuracionRecargos={configuracionRecargos}
        />
        <AccordionWizardNavigation
          currentStep={4}
          totalSteps={PASOS_VIVIENDA.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 4 && isValidating}
          moduleName="viviendas"
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 5: Resumen ────────────────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(5)}
        stepNumber={5}
        title={pasos[4].title}
        description={pasos[4].description}
        icon={pasos[4].icon}
        currentStep={pasoActual}
        totalSteps={PASOS_VIVIENDA.length}
        moduleName="viviendas"
        summaryItems={[]}
        onEdit={() => irAPaso(5)}
      >
        <PasoResumenNuevo
          formData={formData}
          proyectoNombre={proyectoNombre}
          manzanaNombre={manzanaNombre}
          gastosNotariales={gastosNotariales}
        />
        <AccordionWizardNavigation
          currentStep={5}
          totalSteps={PASOS_VIVIENDA.length}
          isFirst={false}
          isLast
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          moduleName="viviendas"
          submitLabel="Crear Vivienda"
          onBack={irAtras}
          onNext={irSiguiente}
          onSubmit={handleSubmit}
        />
      </AccordionWizardSection>

      {/* Success celebration */}
      <AccordionWizardSuccess
        isVisible={showSuccess}
        moduleName="viviendas"
        title="¡Vivienda creada!"
        subtitle="Redirigiendo al listado de viviendas..."
      />
    </AccordionWizardLayout>
  )
}

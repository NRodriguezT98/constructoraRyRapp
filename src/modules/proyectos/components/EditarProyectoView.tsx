'use client'

import { Edit3, Loader2 } from 'lucide-react'

import {
    AccordionWizardHero,
    AccordionWizardLayout,
    AccordionWizardNavigation,
    AccordionWizardSection,
    AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'
import { ConfirmarCambiosModal } from '@/shared/components/modulos/ConfirmarCambiosModal'
import { PASOS_PROYECTO_EDICION, useEditarProyecto } from '../hooks/useEditarProyecto'
import { PasoEstadoFechas, PasoInfoGeneral, PasoManzanas } from './pasos'

interface EditarProyectoViewProps {
  proyectoId: string
  canEdit: boolean
}

export function EditarProyectoView({ proyectoId, canEdit }: EditarProyectoViewProps) {
  const {
    isLoading,
    isError,
    proyectoNombre,
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
    mostrarConfirmacion,
    cambiosGenericos,
    categoriasConfig,
    confirmarActualizacion,
    cancelarConfirmacion,
    hayCambios,
    cambiosPorPaso,
  } = useEditarProyecto(proyectoId)

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          No tienes permisos para editar proyectos.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando datos del proyecto...
          </p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al cargar el proyecto. Verifica que el proyecto exista.
          </p>
          <a href="/proyectos" className="text-sm text-green-600 hover:underline">
            Volver al listado
          </a>
        </div>
      </div>
    )
  }

  return (
    <AccordionWizardLayout
      moduleName="proyectos"
      breadcrumbs={[
        { label: 'Proyectos', href: '/proyectos' },
        { label: proyectoNombre || 'Proyecto' },
        { label: 'Editar' },
      ]}
      isSubmitting={isSubmitting}
      submitLoadingLabel="Actualizando Proyecto..."
    >
      {/* Hero Header */}
      <AccordionWizardHero
        icon={Edit3}
        title="Editar Proyecto"
        subtitle={`Actualiza la información del proyecto${proyectoNombre ? ` "${proyectoNombre}"` : ''}.`}
        moduleName="proyectos"
        estimatedTime="~3 minutos"
        totalSteps={PASOS_PROYECTO_EDICION.length}
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
        totalSteps={PASOS_PROYECTO_EDICION.length}
        moduleName="proyectos"
        summaryItems={summaryPaso1}
        onEdit={() => irAPaso(1)}
        changeCount={cambiosPorPaso.paso1}
      >
        <PasoInfoGeneral register={register} errors={errors} watch={watch} setValue={setValue} />
        <AccordionWizardNavigation
          currentStep={1}
          totalSteps={PASOS_PROYECTO_EDICION.length}
          isFirst
          isLast={false}
          isValidating={pasoActual === 1 && isValidating}
          moduleName="proyectos"
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
        totalSteps={PASOS_PROYECTO_EDICION.length}
        moduleName="proyectos"
        summaryItems={summaryPaso2}
        onEdit={() => irAPaso(2)}
        changeCount={cambiosPorPaso.paso2}
      >
        <PasoEstadoFechas
          register={register}
          errors={errors}
          estadoLabels={estadoLabels}
        />
        <AccordionWizardNavigation
          currentStep={2}
          totalSteps={PASOS_PROYECTO_EDICION.length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 2 && isValidating}
          moduleName="proyectos"
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
        totalSteps={PASOS_PROYECTO_EDICION.length}
        moduleName="proyectos"
        summaryItems={summaryPaso3}
        onEdit={() => irAPaso(3)}
        changeCount={cambiosPorPaso.paso3}
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
          totalSteps={PASOS_PROYECTO_EDICION.length}
          isFirst={false}
          isLast
          isSubmitting={isSubmitting}
          isValidating={pasoActual === 3 && isValidating}
          moduleName="proyectos"
          submitLabel="Actualizar Proyecto"
          disableSubmit={!hayCambios}
          disableSubmitMessage="Realiza cambios en el proyecto para habilitar la actualización."
          onBack={irAtras}
          onNext={irSiguiente}
          onSubmit={handleSubmit}
        />
      </AccordionWizardSection>

      {/* Modal de confirmación de cambios (sólo confirmar, no loading) */}
      <ConfirmarCambiosModal
        isOpen={mostrarConfirmacion}
        onClose={cancelarConfirmacion}
        onConfirm={confirmarActualizacion}
        cambios={cambiosGenericos}
        categoriasConfig={categoriasConfig}
        moduleName="proyectos"
        tituloEntidad={`Proyecto${proyectoNombre ? ` "${proyectoNombre}"` : ''}`}
      />

      {/* Animación de éxito (cubre el formulario tras guardar) */}
      <AccordionWizardSuccess
        isVisible={showSuccess}
        moduleName="proyectos"
        title="¡Proyecto actualizado!"
        subtitle="Redirigiendo al listado de proyectos..."
      />
    </AccordionWizardLayout>
  )
}

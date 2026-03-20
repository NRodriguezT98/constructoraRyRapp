'use client'

import { useMemo } from 'react'

import {
    AccordionSection,
    AsignarViviendaHeader,
    SeccionFuentesPago,
    SeccionRevision,
    SeccionViviendaValores,
    StatusBar,
} from './components'
import { useAsignarViviendaV2 } from './hooks'
import { styles as s } from './styles'

interface AsignarViviendaV2PageProps {
  clienteId: string
  clienteNombre?: string
  clienteSlug?: string
}

export function AsignarViviendaV2Page({
  clienteId,
  clienteNombre = 'Cliente',
  clienteSlug,
}: AsignarViviendaV2PageProps) {
  const {
    // Navegación
    pasoActivo,
    pasosCompletados,
    irAPaso,
    // RHF
    register,
    errors,
    setValue,
    watch,
    // Proyecto/Vivienda
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaId,
    viviendaSeleccionada,
    cargandoProyectos,
    cargandoViviendas,
    setProyectoSeleccionado,
    setViviendaId,
    // Valores
    valorBase,
    gastosNotariales,
    recargoEsquinera,
    descuentoAplicado,
    valorTotal,
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
    // Guardado
    handleContinuar,
    handleCancelar,
    creando,
    errorApi,
    clearErrorApi,
  } = useAsignarViviendaV2({ clienteId, clienteSlug })

  // Nombre del proyecto seleccionado (para revisión)
  const proyectoNombre = useMemo(
    () => proyectos.find(p => p.id === proyectoSeleccionado)?.nombre ?? '',
    [proyectos, proyectoSeleccionado]
  )

  // Estado de cada acordeón
  const estado1 =
    pasoActivo === 1
      ? 'active'
      : pasosCompletados.includes(1)
        ? 'completed'
        : 'locked'
  const estado2 =
    pasoActivo === 2
      ? 'active'
      : pasosCompletados.includes(2)
        ? 'completed'
        : 'locked'
  const estado3 = pasoActivo === 3 ? 'active' : 'locked'

  // Resumen sección 1 (para estado "completado")
  const resumen1 = useMemo(() => {
    if (!viviendaSeleccionada) return ''
    const base = [
      viviendaSeleccionada.manzana_nombre,
      `Casa ${viviendaSeleccionada.numero}`,
      proyectoNombre,
      `$${(valorTotal / 1_000_000).toFixed(1)}M`,
    ]
      .filter(Boolean)
      .join(' · ')
    return descuentoAplicado > 0
      ? `${base} · -$${(descuentoAplicado / 1_000_000).toFixed(1)}M desc.`
      : base
  }, [viviendaSeleccionada, proyectoNombre, valorTotal, descuentoAplicado])

  // Resumen sección 2 (para estado "completado")
  const resumen2 = useMemo(() => {
    const fuentesOn = fuentes.filter(f => f.enabled).map(f => f.tipo)
    if (fuentesOn.length === 0) return ''
    return `${fuentesOn.join(' · ')} — $${(totalFuentes / 1_000_000).toFixed(1)}M cubierto`
  }, [fuentes, totalFuentes])

  const aplicarDescuento = watch('aplicar_descuento') as boolean
  const tipoDescuento = (watch('tipo_descuento') as string) ?? ''
  const notas = (watch('notas') as string) ?? ''
  const valorEscrituraPublica = (watch('valor_escritura_publica') as number) ?? 0

  return (
    <div className={s.page.wrapper}>
      <div className={s.page.inner}>
        {/* Header */}
        <AsignarViviendaHeader
          clienteId={clienteSlug ?? clienteId}
          clienteNombre={clienteNombre}
          pasoActivo={pasoActivo}
        />

        {/* Acordeones */}
        <div className={s.page.accordionStack}>
          {/* ① Vivienda & Valores */}
          <AccordionSection
            number='01'
            title='Vivienda &amp; Valores'
            state={estado1}
            summary={resumen1}
            onHeaderClick={() => irAPaso(1)}
          >
            <SeccionViviendaValores
              clienteNombre={clienteNombre}
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              proyectos={proyectos}
              viviendas={viviendas}
              proyectoSeleccionado={proyectoSeleccionado}
              viviendaId={viviendaId}
              viviendaSeleccionada={viviendaSeleccionada}
              cargandoProyectos={cargandoProyectos}
              cargandoViviendas={cargandoViviendas}
              setProyectoSeleccionado={setProyectoSeleccionado}
              setViviendaId={setViviendaId}
              valorBase={valorBase}
              gastosNotariales={gastosNotariales}
              recargoEsquinera={recargoEsquinera}
              descuentoAplicado={descuentoAplicado}
              valorTotal={valorTotal}
              onClearErrorApi={clearErrorApi}
            />
          </AccordionSection>

          {/* ② Fuentes de Pago */}
          <AccordionSection
            number='02'
            title='Fuentes de Pago'
            state={estado2}
            summary={resumen2}
            onHeaderClick={() => irAPaso(2)}
          >
            <SeccionFuentesPago
              valorTotal={valorTotal}
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
          </AccordionSection>

          {/* ③ Revisión & Confirmación */}
          <AccordionSection
            number='03'
            title='Revisión &amp; Confirmación'
            state={estado3}
            onHeaderClick={() => irAPaso(3)}
          >
            <SeccionRevision
              clienteNombre={clienteNombre}
              proyectoNombre={proyectoNombre}
              viviendaSeleccionada={viviendaSeleccionada}
              valorBase={valorBase}
              gastosNotariales={gastosNotariales}
              recargoEsquinera={recargoEsquinera}
              descuentoAplicado={descuentoAplicado}
              valorTotal={valorTotal}
              valorEscrituraPublica={valorEscrituraPublica}
              aplicarDescuento={aplicarDescuento}
              tipoDescuento={tipoDescuento}
              notas={notas}
              fuentes={fuentes}
              tiposConCampos={tiposConCampos}
              errorApi={errorApi}
              creando={creando}
              onGuardar={handleContinuar}
              onEditarSeccion1={() => irAPaso(1)}
              onEditarSeccion2={() => irAPaso(2)}
            />
          </AccordionSection>
        </div>
      </div>

      {/* Status Bar sticky */}
      <StatusBar
        paso={pasoActivo}
        valorTotal={valorTotal}
        totalCubierto={totalFuentes}
        onContinuar={handleContinuar}
        onCancelar={handleCancelar}
        cargando={creando}
      />
    </div>
  )
}

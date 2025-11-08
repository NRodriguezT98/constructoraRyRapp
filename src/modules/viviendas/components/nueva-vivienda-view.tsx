/**
 * NuevaViviendaView - Vista dedicada para crear vivienda
 * ✅ Componente presentacional puro
 * ✅ Separación de responsabilidades
 * ✅ Diseño estándar compacto
 * ✅ Paleta Naranja/Ámbar (Viviendas)
 */

'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
    Check,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Compass,
    DollarSign,
    FileText,
    Home,
    MapPin,
    X
} from 'lucide-react'

import Link from 'next/link'

import { cn } from '@/shared/utils/helpers'


import { proyectosService } from '../../proyectos/services/proyectos.service'
import { useNuevaVivienda } from '../hooks/useNuevaVivienda'
import { viviendasService } from '../services/viviendas.service'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'

import { PasoFinancieroNuevo } from './paso-financiero-nuevo'
import { PasoLegalNuevo } from './paso-legal-nuevo'
import { PasoLinderosNuevo } from './paso-linderos-nuevo'
import { PasoResumenNuevo } from './paso-resumen-nuevo'
import { PasoUbicacionNuevo } from './paso-ubicacion-nuevo'
import { PreviewSidebar as PreviewSidebarReal } from './preview-sidebar'

// Mapeo de iconos
const iconMap = {
  MapPin,
  Compass,
  FileText,
  DollarSign,
  CheckCircle,
}

export function NuevaViviendaView() {
  // Estados para nombres (para el preview)
  const [proyectoNombre, setProyectoNombre] = useState<string | null>(null)
  const [manzanaNombre, setManzanaNombre] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    pasoActual,
    pasoActualConfig,
    totalPasos,
    progreso,
    esPrimerPaso,
    esUltimoPaso,
    irSiguiente,
    irAtras,
    irAPaso,
    cancelar,
    submitting,
    autorizarSubmit, // ← NUEVA función para autorizar submit
    previewData,
    formData,
    pasos,
    gastosNotariales,
    resumenFinanciero,
    configuracionRecargos,
  } = useNuevaVivienda({
    onSubmit: async (data) => {
      await viviendasService.crear(data)
    },
  })

  // 🔍 LOGGER: Monitorear renderizados del componente
  useEffect(() => {
    console.log('\n🎨 [NUEVA VIVIENDA VIEW] ████████████ RENDERIZADO ████████████')
    console.log('📍 [COMPONENT] Paso actual:', pasoActual)
    console.log('📍 [COMPONENT] Paso config:', pasoActualConfig?.titulo)
    console.log('📍 [COMPONENT] Total pasos:', totalPasos)
    console.log('📍 [COMPONENT] ¿Es primer paso?:', esPrimerPaso)
    console.log('📍 [COMPONENT] ¿Es último paso?:', esUltimoPaso)
    console.log('📍 [COMPONENT] ¿Submitting?:', submitting)
    console.log('📍 [COMPONENT] Timestamp:', new Date().toISOString())
    console.log('🎨 [NUEVA VIVIENDA VIEW] ████████████████████████████████████\n')
  }, [pasoActual, pasoActualConfig, totalPasos, esPrimerPaso, esUltimoPaso, submitting])

  // Cargar nombres de proyecto y manzana cuando cambian los IDs
  const proyectoId = watch('proyecto_id')
  const manzanaId = watch('manzana_id')

  useEffect(() => {
    async function cargarNombreProyecto() {
      if (!proyectoId) {
        setProyectoNombre(null)
        return
      }
      try {
        const proyectos = await proyectosService.obtenerProyectos()
        const proyecto = proyectos.find(p => p.id === proyectoId)
        setProyectoNombre(proyecto?.nombre || null)
      } catch (error) {
        console.error('Error cargando nombre de proyecto:', error)
      }
    }
    cargarNombreProyecto()
  }, [proyectoId])

  useEffect(() => {
    async function cargarNombreManzana() {
      if (!manzanaId || !proyectoId) {
        setManzanaNombre(null)
        return
      }
      try {
        const manzanas = await viviendasService.obtenerManzanasDisponibles(proyectoId)
        const manzana = manzanas.find(m => m.id === manzanaId)
        setManzanaNombre(manzana ? `Manzana ${manzana.nombre}` : null)
      } catch (error) {
        console.error('Error cargando nombre de manzana:', error)
      }
    }
    cargarNombreManzana()
  }, [manzanaId, proyectoId])

  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        {/* HEADER CON BREADCRUMBS */}
        <motion.div {...styles.animations.container} className={styles.header.container}>
          <div className={styles.header.pattern} />
          <div className={styles.header.content}>
            {/* Breadcrumbs */}
            <nav className={styles.header.breadcrumbs}>
              <Link href="/viviendas" className={styles.header.breadcrumbItem}>
                Viviendas
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className={styles.header.breadcrumbCurrent}>Nueva Vivienda</span>
            </nav>

            {/* Título */}
            <div className={styles.header.titleRow}>
              <div className={styles.header.titleLeft}>
                <div className={styles.header.icon}>
                  <Home className={styles.header.iconSvg} />
                </div>
                <div className={styles.header.titleContent}>
                  <h1 className={styles.header.title}>Nueva Vivienda</h1>
                  <p className={styles.header.subtitle}>
                    Completa la información en 5 pasos • Progreso: {progreso}%
                  </p>
                </div>
              </div>

              {/* Botón cancelar */}
              <div className={styles.header.actions}>
                <button onClick={cancelar} className={styles.header.cancelButton} type="button">
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* STEPPER HORIZONTAL (STICKY) */}
        <motion.div {...styles.animations.container} className={styles.stepper.container}>
          <div className={styles.stepper.list}>
            {pasos.map((paso, index) => {
              const Icon = iconMap[paso.icon as keyof typeof iconMap]
              const completado = paso.id < pasoActual
              const activo = paso.id === pasoActual
              const inactivo = paso.id > pasoActual

              return (
                <div key={paso.id} className={styles.stepper.step.container}>
                  {/* Conector (línea entre pasos) - ANTES del iconWrapper */}
                  {index < pasos.length - 1 && (
                    <div
                      className={cn(
                        styles.stepper.step.connector,
                        completado
                          ? styles.stepper.step.connectorCompleted
                          : styles.stepper.step.connectorInactive
                      )}
                    />
                  )}

                  {/* Icono */}
                  <div className={styles.stepper.step.iconWrapper}>
                    <button
                      onClick={() => irAPaso(paso.id)}
                      className={cn(
                        styles.stepper.step.iconCircle,
                        completado && styles.stepper.step.iconCircleCompleted,
                        activo && styles.stepper.step.iconCircleActive,
                        inactivo && styles.stepper.step.iconCircleInactive
                      )}
                      type="button"
                    >
                      {completado ? (
                        <Check className={styles.stepper.step.checkIcon} />
                      ) : (
                        <Icon className={styles.stepper.step.icon} />
                      )}
                    </button>
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      styles.stepper.step.label,
                      completado && styles.stepper.step.labelCompleted,
                      activo && styles.stepper.step.labelActive,
                      inactivo && styles.stepper.step.labelInactive
                    )}
                  >
                    {paso.titulo}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* FORMULARIO */}
        {/* ⚠️ IMPORTANTE: El submit está protegido en useNuevaVivienda.onSubmitForm */}
        {/* Solo se procesa cuando pasoActual === 5 (Resumen) */}
        {/* Si se presiona Enter en pasos 1-4, avanza al siguiente paso en lugar de crear */}
        {/* 🔒 CRÍTICO: onSubmit con preventDefault para evitar auto-submit de React Hook Form */}
        <form onSubmit={(e) => {
          console.log('\n\n')
          console.log('╔═══════════════════════════════════════════════════════════════╗')
          console.log('║  ⚠️⚠️⚠️ FORM ONSUBMIT DISPARADO ⚠️⚠️⚠️                      ║')
          console.log('╚═══════════════════════════════════════════════════════════════╝')
          console.log('📍 [FORM SUBMIT] Paso actual:', pasoActual)
          console.log('📍 [FORM SUBMIT] Timestamp:', new Date().toISOString())
          console.log('📍 [FORM SUBMIT] Event:', e)
          console.log('📍 [FORM SUBMIT] Event type:', e.type)
          console.log('📍 [FORM SUBMIT] Event submitter:', (e.nativeEvent as SubmitEvent).submitter)
          console.log('📍 [FORM SUBMIT] ¿Es último paso?:', pasoActual === 5)

          // 🚨 PREVENIR AUTO-SUBMIT: Si no estamos en paso 5, bloquear submit
          if (pasoActual < 5) {
            console.log('⚠️⚠️⚠️ [FORM SUBMIT] 🚫 SUBMIT BLOQUEADO - No estás en paso 5')
            console.log('📍 [FORM SUBMIT] Llamando preventDefault() y stopPropagation()')
            e.preventDefault()
            e.stopPropagation()
            console.log('╔═══════════════════════════════════════════════════════════════╗\n\n')
            return false
          }

          console.log('📍 [FORM SUBMIT] Delegando a handleSubmit()...')
          console.log('╔═══════════════════════════════════════════════════════════════╗\n\n')

          handleSubmit(e)
        }}>
          {/* CONTENIDO DEL PASO ACTUAL */}
          <motion.div {...styles.animations.step} key={pasoActual} className={styles.content.container}>
            {/* Grid condicional: 1 columna en paso 5 (sin sidebar), 2 columnas en pasos 1-4 */}
            <div className={cn(
              pasoActual === 5 ? 'grid grid-cols-1' : styles.content.grid
            )}>
              {/* COLUMNA IZQUIERDA: Formulario */}
              <div className={cn(
                pasoActual === 5 ? 'space-y-6' : styles.content.formColumn
              )}>
                <AnimatePresence mode="wait">
                  {(() => {
                    console.log('🎬 [RENDER PASO] ═══════════════════════════════════════')
                    console.log('📍 [RENDER PASO] Renderizando paso:', pasoActual)
                    console.log('📍 [RENDER PASO] Timestamp:', new Date().toISOString())

                    switch (pasoActual) {
                      case 1:
                        console.log('✅ [RENDER PASO] → Renderizando: PasoUbicacionNuevo')
                        console.log('🎬 [RENDER PASO] ═══════════════════════════════════════\n')
                        return (
                          <PasoUbicacionNuevo
                            key="paso-1"
                            register={register}
                            errors={errors}
                            setValue={setValue}
                            watch={watch}
                          />
                        )
                      case 2:
                        console.log('✅ [RENDER PASO] → Renderizando: PasoLinderosNuevo')
                        console.log('🎬 [RENDER PASO] ═══════════════════════════════════════\n')
                        return (
                          <PasoLinderosNuevo
                            key="paso-2"
                            register={register}
                            errors={errors}
                          />
                        )
                      case 3:
                        console.log('✅ [RENDER PASO] → Renderizando: PasoLegalNuevo')
                        console.log('🎬 [RENDER PASO] ═══════════════════════════════════════\n')
                        return (
                          <PasoLegalNuevo
                            key="paso-3"
                            register={register}
                            errors={errors}
                            setValue={setValue}
                          />
                        )
                      case 4:
                        console.log('✅ [RENDER PASO] → Renderizando: PasoFinancieroNuevo')
                        console.log('🎬 [RENDER PASO] ═══════════════════════════════════════\n')
                        return (
                          <PasoFinancieroNuevo
                            key="paso-4"
                            register={register}
                            errors={errors}
                            watch={watch}
                            setValue={setValue}
                            resumenFinanciero={resumenFinanciero}
                            configuracionRecargos={configuracionRecargos}
                          />
                        )
                      case 5:
                        console.log('✅ [RENDER PASO] → Renderizando: PasoResumenNuevo')
                        console.log('⚠️ [RENDER PASO] 🎯 ESTÁS EN EL PASO FINAL (RESUMEN)')
                        console.log('🎬 [RENDER PASO] ═══════════════════════════════════════\n')
                        return (
                          <PasoResumenNuevo
                            key="paso-5"
                            formData={formData}
                            proyectoNombre={proyectoNombre}
                            manzanaNombre={manzanaNombre}
                            gastosNotariales={gastosNotariales}
                          />
                        )
                      default:
                        console.log('❌ [RENDER PASO] → PASO INVÁLIDO:', pasoActual)
                        console.log('🎬 [RENDER PASO] ═══════════════════════════════════════\n')
                        return null
                    }
                  })()}
                </AnimatePresence>
              </div>

              {/* COLUMNA DERECHA: Preview (oculto en paso 5 porque es redundante) */}
              {pasoActual !== 5 && (
                <div className={styles.content.previewColumn}>
                  <PreviewSidebarReal
                    data={{
                      ...previewData,
                      legal: {
                        matricula: previewData.legal.matricula,
                        nomenclatura: previewData.legal.nomenclatura,
                        areaLote: previewData.legal.areaLote,
                        areaConstruida: previewData.legal.areaConstruida,
                        tipo: previewData.legal.tipoVivienda,
                      },
                      financiero: {
                        ...previewData.financiero,
                        valorTotal: resumenFinanciero.valor_total,
                      }
                    }}
                    proyectoNombre={proyectoNombre}
                    manzanaNombre={manzanaNombre}
                    resumenFinanciero={resumenFinanciero}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* BOTONES DE NAVEGACIÓN (STICKY BOTTOM) */}
          <motion.div {...styles.animations.container} className={styles.navigation.container}>
            <div className={styles.navigation.content}>
              {/* Botón Atrás */}
              <button
                onClick={irAtras}
                disabled={esPrimerPaso}
                className={styles.navigation.backButton}
                type="button"
              >
                <ChevronLeft className={styles.navigation.backIcon} />
                Atrás
              </button>

              {/* Indicador de paso */}
              <span className={styles.navigation.stepIndicator}>
                Paso {pasoActual} de {totalPasos}
              </span>

              {/* Botón Siguiente/Guardar */}
              {(() => {
                console.log('🔘 [BOTÓN] ═══════════════════════════════════════')
                console.log('📍 [BOTÓN] esUltimoPaso:', esUltimoPaso)
                console.log('📍 [BOTÓN] pasoActual:', pasoActual)
                console.log('📍 [BOTÓN] totalPasos:', totalPasos)
                console.log('📍 [BOTÓN] submitting:', submitting)

                if (esUltimoPaso) {
                  console.log('✅ [BOTÓN] → Renderizando: BOTÓN GUARDAR (type="submit")')
                  console.log('⚠️ [BOTÓN] 🎯 AL PRESIONAR ESTE BOTÓN SE CREARÁ LA VIVIENDA')
                  console.log('🔘 [BOTÓN] ═══════════════════════════════════════\n')

                  return (
                    <button
                      type="submit"
                      disabled={submitting}
                      className={styles.navigation.submitButton}
                      onClick={(e) => {
                        console.log('\n🖱️ [BOTÓN GUARDAR] ══════════════════════════════════')
                        console.log('📍 [BOTÓN GUARDAR] CLICK EN BOTÓN "Guardar Vivienda"')
                        console.log('📍 [BOTÓN GUARDAR] Paso actual:', pasoActual)
                        console.log('📍 [BOTÓN GUARDAR] Timestamp:', new Date().toISOString())
                        console.log('� [BOTÓN GUARDAR] Autorizando submit...')

                        // 🔒 AUTORIZAR SUBMIT: Marcar que el usuario hizo click explícitamente
                        autorizarSubmit()

                        console.log('✅ [BOTÓN GUARDAR] Submit autorizado exitosamente')
                        console.log('📍 [BOTÓN GUARDAR] El formulario se enviará ahora')
                        console.log('🖱️ [BOTÓN GUARDAR] ══════════════════════════════════\n')

                        // El submit se dispara automáticamente porque type="submit"
                      }}
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Check className={styles.navigation.submitIcon} />
                          Guardar Vivienda
                        </>
                      )}
                    </button>
                  )
                } else {
                  console.log('✅ [BOTÓN] → Renderizando: BOTÓN SIGUIENTE (type="button")')
                  console.log('📍 [BOTÓN] Al presionar este botón se llamará irSiguiente()')
                  console.log('🔘 [BOTÓN] ═══════════════════════════════════════\n')

                  return (
                    <button
                      onClick={() => {
                        console.log('\n🖱️ [BOTÓN SIGUIENTE] ════════════════════════════════')
                        console.log('📍 [BOTÓN SIGUIENTE] CLICK EN BOTÓN "Siguiente"')
                        console.log('📍 [BOTÓN SIGUIENTE] Paso actual:', pasoActual)
                        console.log('📍 [BOTÓN SIGUIENTE] Timestamp:', new Date().toISOString())
                        console.log('📍 [BOTÓN SIGUIENTE] Llamando a irSiguiente()...')
                        console.log('🖱️ [BOTÓN SIGUIENTE] ════════════════════════════════\n')
                        irSiguiente()
                      }}
                      className={styles.navigation.nextButton}
                      type="button"
                    >
                      Siguiente
                      <ChevronRight className={styles.navigation.nextIcon} />
                    </button>
                  )
                }
              })()}
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  )
}

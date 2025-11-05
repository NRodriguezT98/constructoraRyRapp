/**
 * NuevaViviendaView - Vista dedicada para crear vivienda
 * ✅ Componente presentacional puro
 * ✅ Separación de responsabilidades
 * ✅ Diseño estándar compacto
 * ✅ Paleta Naranja/Ámbar (Viviendas)
 */

'use client'

import { cn } from '@/shared/utils/helpers'
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
import { useEffect, useState } from 'react'
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
    previewData,
    formData,
    pasos,
    resumenFinanciero,
    configuracionRecargos,
  } = useNuevaVivienda({
    onSubmit: async (data) => {
      await viviendasService.crear(data)
    },
  })

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
        <form onSubmit={handleSubmit}>
          {/* CONTENIDO DEL PASO ACTUAL */}
          <motion.div {...styles.animations.step} key={pasoActual} className={styles.content.container}>
            <div className={styles.content.grid}>
              {/* COLUMNA IZQUIERDA: Formulario */}
              <div className={styles.content.formColumn}>
                <AnimatePresence mode="wait">
                  {pasoActual === 1 && (
                    <PasoUbicacionNuevo
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      watch={watch}
                    />
                  )}
                  {pasoActual === 2 && (
                    <PasoLinderosNuevo
                      register={register}
                      errors={errors}
                    />
                  )}
                  {pasoActual === 3 && (
                    <PasoLegalNuevo
                      register={register}
                      errors={errors}
                      setValue={setValue}
                    />
                  )}
                  {pasoActual === 4 && (
                    <PasoFinancieroNuevo
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                      resumenFinanciero={resumenFinanciero}
                      configuracionRecargos={configuracionRecargos}
                    />
                  )}
                  {pasoActual === 5 && (
                    <PasoResumenNuevo
                      formData={formData}
                      proyectoNombre={proyectoNombre}
                      manzanaNombre={manzanaNombre}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* COLUMNA DERECHA: Preview */}
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
              {esUltimoPaso ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.navigation.submitButton}
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
              ) : (
                <button onClick={irSiguiente} className={styles.navigation.nextButton} type="button">
                  Siguiente
                  <ChevronRight className={styles.navigation.nextIcon} />
                </button>
              )}
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  )
}

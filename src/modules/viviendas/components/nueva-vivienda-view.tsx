/**
 * NuevaViviendaView - Vista dedicada para crear vivienda
 * ✅ Componente presentacional puro
 * ✅ Separación de responsabilidades
 * ✅ Diseño estándar compacto
 * ✅ Paleta Naranja/Ámbar (Viviendas)
 */

'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
import { useCrearViviendaMutation } from '../hooks/useViviendasQuery'
import { viviendasService } from '../services/viviendas.service'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'

import { PasoFinancieroNuevo } from './paso-financiero-nuevo'
import { PasoLegalNuevo } from './paso-legal-nuevo'
import { PasoLinderosNuevo } from './paso-linderos-nuevo'
import { PasoResumenNuevo } from './paso-resumen-nuevo'
import { PasoUbicacionNuevo } from './paso-ubicacion-nuevo'

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

  // ✅ Mutation de React Query para crear vivienda (sin toast automático)
  const crearViviendaMutation = useCrearViviendaMutation({ showToast: false })

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
      try {
        // ✅ Usar mutation de React Query (invalida caché automáticamente)
        const nuevaVivienda = await crearViviendaMutation.mutateAsync(data)

        // ✅ Toast con nombre de manzana
        toast.success('¡Vivienda creada exitosamente!', {
          description: manzanaNombre
            ? `Se creó con éxito la vivienda ${data.numero} de ${manzanaNombre}`
            : `Se creó con éxito la vivienda ${data.numero}`,
          duration: 4000,
        })

        // ✅ Retornar la vivienda creada para que el hook sepa que todo salió bien
        return nuevaVivienda
      } catch (error) {
        console.error('❌ Error al crear vivienda:', error)
        toast.error('Error al crear vivienda', {
          description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
          duration: 5000,
        })
        throw error // Re-lanzar para que el hook maneje el estado
      }
    },
  })

  // Logs eliminados para mejorar performance

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
                    Completa los 5 pasos • Progreso: {progreso}%
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

          // 🚨 PREVENIR AUTO-SUBMIT: Si no estamos en paso 5, bloquear submit
          if (pasoActual < 5) {
                                    e.preventDefault()
            e.stopPropagation()
                        return false
          }


          handleSubmit(e)
        }}>
          {/* CONTENIDO DEL PASO ACTUAL */}
          <motion.div {...styles.animations.step} key={pasoActual} className={styles.content.container}>
            {/* Layout de 1 columna (sin sidebar) */}
            <div className="w-full max-w-4xl mx-auto">
              {/* CONTENIDO DEL FORMULARIO */}
              <div className={styles.content.formColumn}>
                <AnimatePresence mode="wait">
                  {(() => {
                    switch (pasoActual) {
                      case 1:
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
                        return (
                          <PasoLinderosNuevo
                            key="paso-2"
                            register={register}
                            errors={errors}
                          />
                        )
                      case 3:
                        return (
                          <PasoLegalNuevo
                            key="paso-3"
                            register={register}
                            errors={errors}
                            setValue={setValue}
                          />
                        )
                      case 4:
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
                        return null
                    }
                  })()}
                </AnimatePresence>
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
              {(() => {

                if (esUltimoPaso) {

                  return (
                    <button
                      type="submit"
                      disabled={submitting}
                      className={styles.navigation.submitButton}
                      onClick={(e) => {

                        // 🔒 AUTORIZAR SUBMIT: Marcar que el usuario hizo click explícitamente
                        autorizarSubmit()


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

                  return (
                    <button
                      onClick={() => {
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

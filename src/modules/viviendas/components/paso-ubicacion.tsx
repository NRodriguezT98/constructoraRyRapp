'use client'

import { Building2, Home, MapPin } from 'lucide-react'
import { LABELS, MENSAJES, PLACEHOLDERS } from '../constants'
import { fieldClasses, sectionClasses, seleccionClasses } from '../styles/vivienda-form.styles'
import type { ManzanaConDisponibilidad, Proyecto } from '../types'
import { generarTextoDisponibilidad } from '../utils'

interface PasoUbicacionProps {
  proyectos: Proyecto[]
  manzanas: ManzanaConDisponibilidad[]
  manzanaSeleccionada: ManzanaConDisponibilidad | null
  numerosDisponibles: number[]
  proyectoId?: string
  manzanaId?: string
  numeroVivienda?: string
  errores: Record<string, string>
  loadingProyectos: boolean
  loadingManzanas: boolean
  onProyectoChange: (proyectoId: string) => void
  onManzanaChange: (manzanaId: string) => void
  onNumeroChange: (numero: string) => void
}

/**
 * Paso 1: Selección de Ubicación
 * Proyecto → Manzana → Vivienda Disponible (Manual)
 */
export function PasoUbicacion({
  proyectos,
  manzanas,
  manzanaSeleccionada,
  numerosDisponibles,
  proyectoId,
  manzanaId,
  numeroVivienda,
  errores,
  loadingProyectos,
  loadingManzanas,
  onProyectoChange,
  onManzanaChange,
  onNumeroChange,
}: PasoUbicacionProps) {
  return (
    <div className={sectionClasses.container}>
      <div className={sectionClasses.card}>
        <div className={sectionClasses.header}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className={sectionClasses.title}>Ubicación de la Vivienda</h2>
              <p className={sectionClasses.subtitle}>
                Selecciona el proyecto, manzana y vivienda disponible
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Selección de Proyecto */}
          <div className={fieldClasses.group}>
            <label htmlFor="proyecto" className={fieldClasses.label}>
              <Building2 className="mr-1 inline h-4 w-4" />
              {LABELS.PROYECTO}
              <span className={fieldClasses.required}>*</span>
            </label>
            <select
              id="proyecto"
              value={proyectoId || ''}
              onChange={(e) => onProyectoChange(e.target.value)}
              disabled={loadingProyectos}
              className={`${fieldClasses.select.base} ${errores.proyecto_id ? fieldClasses.select.error : ''}`}
            >
              <option value="">{PLACEHOLDERS.PROYECTO}</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
            {errores.proyecto_id && (
              <p className={fieldClasses.error}>{errores.proyecto_id}</p>
            )}
            {proyectos.length === 0 && !loadingProyectos && (
              <p className={fieldClasses.hint}>{MENSAJES.SIN_PROYECTOS}</p>
            )}
          </div>

          {/* Selección de Manzana */}
          {proyectoId && (
            <div className={fieldClasses.group}>
              <label htmlFor="manzana" className={fieldClasses.label}>
                <Home className="mr-1 inline h-4 w-4" />
                {LABELS.MANZANA}
                <span className={fieldClasses.required}>*</span>
              </label>
              <select
                id="manzana"
                value={manzanaId || ''}
                onChange={(e) => onManzanaChange(e.target.value)}
                disabled={loadingManzanas || manzanas.length === 0}
                className={`${fieldClasses.select.base} ${errores.manzana_id ? fieldClasses.select.error : ''}`}
              >
                <option value="">{PLACEHOLDERS.MANZANA}</option>
                {manzanas.map((manzana) => (
                  <option key={manzana.id} value={manzana.id}>
                    Manzana {manzana.nombre} ({manzana.viviendas_disponibles}{' '}
                    {manzana.viviendas_disponibles === 1 ? 'disponible' : 'disponibles'})
                  </option>
                ))}
              </select>
              {errores.manzana_id && (
                <p className={fieldClasses.error}>{errores.manzana_id}</p>
              )}
              {manzanas.length === 0 && !loadingManzanas && (
                <p className={fieldClasses.hint}>{MENSAJES.SIN_MANZANAS_DISPONIBLES}</p>
              )}
            </div>
          )}

          {/* Selección Manual de Número de Vivienda */}
          {manzanaId && numerosDisponibles.length > 0 && (
            <div className={fieldClasses.group}>
              <label htmlFor="numero_vivienda" className={fieldClasses.label}>
                <Home className="mr-1 inline h-4 w-4" />
                Número de Vivienda
                <span className={fieldClasses.required}>*</span>
              </label>
              <select
                id="numero_vivienda"
                value={numeroVivienda || ''}
                onChange={(e) => onNumeroChange(e.target.value)}
                className={`${fieldClasses.select.base} ${errores.numero ? fieldClasses.select.error : ''}`}
              >
                <option value="">Selecciona el número de vivienda</option>
                {numerosDisponibles.map((num) => (
                  <option key={num} value={num.toString()}>
                    Vivienda #{num}
                  </option>
                ))}
              </select>
              {errores.numero && <p className={fieldClasses.error}>{errores.numero}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Selecciona el número de vivienda que deseas crear de las disponibles
              </p>
            </div>
          )}

          {/* Info de Manzana y Vivienda Seleccionada */}
          {manzanaSeleccionada && numeroVivienda && (
            <div className={seleccionClasses.infoBox.container}>
              <div className="space-y-2">
                {/* Texto de disponibilidad */}
                <p className={seleccionClasses.infoBox.text}>
                  {generarTextoDisponibilidad(
                    manzanaSeleccionada.nombre,
                    manzanaSeleccionada.total_viviendas,
                    manzanaSeleccionada.viviendas_creadas,
                    manzanaSeleccionada.viviendas_disponibles
                  )}
                </p>

                {/* Vivienda a crear */}
                <div className="mt-3 flex items-center gap-2">
                  <span className={seleccionClasses.badge.info}>
                    <Home className="h-3 w-3" />
                    Crearás la Vivienda #{numeroVivienda}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

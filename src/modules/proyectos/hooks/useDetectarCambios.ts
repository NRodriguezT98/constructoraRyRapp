/**
 * useDetectarCambios - Hook para detectar y comparar cambios en proyectos
 *
 * ✅ Hook personalizado (SOLO lógica)
 * ✅ < 200 líneas
 * ✅ Funciones puras de comparación
 */

import { useMemo } from 'react'
import type { Proyecto, ProyectoFormData } from '../types'

export interface CambioDetectado {
  campo: string
  label: string
  valorAnterior: any
  valorNuevo: any
  tipo: 'texto' | 'numero' | 'lista'
}

export interface CambioManzana {
  tipo: 'agregada' | 'eliminada' | 'modificada'
  nombre: string
  cambios?: {
    nombreAnterior?: string
    nombreNuevo?: string
    viviendasAnterior?: number
    viviendasNuevo?: number
  }
}

export interface ResumenCambios {
  proyecto: CambioDetectado[]
  manzanas: CambioManzana[]
  totalCambios: number
  hayCambios: boolean
}

export function useDetectarCambios(
  proyectoOriginal: Proyecto | null,
  nuevosDatos: ProyectoFormData | null
): ResumenCambios {
  const resumen = useMemo(() => {
    if (!proyectoOriginal || !nuevosDatos) {
      return {
        proyecto: [],
        manzanas: [],
        totalCambios: 0,
        hayCambios: false,
      }
    }

    const cambiosProyecto: CambioDetectado[] = []

    // Comparar campos del proyecto
    if (proyectoOriginal.nombre !== nuevosDatos.nombre) {
      cambiosProyecto.push({
        campo: 'nombre',
        label: 'Nombre del Proyecto',
        valorAnterior: proyectoOriginal.nombre,
        valorNuevo: nuevosDatos.nombre,
        tipo: 'texto',
      })
    }

    if (proyectoOriginal.descripcion !== nuevosDatos.descripcion) {
      cambiosProyecto.push({
        campo: 'descripcion',
        label: 'Descripción',
        valorAnterior: proyectoOriginal.descripcion,
        valorNuevo: nuevosDatos.descripcion,
        tipo: 'texto',
      })
    }

    if (proyectoOriginal.ubicacion !== nuevosDatos.ubicacion) {
      cambiosProyecto.push({
        campo: 'ubicacion',
        label: 'Ubicación',
        valorAnterior: proyectoOriginal.ubicacion,
        valorNuevo: nuevosDatos.ubicacion,
        tipo: 'texto',
      })
    }

    // Detectar cambios en manzanas
    const cambiosManzanas: CambioManzana[] = []
    const manzanasOriginales = proyectoOriginal.manzanas || []
    const manzanasNuevas = nuevosDatos.manzanas || []

    // Manzanas eliminadas
    manzanasOriginales.forEach(manzanaOriginal => {
      const existe = manzanasNuevas.some(
        m => m.nombre === manzanaOriginal.nombre
      )
      if (!existe) {
        cambiosManzanas.push({
          tipo: 'eliminada',
          nombre: manzanaOriginal.nombre,
        })
      }
    })

    // Manzanas agregadas o modificadas
    manzanasNuevas.forEach(manzanaNueva => {
      const manzanaOriginal = manzanasOriginales.find(
        m => m.nombre === manzanaNueva.nombre
      )

      if (!manzanaOriginal) {
        // Manzana nueva
        cambiosManzanas.push({
          tipo: 'agregada',
          nombre: manzanaNueva.nombre,
          cambios: {
            viviendasNuevo: manzanaNueva.totalViviendas,
          },
        })
      } else {
        // Verificar si cambió el número de viviendas
        if (manzanaOriginal.totalViviendas !== manzanaNueva.totalViviendas) {
          cambiosManzanas.push({
            tipo: 'modificada',
            nombre: manzanaNueva.nombre,
            cambios: {
              viviendasAnterior: manzanaOriginal.totalViviendas,
              viviendasNuevo: manzanaNueva.totalViviendas,
            },
          })
        }
      }
    })

    // Detectar cambios de nombre en manzanas (cuando índice coincide pero nombre no)
    manzanasNuevas.forEach((manzanaNueva, index) => {
      if (index < manzanasOriginales.length) {
        const manzanaOriginal = manzanasOriginales[index]

        // Si el nombre cambió pero no es una manzana nueva/eliminada
        if (
          manzanaOriginal.nombre !== manzanaNueva.nombre &&
          !cambiosManzanas.some(c => c.nombre === manzanaOriginal.nombre && c.tipo === 'eliminada') &&
          !cambiosManzanas.some(c => c.nombre === manzanaNueva.nombre && c.tipo === 'agregada')
        ) {
          const cambioExistente = cambiosManzanas.find(
            c => c.nombre === manzanaNueva.nombre && c.tipo === 'modificada'
          )

          if (cambioExistente) {
            // Actualizar el cambio existente con el cambio de nombre
            cambioExistente.cambios = {
              ...cambioExistente.cambios,
              nombreAnterior: manzanaOriginal.nombre,
              nombreNuevo: manzanaNueva.nombre,
            }
          } else {
            // Crear nuevo cambio
            cambiosManzanas.push({
              tipo: 'modificada',
              nombre: manzanaNueva.nombre,
              cambios: {
                nombreAnterior: manzanaOriginal.nombre,
                nombreNuevo: manzanaNueva.nombre,
                viviendasAnterior: manzanaOriginal.totalViviendas,
                viviendasNuevo: manzanaNueva.totalViviendas,
              },
            })
          }
        }
      }
    })

    const totalCambios = cambiosProyecto.length + cambiosManzanas.length
    const hayCambios = totalCambios > 0

    return {
      proyecto: cambiosProyecto,
      manzanas: cambiosManzanas,
      totalCambios,
      hayCambios,
    }
  }, [proyectoOriginal, nuevosDatos])

  return resumen
}

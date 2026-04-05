import type { Database } from '@/lib/supabase/database.types'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'

import type { EstadoManzana, EstadoProyecto, Proyecto } from '../types'

/** Tipo para resultado de query con JOIN de manzanas */
export type ProyectoConManzanasDB =
  Database['public']['Tables']['proyectos']['Row'] & {
    manzanas: Array<Database['public']['Tables']['manzanas']['Row']>
  }

export function parsearUbicacion(ubicacion: string): {
  departamento: string
  ciudad: string
  direccion: string
} {
  const partes = ubicacion.split(', ')
  if (partes.length >= 3) {
    return {
      departamento: partes[partes.length - 1],
      ciudad: partes[partes.length - 2],
      direccion: partes.slice(0, -2).join(', '),
    }
  } else if (partes.length === 2) {
    return { departamento: partes[1], ciudad: partes[0], direccion: '' }
  }
  return { departamento: '', ciudad: '', direccion: ubicacion }
}

export function transformarProyectoDeDB(
  data: Database['public']['Tables']['proyectos']['Row'] & {
    manzanas?: Array<Database['public']['Tables']['manzanas']['Row']>
  }
): Proyecto {
  const { departamento, ciudad, direccion } = parsearUbicacion(data.ubicacion)
  return {
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    ubicacion: data.ubicacion,
    departamento,
    ciudad,
    direccion,
    fechaInicio: data.fecha_inicio,
    fechaFinEstimada: data.fecha_fin_estimada,
    presupuesto: data.presupuesto,
    estado: data.estado as EstadoProyecto,
    progreso: data.progreso,
    manzanas: (data.manzanas || []).map(m => ({
      id: m.id,
      nombre: m.nombre,
      totalViviendas: m.numero_viviendas || 0,
      viviendasVendidas: 0,
      precioBase: 0,
      superficieTotal: 0,
      proyectoId: data.id,
      estado: 'planificada' as EstadoManzana,
      fechaCreacion: m.fecha_creacion || formatDateForDB(getTodayDateString()),
    })),
    fechaCreacion: data.fecha_creacion ?? '',
    fechaActualizacion: data.fecha_actualizacion ?? '',
    archivado: data.archivado || false,
    fechaArchivado: data.fecha_archivado || null,
    motivoArchivo: data.motivo_archivo || null,
  }
}

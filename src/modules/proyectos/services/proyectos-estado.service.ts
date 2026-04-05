import { supabase } from '@/lib/supabase/client'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'
import { auditService } from '@/services/audit.service'

import type { Proyecto } from '../types'

import { obtenerProyecto } from './proyectos-consultas.service'

export async function eliminarProyecto(id: string): Promise<void> {
  let proyectoEliminado: Proyecto | null = null
  try {
    proyectoEliminado = await obtenerProyecto(id)
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        '[PROYECTOS] Error al obtener proyecto para auditoría:',
        error.message
      )
    } else {
      logger.error(
        '[PROYECTOS] Error desconocido al obtener proyecto:',
        String(error)
      )
    }
  }

  const { data: manzanas } = await supabase
    .from('manzanas')
    .select('id')
    .eq('proyecto_id', id)

  const manzanasIds = manzanas?.map(m => m.id) || []

  if (manzanasIds.length > 0) {
    const { count: totalViviendas } = await supabase
      .from('viviendas')
      .select('*', { count: 'exact', head: true })
      .in('manzana_id', manzanasIds)

    if (totalViviendas && totalViviendas > 0) {
      throw new Error(
        `No se puede eliminar el proyecto porque tiene ${totalViviendas} vivienda(s) registrada(s). ` +
          `Por seguridad de datos, archive el proyecto en lugar de eliminarlo.`
      )
    }
  }

  const { count: totalDocumentos } = await supabase
    .from('documentos_proyecto')
    .select('*', { count: 'exact', head: true })
    .eq('proyecto_id', id)

  if (totalDocumentos && totalDocumentos > 0) {
    throw new Error(
      `No se puede eliminar el proyecto porque tiene ${totalDocumentos} documento(s) asociado(s). ` +
        `Elimine primero los documentos o archive el proyecto.`
    )
  }

  const { error } = await supabase.from('proyectos').delete().eq('id', id)

  if (error) {
    logger.error('Error al eliminar proyecto:', error)
    throw new Error(`Error al eliminar proyecto: ${error.message}`)
  }

  if (proyectoEliminado) {
    try {
      await auditService.auditarEliminacion(
        'proyectos',
        id,
        proyectoEliminado,
        {
          nombre_proyecto: proyectoEliminado.nombre,
          total_manzanas: proyectoEliminado.manzanas.length,
          estado_al_eliminar: proyectoEliminado.estado,
        },
        'proyectos'
      )
    } catch (auditError) {
      logger.error('Error al auditar eliminación de proyecto:', auditError)
    }
  }
}

export async function archivarProyecto(
  id: string,
  motivo?: string
): Promise<void> {
  let proyectoArchivado: Proyecto | null = null
  try {
    proyectoArchivado = await obtenerProyecto(id)
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        '[PROYECTOS] Error al obtener proyecto para auditoría:',
        error.message
      )
    } else {
      logger.error(
        '[PROYECTOS] Error desconocido al obtener proyecto:',
        String(error)
      )
    }
  }

  const { error } = await supabase
    .from('proyectos')
    .update({
      archivado: true,
      fecha_archivado: formatDateForDB(getTodayDateString()),
      motivo_archivo: motivo || null,
    })
    .eq('id', id)

  if (error) {
    logger.error('Error al archivar proyecto:', error)
    throw new Error(`Error al archivar proyecto: ${error.message}`)
  }

  if (proyectoArchivado) {
    try {
      await auditService.auditarActualizacion(
        'proyectos',
        id,
        proyectoArchivado,
        { ...proyectoArchivado, archivado: true },
        {
          accion: 'archivado',
          motivo_archivo: motivo,
          nombre_proyecto: proyectoArchivado.nombre,
          estado_al_archivar: proyectoArchivado.estado,
        },
        'proyectos'
      )
    } catch (auditError) {
      logger.error('Error al auditar archivado de proyecto:', auditError)
    }
  }
}

export async function restaurarProyecto(id: string): Promise<void> {
  let proyectoRestaurado: Proyecto | null = null
  try {
    proyectoRestaurado = await obtenerProyecto(id)
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        '[PROYECTOS] Error al obtener proyecto para auditoría:',
        error.message
      )
    } else {
      logger.error(
        '[PROYECTOS] Error desconocido al obtener proyecto:',
        String(error)
      )
    }
  }

  const { error } = await supabase
    .from('proyectos')
    .update({ archivado: false, fecha_archivado: null, motivo_archivo: null })
    .eq('id', id)

  if (error) {
    logger.error('Error al restaurar proyecto:', error)
    throw new Error(`Error al restaurar proyecto: ${error.message}`)
  }

  if (proyectoRestaurado) {
    try {
      await auditService.auditarActualizacion(
        'proyectos',
        id,
        proyectoRestaurado,
        { ...proyectoRestaurado, archivado: false },
        { accion: 'restaurado', nombre_proyecto: proyectoRestaurado.nombre },
        'proyectos'
      )
    } catch (auditError) {
      logger.error('Error al auditar restauración de proyecto:', auditError)
    }
  }
}

/** Solo admins — requiere que el proyecto esté archivado primero */
export async function eliminarProyectoDefinitivo(id: string): Promise<void> {
  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('archivado, nombre')
    .eq('id', id)
    .single()

  if (!proyecto?.archivado) {
    throw new Error(
      'El proyecto debe estar archivado antes de eliminarlo definitivamente. ' +
        'Archive primero el proyecto y luego proceda con la eliminación.'
    )
  }

  await eliminarProyecto(id)
}

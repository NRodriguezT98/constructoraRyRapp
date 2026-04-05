import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { logger } from '@/lib/utils/logger'
import { auditService } from '@/services/audit.service'
import {
  getDepartamentos,
  validarCiudadDepartamento,
} from '@/shared/data/colombia-locations'

import type {
  EstadoManzana,
  EstadoProyecto,
  Manzana,
  Proyecto,
  ProyectoFormData,
} from '../types'
import {
  sanitizeProyectoFormData,
  sanitizeProyectoUpdate,
} from '../utils/sanitize-proyecto.utils'

import { obtenerProyecto } from './proyectos-consultas.service'
import {
  parsearUbicacion,
  transformarProyectoDeDB,
  type ProyectoConManzanasDB,
} from './proyectos-helpers.service'

export async function crearProyecto(
  proyectoData: ProyectoFormData
): Promise<Proyecto> {
  const formData = sanitizeProyectoFormData(proyectoData)

  const departamentosValidos = getDepartamentos()
  if (!departamentosValidos.includes(formData.departamento)) {
    throw new Error(
      `Departamento inválido: "${formData.departamento}". Selecciona un departamento de Colombia válido.`
    )
  }
  if (!validarCiudadDepartamento(formData.ciudad, formData.departamento)) {
    throw new Error(
      `La ciudad "${formData.ciudad}" no pertenece al departamento "${formData.departamento}".`
    )
  }

  const ubicacionCombinada = [
    formData.direccion,
    formData.ciudad,
    formData.departamento,
  ]
    .filter(Boolean)
    .join(', ')

  const { data: proyecto, error: errorProyecto } = await supabase
    .from('proyectos')
    .insert({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      ubicacion: ubicacionCombinada,
      fecha_inicio: formData.fechaInicio,
      fecha_fin_estimada: formData.fechaFinEstimada,
      presupuesto: formData.presupuesto,
      estado: formData.estado,
      progreso: 0,
    })
    .select()
    .single()

  if (errorProyecto) {
    logger.error('Error al crear proyecto:', errorProyecto)
    throw new Error(`Error al crear proyecto: ${errorProyecto.message}`)
  }

  let manzanas: Manzana[] = []
  if (formData.manzanas && formData.manzanas.length > 0) {
    const manzanasData = formData.manzanas.map(m => ({
      proyecto_id: proyecto.id,
      nombre: m.nombre,
      numero_viviendas: m.totalViviendas,
    }))

    const { data: manzanasCreadas, error: errorManzanas } = await supabase
      .from('manzanas')
      .insert(manzanasData)
      .select()

    if (errorManzanas) {
      logger.error('Error al crear manzanas:', errorManzanas)
    } else {
      manzanas = (manzanasCreadas || []).map(m => ({
        id: m.id,
        nombre: m.nombre,
        totalViviendas: m.numero_viviendas,
        viviendasVendidas: 0,
        precioBase:
          formData.manzanas.find(fm => fm.nombre === m.nombre)?.precioBase || 0,
        superficieTotal:
          formData.manzanas.find(fm => fm.nombre === m.nombre)
            ?.superficieTotal || 0,
        proyectoId: proyecto.id,
        estado: 'planificada' as EstadoManzana,
        fechaCreacion: m.fecha_creacion ?? '',
      })) as unknown as Manzana[]
    }
  }

  const { departamento, ciudad, direccion } = parsearUbicacion(
    proyecto.ubicacion
  )
  const proyectoCompleto: Proyecto = {
    id: proyecto.id,
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion,
    ubicacion: proyecto.ubicacion,
    departamento,
    ciudad,
    direccion,
    fechaInicio: proyecto.fecha_inicio,
    fechaFinEstimada: proyecto.fecha_fin_estimada,
    presupuesto: proyecto.presupuesto,
    estado: proyecto.estado as EstadoProyecto,
    progreso: proyecto.progreso,
    manzanas,
    fechaCreacion: proyecto.fecha_creacion ?? '',
    fechaActualizacion: proyecto.fecha_actualizacion ?? '',
    archivado: proyecto.archivado || false,
    fechaArchivado: proyecto.fecha_archivado || null,
    motivoArchivo: proyecto.motivo_archivo || null,
  }

  try {
    await auditService.auditarCreacionProyecto(
      proyectoCompleto as unknown as Record<string, unknown>,
      manzanas as unknown as Record<string, unknown>[]
    )
  } catch (auditError) {
    logger.error('Error al auditar creación de proyecto:', auditError)
  }

  return proyectoCompleto
}

export async function actualizarProyecto(
  id: string,
  data: Partial<ProyectoFormData>
): Promise<Proyecto> {
  let proyectoAnterior: Proyecto | null = null
  try {
    proyectoAnterior = await obtenerProyecto(id)
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

  if (
    data.nombre &&
    proyectoAnterior &&
    proyectoAnterior.nombre !== data.nombre
  ) {
    const { data: manzanas } = await supabase
      .from('manzanas')
      .select('id')
      .eq('proyecto_id', id)

    const manzanasIds = manzanas?.map(m => m.id) || []
    if (manzanasIds.length > 0) {
      const { count: viviendasVendidas } = await supabase
        .from('viviendas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'vendida')
        .in('manzana_id', manzanasIds)

      if (viviendasVendidas && viviendasVendidas > 0) {
        logger.warn(
          `⚠️ ADVERTENCIA: Cambiando nombre de proyecto de "${proyectoAnterior.nombre}" a "${data.nombre}". ` +
            `El proyecto tiene ${viviendasVendidas} vivienda(s) vendida(s). ` +
            `Verificar que no afecte documentos legales o contratos.`
        )
      }
    }
  }

  if (
    data.estado &&
    proyectoAnterior &&
    proyectoAnterior.estado !== data.estado
  ) {
    const { data: manzanas } = await supabase
      .from('manzanas')
      .select('id')
      .eq('proyecto_id', id)

    const manzanasIds = manzanas?.map(m => m.id) || []

    if (data.estado === 'completado' && manzanasIds.length > 0) {
      const { count: viviendasDisponibles } = await supabase
        .from('viviendas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'Disponible')
        .in('manzana_id', manzanasIds)

      if (viviendasDisponibles && viviendasDisponibles > 0) {
        throw new Error(
          `No se puede marcar el proyecto como completado porque tiene ` +
            `${viviendasDisponibles} vivienda(s) aún disponibles. ` +
            `Todas las viviendas deben estar vendidas o reservadas.`
        )
      }
    }

    if (data.estado === 'pausado') {
      logger.warn(
        `⚠️ ADVERTENCIA: Pausando proyecto "${proyectoAnterior?.nombre}". ` +
          `Verificar que no haya negociaciones activas o compromisos pendientes.`
      )
    }
  }

  const dataSanitizada = sanitizeProyectoUpdate(data)

  const departamentosValidos = getDepartamentos()
  if (dataSanitizada.departamento !== undefined) {
    if (!departamentosValidos.includes(dataSanitizada.departamento)) {
      throw new Error(
        `Departamento inválido: "${dataSanitizada.departamento}". Selecciona un departamento de Colombia válido.`
      )
    }
  }
  if (dataSanitizada.ciudad !== undefined) {
    const depActual =
      dataSanitizada.departamento ?? proyectoAnterior?.departamento ?? ''
    if (
      depActual &&
      !validarCiudadDepartamento(dataSanitizada.ciudad, depActual)
    ) {
      throw new Error(
        `La ciudad "${dataSanitizada.ciudad}" no pertenece al departamento "${depActual}".`
      )
    }
  }

  const updateData: Partial<
    Database['public']['Tables']['proyectos']['Update']
  > = {}
  if (dataSanitizada.nombre !== undefined)
    updateData.nombre = dataSanitizada.nombre
  if (dataSanitizada.descripcion !== undefined)
    updateData.descripcion = dataSanitizada.descripcion
  if (
    dataSanitizada.departamento !== undefined ||
    dataSanitizada.ciudad !== undefined ||
    dataSanitizada.direccion !== undefined
  ) {
    const dep =
      dataSanitizada.departamento ?? proyectoAnterior?.departamento ?? ''
    const ciu = dataSanitizada.ciudad ?? proyectoAnterior?.ciudad ?? ''
    const dir = dataSanitizada.direccion ?? proyectoAnterior?.direccion ?? ''
    updateData.ubicacion = [dir, ciu, dep].filter(Boolean).join(', ')
  }
  if (dataSanitizada.fechaInicio !== undefined)
    updateData.fecha_inicio = dataSanitizada.fechaInicio
  if (dataSanitizada.fechaFinEstimada !== undefined)
    updateData.fecha_fin_estimada = dataSanitizada.fechaFinEstimada
  if (dataSanitizada.presupuesto !== undefined)
    updateData.presupuesto = dataSanitizada.presupuesto
  if (dataSanitizada.estado !== undefined)
    updateData.estado = dataSanitizada.estado

  const { data: proyecto, error } = await supabase
    .from('proyectos')
    .update(updateData)
    .eq('id', id)
    .select(
      `
        *,
        manzanas (
          id,
          nombre,
          numero_viviendas
        )
      `
    )
    .single()

  if (error) {
    logger.error('Error al actualizar proyecto:', error)
    throw new Error(`Error al actualizar proyecto: ${error.message}`)
  }

  if (data.manzanas && data.manzanas.length > 0) {
    const manzanasExistentesIds = (proyecto.manzanas || []).map(m => m.id)

    for (const manzana of data.manzanas) {
      const manzanaData = {
        proyecto_id: id,
        nombre: manzana.nombre,
        numero_viviendas: manzana.totalViviendas,
      }

      if (
        'id' in manzana &&
        manzana.id &&
        manzanasExistentesIds.includes(manzana.id)
      ) {
        const { error: updateError } = await supabase
          .from('manzanas')
          .update(manzanaData)
          .eq('id', manzana.id)
        if (updateError)
          logger.error('Error al actualizar manzana:', updateError)
      } else {
        const { error: insertError } = await supabase
          .from('manzanas')
          .insert(manzanaData)
        if (insertError) logger.error('Error al crear manzana:', insertError)
      }
    }

    const manzanasFormularioIds = data.manzanas
      .map(m => ('id' in m ? m.id : null))
      .filter(Boolean) as string[]

    const manzanasAEliminar = manzanasExistentesIds.filter(
      mId => !manzanasFormularioIds.includes(mId)
    )

    for (const manzanaId of manzanasAEliminar) {
      const { count } = await supabase
        .from('viviendas')
        .select('*', { count: 'exact', head: true })
        .eq('manzana_id', manzanaId)

      if (count === 0) {
        const { error: deleteError } = await supabase
          .from('manzanas')
          .delete()
          .eq('id', manzanaId)
        if (deleteError) logger.error('Error al eliminar manzana:', deleteError)
      }
    }
  }

  const proyectoActualizado = transformarProyectoDeDB(
    proyecto as unknown as ProyectoConManzanasDB
  )

  if (proyectoAnterior) {
    try {
      await auditService.auditarActualizacion(
        'proyectos',
        id,
        proyectoAnterior,
        proyectoActualizado,
        { campos_modificados: Object.keys(updateData) },
        'proyectos'
      )
    } catch (auditError) {
      logger.error('Error al auditar actualización de proyecto:', auditError)
    }
  }

  return proyectoActualizado
}

import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'
import { auditService } from '@/services/audit.service'

import type {
    EstadoManzana,
    Manzana,
    Proyecto,
    ProyectoFormData,
} from '../types'

/**
 * Servicio para gestionar proyectos usando Supabase
 * Incluye auditoría completa de todas las operaciones CRUD
 */
class ProyectosService {
  // ==================== CRUD OPERATIONS ====================

  /**
   * Obtiene todos los proyectos de la base de datos
   * @param incluirArchivados - Si es true, incluye proyectos archivados. Por defecto false.
   * @returns Array de proyectos con sus manzanas
   * @throws Error si falla la consulta a Supabase
   * @example
   * ```ts
   * const proyectos = await proyectosService.obtenerProyectos()
   * const todosIncluidos = await proyectosService.obtenerProyectos(true)
   * ```
   */
  async obtenerProyectos(incluirArchivados: boolean = false): Promise<Proyecto[]> {
    let query = supabase
      .from('proyectos')
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

    // Por defecto, solo mostrar proyectos activos (NO archivados)
    if (!incluirArchivados) {
      query = query.eq('archivado', false)
    }

    const { data, error } = await query.order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error al obtener proyectos:', error)
      throw new Error(`Error al obtener proyectos: ${error.message}`)
    }

    // Transformar datos de Supabase a formato de la aplicación
    return (data || []).map(this.transformarProyectoDeDB)
  }

  /**
   * Obtiene un proyecto específico por su ID
   * @param id - UUID del proyecto a buscar
   * @returns Proyecto encontrado o null si no existe
   * @throws Error si falla la consulta a Supabase
   * @example
   * ```ts
   * const proyecto = await proyectosService.obtenerProyecto('uuid-123')
   * if (proyecto) console.log(proyecto.nombre)
   * ```
   */
  async obtenerProyecto(id: string): Promise<Proyecto | null> {
    const { data, error } = await supabase
      .from('proyectos')
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
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No encontrado
      }
      console.error('Error al obtener proyecto:', error)
      throw new Error(`Error al obtener proyecto: ${error.message}`)
    }

    return this.transformarProyectoDeDB(data)
  }

  /**
   * Crea un nuevo proyecto en la base de datos
   * @param proyectoData - Datos del formulario de proyecto
   * @returns Proyecto creado con ID asignado
   * @throws Error si falla la creación o auditoría
   * @example
   * ```ts
   * const nuevoProyecto = await proyectosService.crearProyecto({
   *   nombre: 'Proyecto Norte',
   *   ubicacion: 'Calle 123 #45-67',
   *   estado: 'planificacion',
   *   manzanas: [{ nombre: 'A', numero_viviendas: 10 }]
   * })
   * ```
   */
  async crearProyecto(proyectoData: ProyectoFormData): Promise<Proyecto> {
    // 1. Crear el proyecto principal
    const { data: proyecto, error: errorProyecto } = await supabase
      .from('proyectos')
      .insert({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        ubicacion: formData.ubicacion,
        fecha_inicio: formData.fechaInicio,
        fecha_fin_estimada: formData.fechaFinEstimada,
        presupuesto: formData.presupuesto,
        estado: formData.estado,
        progreso: 0,
      })
      .select()
      .single()

    if (errorProyecto) {
      console.error('Error al crear proyecto:', errorProyecto)
      throw new Error(`Error al crear proyecto: ${errorProyecto.message}`)
    }

    // 2. Crear las manzanas si existen
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
        console.error('Error al crear manzanas:', errorManzanas)
        // No lanzamos error aquí, el proyecto ya fue creado
      } else {
        manzanas = (manzanasCreadas || []).map(m => ({
          id: m.id,
          nombre: m.nombre,
          totalViviendas: m.numero_viviendas,
          viviendasVendidas: 0,
          precioBase:
            formData.manzanas.find(fm => fm.nombre === m.nombre)?.precioBase ||
            0,
          superficieTotal:
            formData.manzanas.find(fm => fm.nombre === m.nombre)
              ?.superficieTotal || 0,
          proyectoId: proyecto.id,
          estado: 'planificada' as EstadoManzana,
          fechaCreacion: m.fecha_creacion,
        }))
      }
    }

    // 3. Preparar objeto completo para retornar
    const proyectoCompleto: Proyecto = {
      id: proyecto.id,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      ubicacion: proyecto.ubicacion,
      fechaInicio: proyecto.fecha_inicio,
      fechaFinEstimada: proyecto.fecha_fin_estimada,
      presupuesto: proyecto.presupuesto,
      estado: proyecto.estado as any, // Type assertion para evitar error de tipos con Supabase
      progreso: proyecto.progreso,
      manzanas,
      fechaCreacion: proyecto.fecha_creacion,
      fechaActualizacion: proyecto.fecha_actualizacion,
      // ✅ Campos de archivado
      archivado: proyecto.archivado || false,
      fechaArchivado: proyecto.fecha_archivado || null,
      motivoArchivo: proyecto.motivo_archivo || null,
    }

    // 4. 🔍 AUDITORÍA DETALLADA: Registrar creación del proyecto con todos los detalles
    try {
      await auditService.auditarCreacionProyecto(proyectoCompleto, manzanas)
    } catch (auditError) {
      console.error('Error al auditar creación de proyecto:', auditError)
      // No lanzamos error, la auditoría es secundaria
    }

    return proyectoCompleto
  }

  /**
   * Actualiza un proyecto existente y sus manzanas
   * @param id - UUID del proyecto a actualizar
   * @param data - Datos parciales del proyecto a actualizar
   * @returns Proyecto actualizado con cambios aplicados
   * @throws Error si no existe el proyecto o falla la actualización
   * @remarks
   * - Valida transiciones de estado coherentes
   * - Advierte al cambiar nombre con viviendas vendidas
   * - No permite marcar como completado si hay viviendas disponibles
   * - Actualiza/crea/elimina manzanas según cambios en formulario
   * @example
   * ```ts
   * const actualizado = await proyectosService.actualizarProyecto('uuid-123', {
   *   estado: 'en_construccion',
   *   fecha_inicio: '2025-01-15',
   *   manzanas: [{ nombre: 'A', totalViviendas: 15 }]
   * })
   * ```
   */
  async actualizarProyecto(
    id: string,
    data: Partial<ProyectoFormData>
  ): Promise<Proyecto> {
    // 1. 🔍 AUDITORÍA: Obtener datos ANTES de actualizar
    let proyectoAnterior: Proyecto | null = null
    try {
      proyectoAnterior = await this.obtenerProyecto(id)
    } catch (error) {
      if (error instanceof Error) {
        console.error('[PROYECTOS] Error al obtener proyecto para auditoría:', error.message)
      } else {
        console.error('[PROYECTOS] Error desconocido al obtener proyecto:', String(error))
      }
    }

    // 2. ✅ VALIDACIÓN: Advertencia al cambiar nombre con viviendas vendidas
    if (data.nombre && proyectoAnterior && proyectoAnterior.nombre !== data.nombre) {
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
          console.warn(
            `⚠️ ADVERTENCIA: Cambiando nombre de proyecto de "${proyectoAnterior.nombre}" a "${data.nombre}". ` +
            `El proyecto tiene ${viviendasVendidas} vivienda(s) vendida(s). ` +
            `Verificar que no afecte documentos legales o contratos.`
          )
        }
      }
    }

    // 3. ✅ VALIDACIÓN: Transiciones de estado coherentes
    if (data.estado && proyectoAnterior && proyectoAnterior.estado !== data.estado) {
      const { data: manzanas } = await supabase
        .from('manzanas')
        .select('id')
        .eq('proyecto_id', id)

      const manzanasIds = manzanas?.map(m => m.id) || []

      // No permitir marcar como "completado" si hay viviendas disponibles
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

      // Advertencia al pausar proyecto con negociaciones activas
      if (data.estado === 'pausado') {
        console.warn(
          `⚠️ ADVERTENCIA: Pausando proyecto "${proyectoAnterior.nombre}". ` +
          `Verificar que no haya negociaciones activas o compromisos pendientes.`
        )
      }
    }

    // 4. Preparar datos para actualización
    const updateData: Partial<Database['public']['Tables']['proyectos']['Update']> = {}

    // Mapear campos de la aplicación a campos de DB
    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion
    if (data.fechaInicio !== undefined) updateData.fecha_inicio = data.fechaInicio
    if (data.fechaFinEstimada !== undefined)
      updateData.fecha_fin_estimada = data.fechaFinEstimada
    if (data.presupuesto !== undefined)
      updateData.presupuesto = data.presupuesto
    if (data.estado !== undefined) updateData.estado = data.estado

    // 5. Actualizar proyecto en DB
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
      console.error('Error al actualizar proyecto:', error)
      throw new Error(`Error al actualizar proyecto: ${error.message}`)
    }

    // 6. ✅ Actualizar manzanas si se proporcionaron
    if (data.manzanas && data.manzanas.length > 0) {
      // Obtener IDs de manzanas existentes
      const manzanasExistentesIds = (proyecto.manzanas || []).map((m) => m.id)

      // Procesar cada manzana
      for (const manzana of data.manzanas) {
        const manzanaData = {
          proyecto_id: id,
          nombre: manzana.nombre,
          numero_viviendas: manzana.totalViviendas,
        }

        // Si la manzana tiene ID y existe en DB → Actualizar
        if ('id' in manzana && manzana.id && manzanasExistentesIds.includes(manzana.id)) {
          const { error: updateError } = await supabase
            .from('manzanas')
            .update(manzanaData)
            .eq('id', manzana.id)

          if (updateError) {
            console.error('Error al actualizar manzana:', updateError)
          }
        }
        // Si NO tiene ID o NO existe en DB → Crear nueva
        else {
          const { error: insertError } = await supabase
            .from('manzanas')
            .insert(manzanaData)

          if (insertError) {
            console.error('Error al crear manzana:', insertError)
          }
        }
      }

      // Eliminar manzanas que ya no están en el formulario
      // (Solo las que NO tienen viviendas - validación granular)
      const manzanasFormularioIds = data.manzanas
        .map((m) => 'id' in m ? m.id : null)
        .filter(Boolean) as string[]

      const manzanasAEliminar = manzanasExistentesIds.filter(
        id => !manzanasFormularioIds.includes(id)
      )

      for (const manzanaId of manzanasAEliminar) {
        // Verificar que no tenga viviendas antes de eliminar
        const { count } = await supabase
          .from('viviendas')
          .select('*', { count: 'exact', head: true })
          .eq('manzana_id', manzanaId)

        if (count === 0) {
          const { error: deleteError } = await supabase
            .from('manzanas')
            .delete()
            .eq('id', manzanaId)

          if (deleteError) {
            console.error('Error al eliminar manzana:', deleteError)
          }
        }
      }
    }

    const proyectoActualizado = this.transformarProyectoDeDB(proyecto)

    // 7. 🔍 AUDITORÍA: Registrar actualización
    if (proyectoAnterior) {
      try {
        await auditService.auditarActualizacion(
          'proyectos',
          id,
          proyectoAnterior,
          proyectoActualizado,
          {
            campos_modificados: Object.keys(updateData),
          },
          'proyectos'
        )
      } catch (auditError) {
        console.error('Error al auditar actualización de proyecto:', auditError)
      }
    }

    return proyectoActualizado
  }

  /**
   * Elimina un proyecto (soft delete - marca como archivado)
   * @param id - UUID del proyecto a eliminar
   * @throws Error si no existe el proyecto o falla la eliminación
   * @example
   * ```ts
   * await proyectosService.eliminarProyecto('uuid-123')
   * ```
   */
  async eliminarProyecto(id: string): Promise<void> {
    // 1. 🔍 AUDITORÍA: Obtener datos ANTES de eliminar
    let proyectoEliminado: Proyecto | null = null
    try {
      proyectoEliminado = await this.obtenerProyecto(id)
    } catch (error) {
      if (error instanceof Error) {
        console.error('[PROYECTOS] Error al obtener proyecto para auditoría:', error.message)
      } else {
        console.error('[PROYECTOS] Error desconocido al obtener proyecto:', String(error))
      }
    }

    // 2. ✅ VALIDACIÓN CRÍTICA: Verificar que NO tenga viviendas
    const { data: manzanas } = await supabase
      .from('manzanas')
      .select('id')
      .eq('proyecto_id', id)

    const manzanasIds = manzanas?.map(m => m.id) || []

    if (manzanasIds.length > 0) {
      // Verificar viviendas en las manzanas
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

    // 3. ✅ VALIDACIÓN CRÍTICA: Verificar que NO tenga documentos
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

    // 4. Eliminar de DB (solo si pasó todas las validaciones)
    const { error } = await supabase.from('proyectos').delete().eq('id', id)

    if (error) {
      console.error('Error al eliminar proyecto:', error)
      throw new Error(`Error al eliminar proyecto: ${error.message}`)
    }

    // 5. 🔍 AUDITORÍA: Registrar eliminación
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
        console.error('Error al auditar eliminación de proyecto:', auditError)
      }
    }
  }

  /**
   * Archiva un proyecto (soft delete sin eliminar datos)
   * @param id - UUID del proyecto a archivar
   * @param motivo - Razón del archivado (opcional)
   * @throws Error si no existe el proyecto o falla el archivado
   * @remarks
   * - Permite ocultar proyectos manteniendo historial completo
   * - No afecta viviendas, manzanas ni documentos asociados
   * - Registra fecha y motivo del archivado
   * @example
   * ```ts
   * await proyectosService.archivarProyecto('uuid-123', 'Proyecto cancelado por cliente')
   * ```
   */
  async archivarProyecto(id: string, motivo?: string): Promise<void> {
    // 1. 🔍 AUDITORÍA: Obtener datos ANTES de archivar
    let proyectoArchivado: Proyecto | null = null
    try {
      proyectoArchivado = await this.obtenerProyecto(id)
    } catch (error) {
      if (error instanceof Error) {
        console.error('[PROYECTOS] Error al obtener proyecto para auditoría:', error.message)
      } else {
        console.error('[PROYECTOS] Error desconocido al obtener proyecto:', String(error))
      }
    }

    // 2. Archivar proyecto
    const { error } = await supabase
      .from('proyectos')
      .update({
        archivado: true,
        fecha_archivado: formatDateForDB(getTodayDateString()),
        motivo_archivo: motivo || null,
      })
      .eq('id', id)

    if (error) {
      console.error('Error al archivar proyecto:', error)
      throw new Error(`Error al archivar proyecto: ${error.message}`)
    }

    // 3. 🔍 AUDITORÍA: Registrar archivado
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
        console.error('Error al auditar archivado de proyecto:', auditError)
      }
    }
  }

  /**
   * Restaura un proyecto archivado
   * @param id - UUID del proyecto a restaurar
   * @throws Error si no existe el proyecto o falla la restauración
   * @remarks
   * - Quita marca de archivado y limpia metadatos
   * - Restaura acceso completo al proyecto
   * @example
   * ```ts
   * await proyectosService.restaurarProyecto('uuid-123')
   * ```
   */
  async restaurarProyecto(id: string): Promise<void> {
    // 1. 🔍 AUDITORÍA: Obtener datos ANTES de restaurar
    let proyectoRestaurado: Proyecto | null = null
    try {
      proyectoRestaurado = await this.obtenerProyecto(id)
    } catch (error) {
      if (error instanceof Error) {
        console.error('[PROYECTOS] Error al obtener proyecto para auditoría:', error.message)
      } else {
        console.error('[PROYECTOS] Error desconocido al obtener proyecto:', String(error))
      }
    }

    // 2. Restaurar proyecto
    const { error } = await supabase
      .from('proyectos')
      .update({
        archivado: false,
        fecha_archivado: null,
        motivo_archivo: null,
      })
      .eq('id', id)

    if (error) {
      console.error('Error al restaurar proyecto:', error)
      throw new Error(`Error al restaurar proyecto: ${error.message}`)
    }

    // 3. 🔍 AUDITORÍA: Registrar restauración
    if (proyectoRestaurado) {
      try {
        await auditService.auditarActualizacion(
          'proyectos',
          id,
          proyectoRestaurado,
          { ...proyectoRestaurado, archivado: false },
          {
            accion: 'restaurado',
            nombre_proyecto: proyectoRestaurado.nombre,
          },
          'proyectos'
        )
      } catch (auditError) {
        console.error('Error al auditar restauración de proyecto:', auditError)
      }
    }
  }

  // ==================== ELIMINACIÓN DEFINITIVA (ADMIN ONLY) ====================

  /**
   * Elimina definitivamente un proyecto de la base de datos
   * @param id - UUID del proyecto a eliminar
   * @throws Error si el proyecto no está archivado o falla la eliminación
   * @remarks
   * - ⚠️ SOLO ADMINS - Acción irreversible
   * - Requiere que el proyecto esté archivado primero
   * - Elimina también manzanas sin viviendas asociadas
   * @example
   * ```ts
   * await proyectosService.eliminarProyectoDefinitivo('uuid-123')
   * ```
   */
  async eliminarProyectoDefinitivo(id: string): Promise<void> {
    // 1. Verificar que el proyecto esté archivado
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

    // 2. Ejecutar eliminación normal (con todas las validaciones)
    await this.eliminarProyecto(id)
  }

  // Métodos de transformación
  private transformarProyectoDeDB(data: Database['public']['Tables']['proyectos']['Row'] & {
    manzanas?: Array<Database['public']['Tables']['manzanas']['Row']>
  }): Proyecto {
    return {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      ubicacion: data.ubicacion,
      fechaInicio: data.fecha_inicio,
      fechaFinEstimada: data.fecha_fin_estimada,
      presupuesto: data.presupuesto,
      estado: data.estado,
      progreso: data.progreso,
      manzanas: (data.manzanas || []).map((m) => ({
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
      fechaCreacion: data.fecha_creacion,
      fechaActualizacion: data.fecha_actualizacion,
      // ✅ Campos de archivado
      archivado: data.archivado || false,
      fechaArchivado: data.fecha_archivado || null,
      motivoArchivo: data.motivo_archivo || null,
    }
  }

  /**
   * Verifica si ya existe un proyecto con el mismo nombre (case-insensitive)
   * @param nombre - Nombre del proyecto a verificar
   * @param excludeId - ID del proyecto a excluir (para edición)
   * @returns true si el nombre ya existe, false si está disponible
   */
  async verificarNombreDuplicado(
    nombre: string,
    excludeId?: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('proyectos')
      .select('id, nombre')
      .ilike('nombre', nombre) // Case-insensitive comparison

    if (error) {
      console.error('Error al verificar nombre duplicado:', error)
      throw new Error(`Error al verificar nombre: ${error.message}`)
    }

    // Si estamos editando, excluir el proyecto actual
    const duplicados = excludeId
      ? data?.filter(p => p.id !== excludeId) || []
      : data || []

    return duplicados.length > 0
  }
}

export const proyectosService = new ProyectosService()

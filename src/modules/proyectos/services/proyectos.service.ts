import { supabase } from '@/lib/supabase/client'
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
  // CRUD Operations
  async obtenerProyectos(): Promise<Proyecto[]> {
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
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error al obtener proyectos:', error)
      throw new Error(`Error al obtener proyectos: ${error.message}`)
    }

    // Transformar datos de Supabase a formato de la aplicación
    return (data || []).map(this.transformarProyectoDeDB)
  }

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

  async crearProyecto(formData: ProyectoFormData): Promise<Proyecto> {
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
        responsable: formData.responsable,
        telefono: formData.telefono,
        email: formData.email,
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
      responsable: proyecto.responsable,
      telefono: proyecto.telefono,
      email: proyecto.email,
      manzanas,
      fechaCreacion: proyecto.fecha_creacion,
      fechaActualizacion: proyecto.fecha_actualizacion,
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

  async actualizarProyecto(
    id: string,
    data: Partial<ProyectoFormData>
  ): Promise<Proyecto> {
    // 1. 🔍 AUDITORÍA: Obtener datos ANTES de actualizar
    let proyectoAnterior: Proyecto | null = null
    try {
      proyectoAnterior = await this.obtenerProyecto(id)
    } catch (error) {
      console.error('Error al obtener proyecto para auditoría:', error)
    }

    // 2. Preparar datos para actualización
    const updateData: any = {}

    // Mapear campos de la aplicación a campos de DB
    if (data.nombre) updateData.nombre = data.nombre
    if (data.descripcion) updateData.descripcion = data.descripcion
    if (data.ubicacion) updateData.ubicacion = data.ubicacion
    if (data.fechaInicio) updateData.fecha_inicio = data.fechaInicio
    if (data.fechaFinEstimada)
      updateData.fecha_fin_estimada = data.fechaFinEstimada
    if (data.presupuesto !== undefined)
      updateData.presupuesto = data.presupuesto
    if (data.estado) updateData.estado = data.estado
    if (data.responsable) updateData.responsable = data.responsable
    if (data.telefono) updateData.telefono = data.telefono
    if (data.email) updateData.email = data.email

    // 3. Actualizar en DB
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

    const proyectoActualizado = this.transformarProyectoDeDB(proyecto)

    // 4. 🔍 AUDITORÍA: Registrar actualización
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

  async eliminarProyecto(id: string): Promise<void> {
    // 1. 🔍 AUDITORÍA: Obtener datos ANTES de eliminar
    let proyectoEliminado: Proyecto | null = null
    try {
      proyectoEliminado = await this.obtenerProyecto(id)
    } catch (error) {
      console.error('Error al obtener proyecto para auditoría:', error)
    }

    // 2. Eliminar de DB
    const { error } = await supabase.from('proyectos').delete().eq('id', id)

    if (error) {
      console.error('Error al eliminar proyecto:', error)
      throw new Error(`Error al eliminar proyecto: ${error.message}`)
    }

    // 3. 🔍 AUDITORÍA: Registrar eliminación
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

  // Métodos de transformación
  private transformarProyectoDeDB(data: any): Proyecto {
    return {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      ubicacion: data.ubicacion,
      fechaInicio: data.fecha_inicio,
      fechaFinEstimada: data.fecha_fin_estimada,
      presupuesto: data.presupuesto,
      estado: data.estado as any, // Type assertion para evitar error de tipos con Supabase
      progreso: data.progreso,
      responsable: data.responsable,
      telefono: data.telefono,
      email: data.email,
      manzanas: (data.manzanas || []).map((m: any) => ({
        id: m.id,
        nombre: m.nombre,
        totalViviendas: m.numero_viviendas || 0,
        viviendasVendidas: 0,
        precioBase: 0,
        superficieTotal: 0,
        proyectoId: data.id,
        estado: 'planificada' as EstadoManzana,
        fechaCreacion: m.fecha_creacion || new Date().toISOString(),
      })),
      fechaCreacion: data.fecha_creacion,
      fechaActualizacion: data.fecha_actualizacion,
    }
  }
}

export const proyectosService = new ProyectosService()

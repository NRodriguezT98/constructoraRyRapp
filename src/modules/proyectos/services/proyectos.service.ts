import type { Proyecto, ProyectoFormData } from '../types'

import {
  obtenerProyecto,
  obtenerProyectos,
  verificarNombreDuplicado,
} from './proyectos-consultas.service'
import {
  actualizarProyecto,
  crearProyecto,
} from './proyectos-escritura.service'
import {
  archivarProyecto,
  eliminarProyecto,
  eliminarProyectoDefinitivo,
  restaurarProyecto,
} from './proyectos-estado.service'

// Re-exportar funciones individuales para uso directo
export {
  actualizarProyecto,
  archivarProyecto,
  crearProyecto,
  eliminarProyecto,
  eliminarProyectoDefinitivo,
  obtenerProyecto,
  obtenerProyectos,
  restaurarProyecto,
  verificarNombreDuplicado,
}

// Re-exportar helpers y tipos
export {
  parsearUbicacion,
  transformarProyectoDeDB,
} from './proyectos-helpers.service'
export type { ProyectoConManzanasDB } from './proyectos-helpers.service'

/**
 * Facade para mantener compatibilidad con el patr�n proyectosService.method()
 * usado en todos los hooks del m�dulo
 */
class ProyectosService {
  obtenerProyectos(incluirArchivados = false): Promise<Proyecto[]> {
    return obtenerProyectos(incluirArchivados)
  }
  obtenerProyecto(id: string): Promise<Proyecto | null> {
    return obtenerProyecto(id)
  }
  crearProyecto(proyectoData: ProyectoFormData): Promise<Proyecto> {
    return crearProyecto(proyectoData)
  }
  actualizarProyecto(
    id: string,
    data: Partial<ProyectoFormData>
  ): Promise<Proyecto> {
    return actualizarProyecto(id, data)
  }
  eliminarProyecto(id: string): Promise<void> {
    return eliminarProyecto(id)
  }
  archivarProyecto(id: string, motivo?: string): Promise<void> {
    return archivarProyecto(id, motivo)
  }
  restaurarProyecto(id: string): Promise<void> {
    return restaurarProyecto(id)
  }
  eliminarProyectoDefinitivo(id: string): Promise<void> {
    return eliminarProyectoDefinitivo(id)
  }
  verificarNombreDuplicado(
    nombre: string,
    excludeId?: string
  ): Promise<boolean> {
    return verificarNombreDuplicado(nombre, excludeId)
  }
}

export const proyectosService = new ProyectosService()

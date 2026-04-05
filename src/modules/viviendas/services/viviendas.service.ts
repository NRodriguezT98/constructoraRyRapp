import type {
  ConfiguracionRecargo,
  FiltrosViviendas,
  ManzanaConDisponibilidad,
  Proyecto,
  Vivienda,
  ViviendaFormData,
} from '../types'

import {
  listar,
  obtenerConfiguracionRecargos,
  obtenerGastosNotariales,
  obtenerManzanasDisponibles,
  obtenerNumerosOcupados,
  obtenerPorId,
  obtenerPorManzana,
  obtenerProyectos,
  obtenerProyectosParaFiltro,
  obtenerSiguienteNumeroVivienda,
  obtenerTodas,
  obtenerVivienda,
  obtenerViviendasDisponiblesPorProyecto,
  verificarMatriculaUnica,
} from './viviendas-consultas.service'
import { actualizar, crear, eliminar } from './viviendas-escritura.service'
import {
  actualizarCertificado,
  obtenerNegociacionActivaPorVivienda,
  sincronizarNegociacionConVivienda,
} from './viviendas-storage.service'

// Re-exportar funciones individuales para uso directo
export {
  actualizar,
  actualizarCertificado,
  crear,
  eliminar,
  listar,
  obtenerConfiguracionRecargos,
  obtenerGastosNotariales,
  obtenerManzanasDisponibles,
  obtenerNegociacionActivaPorVivienda,
  obtenerNumerosOcupados,
  obtenerPorId,
  obtenerPorManzana,
  obtenerProyectos,
  obtenerProyectosParaFiltro,
  obtenerSiguienteNumeroVivienda,
  obtenerTodas,
  obtenerVivienda,
  obtenerViviendasDisponiblesPorProyecto,
  sincronizarNegociacionConVivienda,
  verificarMatriculaUnica,
}

/**
 * Facade para mantener compatibilidad con viviendasService.method() en todos los hooks
 */
class ViviendasService {
  obtenerProyectos(): Promise<Proyecto[]> {
    return obtenerProyectos()
  }
  obtenerProyectosParaFiltro(): Promise<Array<{ id: string; nombre: string }>> {
    return obtenerProyectosParaFiltro()
  }
  obtenerViviendasDisponiblesPorProyecto(proyectoId: string) {
    return obtenerViviendasDisponiblesPorProyecto(proyectoId)
  }
  obtenerManzanasDisponibles(
    proyectoId: string
  ): Promise<ManzanaConDisponibilidad[]> {
    return obtenerManzanasDisponibles(proyectoId)
  }
  obtenerSiguienteNumeroVivienda(manzanaId: string): Promise<number> {
    return obtenerSiguienteNumeroVivienda(manzanaId)
  }
  obtenerNumerosOcupados(manzanaId: string): Promise<string[]> {
    return obtenerNumerosOcupados(manzanaId)
  }
  verificarMatriculaUnica(matricula: string, viviendaId?: string) {
    return verificarMatriculaUnica(matricula, viviendaId)
  }
  obtenerConfiguracionRecargos(): Promise<ConfiguracionRecargo[]> {
    return obtenerConfiguracionRecargos()
  }
  obtenerGastosNotariales(): Promise<number> {
    return obtenerGastosNotariales()
  }
  obtenerTodas(): Promise<Vivienda[]> {
    return obtenerTodas()
  }
  obtenerPorManzana(manzanaId: string): Promise<Vivienda[]> {
    return obtenerPorManzana(manzanaId)
  }
  obtenerPorId(id: string): Promise<Vivienda | null> {
    return obtenerPorId(id)
  }
  obtenerVivienda(id: string): Promise<Vivienda> {
    return obtenerVivienda(id)
  }
  listar(filtros?: FiltrosViviendas): Promise<Vivienda[]> {
    return listar(filtros)
  }
  crear(formData: ViviendaFormData): Promise<Vivienda> {
    return crear(formData)
  }
  actualizar(
    id: string,
    formData: Partial<ViviendaFormData>
  ): Promise<Vivienda> {
    return actualizar(id, formData)
  }
  eliminar(id: string): Promise<void> {
    return eliminar(id)
  }
  actualizarCertificado(viviendaId: string, file: File): Promise<string> {
    return actualizarCertificado(viviendaId, file)
  }
  obtenerNegociacionActivaPorVivienda(viviendaId: string) {
    return obtenerNegociacionActivaPorVivienda(viviendaId)
  }
  sincronizarNegociacionConVivienda(
    negociacionId: string,
    nuevoValorBase: number
  ): Promise<void> {
    return sincronizarNegociacionConVivienda(negociacionId, nuevoValorBase)
  }
}

export const viviendasService = new ViviendasService()

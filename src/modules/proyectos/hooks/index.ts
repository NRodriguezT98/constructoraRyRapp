// Barrel export para hooks de proyectos
export { useDetectarCambios } from './useDetectarCambios'
export { PASOS_PROYECTO_EDICION, useEditarProyecto } from './useEditarProyecto'
export { useProyectosActions } from './useProyectosActions'
export { useProyectosModals } from './useProyectosModals'
export { useProyectoTabla } from './useProyectoTabla'

// ✅ Hooks con React Query (USAR ESTOS)
export {
  proyectosKeys,
  useEstadisticasProyectos as useEstadisticasProyectosQuery,
  useProyectoQuery,
  useProyectosFiltrados as useProyectosFiltradosQuery,
  useProyectosQuery,
} from './useProyectosQuery'

// ✅ Hook optimizado con JOIN para edición (7.5x más rápido)
export {
  useProyectoConValidacion,
  type ManzanaConValidacion,
  type ProyectoConValidacion,
} from './useProyectoConValidacion'

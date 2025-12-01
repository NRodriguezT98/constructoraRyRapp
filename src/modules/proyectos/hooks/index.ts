// Barrel export para hooks de proyectos
// Facilita imports: import { useProyectosQuery, useProyectoCard } from '@/modules/proyectos/hooks'

export { useDetectarCambios } from './useDetectarCambios'
export { useDocumentoVersiones } from './useDocumentoVersiones'
export { useEstadosVersionProyecto } from './useEstadosVersionProyecto'
export { useProyectoCard } from './useProyectoCard'
export { useProyectosActions } from './useProyectosActions'
export { useProyectosModals } from './useProyectosModals'
export { useProyectoTabla } from './useProyectoTabla'
export { horasRestantesParaReemplazo, puedeReemplazarArchivo, useReemplazarArchivoProyecto } from './useReemplazarArchivoProyecto'

// ✅ Hooks con React Query (USAR ESTOS)
export {
    proyectosKeys,
    useEstadisticasProyectos as useEstadisticasProyectosQuery,
    useProyectoQuery,
    useProyectosFiltrados as useProyectosFiltradosQuery,
    useProyectosQuery,
    useVistaProyectos as useVistaProyectosQuery
} from './useProyectosQuery'

// ✅ Hook optimizado con JOIN para edición (7.5x más rápido)
export {
    useProyectoConValidacion,
    type ManzanaConValidacion,
    type ProyectoConValidacion
} from './useProyectoConValidacion'

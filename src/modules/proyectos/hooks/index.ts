// Barrel export para hooks de proyectos
// Facilita imports: import { useProyectos, useProyectoCard } from '@/modules/proyectos/hooks'

export { useDetectarCambios } from './useDetectarCambios'
export { useDocumentoVersiones } from './useDocumentoVersiones'
export { useProyectoCard } from './useProyectoCard'
// ❌ useProyectoDetalle eliminado - nunca se implementó

// ✅ Hooks con Zustand (DEPRECADO - usar React Query)
export {
    useProyecto, useProyectos, useProyectosFiltrados
} from './useProyectos'

// ✅ Hooks con React Query (NUEVO - usar estos)
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

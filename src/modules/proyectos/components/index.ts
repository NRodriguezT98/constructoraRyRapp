// Barrel exports para componentes de proyectos
// Permite importar m�ltiples componentes en una sola l�nea

// Componentes principales
export { ProyectosPage } from './proyectos-page-main'
export { ProyectoCard } from './proyecto-card'
export { ProyectosForm } from './proyectos-form'

// Componentes de lista y búsqueda
export { ProyectosLista } from './proyectos-lista'
// ❌ ProyectosSearch eliminado - reemplazado por ProyectosFiltrosPremium
export { ProyectosHeader } from './proyectos-header'

// Estados
export { ProyectosEmpty } from './proyectos-empty'
export { ProyectosSkeleton } from './proyectos-skeleton'

// Tabs (re-export)
export * from './tabs'

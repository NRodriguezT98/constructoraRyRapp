// Barrel exports para componentes de proyectos
// Permite importar múltiples componentes en una sola línea

// Componentes principales (ProyectoCard legacy eliminado, usar ProyectoCardPremium)
export { ProyectoCardPremium } from './proyecto-card-premium'
export { ProyectosForm } from './proyectos-form'
export { ProyectosPage } from './proyectos-page-main'

// Componentes de lista y búsqueda
export { ProyectosLista } from './proyectos-lista'
// ❌ ProyectosSearch eliminado - reemplazado por ProyectosFiltrosPremium
export { ProyectosHeader } from './proyectos-header'

// Estados
export { ProyectosEmpty } from './proyectos-empty'
export { ProyectosSkeleton } from './proyectos-skeleton'

// Tabs (re-export)
export * from './tabs'

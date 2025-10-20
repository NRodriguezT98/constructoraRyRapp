/**
 * Barrel export de modales del módulo Clientes
 *
 * ⭐ REFACTORIZADO: Modal de negociaciones con arquitectura limpia
 * - Separación de responsabilidades (hooks, components, styles)
 * - 3 hooks especializados (useProyectosViviendas, useFuentesPago, useModalNegociacion)
 * - 3 componentes de pasos separados
 * - Estilos centralizados
 * - index.tsx de ~202 líneas vs 1,035 original
 *
 * Backups:
 * - modal-crear-negociacion.tsx (versión simple sin wizard)
 * - modal-crear-negociacion-OLD.tsx (versión original antigua)
 * - modal-crear-negociacion-nuevo.tsx (versión monolítica de 1,035 líneas)
 */

// ⭐ USAR MODAL REFACTORIZADO DE LA CARPETA modal-crear-negociacion/
export { ModalCrearNegociacion } from './modal-crear-negociacion/index';
export * from './modal-registrar-interes';

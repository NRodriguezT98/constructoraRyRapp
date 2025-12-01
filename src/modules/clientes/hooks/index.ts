// Barrel export para hooks del módulo de clientes

// ✅ React Query Hooks (NUEVOS - Usar estos)
export * from './useClientesList'
export * from './useClientesQuery'
export * from './useNegociacionesQuery'; // 🆕 React Query para negociaciones

// ✅ Component Hooks (Separación de Responsabilidades)
export * from './useAsignacionVivienda'
export * from './useClienteCard'

// ✅ NEW: Hooks para Tabs (Separación de Responsabilidades)
export * from './useClienteDetalle'
export * from './useDetectarCambios'
export * from './useDocumentosTab'
export * from './useInteresesTab'
export * from './useNegociacionesTab'; // ⚠️ DEPRECADO - Usar useNegociacionesQuery

// ✅ NEW: Hooks para Subsecciones de Negociaciones (REFACTORIZADO 2025-11-27)
export * from './useAccionesSection'
export * from './useFuentesPagoSection'
export * from './useGenerarReportePDF'; // 🆕 Generación de reportes PDF
export * from './useProgressSection'
export * from './useUltimosAbonosSection'

// ✅ NEW: Hooks para Versiones de Negociaciones
export * from './useHistorialVersiones'

// Legacy Hooks (Compatibilidad)
export * from './useClienteCardActivo'
export * from './useClienteIntereses'
export * from './useClientes'
export * from './useConfigurarFuentesPago'
export * from './useCrearNegociacion'
export * from './useFormularioCliente'
export * from './useInteresFormulario'
export * from './useListaIntereses'
export * from './useNegociacion'
export * from './useRegistrarInteres'

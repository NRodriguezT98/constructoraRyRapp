// Barrel exports para hooks de viviendas

// ============================================
// REACT QUERY HOOKS (Datos del servidor)
// ============================================
export {
  useActualizarCertificadoMutation,
  useActualizarViviendaMutation,
  useConfiguracionRecargosQuery,
  useCrearViviendaMutation,
  useEliminarViviendaMutation,
  useGastosNotarialesQuery,
  useManzanasDisponiblesQuery,
  useNumerosOcupadosQuery,
  useProyectosActivosQuery,
  useProyectosFiltroQuery,
  useSiguienteNumeroViviendaQuery,
  useViviendaQuery,
  useViviendasQuery,
  verificarMatriculaUnica,
  viviendasKeys,
} from './useViviendasQuery'

// ============================================
// HOOKS DE LÓGICA UI
// ============================================
export { useEditarVivienda } from './useEditarVivienda'
export { useEditarViviendaAccordion } from './useEditarViviendaAccordion'
export { useNuevaViviendaAccordion } from './useNuevaViviendaAccordion'
export { usePasoLegal } from './usePasoLegal'
export { usePasoUbicacion } from './usePasoUbicacion'
export { useViviendasList } from './useViviendasList'

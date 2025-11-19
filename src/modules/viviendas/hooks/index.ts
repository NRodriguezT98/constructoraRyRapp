// Barrel exports para hooks de viviendas

// ============================================
// REACT QUERY HOOKS (Datos del servidor)
// ============================================
export {
    useActualizarCertificadoMutation, useActualizarViviendaMutation, useConfiguracionRecargosQuery, useCrearViviendaMutation, useEliminarViviendaMutation, useGastosNotarialesQuery, useManzanasDisponiblesQuery, useNumerosOcupadosQuery, useProyectosActivosQuery, useSiguienteNumeroViviendaQuery, useViviendaQuery, useViviendasQuery, verificarMatriculaUnica,
    viviendasKeys
} from './useViviendasQuery'

// ============================================
// DOCUMENTOS (Sistema nuevo modular)
// ============================================
export * from './documentos'
export { useCategoriasSistemaViviendas } from './useCategoriasSistemaViviendas'
export { useDocumentoUploadVivienda } from './useDocumentoUploadVivienda'

// ============================================
// HOOKS DE LÓGICA UI
// ============================================
export { useNuevaVivienda } from './useNuevaVivienda'
export { usePasoLegal } from './usePasoLegal'
export { usePasoUbicacion } from './usePasoUbicacion'
export { useViviendaForm } from './useViviendaForm'
export { useViviendas } from './useViviendas'
export { useViviendasFiltros } from './useViviendasFiltros'
export { useViviendasList } from './useViviendasList'
export { useViviendaTabla } from './useViviendaTabla'

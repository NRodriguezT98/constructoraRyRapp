// Barrel exports para hooks de viviendas

// ============================================
// REACT QUERY HOOKS (Datos del servidor)
// ============================================
export {
    useActualizarCertificadoMutation, useActualizarViviendaMutation, useConfiguracionRecargosQuery, useCrearViviendaMutation, useEliminarViviendaMutation, useGastosNotarialesQuery, useManzanasDisponiblesQuery, useNumerosOcupadosQuery, useProyectosActivosQuery, useSiguienteNumeroViviendaQuery, useViviendaQuery, useViviendasQuery, verificarMatriculaUnica,
    viviendasKeys
} from './useViviendasQuery'

// ============================================
// DOCUMENTOS (React Query)
// ============================================
export { useCategoriasSistemaViviendas } from './useCategoriasSistemaViviendas'
export { useDocumentosListaVivienda } from './useDocumentosListaVivienda'
export { useDocumentosVivienda, useEstadisticasDocumentosVivienda } from './useDocumentosVivienda'
export { useDocumentoUploadVivienda } from './useDocumentoUploadVivienda'

// ============================================
// HOOKS DE LÓGICA UI (Por refactorizar)
// ============================================
export { useNuevaVivienda } from './useNuevaVivienda'
export { useViviendaForm } from './useViviendaForm'
export { useViviendas } from './useViviendas'
export { useViviendasList } from './useViviendasList'

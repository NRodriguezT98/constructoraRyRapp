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
export { useEditarVivienda } from './useEditarVivienda'
export { useNuevaVivienda } from './useNuevaVivienda'
export { usePasoLegal } from './usePasoLegal'
export { usePasoUbicacion } from './usePasoUbicacion'
export { useViviendaForm } from './useViviendaForm'
export { useViviendas } from './useViviendas'
export { useViviendasFiltros } from './useViviendasFiltros'
export { useViviendasList } from './useViviendasList'
export { useViviendaTabla } from './useViviendaTabla'

// ============================================
// SISTEMA DE INACTIVACIÓN Y BLOQUEO
// ============================================
export { useViviendaBloqueo } from './useViviendaBloqueo'
export { useViviendaConflictos } from './useViviendaConflictos'
export { useViviendaInactivacion } from './useViviendaInactivacion'

// ============================================
// HOOKS DE MODALES (UI Logic)
// ============================================
export { useDesactivarViviendaModal } from './useDesactivarViviendaModal'
export { useReactivarViviendaModal } from './useReactivarViviendaModal'

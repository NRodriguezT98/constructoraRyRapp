// ============================================
// SISTEMA ANTIGUO (Hardcodeado) - Deprecado
// ============================================
export { useCan, useIsAdmin, usePermissions, useRole } from './usePermissions'

// ============================================
// SISTEMA NUEVO (React Query + BD) - Recomendado ⭐
// ============================================
export {
    useActualizarPermisoMutation,
    useActualizarPermisosEnLoteMutation,
    useCan as useCanQuery,
    useIsAdmin as useIsAdminQuery, usePermisosQuery, useRole as useRoleQuery, useTodosLosPermisosQuery
} from './usePermisosQuery'

// ============================================
// USUARIOS - Sistema Antiguo (useState)
// ============================================
export { useUsuarios } from './useUsuarios'

// ============================================
// USUARIOS - Sistema Nuevo (React Query) ⭐
// ============================================
export {
    useActualizarUsuarioMutation, useCambiarEstadoMutation, useCambiarRolMutation, useCrearUsuarioMutation, useEliminarUsuarioMutation, useEstadisticasUsuariosQuery, useResetearIntentosMutation, useUsuarioQuery, useUsuariosConMutations, useUsuariosQuery
} from './useUsuariosQuery'

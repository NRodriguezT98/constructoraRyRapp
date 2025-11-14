/**
 * ============================================
 * BARREL EXPORT: Componentes de Usuarios
 * ============================================
 *
 * ✨ VERSIÓN 2.0.0 - Sistema de Permisos Configurable
 */

export { usuariosPremiumStyles } from '../styles/usuarios-premium.styles'
export { EstadisticasUsuariosPremium } from './EstadisticasUsuarios'
export { Modal } from './Modal'
export { ModalCrearUsuario } from './ModalCrearUsuario'
export { ModalEditarUsuario } from './ModalEditarUsuario'
export { usuariosStyles } from './usuarios.styles'
export { UsuariosHeader } from './UsuariosHeader'

// Componentes de protección de acciones
export {
    AdminOnly, CanApprove, CanCreate, CanDelete, CanEdit, CanExport, CanReject, CanView, ManagerOrAbove, ProtectedAction
} from './ProtectedAction'

// Componentes de protección de rutas
export {
    ProtectedRoute, RequireAdmin, RequireView
} from './ProtectedRoute'

// ✨ NUEVO: Sistema de Tabs + Gestión de Permisos
export { PermisosMatrix } from './PermisosMatrix'
export { PermisosMatrixCompact } from './PermisosMatrixCompact'; // ⭐ NUEVO: Vista compacta UX moderna
export { UsuariosTabs } from './UsuariosTabs'

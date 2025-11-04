/**
 * ============================================
 * TIPOS DEL MÓDULO DE USUARIOS
 * ============================================
 */

/**
 * Roles disponibles en el sistema
 */
export type Rol = 'Administrador' | 'Gerente' | 'Vendedor'

/**
 * Estados de usuario
 */
export type EstadoUsuario = 'Activo' | 'Inactivo' | 'Bloqueado'

/**
 * Usuario completo de la base de datos
 */
export interface Usuario {
  id: string
  email: string
  nombres: string
  apellidos: string
  nombre_completo?: string
  telefono: string | null
  rol: Rol
  estado: EstadoUsuario
  avatar_url: string | null
  preferencias: Record<string, any>
  creado_por: string | null
  ultimo_acceso: string | null
  fecha_creacion: string
  fecha_actualizacion: string
  debe_cambiar_password: boolean
  intentos_fallidos: number
  bloqueado_hasta: string | null
}

/**
 * Usuario completo con información adicional (vista)
 */
export interface UsuarioCompleto extends Usuario {
  creado_por_nombre: string | null
  fecha_registro_auth: string
  ultimo_login_auth: string | null
}

/**
 * Datos para crear nuevo usuario
 */
export interface CrearUsuarioData {
  email: string
  nombres: string
  apellidos: string
  telefono?: string
  rol: Rol
  password?: string // Si no se proporciona, se genera automáticamente
  enviar_invitacion?: boolean // Enviar email de invitación
}

/**
 * Datos para actualizar usuario existente
 */
export interface ActualizarUsuarioData {
  nombres?: string
  apellidos?: string
  telefono?: string
  rol?: Rol
  estado?: EstadoUsuario
  avatar_url?: string
  preferencias?: Record<string, any>
}

/**
 * Filtros para búsqueda de usuarios
 */
export interface FiltrosUsuarios {
  busqueda?: string // Búsqueda en nombres, apellidos, email
  rol?: Rol
  estado?: EstadoUsuario
  creado_por?: string
}

/**
 * Estadísticas de usuarios
 */
export interface EstadisticasUsuarios {
  total: number
  por_rol: Record<Rol, number>
  por_estado: Record<EstadoUsuario, number>
  activos_hoy: number
  bloqueados: number
}

/**
 * Respuesta de creación de usuario
 */
export interface CrearUsuarioRespuesta {
  usuario: Usuario
  password_temporal?: string // Solo si se generó automáticamente
  invitacion_enviada: boolean
}

/**
 * Opciones de rol con metadata
 */
export const ROLES: { value: Rol; label: string; descripcion: string; color: string }[] = [
  {
    value: 'Administrador',
    label: 'Administrador',
    descripcion: 'Acceso total al sistema, gestión de usuarios',
    color: 'red',
  },
  {
    value: 'Gerente',
    label: 'Gerente',
    descripcion: 'Supervisión de proyectos y negociaciones',
    color: 'orange',
  },
  {
    value: 'Vendedor',
    label: 'Vendedor',
    descripcion: 'Gestión de clientes y ventas',
    color: 'blue',
  },
]

/**
 * Opciones de estado con metadata
 */
export const ESTADOS_USUARIO: {
  value: EstadoUsuario
  label: string
  descripcion: string
  color: string
}[] = [
  {
    value: 'Activo',
    label: 'Activo',
    descripcion: 'Usuario puede acceder al sistema',
    color: 'green',
  },
  {
    value: 'Inactivo',
    label: 'Inactivo',
    descripcion: 'Usuario suspendido temporalmente',
    color: 'gray',
  },
  {
    value: 'Bloqueado',
    label: 'Bloqueado',
    descripcion: 'Usuario bloqueado por seguridad',
    color: 'red',
  },
]

/**
 * Permisos por rol - Sistema granular por módulo y acción
 *
 * DISEÑO PARA MIGRACIÓN FUTURA:
 * Esta estructura está preparada para migrar a base de datos.
 * Los valores aquí definidos serán datos de seed cuando migremos.
 */

// ============================================
// MÓDULOS Y ACCIONES DEL SISTEMA
// ============================================

/**
 * Módulos disponibles en el sistema
 */
export type Modulo =
  | 'proyectos'
  | 'viviendas'
  | 'clientes'
  | 'abonos'
  | 'renuncias'
  | 'usuarios'
  | 'auditorias'
  | 'procesos'
  | 'reportes'
  | 'administracion'

/**
 * Acciones disponibles por módulo
 */
export type Accion =
  | 'ver'
  | 'crear'
  | 'editar'
  | 'eliminar'
  | 'aprobar'
  | 'rechazar'
  | 'exportar'
  | 'importar'
  | 'gestionar'

/**
 * Permiso completo: módulo + acción
 */
export interface Permiso {
  modulo: Modulo
  accion: Accion
  descripcion?: string
}

// ============================================
// PERMISOS POR ROL
// ============================================

export const PERMISOS_POR_ROL: Record<Rol, Record<Modulo, Accion[]>> = {
  Administrador: {
    proyectos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    viviendas: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    clientes: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    abonos: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'rechazar', 'exportar'],
    renuncias: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'rechazar'],
    usuarios: ['ver', 'crear', 'editar', 'eliminar', 'gestionar'],
    auditorias: ['ver', 'exportar'],
    procesos: ['ver', 'crear', 'editar', 'eliminar', 'gestionar'],
    reportes: ['ver', 'exportar'],
    administracion: ['ver', 'gestionar'],
  },
  Gerente: {
    proyectos: ['ver', 'crear', 'editar', 'exportar'],
    viviendas: ['ver', 'crear', 'editar', 'exportar'],
    clientes: ['ver', 'crear', 'editar', 'exportar'],
    abonos: ['ver', 'crear', 'editar', 'aprobar', 'rechazar', 'exportar'],
    renuncias: ['ver', 'aprobar', 'rechazar'],
    usuarios: ['ver'],
    auditorias: [],
    procesos: ['ver', 'crear', 'editar'],
    reportes: ['ver', 'exportar'],
    administracion: ['ver'],
  },
  Vendedor: {
    proyectos: ['ver'],
    viviendas: ['ver'],
    clientes: ['ver', 'crear', 'editar'],
    abonos: ['ver', 'crear'],
    renuncias: ['ver', 'crear'],
    usuarios: [],
    auditorias: [],
    procesos: ['ver'],
    reportes: [],
    administracion: [],
  },
}

/**
 * Descripción de cada permiso para UI y auditoría
 */
export const DESCRIPCION_PERMISOS: Record<Modulo, Record<Accion, string>> = {
  proyectos: {
    ver: 'Ver lista y detalles de proyectos',
    crear: 'Crear nuevos proyectos',
    editar: 'Modificar proyectos existentes',
    eliminar: 'Eliminar proyectos',
    exportar: 'Exportar datos de proyectos',
    aprobar: 'N/A',
    rechazar: 'N/A',
    importar: 'N/A',
    gestionar: 'N/A',
  },
  viviendas: {
    ver: 'Ver lista y detalles de viviendas',
    crear: 'Crear nuevas viviendas',
    editar: 'Modificar viviendas existentes',
    eliminar: 'Eliminar viviendas',
    exportar: 'Exportar datos de viviendas',
    aprobar: 'N/A',
    rechazar: 'N/A',
    importar: 'N/A',
    gestionar: 'N/A',
  },
  clientes: {
    ver: 'Ver lista y detalles de clientes',
    crear: 'Registrar nuevos clientes',
    editar: 'Modificar datos de clientes',
    eliminar: 'Eliminar clientes',
    exportar: 'Exportar base de datos de clientes',
    aprobar: 'N/A',
    rechazar: 'N/A',
    importar: 'Importar clientes masivamente',
    gestionar: 'N/A',
  },
  abonos: {
    ver: 'Ver lista y detalles de abonos',
    crear: 'Registrar nuevos abonos',
    editar: 'Modificar abonos existentes',
    eliminar: 'Eliminar abonos',
    aprobar: 'Aprobar abonos pendientes',
    rechazar: 'Rechazar abonos',
    exportar: 'Exportar reporte de abonos',
    importar: 'N/A',
    gestionar: 'N/A',
  },
  renuncias: {
    ver: 'Ver lista y detalles de renuncias',
    crear: 'Registrar nuevas renuncias',
    editar: 'Modificar renuncias',
    eliminar: 'Eliminar renuncias',
    aprobar: 'Aprobar renuncias pendientes',
    rechazar: 'Rechazar renuncias',
    exportar: 'Exportar reporte de renuncias',
    importar: 'N/A',
    gestionar: 'N/A',
  },
  usuarios: {
    ver: 'Ver lista de usuarios del sistema',
    crear: 'Crear nuevos usuarios',
    editar: 'Modificar usuarios existentes',
    eliminar: 'Eliminar usuarios',
    gestionar: 'Gestión completa de usuarios y permisos',
    exportar: 'N/A',
    aprobar: 'N/A',
    rechazar: 'N/A',
    importar: 'N/A',
  },
  auditorias: {
    ver: 'Ver registros de auditoría del sistema',
    exportar: 'Exportar registros de auditoría',
    crear: 'N/A',
    editar: 'N/A',
    eliminar: 'N/A',
    aprobar: 'N/A',
    rechazar: 'N/A',
    importar: 'N/A',
    gestionar: 'N/A',
  },
  procesos: {
    ver: 'Ver procesos de negociación',
    crear: 'Crear plantillas de procesos',
    editar: 'Modificar procesos existentes',
    eliminar: 'Eliminar procesos',
    gestionar: 'Gestión completa de procesos',
    exportar: 'N/A',
    aprobar: 'N/A',
    rechazar: 'N/A',
    importar: 'N/A',
  },
  reportes: {
    ver: 'Ver reportes y estadísticas',
    exportar: 'Exportar reportes',
    crear: 'N/A',
    editar: 'N/A',
    eliminar: 'N/A',
    aprobar: 'N/A',
    rechazar: 'N/A',
    importar: 'N/A',
    gestionar: 'N/A',
  },
  administracion: {
    ver: 'Ver panel de administración',
    gestionar: 'Gestión completa del sistema',
    crear: 'N/A',
    editar: 'N/A',
    eliminar: 'N/A',
    aprobar: 'N/A',
    rechazar: 'N/A',
    exportar: 'N/A',
    importar: 'N/A',
  },
}

// ============================================
// FUNCIONES DE VERIFICACIÓN DE PERMISOS
// ============================================

/**
 * Verifica si un rol tiene un permiso específico
 *
 * @param rol - Rol del usuario
 * @param modulo - Módulo del sistema
 * @param accion - Acción a verificar
 * @returns true si el rol tiene el permiso
 *
 * @example
 * tienePermiso('Vendedor', 'clientes', 'crear') // true
 * tienePermiso('Vendedor', 'usuarios', 'crear') // false
 */
export function tienePermiso(rol: Rol, modulo: Modulo, accion: Accion): boolean {
  const permisosModulo = PERMISOS_POR_ROL[rol]?.[modulo]
  return permisosModulo?.includes(accion) || false
}

/**
 * Verifica si un rol tiene ALGUNO de los permisos especificados
 *
 * @param rol - Rol del usuario
 * @param modulo - Módulo del sistema
 * @param acciones - Array de acciones a verificar
 * @returns true si el rol tiene al menos una de las acciones
 *
 * @example
 * tieneAlgunPermiso('Vendedor', 'clientes', ['crear', 'editar']) // true
 */
export function tieneAlgunPermiso(rol: Rol, modulo: Modulo, acciones: Accion[]): boolean {
  return acciones.some(accion => tienePermiso(rol, modulo, accion))
}

/**
 * Verifica si un rol tiene TODOS los permisos especificados
 *
 * @param rol - Rol del usuario
 * @param modulo - Módulo del sistema
 * @param acciones - Array de acciones a verificar
 * @returns true si el rol tiene todas las acciones
 *
 * @example
 * tieneTodosLosPermisos('Administrador', 'clientes', ['crear', 'editar']) // true
 */
export function tieneTodosLosPermisos(rol: Rol, modulo: Modulo, acciones: Accion[]): boolean {
  return acciones.every(accion => tienePermiso(rol, modulo, accion))
}

/**
 * Obtiene todos los permisos de un rol para un módulo
 *
 * @param rol - Rol del usuario
 * @param modulo - Módulo del sistema
 * @returns Array de acciones permitidas
 *
 * @example
 * obtenerPermisos('Vendedor', 'clientes') // ['ver', 'crear', 'editar']
 */
export function obtenerPermisos(rol: Rol, modulo: Modulo): Accion[] {
  return PERMISOS_POR_ROL[rol]?.[modulo] || []
}

/**
 * Obtiene todos los módulos a los que un rol tiene acceso
 *
 * @param rol - Rol del usuario
 * @returns Array de módulos con al menos un permiso
 *
 * @example
 * obtenerModulosConAcceso('Vendedor') // ['proyectos', 'viviendas', 'clientes', ...]
 */
export function obtenerModulosConAcceso(rol: Rol): Modulo[] {
  return (Object.keys(PERMISOS_POR_ROL[rol]) as Modulo[]).filter(
    modulo => PERMISOS_POR_ROL[rol][modulo].length > 0
  )
}

/**
 * Helper para obtener color de rol
 */
export function getColorRol(rol: Rol): string {
  return ROLES.find((r) => r.value === rol)?.color || 'gray'
}

/**
 * Helper para obtener color de estado
 */
export function getColorEstado(estado: EstadoUsuario): string {
  return ESTADOS_USUARIO.find((e) => e.value === estado)?.color || 'gray'
}

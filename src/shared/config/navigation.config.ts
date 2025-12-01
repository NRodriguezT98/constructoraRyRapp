/**
 * ============================================
 * CONFIGURACIÓN: Navegación de la Aplicación
 * ============================================
 *
 * Define la estructura de navegación del sidebar.
 * Centraliza rutas, íconos, permisos y estilos.
 *
 * VENTAJAS:
 * - ✅ Configuración centralizada
 * - ✅ Fácil agregar/quitar módulos
 * - ✅ Reutilizable en móvil, breadcrumbs, etc.
 * - ✅ Testeable independientemente
 * - ✅ Type-safe con TypeScript
 */

import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  FileX,
  Home,
  Settings,
  Shield,
  Trash2,
  Users,
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  color: string
  description: string
  /** Permiso requerido para ver este item */
  requiredPermission?: {
    modulo: string
    accion: string
  }
  /** Solo visible para administradores */
  adminOnly?: boolean
}

export interface NavigationGroup {
  title: string
  items: NavigationItem[]
}

// ============================================
// CONFIGURACIÓN DE NAVEGACIÓN
// ============================================

/**
 * Grupos de navegación del sidebar
 * Organizados por categorías lógicas
 */
export const navigationGroups: NavigationGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: BarChart3,
        color: 'from-blue-500 to-indigo-500',
        description: 'Panel principal',
        // Dashboard no requiere permiso (accesible para todos)
      },
      {
        name: 'Proyectos',
        href: '/proyectos',
        icon: Building2,
        color: 'from-green-500 to-emerald-500',
        description: 'Gestión de proyectos',
        requiredPermission: { modulo: 'proyectos', accion: 'ver' },
      },
      {
        name: 'Viviendas',
        href: '/viviendas',
        icon: Home,
        color: 'from-orange-500 to-amber-500',
        description: 'Administrar viviendas',
        requiredPermission: { modulo: 'viviendas', accion: 'ver' },
      },
    ],
  },
  {
    title: 'Clientes',
    items: [
      {
        name: 'Clientes',
        href: '/clientes',
        icon: Users,
        color: 'from-cyan-500 to-blue-500',
        description: 'Base de clientes',
        requiredPermission: { modulo: 'clientes', accion: 'ver' },
      },
      {
        name: 'Abonos',
        href: '/abonos',
        icon: CreditCard,
        color: 'from-purple-500 to-pink-500',
        description: 'Gestión de pagos',
        requiredPermission: { modulo: 'abonos', accion: 'ver' },
      },
      {
        name: 'Renuncias',
        href: '/renuncias',
        icon: FileX,
        color: 'from-red-500 to-rose-500',
        description: 'Cancelaciones',
        // Renuncias no tiene permiso en BD, accesible para todos con sesión
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        name: 'Usuarios',
        href: '/usuarios',
        icon: Users,
        color: 'from-violet-500 to-purple-500',
        description: 'Gestión de usuarios',
        requiredPermission: { modulo: 'usuarios', accion: 'ver' },
      },
      {
        name: 'Auditorías',
        href: '/auditorias',
        icon: Activity,
        color: 'from-teal-500 to-cyan-500',
        description: 'Registro de actividad',
        requiredPermission: { modulo: 'auditorias', accion: 'ver' },
      },
      {
        name: 'Papelera',
        href: '/documentos/eliminados',
        icon: Trash2,
        color: 'from-red-500 to-rose-500',
        description: 'Documentos eliminados',
        adminOnly: true,
      },
      {
        name: 'Plantillas Proceso',
        href: '/admin/procesos',
        icon: ClipboardList,
        color: 'from-rose-500 to-pink-500',
        description: 'Plantillas de negociación',
        // No tiene permiso en BD, accesible para todos
      },
      {
        name: 'Recargos',
        href: '/administracion/configuracion',
        icon: Settings,
        color: 'from-blue-500 to-indigo-500',
        description: 'Gastos y valores',
        requiredPermission: { modulo: 'administracion', accion: 'gestionar' },
      },
      {
        name: 'Administración',
        href: '/admin',
        icon: Shield,
        color: 'from-indigo-500 to-blue-500',
        description: 'Panel admin',
        requiredPermission: { modulo: 'administracion', accion: 'ver' },
      },
      {
        name: 'Reportes',
        href: '/reportes',
        icon: FileText,
        color: 'from-gray-500 to-slate-500',
        description: 'Informes y análisis',
        requiredPermission: { modulo: 'reportes', accion: 'ver' },
      },
    ],
  },
]

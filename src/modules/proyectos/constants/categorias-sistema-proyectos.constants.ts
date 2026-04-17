/**
 * @file categorias-sistema-proyectos.constants.ts
 * @description Categorías del sistema para módulo PROYECTOS
 * ⚠️ UUIDs FIJOS: NO modificar, usados en triggers y validaciones
 *
 * Estas categorías son globales (es_global=true, es_sistema=true).
 * Se recrean con los mismos UUIDs si se eliminan.
 * Para restaurar: ejecutar `verificar_categorias_proyectos()` en Supabase.
 *
 * @updated 2026-04-18 - Creación inicial
 */

export const CATEGORIAS_SISTEMA_PROYECTOS = [
  // ── Jurídico ────────────────────────────────────────────────────────────
  {
    id: '06c57b7c-7d68-46f0-94ba-4065e00bbbf0',
    nombre: 'Documentos Legales',
    descripcion: 'Boletas fiscales, matrículas, paz y salvos',
    color: '#8B5CF6',
    icono: 'Scale',
    orden: 1,
    es_sistema: true,
    modulos_permitidos: ['proyectos'],
  },
  // ── Técnico ─────────────────────────────────────────────────────────────
  {
    id: 'a1d04cea-9aa3-4610-b0e0-aa4f89fe2ab5',
    nombre: 'Documentos Técnicos',
    descripcion: 'Planos, diseños, memorias de cálculo',
    color: '#10B981',
    icono: 'Compass',
    orden: 2,
    es_sistema: true,
    modulos_permitidos: ['proyectos'],
  },
  // ── Financiero ──────────────────────────────────────────────────────────
  {
    id: 'd290c205-9187-46cd-a450-5463132efa07',
    nombre: 'Facturas y Pagos',
    descripcion: 'Facturas prediales, comprobantes de pago, recibos',
    color: '#F59E0B',
    icono: 'Receipt',
    orden: 3,
    es_sistema: true,
    modulos_permitidos: ['proyectos'],
  },
  // ── Permisos ────────────────────────────────────────────────────────────
  {
    id: 'a32bef8e-7dc8-4bc1-bbca-16dfc6798779',
    nombre: 'Permisos, Licencias y Certificados',
    descripcion:
      'Licencias de construcción, urbanismo y certificados oficiales',
    color: '#EC4899',
    icono: 'FileSignature',
    orden: 4,
    es_sistema: true,
    modulos_permitidos: ['proyectos'],
  },
  // ── General ─────────────────────────────────────────────────────────────
  {
    id: '347ad2e3-a452-4efd-bc32-4d0448123e25',
    nombre: 'Otros Documentos',
    descripcion: 'Documentos generales y varios',
    color: '#6B7280',
    icono: 'FolderOpen',
    orden: 5,
    es_sistema: true,
    modulos_permitidos: ['proyectos'],
  },
] as const

/**
 * IDs de categorías tipados para usar en código
 * Ejemplo: CATEGORIA_IDS_PROYECTOS.DOCUMENTOS_LEGALES
 */
export const CATEGORIA_IDS_PROYECTOS = {
  /** Boletas fiscales, matrículas, paz y salvos */
  DOCUMENTOS_LEGALES: '06c57b7c-7d68-46f0-94ba-4065e00bbbf0' as const,

  /** Planos, diseños, memorias de cálculo */
  DOCUMENTOS_TECNICOS: 'a1d04cea-9aa3-4610-b0e0-aa4f89fe2ab5' as const,

  /** Facturas prediales, comprobantes de pago, recibos */
  FACTURAS_PAGOS: 'd290c205-9187-46cd-a450-5463132efa07' as const,

  /** Licencias de construcción, urbanismo y certificados oficiales */
  PERMISOS_LICENCIAS: 'a32bef8e-7dc8-4bc1-bbca-16dfc6798779' as const,

  /** Documentos generales y varios */
  OTROS_DOCUMENTOS: '347ad2e3-a452-4efd-bc32-4d0448123e25' as const,
} as const

export type CategoriaIdProyecto =
  (typeof CATEGORIA_IDS_PROYECTOS)[keyof typeof CATEGORIA_IDS_PROYECTOS]

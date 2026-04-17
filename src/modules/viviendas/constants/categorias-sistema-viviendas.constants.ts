/**
 * @file categorias-sistema-viviendas.constants.ts
 * @description Categorías del sistema para módulo VIVIENDAS
 * ⚠️ UUIDs FIJOS: NO modificar, usados en triggers y validaciones
 *
 * Estas categorías son globales (es_global=true, es_sistema=true).
 * Se recrean con los mismos UUIDs si se eliminan.
 * Para restaurar: ejecutar `verificar_categorias_viviendas()` en Supabase.
 *
 * @updated 2026-04-18 - Creación inicial
 */

export const CATEGORIAS_SISTEMA_VIVIENDAS = [
  // ── Valuación ───────────────────────────────────────────────────────────
  {
    id: '3a98c79d-25fc-40f7-b701-c6946995002d',
    nombre: 'Avalúo Comercial',
    descripcion: 'Avalúos y valoraciones de la propiedad',
    color: '#EF4444',
    icono: 'DollarSign',
    orden: 1,
    es_sistema: true,
    modulos_permitidos: ['viviendas'],
  },
  // ── Tradición y propiedad ───────────────────────────────────────────────
  {
    id: 'e76ff8af-7ff6-4c44-8003-a2dc8eaf9967',
    nombre: 'Certificado de Tradición',
    descripcion: 'Certificados de tradición y libertad de la propiedad',
    color: '#3B82F6',
    icono: 'BookMarked',
    orden: 2,
    es_sistema: true,
    modulos_permitidos: ['viviendas'],
  },
  // ── Proceso de compra ───────────────────────────────────────────────────
  {
    id: '00f70227-fb60-4737-a8ba-2071fcd82cdf',
    nombre: 'Contrato de Promesa',
    descripcion: 'Contratos de promesa de compraventa',
    color: '#EC4899',
    icono: 'FilePen',
    orden: 3,
    es_sistema: true,
    modulos_permitidos: ['viviendas'],
  },
  // ── Escrituras ──────────────────────────────────────────────────────────
  {
    id: '9f5fec74-af8b-4105-a4fd-3f3df3568716',
    nombre: 'Escritura Pública',
    descripcion: 'Escrituras de compraventa y documentos notariales',
    color: '#8B5CF6',
    icono: 'ScrollText',
    orden: 4,
    es_sistema: true,
    modulos_permitidos: ['viviendas'],
  },
  // ── Evidencia visual ─────────────────────────────────────────────────────
  {
    id: 'd57e28c2-1fdd-4020-879c-732684eaa4c8',
    nombre: 'Foto de Progreso',
    descripcion: 'Fotografías del avance y estado de la obra',
    color: '#06B6D4',
    icono: 'Camera',
    orden: 5,
    es_sistema: true,
    modulos_permitidos: ['viviendas'],
  },
  // ── Permisos ────────────────────────────────────────────────────────────
  {
    id: '992be01e-693f-4e7b-a583-5a45c125b113',
    nombre: 'Licencia y Permiso',
    descripcion: 'Licencias de construcción y permisos municipales',
    color: '#F59E0B',
    icono: 'Shield',
    orden: 6,
    es_sistema: true,
    modulos_permitidos: ['viviendas'],
  },
  // ── Técnico ─────────────────────────────────────────────────────────────
  {
    id: 'a619437b-4edb-49e9-8ead-27dc65da38a7',
    nombre: 'Plano Arquitectónico',
    descripcion: 'Planos, diseños y renders de la vivienda',
    color: '#10B981',
    icono: 'Ruler',
    orden: 7,
    es_sistema: true,
    modulos_permitidos: ['viviendas'],
  },
  // ── Servicios ───────────────────────────────────────────────────────────
  {
    id: '8d6e704b-ce42-44d2-816b-292f2026ad90',
    nombre: 'Recibo de Servicios',
    descripcion: 'Recibos de servicios públicos y pagos',
    color: '#14B8A6',
    icono: 'Receipt',
    orden: 8,
    es_sistema: true,
    modulos_permitidos: ['viviendas'],
  },
] as const

/**
 * IDs de categorías tipados para usar en código
 * Ejemplo: CATEGORIA_IDS_VIVIENDAS.ESCRITURA_PUBLICA
 */
export const CATEGORIA_IDS_VIVIENDAS = {
  /** Avalúos y valoraciones de la propiedad */
  AVALUO_COMERCIAL: '3a98c79d-25fc-40f7-b701-c6946995002d' as const,

  /** Certificados de tradición y libertad */
  CERTIFICADO_TRADICION: 'e76ff8af-7ff6-4c44-8003-a2dc8eaf9967' as const,

  /** Contratos de promesa de compraventa */
  CONTRATO_PROMESA: '00f70227-fb60-4737-a8ba-2071fcd82cdf' as const,

  /** Escrituras de compraventa y documentos notariales */
  ESCRITURA_PUBLICA: '9f5fec74-af8b-4105-a4fd-3f3df3568716' as const,

  /** Fotografías del avance y estado de la obra */
  FOTO_PROGRESO: 'd57e28c2-1fdd-4020-879c-732684eaa4c8' as const,

  /** Licencias de construcción y permisos municipales */
  LICENCIA_PERMISO: '992be01e-693f-4e7b-a583-5a45c125b113' as const,

  /** Planos, diseños y renders de la vivienda */
  PLANO_ARQUITECTONICO: 'a619437b-4edb-49e9-8ead-27dc65da38a7' as const,

  /** Recibos de servicios públicos y pagos */
  RECIBO_SERVICIOS: '8d6e704b-ce42-44d2-816b-292f2026ad90' as const,
} as const

export type CategoriaIdVivienda =
  (typeof CATEGORIA_IDS_VIVIENDAS)[keyof typeof CATEGORIA_IDS_VIVIENDAS]

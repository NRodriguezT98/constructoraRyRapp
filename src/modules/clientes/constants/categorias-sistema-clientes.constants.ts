/**
 * @file categorias-sistema-clientes.constants.ts
 * @description Categorías del sistema para módulo CLIENTES
 * ⚠️ UUIDs FIJOS: NO modificar, usados en triggers y validaciones
 *
 * Estas categorías se crean automáticamente si no existen.
 * Se recrean con los mismos UUIDs si se eliminan para garantizar
 * compatibilidad con triggers, documentos pendientes y otros módulos.
 *
 * @generated 2025-12-04 - Extraídas desde base de datos en producción
 */

export const CATEGORIAS_SISTEMA_CLIENTES = [
  {
    id: 'b795b842-f035-42ce-9ab9-7fef2e1c5f24',
    nombre: 'Documentos de Identidad',
    descripcion:
      'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación',
    color: 'green',
    icono: 'IdCard',
    orden: 1,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  {
    id: 'bd49740e-d46d-43c8-973f-196f1418765c',
    nombre: 'Certificados de Tradición',
    descripcion:
      'Certificados de tradición y libertad, certificados de dominio y propiedad',
    color: 'yellow',
    icono: 'FileText',
    orden: 2,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  {
    id: 'a82ca714-b191-4976-a089-66c031ff1496',
    nombre: 'Escrituras Públicas',
    descripcion: 'Minutas de compraventa',
    color: 'pink',
    icono: 'ScrollText',
    orden: 3,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  {
    id: '4898e798-c188-4f02-bfcf-b2b15be48e34',
    nombre:
      'Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso',
    descripcion:
      'Cartas de aprobación, promesas de compraventa, actas de entrega, resoluciones, documentos del proceso legal',
    color: 'cyan',
    icono: 'FileSignature',
    orden: 4,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  {
    id: 'f84ec757-2f11-4245-a487-5091176feec5',
    nombre: 'Gastos Notariales, Avalúos y Paz y salvos',
    descripcion:
      'Estudio de títulos, avalúos comerciales, gastos notariales, paz y salvos',
    color: '#F59E0B',
    icono: 'receipt',
    orden: 5,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
  {
    id: 'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade',
    nombre: 'Otros Documentos',
    descripcion: 'Fotos, correspondencia, documentos generales y varios',
    color: '#6B7280',
    icono: 'folder',
    orden: 6,
    es_sistema: true,
    modulos_permitidos: ['clientes'],
  },
] as const

/**
 * IDs de categorías tipados para usar en código
 * Ejemplo: CATEGORIA_IDS.DOCUMENTOS_IDENTIDAD
 */
export const CATEGORIA_IDS = {
  /** Cédula del cliente, documentos de identificación */
  DOCUMENTOS_IDENTIDAD: 'b795b842-f035-42ce-9ab9-7fef2e1c5f24' as const,

  /** Certificados de tradición y libertad */
  CERTIFICADOS_TRADICION: 'bd49740e-d46d-43c8-973f-196f1418765c' as const,

  /** Escrituras públicas, minutas de compraventa */
  ESCRITURAS_PUBLICAS: 'a82ca714-b191-4976-a089-66c031ff1496' as const,

  /** Cartas de aprobación, promesas, actas, documentos del proceso */
  DOCUMENTOS_PROCESO: '4898e798-c188-4f02-bfcf-b2b15be48e34' as const,

  /** Gastos notariales, avalúos, paz y salvos */
  GASTOS_NOTARIALES: 'f84ec757-2f11-4245-a487-5091176feec5' as const,

  /** Otros documentos varios */
  OTROS_DOCUMENTOS: 'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade' as const,
} as const

/**
 * Tipo auxiliar para IDs de categorías
 */
export type CategoriaClienteId =
  (typeof CATEGORIA_IDS)[keyof typeof CATEGORIA_IDS]

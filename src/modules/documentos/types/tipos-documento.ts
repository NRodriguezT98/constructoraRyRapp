/**
 * Tipos de documento permitidos para validación automática
 * de requisitos de fuentes de pago
 *
 * @module tipos-documento
 * @description Catálogo centralizado de tipos de documento que pueden
 *              vincularse automáticamente con requisitos pendientes
 */

/**
 * Tipos de documento válidos para validación automática
 */
export type TipoDocumentoValidacion =
  | 'boleta_registro'
  | 'certificado_tradicion'
  | 'carta_aprobacion_credito'
  | 'carta_asignacion_subsidio'
  | 'avaluo_vivienda'
  | 'escritura_vivienda'
  | 'minuta_compraventa'
  | 'promesa_compraventa'
  | 'acta_entrega'
  | 'estudio_titulos'

/**
 * Información detallada de cada tipo de documento
 */
export interface TipoDocumentoInfo {
  valor: TipoDocumentoValidacion
  titulo: string
  descripcion: string
  categoria_sugerida: string  // ID de categoría recomendada
  icono: string  // Lucide icon name
}

/**
 * Catálogo completo de tipos de documento
 * con sus metadatos asociados
 */
export const TIPOS_DOCUMENTO: Record<TipoDocumentoValidacion, TipoDocumentoInfo> = {
  boleta_registro: {
    valor: 'boleta_registro',
    titulo: 'Boleta de Registro',
    descripcion: 'Boleta de registro de escritura pública en oficina de registro',
    categoria_sugerida: '4898e798-c188-4f02-bfcf-b2b15be48e34', // Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso
    icono: 'FileCheck',
  },

  certificado_tradicion: {
    valor: 'certificado_tradicion',
    titulo: 'Certificado de Tradición',
    descripcion: 'Certificado de tradición y libertad del inmueble',
    categoria_sugerida: 'bd49740e-d46d-43c8-973f-196f1418765c', // Certificados de Tradición
    icono: 'FileText',
  },

  carta_aprobacion_credito: {
    valor: 'carta_aprobacion_credito',
    titulo: 'Carta Aprobación Crédito',
    descripcion: 'Carta de aprobación de crédito hipotecario por entidad bancaria',
    categoria_sugerida: '4898e798-c188-4f02-bfcf-b2b15be48e34', // Cartas de aprobación...
    icono: 'FileSignature',
  },

  carta_asignacion_subsidio: {
    valor: 'carta_asignacion_subsidio',
    titulo: 'Carta Asignación Subsidio',
    descripcion: 'Carta de asignación de subsidio de vivienda (Mi Casa Ya, Caja de Compensación)',
    categoria_sugerida: '4898e798-c188-4f02-bfcf-b2b15be48e34', // Cartas de aprobación...
    icono: 'FileSignature',
  },

  avaluo_vivienda: {
    valor: 'avaluo_vivienda',
    titulo: 'Avalúo de Vivienda',
    descripcion: 'Avalúo comercial de la vivienda',
    categoria_sugerida: 'f84ec757-2f11-4245-a487-5091176feec5', // Gastos Notariales, Avalúos...
    icono: 'Home',
  },

  escritura_vivienda: {
    valor: 'escritura_vivienda',
    titulo: 'Escritura de Vivienda',
    descripcion: 'Escritura pública de compraventa del inmueble',
    categoria_sugerida: 'a82ca714-b191-4976-a089-66c031ff1496', // Escrituras Públicas
    icono: 'ScrollText',
  },

  minuta_compraventa: {
    valor: 'minuta_compraventa',
    titulo: 'Minuta de Compraventa',
    descripcion: 'Minuta del contrato de compraventa',
    categoria_sugerida: 'a82ca714-b191-4976-a089-66c031ff1496', // Escrituras Públicas
    icono: 'FileEdit',
  },

  promesa_compraventa: {
    valor: 'promesa_compraventa',
    titulo: 'Promesa de Compraventa',
    descripcion: 'Documento de promesa de compraventa del inmueble',
    categoria_sugerida: '4898e798-c188-4f02-bfcf-b2b15be48e34', // Cartas de aprobación...
    icono: 'Handshake',
  },

  acta_entrega: {
    valor: 'acta_entrega',
    titulo: 'Acta de Entrega',
    descripcion: 'Acta de entrega física del inmueble',
    categoria_sugerida: '4898e798-c188-4f02-bfcf-b2b15be48e34', // Cartas de aprobación...
    icono: 'ClipboardCheck',
  },

  estudio_titulos: {
    valor: 'estudio_titulos',
    titulo: 'Estudio de Títulos',
    descripcion: 'Estudio jurídico de títulos del inmueble',
    categoria_sugerida: 'f84ec757-2f11-4245-a487-5091176feec5', // Gastos Notariales, Avalúos...
    icono: 'Search',
  },
}

/**
 * Array de todos los tipos para iteración
 */
export const TIPOS_DOCUMENTO_ARRAY: TipoDocumentoInfo[] = Object.values(TIPOS_DOCUMENTO)

/**
 * Obtener información de un tipo de documento
 */
export function obtenerInfoTipoDocumento(tipo: TipoDocumentoValidacion | null | undefined): TipoDocumentoInfo | null {
  if (!tipo) return null
  return TIPOS_DOCUMENTO[tipo] || null
}

/**
 * Validar si un tipo de documento es válido
 */
export function esTipoDocumentoValido(tipo: string): tipo is TipoDocumentoValidacion {
  return tipo in TIPOS_DOCUMENTO
}

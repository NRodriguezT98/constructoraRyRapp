/**
 * ============================================
 * CONFIGURACIÓN: Requisitos por Tipo de Fuente de Pago
 * ============================================
 *
 * Define los pasos de validación que deben completarse
 * antes de registrar el desembolso de cada tipo de fuente.
 *
 * Niveles de validación:
 * - DOCUMENTO_OBLIGATORIO: DEBE subir documento ANTES de marcar como completado
 * - DOCUMENTO_OPCIONAL: Puede marcar sin documento (ej: avalúo no siempre disponible)
 * - SOLO_CONFIRMACION: Solo marcar checkbox + fecha + observaciones
 *
 * @version 1.0.0 - 2025-12-11
 */

// ============================================
// TYPES
// ============================================

export enum NivelValidacion {
  DOCUMENTO_OBLIGATORIO = 'DOCUMENTO_OBLIGATORIO',
  DOCUMENTO_OPCIONAL = 'DOCUMENTO_OPCIONAL',
  SOLO_CONFIRMACION = 'SOLO_CONFIRMACION',
}

export interface RequisitoPasoFuente {
  paso: string // Identificador único (snake_case)
  titulo: string // Título para mostrar en UI
  descripcion: string // Descripción del paso
  nivel_validacion: NivelValidacion
  tipo_documento_sugerido?: string // Tipo de documento en sistema de documentos
  categoria_documento_requerida?: string // Categoría para filtrar documentos
  orden: number // Orden de aparición (1, 2, 3...)
  instrucciones?: string // Instrucciones adicionales para el usuario
}

export type TipoFuentePago =
  | 'Cuota Inicial'
  | 'Crédito Hipotecario'
  | 'Subsidio Mi Casa Ya'
  | 'Subsidio Caja de Compensación'
  | 'Subsidio Caja Compensación' // Alias

// ============================================
// CONFIGURACIÓN POR TIPO DE FUENTE
// ============================================

/**
 * CUOTA INICIAL
 * - Sin requisitos de documentación
 * - No requiere validaciones previas al desembolso
 */
export const REQUISITOS_CUOTA_INICIAL: RequisitoPasoFuente[] = []

/**
 * CRÉDITO HIPOTECARIO
 * - 2 pasos simplificados
 * - 1 documento obligatorio + 1 opcional
 */
export const REQUISITOS_CREDITO_HIPOTECARIO: RequisitoPasoFuente[] = [
  {
    paso: 'boleta_registro',
    titulo: 'Boleta de Registro',
    descripcion: 'Documento expedido por la Oficina de Registro que certifica que el inmueble ya es propiedad del cliente',
    nivel_validacion: NivelValidacion.DOCUMENTO_OBLIGATORIO,
    tipo_documento_sugerido: 'Boleta de Registro',
    categoria_documento_requerida: 'escrituras',
    orden: 1,
    instrucciones: 'Sube la boleta oficial expedida por la Oficina de Registro de Instrumentos Públicos que confirma que el inmueble pasó a ser propiedad del cliente.',
  },
  {
    paso: 'solicitud_desembolso',
    titulo: 'Solicitud de Desembolso del Crédito',
    descripcion: 'Evidencia de solicitud de cobro enviada al banco (captura de correo/formulario)',
    nivel_validacion: NivelValidacion.DOCUMENTO_OPCIONAL,
    tipo_documento_sugerido: 'Solicitud Desembolso',
    categoria_documento_requerida: 'credito-hipotecario',
    orden: 2,
    instrucciones: 'Opcional: Sube una captura de pantalla del correo o formulario enviado al banco solicitando el desembolso.',
  },
]

/**
 * SUBSIDIO MI CASA YA
 * - 4 pasos de validación
 * - 2 documentos obligatorios + 1 opcional + 1 confirmación
 */
export const REQUISITOS_SUBSIDIO_MI_CASA_YA: RequisitoPasoFuente[] = [
  {
    paso: 'carta_asignacion',
    titulo: 'Carta de Asignación del Subsidio',
    descripcion: 'Documento oficial del MinVivienda asignando el subsidio',
    nivel_validacion: NivelValidacion.DOCUMENTO_OBLIGATORIO,
    tipo_documento_sugerido: 'Carta Asignación Subsidio',
    categoria_documento_requerida: 'subsidios',
    orden: 1,
    instrucciones: 'Sube la carta de asignación expedida por el Ministerio de Vivienda.',
  },
  {
    paso: 'escritura_firmada',
    titulo: 'Escritura Firmada (Factura Notaría)',
    descripcion: 'Factura emitida por notaría al firmar la minuta de escritura',
    nivel_validacion: NivelValidacion.DOCUMENTO_OBLIGATORIO,
    tipo_documento_sugerido: 'Factura Notaría',
    categoria_documento_requerida: 'escrituras',
    orden: 2,
    instrucciones: 'Sube la factura o recibo de pago de la notaría que certifique la firma de la escritura.',
  },
  {
    paso: 'boleta_registro',
    titulo: 'Boleta de Registro',
    descripcion: 'Documento expedido por la Oficina de Registro al registrar la escritura',
    nivel_validacion: NivelValidacion.DOCUMENTO_OPCIONAL,
    tipo_documento_sugerido: 'Boleta de Registro',
    categoria_documento_requerida: 'escrituras',
    orden: 3,
    instrucciones: 'Si aún no tienes la boleta, puedes marcarlo como completado agregando una observación.',
  },
  {
    paso: 'solicitud_desembolso',
    titulo: 'Solicitud de Desembolso del Subsidio',
    descripcion: 'Confirmación de envío de solicitud de desembolso al MinVivienda',
    nivel_validacion: NivelValidacion.SOLO_CONFIRMACION,
    categoria_documento_requerida: 'subsidios',
    orden: 4,
    instrucciones: 'Confirma que se envió la solicitud de desembolso. Opcionalmente puedes subir evidencia.',
  },
]

/**
 * SUBSIDIO CAJA DE COMPENSACIÓN
 * - 4 pasos de validación (similar a Mi Casa Ya)
 */
export const REQUISITOS_SUBSIDIO_CAJA_COMPENSACION: RequisitoPasoFuente[] = [
  {
    paso: 'carta_asignacion',
    titulo: 'Carta de Asignación del Subsidio',
    descripcion: 'Documento oficial de la Caja de Compensación asignando el subsidio',
    nivel_validacion: NivelValidacion.DOCUMENTO_OBLIGATORIO,
    tipo_documento_sugerido: 'Carta Asignación Subsidio',
    categoria_documento_requerida: 'subsidios',
    orden: 1,
    instrucciones: 'Sube la carta de asignación expedida por la Caja de Compensación.',
  },
  {
    paso: 'escritura_firmada',
    titulo: 'Escritura Firmada (Factura Notaría)',
    descripcion: 'Factura emitida por notaría al firmar la minuta de escritura',
    nivel_validacion: NivelValidacion.DOCUMENTO_OBLIGATORIO,
    tipo_documento_sugerido: 'Factura Notaría',
    categoria_documento_requerida: 'escrituras',
    orden: 2,
    instrucciones: 'Sube la factura o recibo de pago de la notaría que certifique la firma de la escritura.',
  },
  {
    paso: 'boleta_registro',
    titulo: 'Boleta de Registro',
    descripcion: 'Documento expedido por la Oficina de Registro al registrar la escritura',
    nivel_validacion: NivelValidacion.DOCUMENTO_OPCIONAL,
    tipo_documento_sugerido: 'Boleta de Registro',
    categoria_documento_requerida: 'escrituras',
    orden: 3,
    instrucciones: 'Si aún no tienes la boleta, puedes marcarlo como completado agregando una observación.',
  },
  {
    paso: 'solicitud_desembolso',
    titulo: 'Solicitud de Desembolso del Subsidio',
    descripcion: 'Confirmación de envío de solicitud de desembolso a la Caja',
    nivel_validacion: NivelValidacion.SOLO_CONFIRMACION,
    categoria_documento_requerida: 'subsidios',
    orden: 4,
    instrucciones: 'Confirma que se envió la solicitud de desembolso. Opcionalmente puedes subir evidencia.',
  },
]

// ============================================
// MAPA DE REQUISITOS POR TIPO
// ============================================

export const REQUISITOS_POR_TIPO: Record<TipoFuentePago, RequisitoPasoFuente[]> = {
  'Cuota Inicial': REQUISITOS_CUOTA_INICIAL,
  'Crédito Hipotecario': REQUISITOS_CREDITO_HIPOTECARIO,
  'Subsidio Mi Casa Ya': REQUISITOS_SUBSIDIO_MI_CASA_YA,
  'Subsidio Caja de Compensación': REQUISITOS_SUBSIDIO_CAJA_COMPENSACION,
  'Subsidio Caja Compensación': REQUISITOS_SUBSIDIO_CAJA_COMPENSACION, // Alias
}

// ============================================
// FUNCIÓN AUXILIAR
// ============================================

/**
 * Obtener requisitos para un tipo de fuente de pago
 */
export function obtenerRequisitosParaTipoFuente(tipoFuente: string): RequisitoPasoFuente[] {
  const requisitos = REQUISITOS_POR_TIPO[tipoFuente as TipoFuentePago]

  if (!requisitos) {
    console.warn(`⚠️ No hay requisitos configurados para tipo de fuente: "${tipoFuente}"`)
    return []
  }

  return requisitos
}

/**
 * Verificar si un tipo de fuente requiere validaciones
 */
export function requiereValidaciones(tipoFuente: string): boolean {
  const requisitos = obtenerRequisitosParaTipoFuente(tipoFuente)
  return requisitos.length > 0
}

/**
 * ============================================
 * TIPOS: Configuración de Requisitos de Fuentes
 * ============================================
 */

export type NivelValidacion =
  | 'DOCUMENTO_OBLIGATORIO'
  | 'DOCUMENTO_OPCIONAL'
  | 'SOLO_CONFIRMACION'

export type AlcanceRequisito = 'ESPECIFICO_FUENTE' | 'COMPARTIDO_CLIENTE'

export interface RequisitoFuenteConfig {
  id: string
  tipo_fuente: string
  paso_identificador: string
  titulo: string
  descripcion: string | null
  instrucciones: string | null
  nivel_validacion: NivelValidacion
  tipo_documento_sugerido: string | null
  categoria_documento: string | null
  alcance: AlcanceRequisito | null
  /** Solo para COMPARTIDO_CLIENTE. NULL = aplica a todas las fuentes. Array = solo esas fuentes. */
  fuentes_aplicables: string[] | null
  orden: number
  activo: boolean
  version: number
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_creacion: string | null
  usuario_actualizacion: string | null
}

export interface CrearRequisitoDTO {
  tipo_fuente: string | string[] // ✅ Ahora acepta array para múltiples fuentes
  paso_identificador: string
  titulo: string
  descripcion?: string
  instrucciones?: string
  nivel_validacion: NivelValidacion
  tipo_documento_sugerido?: string
  categoria_documento?: string
  alcance?: AlcanceRequisito // ✅ Campo nuevo
  /** Solo para COMPARTIDO_CLIENTE. NULL = aplica a todas las fuentes. Array = solo esas fuentes. */
  fuentes_aplicables?: string[] | null
  orden?: number
}

export interface ActualizarRequisitoDTO {
  titulo?: string
  descripcion?: string
  instrucciones?: string
  nivel_validacion?: NivelValidacion
  tipo_documento_sugerido?: string
  categoria_documento?: string
  /** Solo para COMPARTIDO_CLIENTE. NULL = aplica a todas. Array = solo esas fuentes. */
  fuentes_aplicables?: string[] | null
  orden?: number
  activo?: boolean
}

// ❌ DEPRECADO: No usar este array hardcodeado
// ✅ CORRECTO: Usar useTiposFuente() hook que carga dinámicamente desde tipos_fuentes_pago
export const TIPOS_FUENTE_DEPRECADO = [
  'Cuota Inicial',
  'Crédito Hipotecario',
  'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación', // Nombre oficial del catálogo (sin "de")
] as const

export const NIVELES_VALIDACION: { value: NivelValidacion; label: string; color: string }[] = [
  {
    value: 'DOCUMENTO_OBLIGATORIO',
    label: 'Documento Obligatorio',
    color: 'red'
  },
  {
    value: 'DOCUMENTO_OPCIONAL',
    label: 'Documento Opcional',
    color: 'yellow'
  },
  {
    value: 'SOLO_CONFIRMACION',
    label: 'Solo Confirmación',
    color: 'green'
  },
]

export const ALCANCES_REQUISITO: { value: AlcanceRequisito; label: string; descripcion: string }[] = [
  {
    value: 'ESPECIFICO_FUENTE',
    label: 'Específico por Fuente',
    descripcion: 'El cliente debe subir un documento diferente para cada fuente (ej: Carta de Aprobación)'
  },
  {
    value: 'COMPARTIDO_CLIENTE',
    label: 'Compartido entre Fuentes',
    descripcion: 'Un solo documento aplica para todas las fuentes seleccionadas (ej: Boleta de Registro)'
  },
]

export const CATEGORIAS_DOCUMENTO = [
  'escrituras',
  'credito-hipotecario',
  'subsidios',
  'identificacion',
  'pagos',
  'otros',
] as const

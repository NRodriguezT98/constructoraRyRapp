/**
 * Types: Sistema de Campos Dinámicos para Fuentes de Pago
 *
 * Define la estructura de configuración de campos que se almacena en BD
 * y se utiliza para renderizar formularios dinámicamente.
 */

// ============================================
// TIPOS DE CAMPOS SOPORTADOS
// ============================================

export type TipoCampoDinamico =
  | 'text'              // Input de texto simple
  | 'textarea'          // Área de texto
  | 'number'            // Input numérico
  | 'currency'          // Input de moneda (con formato COP)
  | 'date'              // Selector de fecha
  | 'select_banco'      // Select con bancos desde BD
  | 'select_caja'       // Select con cajas desde BD
  | 'select_custom'     // Select con opciones custom
  | 'checkbox'          // Checkbox
  | 'radio'             // Radio buttons

// ============================================
// ROLES DE CAMPOS (para identificar propósito)
// ============================================

/**
 * Rol del campo: identifica el propósito del campo en el sistema
 *
 * - monto: Campo que contiene el valor monetario principal (usado para cálculos)
 * - entidad: Campo que identifica la entidad financiera (banco, caja)
 * - referencia: Campo con número de referencia/radicado
 * - informativo: Campo adicional sin propósito crítico
 */
export type RolCampo = 'monto' | 'entidad' | 'referencia' | 'informativo'

// ============================================
// CONFIGURACIÓN DE UN CAMPO
// ============================================

export interface CampoConfig {
  // Identificación
  nombre: string                    // Nombre del campo (key en el objeto)
  tipo: TipoCampoDinamico           // Tipo de input a renderizar
  rol: RolCampo                     // 🔥 ROL: propósito del campo en el sistema

  // UI
  label: string                     // Etiqueta a mostrar
  placeholder?: string              // Placeholder del input
  ayuda?: string                    // Texto de ayuda debajo del campo

  // Validación
  requerido: boolean                // Si es campo obligatorio
  orden: number                     // Orden de aparición (para ordenar)

  // Opciones (para selects/radios)
  opciones?: Array<{
    value: string
    label: string
  }>

  // Validaciones adicionales
  min?: number                      // Mínimo (para numbers/currency)
  max?: number                      // Máximo (para numbers/currency)
  pattern?: string                  // Regex de validación
  mensajeError?: string             // Mensaje de error personalizado

  // Condicionales (futuro)
  mostrarSi?: {
    campo: string
    valor: any
  }
}

// ============================================
// CONFIGURACIÓN COMPLETA DE CAMPOS
// ============================================

export interface ConfiguracionCampos {
  campos: CampoConfig[]
}

// ============================================
// TIPO DE FUENTE PAGO CON CONFIGURACIÓN
// ============================================

export interface TipoFuentePagoConCampos {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  color: string
  icono: string
  activo: boolean
  orden: number
  requiere_entidad: boolean
  permite_multiples_abonos: boolean
  es_subsidio: boolean
  configuracion_campos: ConfiguracionCampos
  created_at: string
  updated_at: string
}

// ============================================
// VALOR DE CAMPO (para el formulario)
// ============================================

export type ValorCampo = string | number | boolean | null

export type ValoresCampos = Record<string, ValorCampo>

// ============================================
// ERRORES DE VALIDACIÓN
// ============================================

export type ErroresCampos = Record<string, string | undefined>

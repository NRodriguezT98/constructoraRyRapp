/**
 * Utilidades para trabajar con campos dinámicos de fuentes de pago
 */

import type {
  CampoConfig,
  RolCampo,
  ValorCampo,
} from '@/modules/configuracion/types/campos-dinamicos.types'

import type { FuentePagoConfig } from '../components/asignar-vivienda/types'

/**
 * Obtiene el valor de un campo por su rol
 *
 * @param config - Configuración de la fuente de pago
 * @param camposConfig - Configuración de campos desde BD
 * @param rol - Rol del campo a buscar
 * @returns Valor del campo o undefined si no existe
 *
 * @example
 * const monto = obtenerValorPorRol(config, camposConfig, 'monto')
 * const entidad = obtenerValorPorRol(config, camposConfig, 'entidad')
 */
export function obtenerValorPorRol(
  config: FuentePagoConfig | null,
  camposConfig: CampoConfig[],
  rol: RolCampo
): ValorCampo | undefined {
  if (!config) return undefined

  // Buscar campo con el rol especificado
  const campo = camposConfig.find(c => c.rol === rol)
  if (!campo) return undefined

  // Retornar valor del campo
  return config.campos?.[campo.nombre]
}

/**
 * Obtiene el monto principal de una fuente de pago
 *
 * Busca el campo con rol='monto' o nombres convencionales como fallback
 *
 * @param config - Configuración de la fuente de pago
 * @param camposConfig - Configuración de campos desde BD
 * @returns Monto como número o 0 si no existe
 *
 * @example
 * const monto = obtenerMonto(fuente.config, tipoConCampos.configuracion_campos.campos)
 */
export function obtenerMonto(
  config: FuentePagoConfig | null,
  camposConfig: CampoConfig[]
): number {
  if (!config) return 0

  // 1. Intentar por rol='monto'
  const valorRol = obtenerValorPorRol(config, camposConfig, 'monto')
  if (valorRol !== undefined) {
    return Number(valorRol)
  }

  // 2. Fallback: buscar por nombre convencional
  if (config.campos) {
    const campoMonto = Object.entries(config.campos).find(([nombre]) =>
      ['monto_aprobado', 'monto', 'valor'].includes(nombre)
    )
    if (campoMonto) {
      return Number(campoMonto[1])
    }
  }

  // 3. Legacy: usar propiedad directa
  return config.monto_aprobado || 0
}

/**
 * Obtiene el monto que cuenta para el cierre financiero de la vivienda.
 *
 * Para créditos con la constructora (`genera_cuotas = true`) usa `capital_para_cierre`
 * (solo el capital, sin intereses) porque los intereses son ganancia del prestamista,
 * no parte del precio de la vivienda.
 *
 * Para cualquier otra fuente devuelve el mismo resultado que `obtenerMonto`.
 *
 * @example
 * // Casa $122M, crédito constructora $13M capital + $0.78M intereses
 * // → devuelve $13M (no $13.78M)
 * const monto = obtenerMontoParaCierre(config, tipoConCampos, camposConfig)
 */
export function obtenerMontoParaCierre(
  config: FuentePagoConfig | null,
  tipoConCampos:
    | import('@/modules/configuracion/types/campos-dinamicos.types').TipoFuentePagoConCampos
    | undefined,
  camposConfig: CampoConfig[]
): number {
  if (!config) return 0
  if (
    tipoConCampos?.logica_negocio?.genera_cuotas &&
    config.capital_para_cierre != null &&
    config.capital_para_cierre > 0
  ) {
    return config.capital_para_cierre
  }
  return obtenerMonto(config, camposConfig)
}

/**
 * Obtiene la entidad financiera de una fuente de pago
 *
 * @param config - Configuración de la fuente de pago
 * @param camposConfig - Configuración de campos desde BD
 * @returns Nombre de la entidad o cadena vacía
 */
export function obtenerEntidad(
  config: FuentePagoConfig | null,
  camposConfig: CampoConfig[]
): string {
  if (!config) return ''

  // 1. Intentar por rol='entidad'
  const valorRol = obtenerValorPorRol(config, camposConfig, 'entidad')
  if (valorRol !== undefined) {
    return String(valorRol)
  }

  // 2. Fallback: buscar por nombre convencional
  if (config.campos) {
    const campoEntidad = Object.entries(config.campos).find(([nombre]) =>
      ['entidad', 'banco', 'caja'].includes(nombre)
    )
    if (campoEntidad) {
      return String(campoEntidad[1])
    }
  }

  // 3. Legacy: usar propiedad directa
  return config.entidad || ''
}

/**
 * Obtiene el número de referencia de una fuente de pago
 *
 * @param config - Configuración de la fuente de pago
 * @param camposConfig - Configuración de campos desde BD
 * @returns Número de referencia o cadena vacía
 */
export function obtenerReferencia(
  config: FuentePagoConfig | null,
  camposConfig: CampoConfig[]
): string {
  if (!config) return ''

  // 1. Intentar por rol='referencia'
  const valorRol = obtenerValorPorRol(config, camposConfig, 'referencia')
  if (valorRol !== undefined) {
    return String(valorRol)
  }

  // 2. Fallback: buscar por nombre convencional
  if (config.campos) {
    const campoRef = Object.entries(config.campos).find(([nombre]) =>
      ['numero_referencia', 'referencia', 'radicado'].includes(nombre)
    )
    if (campoRef) {
      return String(campoRef[1])
    }
  }

  // 3. Legacy: usar propiedad directa
  return config.numero_referencia || ''
}

/**
 * Obtiene el campo marcado como monto principal
 *
 * @param camposConfig - Array de configuraciones de campos
 * @returns Campo con rol='monto' o undefined
 */
export function obtenerCampoMonto(
  camposConfig: CampoConfig[]
): CampoConfig | undefined {
  return camposConfig.find(c => c.rol === 'monto')
}

/**
 * Valida que exista al menos un campo con rol='monto'
 *
 * @param camposConfig - Array de configuraciones de campos
 * @returns true si existe campo de monto, false en caso contrario
 */
export function validarTieneCampoMonto(camposConfig: CampoConfig[]): boolean {
  return camposConfig.some(c => c.rol === 'monto')
}

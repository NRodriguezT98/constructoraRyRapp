/**
 * Listas de entidades por tipo de fuente para selects del modal de rebalanceo.
 */

import { esCreditoHipotecario, esSubsidioCajaCompensacion } from '@/shared/constants/fuentes-pago.constants'

export const BANCOS_HIPOTECARIO = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Banco Caja Social',
  'Banco AV Villas',
  'Banco Agrario',
  'Fondo Nacional del Ahorro',
  'Banco Pichincha',
  'Scotiabank Colpatria',
  'Itaú',
  'Otro',
] as const

export const CAJAS_COMPENSACION_LIST = [
  'Comfenalco',
  'Comfandi',
  'Compensar',
  'Comfama',
  'Cafam',
  'Comfamiliar',
  'Comfacor',
  'Comparta',
  'Cofrem',
  'Comfacundi',
  'Comfaoriente',
  'Comfamiliar Risaralda',
  'Otro',
] as const

export function getEntidadesParaTipo(tipo: string): readonly string[] {
  if (esCreditoHipotecario(tipo)) return BANCOS_HIPOTECARIO
  if (esSubsidioCajaCompensacion(tipo)) return CAJAS_COMPENSACION_LIST
  return []
}

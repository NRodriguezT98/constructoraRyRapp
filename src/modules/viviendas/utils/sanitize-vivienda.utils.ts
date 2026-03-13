/**
 * 🧹 SANITIZADORES ESPECÍFICOS PARA MÓDULO DE VIVIENDAS
 *
 * Funciones especializadas para sanitizar DTOs de viviendas
 * antes de enviarlos a la base de datos.
 */

import { sanitizeString } from '@/lib/utils/sanitize.utils'
import type { ViviendaFormData } from '../types'

/**
 * Sanitizar datos de creación de vivienda
 * Convierte strings vacíos a null en campos opcionales
 */
export function sanitizeViviendaFormData(datos: ViviendaFormData): ViviendaFormData {
  return {
    ...datos,
    // Campos obligatorios (strings)
    proyecto_id: datos.proyecto_id,
    manzana_id: datos.manzana_id,
    numero: sanitizeString(datos.numero) || '',

    // Linderos (opcionales)
    lindero_norte: sanitizeString(datos.lindero_norte) || '',
    lindero_sur: sanitizeString(datos.lindero_sur) || '',
    lindero_oriente: sanitizeString(datos.lindero_oriente) || '',
    lindero_occidente: sanitizeString(datos.lindero_occidente) || '',

    // Información Legal (opcionales)
    matricula_inmobiliaria: sanitizeString(datos.matricula_inmobiliaria) || '',
    nomenclatura: sanitizeString(datos.nomenclatura) || '',

    // Numéricos y archivo (no requieren sanitización)
    area_lote: datos.area_lote,
    area_construida: datos.area_construida,
    tipo_vivienda: datos.tipo_vivienda,
    certificado_tradicion_file: datos.certificado_tradicion_file,
    valor_base: datos.valor_base,
    es_esquinera: datos.es_esquinera,
    recargo_esquinera: datos.recargo_esquinera,
  }
}

/**
 * Sanitizar datos de actualización parcial de vivienda
 * Solo sanitiza campos que existen en el objeto
 */
export function sanitizeViviendaUpdate(
  datos: Partial<ViviendaFormData>
): Partial<ViviendaFormData> {
  const sanitized: Partial<ViviendaFormData> = {}

  if ('proyecto_id' in datos) sanitized.proyecto_id = datos.proyecto_id!
  if ('manzana_id' in datos) sanitized.manzana_id = datos.manzana_id!
  if ('numero' in datos) sanitized.numero = sanitizeString(datos.numero) || ''

  if ('lindero_norte' in datos) sanitized.lindero_norte = sanitizeString(datos.lindero_norte) ?? undefined
  if ('lindero_sur' in datos) sanitized.lindero_sur = sanitizeString(datos.lindero_sur) ?? undefined
  if ('lindero_oriente' in datos) sanitized.lindero_oriente = sanitizeString(datos.lindero_oriente) ?? undefined
  if ('lindero_occidente' in datos) sanitized.lindero_occidente = sanitizeString(datos.lindero_occidente) ?? undefined

  if ('matricula_inmobiliaria' in datos) {
    sanitized.matricula_inmobiliaria = sanitizeString(datos.matricula_inmobiliaria) ?? undefined
  }
  if ('nomenclatura' in datos) {
    sanitized.nomenclatura = sanitizeString(datos.nomenclatura) ?? undefined
  }

  if ('area_lote' in datos) sanitized.area_lote = datos.area_lote
  if ('area_construida' in datos) sanitized.area_construida = datos.area_construida
  if ('tipo_vivienda' in datos) sanitized.tipo_vivienda = datos.tipo_vivienda
  if ('valor_base' in datos) sanitized.valor_base = datos.valor_base
  if ('es_esquinera' in datos) sanitized.es_esquinera = datos.es_esquinera
  if ('recargo_esquinera' in datos) sanitized.recargo_esquinera = datos.recargo_esquinera

  return sanitized
}

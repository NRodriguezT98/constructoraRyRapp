/**
 * 🧹 SANITIZADORES ESPECÍFICOS PARA MÓDULO DE PROYECTOS
 *
 * Funciones especializadas para sanitizar DTOs de proyectos
 * antes de enviarlos a la base de datos.
 */

import { sanitizeDate, sanitizeString } from '@/lib/utils/sanitize.utils'
import type { ManzanaFormData, ProyectoFormData } from '../types'

/**
 * Sanitizar datos de creación/actualización de proyecto
 * Convierte strings vacíos a null y valida fechas
 */
export function sanitizeProyectoFormData(datos: ProyectoFormData): ProyectoFormData {
  return {
    ...datos,
    // Campos obligatorios (strings)
    nombre: sanitizeString(datos.nombre) || '',
    descripcion: sanitizeString(datos.descripcion) || '',
    ubicacion: sanitizeString(datos.ubicacion) || '',

    // Fechas opcionales
    fechaInicio: sanitizeDate(datos.fechaInicio),
    fechaFinEstimada: sanitizeDate(datos.fechaFinEstimada),

    // Campos numéricos y estado (no requieren sanitización)
    presupuesto: datos.presupuesto,
    estado: datos.estado,

    // Manzanas (sanitizar recursivamente)
    manzanas: datos.manzanas.map(sanitizeManzanaFormData),
  }
}

/**
 * Sanitizar datos de manzana
 */
export function sanitizeManzanaFormData(datos: ManzanaFormData): ManzanaFormData {
  return {
    ...datos,
    // Campos obligatorios
    nombre: sanitizeString(datos.nombre) || '',

    // Campo opcional
    ubicacion: sanitizeString(datos.ubicacion) ?? undefined,

    // Numéricos (no requieren sanitización)
    totalViviendas: datos.totalViviendas,
    precioBase: datos.precioBase,
    superficieTotal: datos.superficieTotal,
  }
}

/**
 * Sanitizar datos de actualización parcial de proyecto
 * Solo sanitiza campos que existen en el objeto
 */
export function sanitizeProyectoUpdate(
  datos: Partial<ProyectoFormData>
): Partial<ProyectoFormData> {
  const sanitized: Partial<ProyectoFormData> = {}

  if ('nombre' in datos) sanitized.nombre = sanitizeString(datos.nombre) || ''
  if ('descripcion' in datos) sanitized.descripcion = sanitizeString(datos.descripcion) || ''
  if ('ubicacion' in datos) sanitized.ubicacion = sanitizeString(datos.ubicacion) || ''
  if ('fechaInicio' in datos) sanitized.fechaInicio = sanitizeDate(datos.fechaInicio)
  if ('fechaFinEstimada' in datos) sanitized.fechaFinEstimada = sanitizeDate(datos.fechaFinEstimada)
  if ('presupuesto' in datos) sanitized.presupuesto = datos.presupuesto
  if ('estado' in datos) sanitized.estado = datos.estado
  if ('manzanas' in datos && datos.manzanas) {
    sanitized.manzanas = datos.manzanas.map(sanitizeManzanaFormData)
  }

  return sanitized
}

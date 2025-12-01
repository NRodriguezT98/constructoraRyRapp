/**
 * ============================================
 * HOOK: useDetectarCambios (Clientes)
 * ============================================
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * Hook que detecta cambios entre datos originales y editados.
 * Usado en modal de confirmación de cambios.
 *
 * Basado en: src/modules/proyectos/hooks/useDetectarCambios.ts
 */

import { useMemo } from 'react'

import { formatDateShort } from '@/lib/utils/date.utils'
import type { Cliente } from '@/modules/clientes/types'

export interface Cambio {
  campo: string
  valorAnterior: any
  valorNuevo: any
  tipo?: 'texto' | 'fecha' | 'numero' | 'select'
}

interface ClienteFormData {
  nombres: string
  apellidos: string
  tipo_documento: string
  numero_documento: string
  fecha_nacimiento?: string
  telefono?: string
  telefono_alternativo?: string
  email?: string
  direccion?: string
  ciudad?: string
  departamento?: string
  estado_civil?: string
  notas?: string
  estado?: 'Interesado' | 'Activo' | 'Inactivo'
}

/**
 * Hook para detectar cambios entre datos originales y editados
 */
export function useDetectarCambios(
  datosOriginales: Cliente | null,
  datosEditados: ClienteFormData | null
): Cambio[] {
  return useMemo(() => {
    if (!datosOriginales || !datosEditados) return []

    const cambios: Cambio[] = []

    // ⭐ Nombres
    if (datosOriginales.nombres !== datosEditados.nombres) {
      cambios.push({
        campo: 'Nombres',
        valorAnterior: datosOriginales.nombres,
        valorNuevo: datosEditados.nombres,
        tipo: 'texto',
      })
    }

    // ⭐ Apellidos
    if (datosOriginales.apellidos !== datosEditados.apellidos) {
      cambios.push({
        campo: 'Apellidos',
        valorAnterior: datosOriginales.apellidos,
        valorNuevo: datosEditados.apellidos,
        tipo: 'texto',
      })
    }

    // ⭐ Tipo de Documento
    if (datosOriginales.tipo_documento !== datosEditados.tipo_documento) {
      cambios.push({
        campo: 'Tipo de Documento',
        valorAnterior: datosOriginales.tipo_documento,
        valorNuevo: datosEditados.tipo_documento,
        tipo: 'select',
      })
    }

    // ⭐ Número de Documento
    if (datosOriginales.numero_documento !== datosEditados.numero_documento) {
      cambios.push({
        campo: 'Número de Documento',
        valorAnterior: datosOriginales.numero_documento,
        valorNuevo: datosEditados.numero_documento,
        tipo: 'texto',
      })
    }

    // ⭐ Fecha de Nacimiento
    const fechaNacimientoOriginal = datosOriginales.fecha_nacimiento || ''
    const fechaNacimientoEditada = datosEditados.fecha_nacimiento || ''
    if (fechaNacimientoOriginal !== fechaNacimientoEditada) {
      cambios.push({
        campo: 'Fecha de Nacimiento',
        valorAnterior: fechaNacimientoOriginal ? formatDateShort(fechaNacimientoOriginal) : 'Sin fecha',
        valorNuevo: fechaNacimientoEditada ? formatDateShort(fechaNacimientoEditada) : 'Sin fecha',
        tipo: 'fecha',
      })
    }

    // ⭐ Teléfono
    const telefonoOriginal = datosOriginales.telefono || ''
    const telefonoEditado = datosEditados.telefono || ''
    if (telefonoOriginal !== telefonoEditado) {
      cambios.push({
        campo: 'Teléfono',
        valorAnterior: telefonoOriginal || 'Sin teléfono',
        valorNuevo: telefonoEditado || 'Sin teléfono',
        tipo: 'texto',
      })
    }

    // ⭐ Teléfono Alternativo
    const telefonoAltOriginal = datosOriginales.telefono_alternativo || ''
    const telefonoAltEditado = datosEditados.telefono_alternativo || ''
    if (telefonoAltOriginal !== telefonoAltEditado) {
      cambios.push({
        campo: 'Teléfono Alternativo',
        valorAnterior: telefonoAltOriginal || 'Sin teléfono',
        valorNuevo: telefonoAltEditado || 'Sin teléfono',
        tipo: 'texto',
      })
    }

    // ⭐ Email
    const emailOriginal = datosOriginales.email || ''
    const emailEditado = datosEditados.email || ''
    if (emailOriginal !== emailEditado) {
      cambios.push({
        campo: 'Email',
        valorAnterior: emailOriginal || 'Sin email',
        valorNuevo: emailEditado || 'Sin email',
        tipo: 'texto',
      })
    }

    // ⭐ Dirección
    const direccionOriginal = datosOriginales.direccion || ''
    const direccionEditada = datosEditados.direccion || ''
    if (direccionOriginal !== direccionEditada) {
      cambios.push({
        campo: 'Dirección',
        valorAnterior: direccionOriginal || 'Sin dirección',
        valorNuevo: direccionEditada || 'Sin dirección',
        tipo: 'texto',
      })
    }

    // ⭐ Ciudad
    const ciudadOriginal = datosOriginales.ciudad || ''
    const ciudadEditada = datosEditados.ciudad || ''
    if (ciudadOriginal !== ciudadEditada) {
      cambios.push({
        campo: 'Ciudad',
        valorAnterior: ciudadOriginal || 'Sin ciudad',
        valorNuevo: ciudadEditada || 'Sin ciudad',
        tipo: 'texto',
      })
    }

    // ⭐ Departamento
    const departamentoOriginal = datosOriginales.departamento || ''
    const departamentoEditado = datosEditados.departamento || ''
    if (departamentoOriginal !== departamentoEditado) {
      cambios.push({
        campo: 'Departamento',
        valorAnterior: departamentoOriginal || 'Sin departamento',
        valorNuevo: departamentoEditado || 'Sin departamento',
        tipo: 'texto',
      })
    }

    // ⭐ Estado Civil
    const estadoCivilOriginal = datosOriginales.estado_civil || ''
    const estadoCivilEditado = datosEditados.estado_civil || ''
    if (estadoCivilOriginal !== estadoCivilEditado) {
      cambios.push({
        campo: 'Estado Civil',
        valorAnterior: estadoCivilOriginal || 'Sin especificar',
        valorNuevo: estadoCivilEditado || 'Sin especificar',
        tipo: 'select',
      })
    }

    // ⭐ Notas
    const notasOriginal = datosOriginales.notas || ''
    const notasEditadas = datosEditados.notas || ''
    if (notasOriginal !== notasEditadas) {
      cambios.push({
        campo: 'Notas',
        valorAnterior: notasOriginal || 'Sin notas',
        valorNuevo: notasEditadas || 'Sin notas',
        tipo: 'texto',
      })
    }

    // ⭐ Estado
    if (datosEditados.estado && datosOriginales.estado !== datosEditados.estado) {
      cambios.push({
        campo: 'Estado',
        valorAnterior: datosOriginales.estado,
        valorNuevo: datosEditados.estado,
        tipo: 'select',
      })
    }

    return cambios
  }, [datosOriginales, datosEditados])
}

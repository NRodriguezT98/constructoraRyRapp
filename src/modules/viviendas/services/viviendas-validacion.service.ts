/**
 * 🔐 Servicio de Validación y Bloqueo de Viviendas
 *
 * Responsabilidad:
 * - Verificar estado de bloqueo de edición según negociaciones
 * - Validar permisos por campo (matrícula, dirección, área, valor)
 * - Determinar campos editables/restringidos/bloqueados
 *
 * Regla de Oro: Minuta firmada = BLOQUEO TOTAL
 */

import { supabase } from '@/lib/supabase/client'
import type { Vivienda } from '@/lib/supabase/database.types'

// ============================================================
// TIPOS
// ============================================================

export interface EstadoBloqueoVivienda {
  bloqueadaCompletamente: boolean
  razonBloqueo?: string
  negociacionBloqueante?: {
    id: string
    estado: string
    fecha_firma_minuta: string | null
    cliente_nombre: string
  }
  camposEditables: string[]
  camposRestringidos: string[] // Requieren Admin + motivo
  camposBloqueados: string[] // NO editables bajo ninguna circunstancia
}

export interface ValidacionCampo {
  puedeEditar: boolean
  requiereAdmin: boolean
  requiereMotivo: boolean
  razon?: string
}

export type CampoVivienda = keyof Pick<
  Vivienda,
  | 'matricula_inmobiliaria'
  | 'direccion'
  | 'area_lote'
  | 'area_construida'
  | 'valor_base'
  | 'descripcion'
  | 'numero'
>

// Estados que bloquean completamente la edición
const ESTADOS_BLOQUEANTES = ['Escriturada', 'Entregada', 'Finalizada']

// ============================================================
// SERVICIO
// ============================================================

export class ViviendaValidacionService {
  /**
   * Verificar estado de bloqueo de una vivienda
   *
   * Lógica:
   * 1. Sin negociaciones → Todo editable (campos legales requieren Admin)
   * 2. Negociación activa pre-minuta → Restringido (valor editable)
   * 3. Minuta firmada o estado bloqueante → BLOQUEADO COMPLETAMENTE
   */
  static async verificarEstadoBloqueo(viviendaId: string): Promise<EstadoBloqueoVivienda> {
    try {
      // Buscar negociaciones activas
      const { data: negociaciones, error } = await supabase
        .from('negociaciones')
        .select(
          `
          id,
          estado,
          fecha_firma_minuta,
          clientes (
            nombres,
            apellidos
          )
        `
        )
        .eq('vivienda_id', viviendaId)
        .in('estado', ['Activa', 'Escriturada', 'Entregada', 'Finalizada'])
        .order('created_at', { ascending: false })

      if (error) throw error

      // CASO 1: Sin negociaciones activas
      if (!negociaciones || negociaciones.length === 0) {
        return {
          bloqueadaCompletamente: false,
          camposEditables: [
            'matricula_inmobiliaria',
            'direccion',
            'area_lote',
            'area_construida',
            'valor_base',
            'descripcion',
            'numero',
          ],
          camposRestringidos: ['matricula_inmobiliaria', 'direccion', 'area_lote', 'area_construida'], // Requieren Admin
          camposBloqueados: [],
        }
      }

      const negociacion = negociaciones[0]

      // CASO 2: Minuta firmada o estado bloqueante → BLOQUEO TOTAL
      if (negociacion.fecha_firma_minuta || ESTADOS_BLOQUEANTES.includes(negociacion.estado)) {
        const clienteNombre = negociacion.clientes
          ? `${negociacion.clientes.nombres} ${negociacion.clientes.apellidos}`
          : 'Cliente desconocido'

        return {
          bloqueadaCompletamente: true,
          razonBloqueo: negociacion.fecha_firma_minuta
            ? `🔒 BLOQUEADO: Minuta firmada el ${new Date(negociacion.fecha_firma_minuta).toLocaleDateString()} - Datos legales congelados`
            : `🔒 BLOQUEADO: Estado "${negociacion.estado}" - Proceso completado`,
          negociacionBloqueante: {
            id: negociacion.id,
            estado: negociacion.estado,
            fecha_firma_minuta: negociacion.fecha_firma_minuta,
            cliente_nombre: clienteNombre,
          },
          camposEditables: ['descripcion'], // Solo campo informativo
          camposRestringidos: [],
          camposBloqueados: [
            'matricula_inmobiliaria',
            'direccion',
            'area_lote',
            'area_construida',
            'valor_base',
            'numero',
          ],
        }
      }

      // CASO 3: Negociación activa pre-minuta → RESTRINGIDO
      const clienteNombre = negociacion.clientes
        ? `${negociacion.clientes.nombres} ${negociacion.clientes.apellidos}`
        : 'Cliente desconocido'

      return {
        bloqueadaCompletamente: false,
        razonBloqueo: `⚠️ RESTRINGIDO: Negociación activa con ${clienteNombre}`,
        negociacionBloqueante: {
          id: negociacion.id,
          estado: negociacion.estado,
          fecha_firma_minuta: negociacion.fecha_firma_minuta,
          cliente_nombre: clienteNombre,
        },
        camposEditables: ['descripcion', 'valor_base'], // Valor aún editable
        camposRestringidos: ['matricula_inmobiliaria', 'direccion', 'area_lote', 'area_construida'], // Admin + motivo
        camposBloqueados: [],
      }
    } catch (error) {
      console.error('❌ Error al verificar estado de bloqueo:', error)
      throw error
    }
  }

  /**
   * Validar si un campo específico puede ser editado
   *
   * @param viviendaId - ID de la vivienda
   * @param campo - Campo a validar
   * @param esAdmin - Si el usuario es Administrador
   * @returns Validación con permisos y razón
   */
  static async puedeEditarCampo(
    viviendaId: string,
    campo: CampoVivienda,
    esAdmin: boolean
  ): Promise<ValidacionCampo> {
    const estadoBloqueo = await this.verificarEstadoBloqueo(viviendaId)

    // Si está bloqueada completamente y el campo no es editable
    if (
      estadoBloqueo.bloqueadaCompletamente &&
      !estadoBloqueo.camposEditables.includes(campo)
    ) {
      return {
        puedeEditar: false,
        requiereAdmin: false,
        requiereMotivo: false,
        razon: estadoBloqueo.razonBloqueo,
      }
    }

    // Si el campo está en restringidos, requiere Admin
    if (estadoBloqueo.camposRestringidos.includes(campo)) {
      if (!esAdmin) {
        return {
          puedeEditar: false,
          requiereAdmin: true,
          requiereMotivo: true,
          razon: `⚠️ Campo "${campo}" requiere permisos de Administrador ${
            estadoBloqueo.razonBloqueo ? `(${estadoBloqueo.razonBloqueo})` : ''
          }`,
        }
      }

      // Admin puede editar pero debe justificar
      return {
        puedeEditar: true,
        requiereAdmin: true,
        requiereMotivo: true,
        razon: 'Campo crítico - Requiere justificación',
      }
    }

    // Campo editable sin restricciones
    return {
      puedeEditar: true,
      requiereAdmin: false,
      requiereMotivo: false,
    }
  }

  /**
   * Obtener historial completo de estados de una vivienda
   */
  static async obtenerHistorialCompleto(viviendaId: string) {
    try {
      const { data: historial, error } = await supabase
        .from('viviendas_historial_estados')
        .select(
          `
          id,
          estado_anterior,
          estado_nuevo,
          fecha_cambio,
          motivo,
          usuarios (
            nombres,
            apellidos,
            email
          ),
          metadata
        `
        )
        .eq('vivienda_id', viviendaId)
        .order('fecha_cambio', { ascending: false })

      if (error) throw error

      return historial || []
    } catch (error) {
      console.error('❌ Error al obtener historial de estados:', error)
      throw error
    }
  }

  /**
   * Obtener historial de cambios de matrícula (solo Admin)
   */
  static async obtenerHistorialMatriculas(viviendaId: string) {
    try {
      const { data: historial, error } = await supabase
        .from('viviendas_historial_matriculas')
        .select(
          `
          id,
          matricula_anterior,
          matricula_nueva,
          fecha_cambio,
          motivo,
          nivel_riesgo,
          usuarios (
            nombres,
            apellidos,
            email
          ),
          negociaciones_snapshot,
          abonos_snapshot
        `
        )
        .eq('vivienda_id', viviendaId)
        .order('fecha_cambio', { ascending: false })

      if (error) throw error

      return historial || []
    } catch (error) {
      console.error('❌ Error al obtener historial de matrículas:', error)
      throw error
    }
  }
}

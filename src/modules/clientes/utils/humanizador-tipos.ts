/**
 * Detect the specific type of event from audit_log data,
 * and infer the field kind for display formatting.
 */

import type {
  EventoHistorialCliente,
  TipoEventoHistorial,
} from '../types/historial.types'

export function detectarTipoEvento(
  evento: EventoHistorialCliente
): TipoEventoHistorial {
  const { tabla, accion, cambios_especificos } = evento

  // ========== CLIENTE ==========
  if (tabla === 'clientes') {
    if (accion === 'CREATE') return 'cliente_creado'
    if (accion === 'DELETE') return 'cliente_eliminado'
    if (accion === 'UPDATE') {
      if (cambios_especificos?.estado) return 'cliente_estado_cambiado'
      return 'cliente_actualizado'
    }
  }

  // ========== NEGOCIACIÓN ==========
  if (tabla === 'negociaciones') {
    if (accion === 'CREATE') return 'negociacion_creada'
    if (accion === 'UPDATE') {
      if (cambios_especificos?.estado?.despues === 'Completada') {
        return 'negociacion_completada'
      }
      if (cambios_especificos?.estado) return 'negociacion_estado_cambiada'
      return 'negociacion_actualizada'
    }
  }

  // ========== ABONO ==========
  if (tabla === 'abonos_historial') {
    if (accion === 'CREATE') return 'abono_registrado'
    if (accion === 'DELETE') return 'abono_anulado'
  }

  // ========== RENUNCIA ==========
  if (tabla === 'renuncias') {
    if (accion === 'CREATE') return 'renuncia_creada'
    if (accion === 'UPDATE') {
      const estadoNuevo = cambios_especificos?.estado?.despues
      if (estadoNuevo === 'Aprobada') return 'renuncia_aprobada'
      if (estadoNuevo === 'Rechazada') return 'renuncia_rechazada'
    }
  }

  // ========== INTERÉS ==========
  if (tabla === 'intereses') {
    if (accion === 'CREATE') return 'interes_registrado'
    if (accion === 'UPDATE') {
      if (cambios_especificos?.estado?.despues === 'Descartado') {
        return 'interes_descartado'
      }
      return 'interes_actualizado'
    }
  }

  // ========== DOCUMENTO ==========
  if (tabla === 'documentos_cliente') {
    if (accion === 'CREATE') return 'documento_subido'
    if (accion === 'UPDATE') return 'documento_actualizado'
    if (accion === 'DELETE') return 'documento_eliminado'
  }

  return 'evento_generico'
}

export function detectarTipoCampo(
  campo: string
): 'texto' | 'numero' | 'fecha' | 'booleano' | 'enum' {
  if (campo.includes('fecha')) return 'fecha'
  if (
    campo.includes('valor') ||
    campo.includes('ingresos') ||
    campo === 'cuota_inicial' ||
    campo === 'saldo_pendiente'
  ) {
    return 'numero'
  }
  if (
    campo === 'estado' ||
    campo === 'origen' ||
    campo === 'tipo_documento' ||
    campo === 'metodo_pago'
  ) {
    return 'enum'
  }
  if (campo.includes('activo') || campo.includes('es_')) return 'booleano'
  return 'texto'
}

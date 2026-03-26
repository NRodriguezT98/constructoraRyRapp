import type { EstadoRenuncia, RenunciaCompletaRow, RenunciaConInfo } from '../types'

/**
 * Transforma una fila plana de la vista SQL a estructura anidada para componentes.
 */
export function transformarRenunciaRow(row: RenunciaCompletaRow): RenunciaConInfo {
  return {
    id: row.id,
    consecutivo: row.consecutivo,
    negociacion_id: row.negociacion_id,
    vivienda_id: row.vivienda_id,
    cliente_id: row.cliente_id,
    motivo: row.motivo,
    fecha_renuncia: row.fecha_renuncia,
    estado: (row.estado ?? 'Pendiente Devolución') as EstadoRenuncia,
    monto_a_devolver: row.monto_a_devolver,
    requiere_devolucion: row.requiere_devolucion,
    retencion_monto: row.retencion_monto,
    retencion_motivo: row.retencion_motivo,
    notas_cierre: row.notas_cierre,
    fecha_devolucion: row.fecha_devolucion,
    comprobante_devolucion_url: row.comprobante_devolucion_url,
    metodo_devolucion: row.metodo_devolucion,
    numero_comprobante: row.numero_comprobante,
    formulario_renuncia_url: row.formulario_renuncia_url,
    vivienda_valor_snapshot: row.vivienda_valor_snapshot,
    vivienda_datos_snapshot: row.vivienda_datos_snapshot,
    cliente_datos_snapshot: row.cliente_datos_snapshot,
    negociacion_datos_snapshot: row.negociacion_datos_snapshot,
    abonos_snapshot: row.abonos_snapshot,
    fecha_cierre: row.fecha_cierre,
    usuario_registro: row.usuario_registro,
    usuario_cierre: row.usuario_cierre,
    fecha_creacion: row.fecha_creacion,
    fecha_actualizacion: row.fecha_actualizacion,
    cliente: {
      id: row.cliente_id,
      nombre: row.cliente_nombre ?? 'N/A',
      documento: row.cliente_documento ?? '',
      tipo_documento: row.cliente_tipo_documento ?? 'CC',
      telefono: row.cliente_telefono,
    },
    vivienda: {
      id: row.vivienda_id,
      numero: row.vivienda_numero ?? 'N/A',
      manzana: row.manzana_nombre ?? 'N/A',
    },
    proyecto: {
      id: row.proyecto_id ?? '',
      nombre: row.proyecto_nombre ?? 'N/A',
    },
    negociacion: {
      id: row.negociacion_id,
      valor_total: row.negociacion_valor_total,
      valor_total_pagar: row.negociacion_valor_total_pagar,
    },
    dias_desde_renuncia: row.dias_desde_renuncia ?? 0,
  }
}

/**
 * Detecta si un string es un UUID y retorna una versión legible.
 * Legacy: usuario_registro almacenaba auth.uid() en lugar del email.
 */
export function formatUsuarioRegistro(valor: string | null): string {
  if (!valor) return 'N/A'
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidPattern.test(valor)) return 'Usuario del sistema'
  return valor
}

/**
 * Retorna la etiqueta completa del tipo de documento.
 */
export function getTipoDocumentoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    CC: 'Cédula de ciudadanía',
    CE: 'Cédula de extranjería',
    TI: 'Tarjeta de identidad',
    PP: 'Pasaporte',
    NIT: 'NIT',
    PEP: 'PEP',
  }
  return labels[tipo] ?? tipo
}

/**
 * Formatea monto a COP (peso colombiano).
 */
export function formatCOP(monto: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)
}

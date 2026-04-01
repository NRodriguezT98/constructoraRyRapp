// =====================================================
// SERVICIO: Módulo de Renuncias
// Comunicación con Supabase (queries + RPC)
// =====================================================

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
    AbonoExpediente,
    MetricasRenuncias,
    ProcesarDevolucionDTO,
    RegistrarRenunciaDTO,
    RenunciaCompletaRow,
    ValidacionRenuncia,
} from '../types'

// =====================================================
// OBTENER RENUNCIAS (vista v_renuncias_completas)
// =====================================================

export async function obtenerRenuncias(): Promise<RenunciaCompletaRow[]> {
  const { data, error } = await supabase
    .from('v_renuncias_completas')
    .select('*')

  if (error) {
    logger.error('❌ Error obteniendo renuncias:', error)
    throw new Error(`Error al obtener renuncias: ${error.message}`)
  }

  return (data ?? []) as RenunciaCompletaRow[]
}

// =====================================================
// OBTENER RENUNCIA POR ID
// =====================================================

export async function obtenerRenuncia(id: string): Promise<RenunciaCompletaRow> {
  const { data, error } = await supabase
    .from('v_renuncias_completas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    logger.error('❌ Error obteniendo renuncia:', error)
    throw new Error(`Error al obtener renuncia: ${error.message}`)
  }

  return data as RenunciaCompletaRow
}

// =====================================================
// VALIDAR PRE-RENUNCIA
// =====================================================

/**
 * Valida si una negociación puede renunciar.
 * Checks: estado válido, sin renuncia previa, sin desembolsos.
 */
export async function validarPuedeRenunciar(negociacionId: string): Promise<ValidacionRenuncia> {
  // 1. Obtener negociación con cliente y vivienda (separate joins for reliability)
  const { data: neg, error: errNeg } = await supabase
    .from('negociaciones')
    .select('id, estado, valor_total, total_abonado, cliente_id, vivienda_id')
    .eq('id', negociacionId)
    .single()

  if (errNeg || !neg) {
    throw new Error('Negociación no encontrada')
  }

  // 2. Obtener cliente
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nombre_completo, numero_documento')
    .eq('id', neg.cliente_id)
    .single()

  // 3. Obtener vivienda → manzana → proyecto
  const { data: vivienda } = await supabase
    .from('viviendas')
    .select('id, numero, manzana_id')
    .eq('id', neg.vivienda_id)
    .single()

  let manzanaNombre = ''
  let proyectoNombre = ''

  if (vivienda?.manzana_id) {
    const { data: manzana } = await supabase
      .from('manzanas')
      .select('nombre, proyecto_id')
      .eq('id', vivienda.manzana_id)
      .single()

    if (manzana) {
      manzanaNombre = manzana.nombre ?? ''
      const { data: proyecto } = await supabase
        .from('proyectos')
        .select('nombre')
        .eq('id', manzana.proyecto_id)
        .single()
      proyectoNombre = proyecto?.nombre ?? ''
    }
  }

  const negInfo = {
    id: neg.id,
    estado: neg.estado,
    cliente_nombre: cliente?.nombre_completo ?? 'N/A',
    vivienda_numero: vivienda?.numero ?? 'N/A',
    manzana_nombre: manzanaNombre,
    proyecto_nombre: proyectoNombre,
  }

  const totalAbonado = Number(neg.total_abonado ?? 0)

  // Validar estado
  const estadosValidos = ['Activa', 'Suspendida']
  if (!estadosValidos.includes(neg.estado)) {
    return {
      puede_renunciar: false,
      motivo_bloqueo: `Solo negociaciones Activas o Suspendidas pueden renunciar. Estado actual: ${neg.estado}`,
      negociacion: negInfo,
      total_abonado: 0,
      fuentes_con_desembolso: [],
    }
  }

  // Validar sin renuncia previa
  const { data: renunciaExistente } = await supabase
    .from('renuncias')
    .select('id')
    .eq('negociacion_id', negociacionId)
    .maybeSingle()

  if (renunciaExistente) {
    return {
      puede_renunciar: false,
      motivo_bloqueo: 'Ya existe una renuncia registrada para esta negociación',
      negociacion: negInfo,
      total_abonado: 0,
      fuentes_con_desembolso: [],
    }
  }

  // 4. Obtener fuentes de pago para validar desembolsos
  const { data: fuentes = [] } = await supabase
    .from('fuentes_pago')
    .select('id, tipo, estado, monto_recibido')
    .eq('negociacion_id', negociacionId)

  const fuentesConDesembolso = (fuentes ?? [])
    .filter((f: { id: string; tipo: string | null; estado: string; monto_recibido: number | null }) => {
      const esExterna = !['Cuota Inicial'].includes(f.tipo ?? '')
      return esExterna && (f.monto_recibido ?? 0) > 0
    })
    .map((f: { tipo: string | null }) => f.tipo ?? 'Desconocida')

  if (fuentesConDesembolso.length > 0) {
    return {
      puede_renunciar: false,
      motivo_bloqueo: `Fuente(s) con desembolso: ${fuentesConDesembolso.join(', ')}. No se puede renunciar.`,
      negociacion: negInfo,
      total_abonado: 0,
      fuentes_con_desembolso: fuentesConDesembolso,
    }
  }

  return {
    puede_renunciar: true,
    negociacion: negInfo,
    total_abonado: totalAbonado,
    fuentes_con_desembolso: [],
  }
}

// =====================================================
// REGISTRAR RENUNCIA (RPC atómica)
// =====================================================

export async function registrarRenuncia(dto: RegistrarRenunciaDTO) {
  const { data: session } = await supabase.auth.getSession()
  const userId = session?.session?.user?.id ?? null

  const { data, error } = await supabase.rpc('registrar_renuncia_completa', {
    p_negociacion_id: dto.negociacion_id,
    p_motivo: dto.motivo.trim(),
    p_retencion_monto: dto.retencion_monto ?? 0,
    p_retencion_motivo: dto.retencion_motivo?.trim() || undefined,
    p_notas: dto.notas?.trim() || undefined,
    p_usuario_id: userId ?? undefined,
  })

  if (error) {
    logger.error('❌ Error registrando renuncia:', error)
    throw new Error(error.message)
  }

  return data
}

// =====================================================
// PROCESAR DEVOLUCIÓN
// =====================================================

export async function procesarDevolucion(renunciaId: string, dto: ProcesarDevolucionDTO) {
  const { data: session } = await supabase.auth.getSession()
  const userId = session?.session?.user?.id ?? null

  // Resolver nombre + rol del usuario (mismo formato que registrar_renuncia_completa en DB)
  let usuarioCierreLabel: string | null = userId
  if (userId) {
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('nombres, apellidos, rol')
      .eq('id', userId)
      .single()
    if (perfil) {
      usuarioCierreLabel = `${perfil.nombres} ${perfil.apellidos} (${perfil.rol})`
    }
  }

  const { data, error } = await supabase
    .from('renuncias')
    .update({
      estado: 'Cerrada',
      fecha_devolucion: dto.fecha_devolucion,
      metodo_devolucion: dto.metodo_devolucion,
      numero_comprobante: dto.numero_comprobante?.trim() || null,
      comprobante_devolucion_url: dto.comprobante_devolucion_url || null,
      notas_cierre: dto.notas_cierre?.trim() || null,
      fecha_cierre: new Date().toISOString(),
      usuario_cierre: usuarioCierreLabel,
    })
    .eq('id', renunciaId)
    .eq('estado', 'Pendiente Devolución')
    .select()
    .single()

  if (error) {
    logger.error('❌ Error procesando devolución:', error)
    throw new Error(error.message)
  }

  return data
}

// =====================================================
// SUBIR COMPROBANTE
// =====================================================

export async function subirComprobante(file: File, renunciaId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const filePath = `${renunciaId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('renuncias-comprobantes')
    .upload(filePath, file, { upsert: false })

  if (error) {
    logger.error('❌ Error subiendo comprobante:', error)
    throw new Error(`Error al subir comprobante: ${error.message}`)
  }

  // 🔒 Bucket privado: guardamos el PATH (no la URL pública).
  // Para visualizar se usa generarUrlFirmadaComprobante(path).
  return filePath
}

/**
 * Genera una URL firmada (expiración 1 hora) para ver un comprobante privado.
 * El valor puede ser:
 *   - Un path relativo: "uuid/1234567890.pdf"  (registros nuevos)
 *   - Una URL pública completa (registros anteriores al bucket privado)
 * En ambos casos se extrae el path correcto antes de llamar a createSignedUrl.
 */
export async function generarUrlFirmadaComprobante(pathOrUrl: string): Promise<string> {
  // Normalizar: si viene una URL completa, extraer solo el path relativo al bucket
  const BUCKET = 'renuncias-comprobantes'
  let filePath = pathOrUrl
  const marker = `/${BUCKET}/`
  const idx = pathOrUrl.indexOf(marker)
  if (idx !== -1) {
    filePath = pathOrUrl.slice(idx + marker.length)
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600) // 1 hora de expiración

  if (error || !data?.signedUrl) {
    logger.error('❌ Error generando URL firmada:', error)
    throw new Error('No se pudo generar el enlace al comprobante')
  }

  return data.signedUrl
}

// =====================================================
// SUBIR FORMULARIO DE RENUNCIA
// =====================================================

/**
 * Sube el formulario de renuncia al bucket privado y actualiza la columna en la tabla.
 * Se ejecuta DESPUÉS de registrar la renuncia exitosamente.
 */
export async function subirFormularioRenuncia(file: File, renunciaId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const filePath = `${renunciaId}/formulario-renuncia.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('renuncias-comprobantes')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    logger.error('❌ Error subiendo formulario de renuncia:', uploadError)
    throw new Error(`Error al subir formulario: ${uploadError.message}`)
  }

  // Actualizar la columna en la tabla renuncias
  const { error: updateError } = await supabase
    .from('renuncias')
    .update({ formulario_renuncia_url: filePath })
    .eq('id', renunciaId)

  if (updateError) {
    logger.error('❌ Error actualizando URL formulario:', updateError)
    throw new Error(`Error al vincular formulario: ${updateError.message}`)
  }

  return filePath
}

// =====================================================
// MÉTRICAS
// =====================================================

export async function obtenerMetricas(): Promise<MetricasRenuncias> {
  const { data, error } = await supabase
    .from('v_renuncias_completas')
    .select('estado, monto_a_devolver, retencion_monto')

  if (error) {
    logger.error('❌ Error obteniendo métricas:', error)
    throw new Error(error.message)
  }

  const renuncias = (data ?? []) as Array<{
    estado: string
    monto_a_devolver: number
    retencion_monto: number
  }>

  return {
    total: renuncias.length,
    pendientes: renuncias.filter(r => r.estado === 'Pendiente Devolución').length,
    cerradas: renuncias.filter(r => r.estado === 'Cerrada').length,
    totalDevuelto: renuncias
      .filter(r => r.estado === 'Cerrada')
      .reduce((sum, r) => sum + (r.monto_a_devolver ?? 0), 0),
    totalRetenido: renuncias.reduce((sum, r) => sum + (r.retencion_monto ?? 0), 0),
  }
}

// =====================================================
// OBTENER RENUNCIA POR CONSECUTIVO (para expediente)
// =====================================================

export async function obtenerRenunciaPorConsecutivo(consecutivo: string): Promise<RenunciaCompletaRow> {
  const { data, error } = await supabase
    .from('v_renuncias_completas')
    .select('*')
    .eq('consecutivo', consecutivo)
    .single()

  if (error) {
    logger.error('❌ Error obteniendo renuncia por consecutivo:', error)
    throw new Error(`Renuncia ${consecutivo} no encontrada`)
  }

  return data as RenunciaCompletaRow
}

// =====================================================
// OBTENER ABONOS DE NEGOCIACIÓN (para expediente)
// =====================================================

export async function obtenerAbonosNegociacion(negociacionId: string): Promise<AbonoExpediente[]> {
  const { data, error } = await supabase
    .from('abonos_historial')
    .select('id, numero_recibo, fecha_abono, monto, metodo_pago, numero_referencia, comprobante_url, estado, fuente_pago_id')
    .eq('negociacion_id', negociacionId)
    .order('fecha_abono', { ascending: true })

  if (error) {
    logger.error('❌ Error obteniendo abonos:', error)
    return []
  }

  // Obtener fuentes de pago para mapear tipo/entidad
  const { data: fuentes } = await supabase
    .from('fuentes_pago')
    .select('id, tipo, entidad')
    .eq('negociacion_id', negociacionId)

  const fuentesMap = new Map((fuentes ?? []).map((f: { id: string; tipo: string | null; entidad: string | null }) => [f.id, f]))

  return (data ?? []).map((a) => {
    const fuente = fuentesMap.get(a.fuente_pago_id ?? '')
    return {
      id: a.id,
      numero_recibo: a.numero_recibo,
      fecha_abono: a.fecha_abono,
      monto: a.monto,
      metodo_pago: a.metodo_pago,
      numero_referencia: a.numero_referencia,
      comprobante_url: a.comprobante_url,
      estado: a.estado ?? 'Activo',
      fuente_tipo: fuente?.tipo ?? 'N/A',
      fuente_entidad: fuente?.entidad ?? null,
    }
  })
}

// =====================================================
// OBTENER DATOS DE NEGOCIACIÓN (para expediente)
// =====================================================

export async function obtenerNegociacionExpediente(negociacionId: string) {
  const { data, error } = await supabase
    .from('negociaciones')
    .select('fecha_negociacion, valor_negociado, descuento_aplicado, tipo_descuento, porcentaje_descuento, motivo_descuento, promesa_compraventa_url, promesa_firmada_url')
    .eq('id', negociacionId)
    .single()

  if (error) {
    logger.error('❌ Error obteniendo negociación:', error)
    return null
  }

  return data
}

// =====================================================
// OBTENER DETALLE DE VIVIENDA (fallback para expediente)
// =====================================================

export async function obtenerViviendaExpediente(viviendaId: string) {
  const { data, error } = await supabase
    .from('viviendas')
    .select('tipo_vivienda, area_construida, area_lote, matricula_inmobiliaria, es_esquinera')
    .eq('id', viviendaId)
    .single()

  if (error) {
    logger.error('❌ Error obteniendo vivienda:', error)
    return null
  }

  return data
}

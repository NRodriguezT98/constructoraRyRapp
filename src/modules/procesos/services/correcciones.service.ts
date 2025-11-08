/**
 * Servicio de Correcciones de Pasos
 *
 * Maneja correcciones de fechas y documentos en pasos de negociaciones
 * con validaciones estrictas y auditoría completa
 */

import { supabase } from '@/lib/supabase/client'

// ============================================
// TIPOS
// ============================================

export interface ValidacionFechaResult {
  valida: boolean
  errores: string[]
  fechaMinima?: Date
  fechaMaxima?: Date
  requiereConfirmacionAdmin?: boolean
  advertenciaAdmin?: string
}

export interface CorreccionFechaParams {
  pasoId: string
  nuevaFecha: Date
  motivo: string
}

export interface CorreccionDocumentoParams {
  documentoAnteriorId: string
  nuevoArchivo: File
  motivo: string
  pasoId: string
  categoriaId: string
}

export interface AuditoriaCorreccion {
  id: string
  tipo_correccion: 'fecha_completado' | 'documento_reemplazado'
  paso_nombre: string
  paso_orden: number
  valor_anterior: string
  valor_nuevo: string
  motivo: string
  fecha_correccion: string
  usuario_nombre: string
  usuario_email: string
  cliente_nombre: string
  documento_nombre?: string
}

export interface PermisosCorreccion {
  permitido: boolean
  razon?: string
  requiereConfirmacionAdmin?: boolean
}

// ============================================
// VALIDACIONES DE PERMISOS
// ============================================

/**
 * Verifica si un usuario puede corregir documentos de un paso
 */
export async function puedeCorregirDocumentos(
  pasoId: string,
  esAdmin = false
): Promise<PermisosCorreccion> {

  // Obtener paso y proceso completo
  const { data: paso, error } = await supabase
    .from('procesos_negociacion')
    .select(`
      *,
      negociaciones (
        id,
        estado
      )
    `)
    .eq('id', pasoId)
    .single()

  if (error || !paso) {
    return {
      permitido: false,
      razon: 'Paso no encontrado'
    }
  }

  // ❌ 1. Proceso bloqueado
  const ESTADOS_BLOQUEADOS = ['Completado', 'Cancelado', 'Escriturado']
  if (ESTADOS_BLOQUEADOS.includes(paso.negociaciones.estado)) {
    return {
      permitido: false,
      razon: `El proceso está ${paso.negociaciones.estado}. No se pueden modificar documentos.`
    }
  }

  // ❌ 2. Hay pasos posteriores completados
  const { data: pasosPosteriores } = await supabase
    .from('procesos_negociacion')
    .select('id, nombre')
    .eq('negociacion_id', paso.negociacion_id)
    .gt('orden', paso.orden)
    .eq('estado', 'Completado')

  if (pasosPosteriores && pasosPosteriores.length > 0) {
    // Si es admin, permitir pero requerir confirmación especial
    if (esAdmin) {
      return {
        permitido: true,
        razon: `⚠️ ADVERTENCIA: Hay ${pasosPosteriores.length} paso(s) posterior(es) completado(s). La corrección podría afectar la cronología del proceso.`,
        requiereConfirmacionAdmin: true
      }
    }

    // Si no es admin, bloquear
    return {
      permitido: false,
      razon: `No puedes modificar este paso porque hay ${pasosPosteriores.length} pasos posteriores completados. Contacta a un administrador.`
    }
  }

  // ⚠️ 3. Ventana temporal (48 horas)
  if (paso.fecha_completado) {
    const horasDesdeCompletado = calcularHorasDesde(new Date(paso.fecha_completado))

    if (horasDesdeCompletado > 48 && !esAdmin) {
      return {
        permitido: false,
        razon: 'Han pasado más de 48 horas desde que se completó el paso. Solo un administrador puede modificarlo.'
      }
    }
  }

  // ⚠️ 4. Admin override (requiere confirmación)
  if (pasosPosteriores && pasosPosteriores.length > 0 && esAdmin) {
    return {
      permitido: true,
      requiereConfirmacionAdmin: true,
      razon: 'Esta acción puede afectar pasos posteriores. Se requiere confirmación adicional.'
    }
  }

  // ✅ Todo OK
  return { permitido: true }
}

/**
 * Verifica si un usuario puede corregir la fecha de un paso
 */
export async function puedeCorregirFecha(
  pasoId: string,
  esAdmin = false
): Promise<PermisosCorreccion> {
  // Mismas validaciones que documentos
  return puedeCorregirDocumentos(pasoId, esAdmin)
}

// ============================================
// VALIDACIONES DE FECHA
// ============================================

/**
 * Valida que una nueva fecha cumpla con restricciones cronológicas
 */
export async function validarCorreccionFecha(
  pasoId: string,
  nuevaFecha: Date
): Promise<ValidacionFechaResult> {

  const errores: string[] = []
  let fechaMinima: Date | undefined
  let fechaMaxima: Date | undefined

  // 1. Obtener paso y negociación
  const { data: paso, error } = await supabase
    .from('procesos_negociacion')
    .select(`
      *,
      negociaciones (
        id,
        estado,
        fecha_negociacion
      )
    `)
    .eq('id', pasoId)
    .single()

  if (error || !paso) {
    return { valida: false, errores: ['Paso no encontrado'] }
  }

  // 2. Validar estado del proceso
  if (['Completado', 'Cancelado'].includes(paso.negociaciones.estado)) {
    errores.push('No se puede corregir fecha de proceso finalizado')
  }

  // 3. No puede ser futuro
  const ahora = new Date()
  if (nuevaFecha > ahora) {
    errores.push('La fecha no puede ser futura')
  }

  // 4. CRÍTICO: No puede ser anterior a la fecha de inicio de negociación
  if (paso.negociaciones.fecha_negociacion) {
    const fechaInicioNegociacion = new Date(paso.negociaciones.fecha_negociacion)

    // Establecer fecha mínima como la fecha de inicio de negociación
    if (!fechaMinima || fechaInicioNegociacion > fechaMinima) {
      fechaMinima = fechaInicioNegociacion
    }

    if (nuevaFecha < fechaInicioNegociacion) {
      errores.push(
        `La fecha no puede ser anterior a la fecha de inicio de la negociación (${formatDate(fechaInicioNegociacion)})`
      )
    }
  }

  // 5. Obtener paso anterior
  const { data: pasoAnterior } = await supabase
    .from('procesos_negociacion')
    .select('fecha_completado, estado, nombre')
    .eq('negociacion_id', paso.negociacion_id)
    .eq('orden', paso.orden - 1)
    .maybeSingle()

  if (pasoAnterior?.estado === 'Completado' && pasoAnterior.fecha_completado) {
    const fechaAnterior = new Date(pasoAnterior.fecha_completado)

    // Actualizar fechaMinima si el paso anterior es más reciente
    if (!fechaMinima || fechaAnterior > fechaMinima) {
      fechaMinima = fechaAnterior
    }

    if (nuevaFecha < fechaAnterior) {
      errores.push(
        `La fecha debe ser posterior al paso anterior "${pasoAnterior.nombre}" (${formatDate(fechaAnterior)})`
      )
    }
  }

  // 6. Obtener paso siguiente
  const { data: pasoSiguiente } = await supabase
    .from('procesos_negociacion')
    .select('fecha_completado, estado, nombre')
    .eq('negociacion_id', paso.negociacion_id)
    .eq('orden', paso.orden + 1)
    .maybeSingle()

  if (pasoSiguiente?.estado === 'Completado' && pasoSiguiente.fecha_completado) {
    const fechaSiguiente = new Date(pasoSiguiente.fecha_completado)
    fechaMaxima = fechaSiguiente

    if (nuevaFecha > fechaSiguiente) {
      errores.push(
        `La fecha debe ser anterior al siguiente paso "${pasoSiguiente.nombre}" (${formatDate(fechaSiguiente)})`
      )
    }
  }

  // 7. Verificar si hay pasos posteriores completados (para advertencia admin)
  const { data: pasosPosterioresCompletados } = await supabase
    .from('procesos_negociacion')
    .select('id, nombre, orden')
    .eq('negociacion_id', paso.negociacion_id)
    .gt('orden', paso.orden)
    .eq('estado', 'Completado')

  const hayPasosPosteriores = pasosPosterioresCompletados && pasosPosterioresCompletados.length > 0

  return {
    valida: errores.length === 0,
    errores,
    fechaMinima,
    fechaMaxima: fechaMaxima || ahora,
    requiereConfirmacionAdmin: hayPasosPosteriores,
    advertenciaAdmin: hayPasosPosteriores
      ? `⚠️ ADVERTENCIA: Hay ${pasosPosterioresCompletados.length} paso(s) posterior(es) completado(s). La corrección podría afectar la cronología del proceso.`
      : undefined
  }
}

// ============================================
// CORRECCIÓN DE FECHA
// ============================================

/**
 * Corrige la fecha de completado de un paso
 */
export async function corregirFecha({
  pasoId,
  nuevaFecha,
  motivo
}: CorreccionFechaParams): Promise<void> {

  // 1. Validar
  const validacion = await validarCorreccionFecha(pasoId, nuevaFecha)

  if (!validacion.valida) {
    throw new Error(validacion.errores.join(', '))
  }

  // 2. Obtener fecha anterior
  const { data: paso } = await supabase
    .from('procesos_negociacion')
    .select('fecha_completado')
    .eq('id', pasoId)
    .single()

  if (!paso) {
    throw new Error('Paso no encontrado')
  }

  const fechaAnterior = paso.fecha_completado

  // 3. Actualizar fecha
  const { error: updateError } = await supabase
    .from('procesos_negociacion')
    .update({
      fecha_completado: nuevaFecha.toISOString(),
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', pasoId)

  if (updateError) throw updateError

  // 4. Registrar en auditoría usando función SQL
  const { error: auditoriaError } = await (supabase.rpc as any)('registrar_correccion_paso', {
    p_tipo_correccion: 'fecha_completado',
    p_paso_id: pasoId,
    p_documento_id: null,
    p_valor_anterior: fechaAnterior,
    p_valor_nuevo: nuevaFecha.toISOString(),
    p_motivo: motivo,
    p_metadata: {
      fecha_anterior_formatted: formatDate(new Date(fechaAnterior)),
      fecha_nueva_formatted: formatDate(nuevaFecha)
    }
  })

  if (auditoriaError) {
    console.error('Error al registrar auditoría:', auditoriaError)
    // No lanzar error, la fecha ya se actualizó
  }
}

// ============================================
// CORRECCIÓN DE DOCUMENTO
// ============================================

/**
 * Reemplaza un documento por otro
 */
export async function corregirDocumento({
  documentoAnteriorId,
  nuevoArchivo,
  motivo,
  pasoId,
  categoriaId
}: CorreccionDocumentoParams): Promise<string> {

  // 1. Obtener documento anterior
  const { data: docAnterior, error: docError } = await (supabase
    .from('documentos_cliente') as any)
    .select('*, paso_negociacion_id, categoria_id, cliente_id')
    .eq('id', documentoAnteriorId)
    .single()

  if (docError || !docAnterior) {
    throw new Error('Documento anterior no encontrado')
  }

  // 2. Subir nuevo archivo a Storage
  const timestamp = Date.now()
  const fileName = `${timestamp}-${nuevoArchivo.name}`
  const storagePath = `${docAnterior.paso_negociacion_id}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documentos-procesos')
    .upload(storagePath, nuevoArchivo, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Error al subir archivo: ${uploadError.message}`)
  }

  // 3. Crear nuevo registro de documento
  const { data: nuevoDoc, error: insertError } = await (supabase as any)
    .from('documentos_procesos_historial')
    .insert({
      paso_negociacion_id: pasoId,
      categoria_id: categoriaId,
      nombre_archivo: nuevoArchivo.name,
      url_storage: uploadData.path,
      estado: 'activo',
      es_version_actual: true,
      version_numero: 1, // Reset a 1 (es corrección, no versión)
      tamano_bytes: nuevoArchivo.size,
      tipo_mime: nuevoArchivo.type
    })
    .select()
    .single()

  if (insertError || !nuevoDoc) {
    // Limpiar archivo subido si falla el insert
    await supabase.storage
      .from('documentos-procesos')
      .remove([storagePath])

    throw new Error(`Error al crear registro de documento: ${insertError?.message}`)
  }

  // 4. Marcar documento anterior como reemplazado
  const { error: marcadoError } = await (supabase.rpc as any)('marcar_documento_reemplazado', {
    p_documento_anterior_id: documentoAnteriorId,
    p_documento_nuevo_id: nuevoDoc.id,
    p_motivo: motivo
  })

  if (marcadoError) {
    console.error('Error al marcar documento como reemplazado:', marcadoError)
  }

  // 5. Registrar en auditoría
  await (supabase.rpc as any)('registrar_correccion_paso', {
    p_tipo_correccion: 'documento_reemplazado',
    p_paso_id: pasoId,
    p_documento_id: documentoAnteriorId,
    p_valor_anterior: docAnterior.nombre_archivo,
    p_valor_nuevo: nuevoArchivo.name,
    p_motivo: motivo,
    p_metadata: {
      documento_anterior_id: documentoAnteriorId,
      documento_nuevo_id: nuevoDoc.id,
      tamano_anterior: docAnterior.tamano_bytes,
      tamano_nuevo: nuevoArchivo.size
    }
  })

  return nuevoDoc.id
}

// ============================================
// CONSULTAS DE AUDITORÍA
// ============================================

/**
 * Obtiene historial de correcciones de un proceso
 */
export async function obtenerCorrecciones(
  negociacionId: string
): Promise<AuditoriaCorreccion[]> {

  const { data, error } = await (supabase as any)
    .from('vista_auditoria_correcciones')
    .select('*')
    .eq('negociacion_id', negociacionId)
    .order('fecha_correccion', { ascending: false })

  if (error) {
    console.error('Error al obtener correcciones:', error)
    return []
  }

  return (data || []) as unknown as AuditoriaCorreccion[]
}

/**
 * Obtiene documentos reemplazados de un proceso
 */
export async function obtenerDocumentosReemplazados(
  negociacionId: string
) {
  const { data, error } = await (supabase as any)
    .from('vista_documentos_reemplazados')
    .select('*')
    .eq('negociacion_id', negociacionId)
    .order('fecha_reemplazo', { ascending: false })

  if (error) {
    console.error('Error al obtener documentos reemplazados:', error)
    return []
  }

  return data || []
}

// ============================================
// UTILIDADES
// ============================================

function calcularHorasDesde(fecha: Date): number {
  const ahora = new Date()
  const diff = ahora.getTime() - fecha.getTime()
  return Math.floor(diff / (1000 * 60 * 60))
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

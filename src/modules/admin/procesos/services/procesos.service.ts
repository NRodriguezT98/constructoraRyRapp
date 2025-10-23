/**
 * 🔧 SERVICIO DE GESTIÓN DE PROCESOS
 *
 * Maneja todas las operaciones CRUD con las tablas:
 * - plantillas_proceso
 * - procesos_negociacion
 */

import { createBrowserClient } from '@supabase/ssr'
import type {
    ActualizarPlantillaDTO,
    ActualizarProcesoDTO,
    CrearPlantillaDTO,
    CrearProcesoDesdePlantillaDTO,
    EstadisticasPlantilla,
    PlantillaProceso,
    ProcesoNegociacion,
    ProgresoNegociacion,
    ValidacionPlantilla
} from '../types'
import { EstadoPaso } from '../types'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ===================================
// PLANTILLAS - CRUD
// ===================================

/**
 * Obtiene todas las plantillas de proceso
 */
export async function obtenerPlantillas(): Promise<PlantillaProceso[]> {
  const { data, error } = await supabase
    .from('plantillas_proceso')
    .select('*')
    .order('es_predeterminado', { ascending: false })
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error al obtener plantillas:', error)
    throw new Error('No se pudieron cargar las plantillas de proceso')
  }

  return (data || []).map(mapPlantillaFromDB)
}

/**
 * Obtiene una plantilla específica por ID
 */
export async function obtenerPlantillaPorId(id: string): Promise<PlantillaProceso | null> {
  const { data, error } = await supabase
    .from('plantillas_proceso')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error al obtener plantilla:', error)
    return null
  }

  return data ? mapPlantillaFromDB(data) : null
}

/**
 * Obtiene la plantilla predeterminada
 */
export async function obtenerPlantillaPredeterminada(): Promise<PlantillaProceso | null> {
  const { data, error } = await supabase
    .from('plantillas_proceso')
    .select('*')
    .eq('es_predeterminado', true)
    .eq('activo', true)
    .single()

  if (error) {
    console.error('Error al obtener plantilla predeterminada:', error)
    return null
  }

  return data ? mapPlantillaFromDB(data) : null
}

/**
 * Crea una nueva plantilla de proceso
 */
export async function crearPlantilla(plantilla: CrearPlantillaDTO): Promise<PlantillaProceso> {
  // Validar plantilla antes de crear
  const validacion = validarPlantilla(plantilla)
  if (!validacion.valida) {
    throw new Error(`Plantilla inválida: ${validacion.errores.join(', ')}`)
  }

  // Si es predeterminada, quitar flag de otras plantillas
  if (plantilla.esPredeterminado) {
    await quitarPredeterminada()
  }

  // Preparar datos para inserción
  const pasos = plantilla.pasos.map((paso, index) => ({
    ...paso,
    id: crypto.randomUUID(),
    orden: index + 1
  }))

  const { data, error } = await supabase
    .from('plantillas_proceso')
    .insert({
      nombre: plantilla.nombre,
      descripcion: plantilla.descripcion,
      pasos: pasos,
      activo: true,
      es_predeterminado: plantilla.esPredeterminado || false
    })
    .select()
    .single()

  if (error) {
    console.error('Error al crear plantilla:', error)
    throw new Error('No se pudo crear la plantilla')
  }

  return mapPlantillaFromDB(data)
}

/**
 * Actualiza una plantilla existente
 */
export async function actualizarPlantilla(
  id: string,
  actualizacion: ActualizarPlantillaDTO
): Promise<PlantillaProceso> {
  // Si se está marcando como predeterminada, quitar flag de otras
  if (actualizacion.esPredeterminado) {
    await quitarPredeterminada(id)
  }

  const updateData: any = {}

  if (actualizacion.nombre !== undefined) updateData.nombre = actualizacion.nombre
  if (actualizacion.descripcion !== undefined) updateData.descripcion = actualizacion.descripcion
  if (actualizacion.pasos !== undefined) updateData.pasos = actualizacion.pasos
  if (actualizacion.activo !== undefined) updateData.activo = actualizacion.activo
  if (actualizacion.esPredeterminado !== undefined) updateData.es_predeterminado = actualizacion.esPredeterminado

  const { data, error } = await supabase
    .from('plantillas_proceso')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar plantilla:', error)
    throw new Error('No se pudo actualizar la plantilla')
  }

  return mapPlantillaFromDB(data)
}

/**
 * Elimina una plantilla
 */
export async function eliminarPlantilla(id: string): Promise<void> {
  // Verificar que no es la predeterminada
  const plantilla = await obtenerPlantillaPorId(id)
  if (plantilla?.esPredeterminado) {
    throw new Error('No se puede eliminar la plantilla predeterminada')
  }

  const { error } = await supabase
    .from('plantillas_proceso')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error al eliminar plantilla:', error)
    throw new Error('No se pudo eliminar la plantilla')
  }
}

/**
 * Duplica una plantilla existente
 */
export async function duplicarPlantilla(id: string, nuevoNombre: string): Promise<PlantillaProceso> {
  const original = await obtenerPlantillaPorId(id)
  if (!original) {
    throw new Error('Plantilla no encontrada')
  }

  return crearPlantilla({
    nombre: nuevoNombre,
    descripcion: `Copia de: ${original.descripcion || original.nombre}`,
    pasos: original.pasos.map(({ id, ...paso }) => paso),
    esPredeterminado: false
  })
}

/**
 * Establece una plantilla como predeterminada
 */
export async function establecerPredeterminada(id: string): Promise<void> {
  await quitarPredeterminada(id)

  const { error } = await supabase
    .from('plantillas_proceso')
    .update({ es_predeterminado: true })
    .eq('id', id)

  if (error) {
    console.error('Error al establecer predeterminada:', error)
    throw new Error('No se pudo establecer como predeterminada')
  }
}

// ===================================
// PROCESOS DE NEGOCIACIÓN
// ===================================

/**
 * Crea instancias de proceso desde una plantilla para una negociación
 */
export async function crearProcesoDesdePlantilla(
  datos: CrearProcesoDesdePlantillaDTO
): Promise<ProcesoNegociacion[]> {
  const plantilla = await obtenerPlantillaPorId(datos.plantillaId)
  if (!plantilla) {
    throw new Error('Plantilla no encontrada')
  }

  // Filtrar pasos según fuentes de pago
  const pasosFiltrados = plantilla.pasos.filter(paso => {
    const { fuentesPagoRequeridas } = paso.condiciones

    // Si no tiene condiciones de fuentes de pago, aplica a todos
    if (!fuentesPagoRequeridas || fuentesPagoRequeridas.length === 0) {
      return true
    }

    // Verificar si alguna fuente de pago coincide
    return fuentesPagoRequeridas.some(fp => datos.fuentesPago.includes(fp))
  })

  // Crear instancias en la base de datos
  const instancias = pasosFiltrados.map(paso => ({
    negociacion_id: datos.negociacionId,
    nombre: paso.nombre,
    descripcion: paso.descripcion,
    orden: paso.orden,
    es_obligatorio: paso.obligatorio,
    permite_omitir: paso.permiteOmitir,
    estado: EstadoPaso.PENDIENTE,
    depende_de: paso.condiciones.dependeDe.length > 0 ? paso.condiciones.dependeDe : null,
    documentos_requeridos: paso.documentos,
    documentos_urls: null,
    fecha_limite: null,
    notas: null
  }))

  const { data, error } = await supabase
    .from('procesos_negociacion')
    .insert(instancias)
    .select()

  if (error) {
    console.error('Error al crear procesos:', error)
    throw new Error('No se pudieron crear los procesos de negociación')
  }

  return (data || []).map(mapProcesoFromDB)
}

/**
 * Obtiene todos los pasos de proceso de una negociación
 */
export async function obtenerProcesosNegociacion(
  negociacionId: string
): Promise<ProcesoNegociacion[]> {
  const { data, error } = await supabase
    .from('procesos_negociacion')
    .select('*')
    .eq('negociacion_id', negociacionId)
    .order('orden', { ascending: true })

  if (error) {
    console.error('Error al obtener procesos:', error)
    throw new Error('No se pudieron cargar los procesos')
  }

  return (data || []).map(mapProcesoFromDB)
}

/**
 * Actualiza un paso de proceso
 */
export async function actualizarProceso(
  id: string,
  actualizacion: ActualizarProcesoDTO
): Promise<ProcesoNegociacion> {
  const updateData: any = {}

  if (actualizacion.estado !== undefined) updateData.estado = actualizacion.estado
  if (actualizacion.documentosUrls !== undefined) updateData.documentos_urls = actualizacion.documentosUrls
  if (actualizacion.fechaInicio !== undefined) updateData.fecha_inicio = actualizacion.fechaInicio
  if (actualizacion.fechaCompletado !== undefined) updateData.fecha_completado = actualizacion.fechaCompletado
  if (actualizacion.fechaLimite !== undefined) updateData.fecha_limite = actualizacion.fechaLimite
  if (actualizacion.notas !== undefined) updateData.notas = actualizacion.notas
  if (actualizacion.motivoOmision !== undefined) updateData.motivo_omision = actualizacion.motivoOmision

  const { data, error } = await supabase
    .from('procesos_negociacion')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar proceso:', error)
    throw new Error('No se pudo actualizar el proceso')
  }

  return mapProcesoFromDB(data)
}

/**
 * Obtiene el progreso de una negociación
 */
export async function obtenerProgresoNegociacion(
  negociacionId: string
): Promise<ProgresoNegociacion> {
  const procesos = await obtenerProcesosNegociacion(negociacionId)

  const completados = procesos.filter(p => p.estado === EstadoPaso.COMPLETADO).length
  const pendientes = procesos.filter(p => p.estado === EstadoPaso.PENDIENTE).length
  const enProceso = procesos.filter(p => p.estado === EstadoPaso.EN_PROCESO).length
  const omitidos = procesos.filter(p => p.estado === EstadoPaso.OMITIDO).length

  const pasoActual = procesos.find(p => p.estado === EstadoPaso.EN_PROCESO)
    || procesos.find(p => p.estado === EstadoPaso.PENDIENTE)

  return {
    negociacionId,
    totalPasos: procesos.length,
    pasosCompletados: completados,
    pasosPendientes: pendientes,
    pasosEnProceso: enProceso,
    pasosOmitidos: omitidos,
    porcentajeCompletado: procesos.length > 0 ? Math.round((completados / procesos.length) * 100) : 0,
    pasoActual,
    diasTranscurridos: 0, // TODO: calcular desde fecha inicio negociación
    diasEstimadosRestantes: 0 // TODO: calcular según pasos restantes
  }
}

// ===================================
// UTILIDADES Y VALIDACIONES
// ===================================

/**
 * Valida la estructura de una plantilla
 */
export function validarPlantilla(plantilla: CrearPlantillaDTO | ActualizarPlantillaDTO): ValidacionPlantilla {
  const errores: string[] = []
  const advertencias: string[] = []

  // Validar nombre
  if ('nombre' in plantilla && (!plantilla.nombre || plantilla.nombre.trim().length === 0)) {
    errores.push('El nombre es obligatorio')
  }

  // Validar pasos
  if ('pasos' in plantilla) {
    if (!plantilla.pasos || plantilla.pasos.length === 0) {
      errores.push('Debe tener al menos un paso')
    } else {
      // Validar cada paso
      plantilla.pasos.forEach((paso, index) => {
        if (!paso.nombre || paso.nombre.trim().length === 0) {
          errores.push(`Paso ${index + 1}: El nombre es obligatorio`)
        }

        // Validar dependencias
        if (paso.condiciones?.dependeDe) {
          const dependencias = paso.condiciones.dependeDe
          const idsValidos = plantilla.pasos!.map((p: any) => p.id).filter(Boolean)

          dependencias.forEach(depId => {
            if (!idsValidos.includes(depId)) {
              advertencias.push(`Paso "${paso.nombre}": Dependencia con ID inválido`)
            }
          })
        }

        // Validar documentos
        if (paso.documentos) {
          paso.documentos.forEach((doc, docIndex) => {
            if (!doc.nombre || doc.nombre.trim().length === 0) {
              errores.push(`Paso ${index + 1}, Documento ${docIndex + 1}: El nombre es obligatorio`)
            }
          })
        }
      })
    }
  }

  return {
    valida: errores.length === 0,
    errores,
    advertencias
  }
}

/**
 * Calcula estadísticas de una plantilla
 */
export function calcularEstadisticas(plantilla: PlantillaProceso): EstadisticasPlantilla {
  const pasos = plantilla.pasos

  return {
    totalPasos: pasos.length,
    pasosObligatorios: pasos.filter(p => p.obligatorio).length,
    pasosOpcionales: pasos.filter(p => !p.obligatorio).length,
    pasosCondicionales: pasos.filter(p =>
      p.condiciones.fuentesPagoRequeridas.length > 0
    ).length,
    diasEstimadosTotal: pasos.reduce((sum, p) => sum + (p.diasEstimados || 0), 0),
    documentosTotales: pasos.reduce((sum, p) => sum + p.documentos.length, 0)
  }
}

// ===================================
// HELPERS PRIVADOS
// ===================================

/**
 * Quita el flag de predeterminada de todas las plantillas excepto una
 */
async function quitarPredeterminada(exceptoId?: string): Promise<void> {
  const query = supabase
    .from('plantillas_proceso')
    .update({ es_predeterminado: false })
    .eq('es_predeterminado', true)

  if (exceptoId) {
    query.neq('id', exceptoId)
  }

  await query
}

/**
 * Mapea datos de DB a PlantillaProceso
 */
function mapPlantillaFromDB(data: any): PlantillaProceso {
  return {
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    pasos: data.pasos || [],
    activo: data.activo,
    esPredeterminado: data.es_predeterminado,
    fechaCreacion: data.fecha_creacion,
    fechaActualizacion: data.fecha_actualizacion,
    usuarioCreacion: data.usuario_creacion
  }
}

/**
 * Mapea datos de DB a ProcesoNegociacion
 */
function mapProcesoFromDB(data: any): ProcesoNegociacion {
  return {
    id: data.id,
    negociacionId: data.negociacion_id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    orden: data.orden,
    esObligatorio: data.es_obligatorio,
    permiteOmitir: data.permite_omitir,
    estado: data.estado,
    dependeDe: data.depende_de,
    documentosRequeridos: data.documentos_requeridos,
    documentosUrls: data.documentos_urls,
    fechaInicio: data.fecha_inicio,
    fechaCompletado: data.fecha_completado,
    fechaLimite: data.fecha_limite,
    notas: data.notas,
    motivoOmision: data.motivo_omision,
    fechaCreacion: data.fecha_creacion,
    fechaActualizacion: data.fecha_actualizacion,
    usuarioCompleto: data.usuario_completo
  }
}

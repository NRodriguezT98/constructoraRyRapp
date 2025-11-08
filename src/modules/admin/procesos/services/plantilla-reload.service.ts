/**
 * 🔄 SERVICIO DE RECARGA DE PLANTILLA
 *
 * Funcionalidad de desarrollo para recargar pasos desde la plantilla predeterminada.
 * ⚠️ Solo debe usarse en modo desarrollo para testing.
 */

import { createBrowserClient } from '@supabase/ssr'

import { EstadoPaso } from '../types'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ResultadoRecarga {
  exito: boolean
  pasos?: number
  error?: string
}

/**
 * 🔧 RECARGAR PLANTILLA
 *
 * Elimina todos los pasos actuales de una negociación y los reemplaza
 * con los pasos de la plantilla predeterminada.
 *
 * @param negociacionId - ID de la negociación
 * @returns Resultado de la operación
 */
export async function recargarPlantilla(negociacionId: string): Promise<ResultadoRecarga> {
  try {
    // 1. Obtener la plantilla predeterminada
    const { data: plantilla, error: plantillaError } = await supabase
      .from('plantillas_proceso')
      .select('*')
      .eq('es_predeterminado', true)
      .eq('activo', true)
      .single()

    if (plantillaError || !plantilla) {
      return {
        exito: false,
        error: 'No se encontró una plantilla predeterminada activa'
      }
    }

    // 2. Eliminar pasos actuales de la negociación
    const { error: deleteError } = await supabase
      .from('procesos_negociacion')
      .delete()
      .eq('negociacion_id', negociacionId)

    if (deleteError) {
      console.error('Error al eliminar pasos:', deleteError)
      return {
        exito: false,
        error: `Error al eliminar pasos: ${deleteError.message}`
      }
    }

    // 3. Crear nuevos pasos desde la plantilla (SIN dependencias primero)
    const nuevosPasos = plantilla.pasos.map((paso: any) => ({
      negociacion_id: negociacionId,
      nombre: paso.nombre,
      descripcion: paso.descripcion || null,
      orden: paso.orden,
      es_obligatorio: paso.obligatorio,
      permite_omitir: paso.permiteOmitir,
      estado: EstadoPaso.PENDIENTE,
      depende_de: null, // Lo mapearemos después
      documentos_requeridos: paso.documentos || null,
      documentos_urls: null,
      fecha_inicio: null,
      fecha_completado: null,
      fecha_limite: null,
      notas: null,
      motivo_omision: null
    }))

    const { data: pasosCreados, error: insertError } = await supabase
      .from('procesos_negociacion')
      .insert(nuevosPasos)
      .select()

    if (insertError) {
      console.error('Error al insertar pasos:', insertError)
      return {
        exito: false,
        error: `Error al insertar pasos: ${insertError.message}`
      }
    }

    // 4. 🔥 MAPEO DE DEPENDENCIAS: ID de plantilla → UUID real
    const mapeoIds: { [key: string]: string } = {}
    plantilla.pasos.forEach((paso: any, index: number) => {
      if (pasosCreados && pasosCreados[index]) {
        mapeoIds[paso.id] = pasosCreados[index].id
      }
    })

    // 5. Actualizar dependencias con UUIDs reales
    for (let i = 0; i < plantilla.pasos.length; i++) {
      const pasoPlantilla = plantilla.pasos[i]
      const pasoCreado = pasosCreados?.[i]

      if (pasoCreado && pasoPlantilla.condiciones?.dependeDe?.length > 0) {
        const dependenciasReales = pasoPlantilla.condiciones.dependeDe
          .map((idPlantilla: string) => mapeoIds[idPlantilla])
          .filter(Boolean)

        if (dependenciasReales.length > 0) {
          const { error: updateError } = await supabase
            .from('procesos_negociacion')
            .update({ depende_de: dependenciasReales })
            .eq('id', pasoCreado.id)

          if (updateError) {
            console.error('⚠️ Error al actualizar dependencias:', updateError)
          }
        }
      }
    }

    return {
      exito: true,
      pasos: nuevosPasos.length
    }

  } catch (error: any) {
    console.error('❌ Error al recargar plantilla:', error)
    return {
      exito: false,
      error: error.message || 'Error desconocido'
    }
  }
}

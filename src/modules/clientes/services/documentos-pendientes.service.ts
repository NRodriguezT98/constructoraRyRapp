/**
 * Servicio para manejar documentos pendientes
 * Sistema automático de recordatorios de documentación faltante
 */

import { supabase } from '@/lib/supabase/client'
import type { TipoFuentePago } from '@/modules/clientes/types'

export interface CrearDocumentoPendienteParams {
  clienteId: string
  tipoFuente: TipoFuentePago
  entidad?: string
  manzana: string
  numeroVivienda: string
}

/**
 * Crea un documento pendiente para una carta de aprobación
 */
export async function crearDocumentoPendiente({
  clienteId,
  tipoFuente,
  entidad,
  manzana,
  numeroVivienda,
}: CrearDocumentoPendienteParams) {
  const vivienda = `${manzana}${numeroVivienda}`

  // Generar descripción según el tipo
  let descripcion = ''
  switch (tipoFuente) {
    case 'Crédito Hipotecario':
      descripcion = `Carta de aprobación de crédito hipotecario${entidad ? ` de ${entidad}` : ''} para vivienda ${vivienda}`
      break
    case 'Subsidio Caja Compensación':
      descripcion = `Carta de aprobación de subsidio de caja de compensación${entidad ? ` de ${entidad}` : ''} para vivienda ${vivienda}`
      break
    case 'Subsidio Mi Casa Ya':
      descripcion = `Carta de aprobación de subsidio Mi Casa Ya para vivienda ${vivienda}`
      break
    default:
      descripcion = `Carta de aprobación de ${tipoFuente} para vivienda ${vivienda}`
  }

  const { data, error } = await supabase
    .from('documentos_pendientes')
    .insert({
      cliente_id: clienteId,
      tipo_documento: 'Carta de Aprobación',
      descripcion,
      categoria_id: '4898e798-c188-4f02-bfcf-b2b15be48e34', // Categoría "Cartas de Aprobación"
      metadata: {
        tipo_fuente: tipoFuente,
        entidad,
        vivienda,
        origen: 'asignacion_vivienda',
        creado_automaticamente: true,
      },
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Error creando documento pendiente:', error)
    throw error
  }

  console.log('✅ Documento pendiente creado:', data)
  return data
}

/**
 * Crea múltiples documentos pendientes
 */
export async function crearDocumentosPendientesBatch(
  params: CrearDocumentoPendienteParams[]
): Promise<void> {
  const promises = params.map((p) => crearDocumentoPendiente(p))
  await Promise.all(promises)
}

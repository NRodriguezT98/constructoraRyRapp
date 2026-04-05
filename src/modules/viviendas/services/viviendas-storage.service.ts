import { supabase } from '@/lib/supabase/client'
import { errorLog } from '@/lib/utils/logger'

import { obtenerPorId } from './viviendas-consultas.service'

export async function subirCertificado(
  file: File,
  manzanaId: string,
  numeroVivienda: string
): Promise<string> {
  const { data: manzana } = await supabase
    .from('manzanas')
    .select('proyecto_id')
    .eq('id', manzanaId)
    .single()

  if (!manzana?.proyecto_id) {
    throw new Error('No se pudo obtener el proyecto de la manzana')
  }

  const fileName = `certificado_${manzanaId}_${numeroVivienda}_${Date.now()}.pdf`
  const filePath = `${manzana.proyecto_id}/certificados/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('documentos-proyectos')
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    errorLog('[SUBIR CERTIFICADO] Error al subir', uploadError)
    throw uploadError
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('documentos-proyectos').getPublicUrl(filePath)

  return publicUrl
}

export async function actualizarCertificado(
  viviendaId: string,
  file: File
): Promise<string> {
  const vivienda = await obtenerPorId(viviendaId)
  if (!vivienda) throw new Error('Vivienda no encontrada')

  const certificadoUrl = await subirCertificado(
    file,
    vivienda.manzana_id,
    vivienda.numero
  )

  const { error } = await supabase
    .from('viviendas')
    .update({ certificado_tradicion_url: certificadoUrl })
    .eq('id', viviendaId)

  if (error) throw error
  return certificadoUrl
}

export async function eliminarCertificado(url: string): Promise<void> {
  const path = url.split('/documentos-proyectos/')[1]
  if (!path) return

  const { error } = await supabase.storage
    .from('documentos-proyectos')
    .remove([path])
  if (error) errorLog('Error eliminando certificado', error)
}

export async function obtenerNegociacionActivaPorVivienda(
  viviendaId: string
): Promise<{
  id: string
  valor_negociado: number
  descuento_aplicado: number
  total_abonado: number
  saldo_pendiente: number
  estado: string
  cliente_id: string
  cliente_nombre: string
} | null> {
  const { data, error } = await supabase
    .from('negociaciones')
    .select(
      `
      id,
      estado,
      valor_negociado,
      descuento_aplicado,
      total_abonado,
      saldo_pendiente,
      cliente_id,
      clientes!negociaciones_cliente_id_fkey(nombres, apellidos)
    `
    )
    .eq('vivienda_id', viviendaId)
    .eq('estado', 'Activa')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const rawData = data as Record<string, unknown>
  const clienteData = Array.isArray(rawData.clientes)
    ? rawData.clientes[0]
    : rawData.clientes

  return {
    id: data.id,
    valor_negociado: Number(rawData.valor_negociado ?? 0),
    descuento_aplicado: Number(rawData.descuento_aplicado ?? 0),
    total_abonado: Number(rawData.total_abonado ?? 0),
    saldo_pendiente: Number(rawData.saldo_pendiente ?? 0),
    estado: data.estado ?? '',
    cliente_id: data.cliente_id ?? '',
    cliente_nombre: clienteData
      ? `${clienteData.nombres} ${clienteData.apellidos}`.trim()
      : 'Cliente desconocido',
  }
}

export async function sincronizarNegociacionConVivienda(
  negociacionId: string,
  nuevoValorBase: number
): Promise<void> {
  const { error } = await supabase
    .from('negociaciones')
    .update({ valor_negociado: nuevoValorBase })
    .eq('id', negociacionId)

  if (error) throw error
}

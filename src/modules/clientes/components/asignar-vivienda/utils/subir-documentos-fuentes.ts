/**
 * Helper: Subir Documentos de Fuentes de Pago
 *
 * ✅ Sube documentos a la pestaña de documentos del cliente
 * ✅ Usa nombres formateados según especificación
 * ✅ Categoría: "Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso"
 *
 * Formato de nombres:
 * - Crédito Hipotecario: "CARTA DE APROBACIÓN CRÉDITO A1 - PEPE PEREZ"
 * - Caja Compensación: "CARTA CAJA DE COMPENSACIÓN A1 - PEPE PEREZ"
 */

import { logger } from '@/lib/utils/logger'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { DocumentosBaseService } from '@/modules/documentos/services/documentos-base.service'

import type { FuentePagoConfig } from '../types'

// â­ ID de la categoría (verificado en DB)
const CATEGORIA_CARTAS_APROBACION_ID = '4898e798-c188-4f02-bfcf-b2b15be48e34'

interface SubirDocumentoFuenteParams {
  clienteId: string
  clienteNombre: string
  manzana: string
  numeroVivienda: string
  tipoFuente: TipoFuentePago
  entidad: string
  archivo: File
  negociacionId?: string // Para vincular con la negociación
}

/**
 * Genera el título del documento según el tipo de fuente
 */
function generarTituloDocumento(
  tipoFuente: TipoFuentePago,
  manzana: string,
  numeroVivienda: string,
  clienteNombre: string
): string {
  const vivienda = `${manzana}${numeroVivienda}` // Ej: "A1"
  const nombreMayusculas = clienteNombre.toUpperCase()

  switch (tipoFuente) {
    case 'Crédito Hipotecario':
      return `CARTA DE APROBACIÓN CRÉDITO ${vivienda} - ${nombreMayusculas}`

    case 'Subsidio Caja Compensación':
      return `CARTA CAJA DE COMPENSACIÓN ${vivienda} - ${nombreMayusculas}`

    default:
      return `DOCUMENTO ${tipoFuente.toUpperCase()} ${vivienda} - ${nombreMayusculas}`
  }
}

/**
 * Sube un documento de fuente de pago al sistema de documentos del cliente
 */
export async function subirDocumentoFuente(
  params: SubirDocumentoFuenteParams
): Promise<string> {
  const { clienteId, clienteNombre, manzana, numeroVivienda, tipoFuente, entidad, archivo, negociacionId } = params

  // Generar título formateado
  const titulo = generarTituloDocumento(tipoFuente, manzana, numeroVivienda, clienteNombre)

  // Generar descripción
  const descripcion = `Carta de aprobación de ${tipoFuente} - ${entidad}`

  // Subir documento al sistema
  const documento = await (DocumentosBaseService as any).subirDocumento({
    entidad_id: clienteId,
    tipoEntidad: 'cliente',
    categoria_id: CATEGORIA_CARTAS_APROBACION_ID,
    titulo,
    descripcion,
    archivo,
    metadata: {
      tipo_fuente: tipoFuente,
      entidad,
      negociacion_id: negociacionId,
      vivienda: `${manzana}${numeroVivienda}`,
    },
  })

  return (documento as any).url_archivo
}

/**
 * Sube todos los documentos de las fuentes de pago configuradas
 */
export async function subirDocumentosFuentesPago(
  clienteId: string,
  clienteNombre: string,
  manzana: string,
  numeroVivienda: string,
  fuentes: FuentePagoConfig[],
  negociacionId?: string
): Promise<Record<TipoFuentePago, string | undefined>> {
  const urls: Record<string, string | undefined> = {}

  for (const fuente of fuentes) {
    // Solo subir si tiene archivo pendiente
    if ((fuente as any).archivo) {
      try {

        const url = await subirDocumentoFuente({
          clienteId,
          clienteNombre,
          manzana,
          numeroVivienda,
          tipoFuente: fuente.tipo,
          entidad: fuente.entidad || '',
          archivo: (fuente as any).archivo,
          negociacionId,
        })

        urls[fuente.tipo] = url
      } catch (error) {
        logger.error(`❌ Error subiendo documento de ${fuente.tipo}:`, error)
        throw new Error(`Error al subir documento de ${fuente.tipo}`)
      }
    }
  }

  return urls as Record<TipoFuentePago, string | undefined>
}

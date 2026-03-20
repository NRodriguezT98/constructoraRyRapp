'use client'

/**
 * HOOK: useDocumentosPendientesNeg
 *
 * Carga y calcula documentos pendientes por fuente y compartidos del cliente.
 * Datos desde vista_documentos_pendientes_fuentes (tiempo real).
 */

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { supabase } from '@/lib/supabase/client'

interface DocPendienteFuente {
  total: number
  obligatorios: number
  docs: { nombre: string; obligatorio: boolean }[]
}

interface UseDocumentosPendientesNegProps {
  clienteId: string
  negociacionId?: string
}

export function useDocumentosPendientesNeg({ clienteId, negociacionId }: UseDocumentosPendientesNegProps) {
  const { data: documentosPendientesRaw = [] } = useQuery({
    queryKey: ['docs-pendientes-neg-tab', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vista_documentos_pendientes_fuentes')
        .select('fuente_pago_id,tipo_documento,nivel_validacion,tipo_fuente,entidad')
        .eq('cliente_id', clienteId)

      if (error) throw error
      return data ?? []
    },
    enabled: !!negociacionId,
    staleTime: 30_000,
  })

  /** Mapa: fuente_pago_id → docs específicos de esa fuente */
  const pendientesPorFuente = useMemo<Record<string, DocPendienteFuente>>(() => {
    if (!documentosPendientesRaw.length) return {}

    const mapa: Record<string, DocPendienteFuente> = {}
    for (const doc of documentosPendientesRaw) {
      if (!doc.fuente_pago_id) continue
      const key = doc.fuente_pago_id
      if (!mapa[key]) mapa[key] = { total: 0, obligatorios: 0, docs: [] }
      const esObligatorio = doc.nivel_validacion === 'DOCUMENTO_OBLIGATORIO'
      mapa[key].total++
      if (esObligatorio) mapa[key].obligatorios++
      mapa[key].docs.push({ nombre: doc.tipo_documento ?? '', obligatorio: esObligatorio })
    }
    return mapa
  }, [documentosPendientesRaw])

  /** Docs compartidos del cliente (no vinculados a fuente específica) */
  const pendientesCompartidos = useMemo(
    () =>
      documentosPendientesRaw
        .filter((d) => !d.fuente_pago_id)
        .map((d) => ({
          nombre: d.tipo_documento ?? '',
          obligatorio: d.nivel_validacion === 'DOCUMENTO_OBLIGATORIO',
        })),
    [documentosPendientesRaw],
  )

  const totalDocsPendientes = documentosPendientesRaw.length

  const totalDocsObligatoriosPendientes = useMemo(
    () => documentosPendientesRaw.filter((d) => d.nivel_validacion === 'DOCUMENTO_OBLIGATORIO').length,
    [documentosPendientesRaw],
  )

  return {
    pendientesPorFuente,
    pendientesCompartidos,
    totalDocsPendientes,
    totalDocsObligatoriosPendientes,
  }
}

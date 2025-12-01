/**
 * Hook para obtener intereses de un cliente específico
 *
 * ✅ Carga intereses desde tabla cliente_intereses
 * ✅ Incluye información de proyecto, vivienda y manzana
 */

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

interface InteresCliente {
  id: string
  proyecto_id: string
  proyecto_nombre?: string
  proyecto_ubicacion?: string
  vivienda_id?: string
  vivienda_numero?: string
  manzana_nombre?: string
  fecha_interes: string
  notas?: string
}

interface UseClienteInteresesReturn {
  intereses: InteresCliente[]
  isLoading: boolean
  error: string | null
}

export function useClienteIntereses(clienteId: string): UseClienteInteresesReturn {
  const [intereses, setIntereses] = useState<InteresCliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarIntereses() {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('cliente_intereses')
          .select(`
            id,
            proyecto_id,
            vivienda_id,
            fecha_interes,
            notas,
            proyectos!cliente_intereses_proyecto_id_fkey (
              nombre,
              ubicacion
            ),
            viviendas!cliente_intereses_vivienda_id_fkey (
              numero,
              manzanas!viviendas_manzana_id_fkey (
                nombre
              )
            )
          `)
          .eq('cliente_id', clienteId)
          .order('fecha_interes', { ascending: false })

        if (queryError) throw queryError

        // Mapear datos
        const interesesMapeados = (data || []).map((interes: any) => ({
          id: interes.id,
          proyecto_id: interes.proyecto_id,
          proyecto_nombre: interes.proyectos?.nombre || 'Proyecto no especificado',
          proyecto_ubicacion: interes.proyectos?.ubicacion || 'No especifica',
          vivienda_id: interes.vivienda_id,
          vivienda_numero: interes.viviendas?.numero || null,
          manzana_nombre: interes.viviendas?.manzanas?.nombre || null,
          fecha_interes: interes.fecha_interes,
          notas: interes.notas,
        }))

        setIntereses(interesesMapeados)
      } catch (err: any) {
        console.error('❌ Error cargando intereses del cliente:', err)
        setError(err.message || 'Error cargando intereses')
        setIntereses([])
      } finally {
        setIsLoading(false)
      }
    }

    if (clienteId) {
      cargarIntereses()
    }
  }, [clienteId])

  return { intereses, isLoading, error }
}

'use client'

/**
 * 📊 TAB DE ACTIVIDAD - PROCESO DE NEGOCIACIÓN
 *
 * Muestra el proceso de compra del cliente con timeline visual.
 * Integra el componente TimelineProceso del módulo admin/procesos.
 */

import { useEffect, useState } from 'react'

import { createBrowserClient } from '@supabase/ssr'
import { Activity, AlertCircle } from 'lucide-react'

import { TimelineProceso } from '@/modules/admin/procesos/components'


import * as styles from '../cliente-detalle.styles'

interface ActividadTabProps {
  clienteId: string
}

export function ActividadTab({ clienteId }: ActividadTabProps) {
  const [negociacionId, setNegociacionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarNegociacion() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Buscar negociación activa del cliente
        const { data, error } = await supabase
          .from('negociaciones')
          .select('id')
          .eq('cliente_id', clienteId)
          .eq('estado', 'Activa')
          .single()

        if (error) {
          // Si no hay negociación activa, no es un error crítico
          if (error.code === 'PGRST116') {
            setError('El cliente no tiene una negociación activa')
          } else {
            setError('Error al cargar negociación')
          }
          setNegociacionId(null)
        } else {
          setNegociacionId(data.id)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error inesperado')
      } finally {
        setLoading(false)
      }
    }

    cargarNegociacion()
  }, [clienteId])

  // Loading
  if (loading) {
    return (
      <div className={styles.emptyStateClasses.container}>
        <Activity className={`${styles.emptyStateClasses.icon} animate-pulse`} />
        <h3 className={styles.emptyStateClasses.title}>Cargando proceso...</h3>
      </div>
    )
  }

  // Sin negociación activa
  if (!negociacionId) {
    return (
      <div className={styles.emptyStateClasses.container}>
        <AlertCircle className={styles.emptyStateClasses.icon} />
        <h3 className={styles.emptyStateClasses.title}>
          {error || 'Sin negociación activa'}
        </h3>
        <p className={styles.emptyStateClasses.description}>
          Este cliente no tiene una negociación activa.
          El proceso de compra se mostrará cuando exista una negociación.
        </p>
      </div>
    )
  }

  // Renderizar timeline de proceso
  return <TimelineProceso negociacionId={negociacionId} />
}

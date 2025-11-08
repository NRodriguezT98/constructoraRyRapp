/**
 * Hook para manejar la carga de proyectos y viviendas
 */

import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

import type { ProyectoBasico, ViviendaDetalle } from '../types'

interface UseProyectosViviendasProps {
  viviendaIdInicial?: string
  valorViviendaInicial?: number
}

export function useProyectosViviendas({
  viviendaIdInicial,
  valorViviendaInicial,
}: UseProyectosViviendasProps = {}) {
  // Estado
  const [proyectos, setProyectos] = useState<ProyectoBasico[]>([])
  const [viviendas, setViviendas] = useState<ViviendaDetalle[]>([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('')
  const [viviendaId, setViviendaId] = useState(viviendaIdInicial || '')
  const [valorNegociado, setValorNegociado] = useState(valorViviendaInicial || 0)

  const [cargandoProyectos, setCargandoProyectos] = useState(false)
  const [cargandoViviendas, setCargandoViviendas] = useState(false)

  // Cargar proyectos
  const cargarProyectos = useCallback(async () => {
    setCargandoProyectos(true)
    try {
      const { proyectosService } = await import('@/modules/proyectos/services/proyectos.service')
      const data = await proyectosService.obtenerProyectos()
      setProyectos(data || [])
    } catch (error) {
      console.error('Error cargando proyectos:', error)
      setProyectos([])
    } finally {
      setCargandoProyectos(false)
    }
  }, [])

  // Cargar viviendas de un proyecto
  const cargarViviendas = useCallback(async (proyectoId: string) => {
    setCargandoViviendas(true)
    try {
      const { data, error } = await supabase
        .from('viviendas')
        .select(`
          *,
          manzanas!inner (
            id,
            nombre,
            proyecto_id
          )
        `)
        .eq('manzanas.proyecto_id', proyectoId)
        .eq('estado', 'Disponible')
        .order('numero')

      if (error) throw error

      // Transformar para incluir manzana_nombre directamente
      const viviendasConManzana = (data || []).map((v: any) => ({
        ...v,
        manzana_nombre: v.manzanas?.nombre,
      }))

      setViviendas(viviendasConManzana)
    } catch (error) {
      console.error('Error cargando viviendas:', error)
      setViviendas([])
    } finally {
      setCargandoViviendas(false)
    }
  }, [])

  // Efecto: Cargar viviendas cuando cambia el proyecto
  useEffect(() => {
    if (proyectoSeleccionado) {
      cargarViviendas(proyectoSeleccionado)
    } else {
      setViviendas([])
      if (!viviendaIdInicial) {
        setViviendaId('')
      }
    }
  }, [proyectoSeleccionado, viviendaIdInicial, cargarViviendas])

  // Efecto: Auto-llenar valor cuando se selecciona vivienda
  useEffect(() => {
    if (viviendaId && !valorViviendaInicial) {
      const vivienda = viviendas.find((v) => v.id === viviendaId)
      if (vivienda?.valor_total) {
        setValorNegociado(vivienda.valor_total)
      }
    }
  }, [viviendaId, viviendas, valorViviendaInicial])

  // Resetear estado
  const resetear = useCallback(() => {
    setProyectoSeleccionado('')
    setViviendaId(viviendaIdInicial || '')
    setValorNegociado(valorViviendaInicial || 0)
    setViviendas([])
  }, [viviendaIdInicial, valorViviendaInicial])

  return {
    // Estado
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaId,
    valorNegociado,

    // Estado de carga
    cargandoProyectos,
    cargandoViviendas,

    // Setters
    setProyectoSeleccionado,
    setViviendaId,
    setValorNegociado,

    // Funciones
    cargarProyectos,
    cargarViviendas,
    resetear,
  }
}

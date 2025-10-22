/**
 * Hook para manejar la selección de intereses en el formulario
 * Carga proyectos y viviendas disponibles
 */

import { supabase } from '@/lib/supabase/client-browser'
import { useCallback, useEffect, useState } from 'react'

interface Proyecto {
  id: string
  nombre: string
  ubicacion: string
}

interface Vivienda {
  id: string
  numero: string
  manzana_nombre: string
  precio: number
  estado: string
}

export function useInteresFormulario() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [viviendas, setViviendas] = useState<Vivienda[]>([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('')
  const [viviendaSeleccionada, setViviendaSeleccionada] = useState<string>('')
  const [notasInteres, setNotasInteres] = useState<string>('')
  const [cargandoProyectos, setCargandoProyectos] = useState(false)
  const [cargandoViviendas, setCargandoViviendas] = useState(false)

  // =====================================================
  // CARGAR PROYECTOS ACTIVOS
  // =====================================================
  useEffect(() => {
    cargarProyectos()
  }, [])

  const cargarProyectos = async () => {
    setCargandoProyectos(true)
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, nombre, ubicacion')
        .in('estado', ['en_planificacion', 'en_construccion'])
        .order('nombre')

      if (error) throw error
      setProyectos(data || [])
    } catch (error) {
      console.error('Error cargando proyectos:', error)
    } finally {
      setCargandoProyectos(false)
    }
  }

  // =====================================================
  // CARGAR VIVIENDAS DISPONIBLES CUANDO SELECCIONA PROYECTO
  // =====================================================
  useEffect(() => {
    if (proyectoSeleccionado) {
      cargarViviendasProyecto(proyectoSeleccionado)
    } else {
      setViviendas([])
      setViviendaSeleccionada('')
    }
  }, [proyectoSeleccionado])

  const cargarViviendasProyecto = async (proyectoId: string) => {
    setCargandoViviendas(true)
    try {
      const { data, error } = await supabase
        .from('viviendas')
        .select(
          `
          id,
          numero,
          precio,
          estado,
          manzanas!inner(
            nombre,
            proyecto_id
          )
        `
        )
        .eq('manzanas.proyecto_id', proyectoId)
        .eq('estado', 'Disponible')
        .order('numero')

      if (error) throw error

      // Transformar datos
      const viviendasFormateadas =
        data?.map((v: any) => ({
          id: v.id,
          numero: v.numero,
          manzana_nombre: v.manzanas?.nombre || '',
          precio: v.precio,
          estado: v.estado,
        })) || []

      setViviendas(viviendasFormateadas)
    } catch (error) {
      console.error('Error cargando viviendas:', error)
      setViviendas([])
    } finally {
      setCargandoViviendas(false)
    }
  }

  // =====================================================
  // HANDLERS
  // =====================================================
  const handleProyectoChange = useCallback((proyectoId: string) => {
    setProyectoSeleccionado(proyectoId)
    setViviendaSeleccionada('') // Reset vivienda cuando cambia proyecto
  }, [])

  const handleViviendaChange = useCallback((viviendaId: string) => {
    setViviendaSeleccionada(viviendaId)
  }, [])

  const handleNotasChange = useCallback((notas: string) => {
    setNotasInteres(notas)
  }, [])

  const resetInteres = useCallback(() => {
    setProyectoSeleccionado('')
    setViviendaSeleccionada('')
    setNotasInteres('')
  }, [])

  // =====================================================
  // OBTENER DATOS DEL INTERÉS
  // =====================================================
  const getInteresData = useCallback(() => {
    if (!proyectoSeleccionado) return undefined

    return {
      proyecto_id: proyectoSeleccionado,
      vivienda_id: viviendaSeleccionada || undefined,
      notas_interes: notasInteres || undefined,
    }
  }, [proyectoSeleccionado, viviendaSeleccionada, notasInteres])

  return {
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaSeleccionada,
    notasInteres,
    cargandoProyectos,
    cargandoViviendas,
    handleProyectoChange,
    handleViviendaChange,
    handleNotasChange,
    resetInteres,
    getInteresData,
    tieneInteres: !!proyectoSeleccionado,
  }
}

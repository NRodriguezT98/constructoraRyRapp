/**
 * Hook para manejar la selección de intereses en el formulario
 * Carga proyectos y viviendas disponibles
 */

import { useCallback, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import {
  obtenerProyectosParaInteres,
  obtenerViviendasParaInteres,
} from '../services/intereses.service'

export function useInteresFormulario() {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('')
  const [viviendaSeleccionada, setViviendaSeleccionada] = useState<string>('')
  const [notasInteres, setNotasInteres] = useState<string>('')

  // ✅ React Query: proyectos activos para el selector
  const { data: proyectos = [], isLoading: cargandoProyectos } = useQuery({
    queryKey: ['proyectos-para-interes'],
    queryFn: obtenerProyectosParaInteres,
    staleTime: 5 * 60 * 1000,
  })

  // ✅ React Query: viviendas disponibles según proyecto seleccionado
  const { data: viviendas = [], isLoading: cargandoViviendas } = useQuery({
    queryKey: ['viviendas-para-interes', proyectoSeleccionado],
    queryFn: () => obtenerViviendasParaInteres(proyectoSeleccionado),
    enabled: !!proyectoSeleccionado,
    staleTime: 2 * 60 * 1000,
  })

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

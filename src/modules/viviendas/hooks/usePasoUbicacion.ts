/**
 * usePasoUbicacion - Hook para lógica del Paso 1 (Ubicación)
 * ✅ Separación de responsabilidades
 * ✅ React Query para carga de datos
 * ✅ Sin lógica en el componente
 */

import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form'

import { proyectosService } from '@/modules/proyectos/services/proyectos.service'
import { viviendasService } from '../services/viviendas.service'

interface UsePasoUbicacionProps {
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
  enabled?: boolean // ← Nuevo: permitir desactivar queries
}

export function usePasoUbicacion({ setValue, watch, enabled = true }: UsePasoUbicacionProps) {
  const proyectoSeleccionado = watch('proyecto_id')
  const manzanaSeleccionada = watch('manzana_id')

  // ✅ React Query: Cargar proyectos (no depende de nada, pero respeta enabled)
  const {
    data: proyectos = [],
    isLoading: cargandoProyectos,
    error: errorProyectos,
  } = useQuery({
    queryKey: ['proyectos'],
    queryFn: () => proyectosService.obtenerProyectos(),
    enabled, // ← Respetar flag enabled
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // ✅ React Query: Cargar manzanas (solo si hay proyecto seleccionado Y enabled)
  const {
    data: manzanas = [],
    isLoading: cargandoManzanas,
    error: errorManzanas,
  } = useQuery({
    queryKey: ['manzanas', proyectoSeleccionado],
    queryFn: () => viviendasService.obtenerManzanasDisponibles(proyectoSeleccionado!),
    enabled: enabled && !!proyectoSeleccionado, // ← Solo ejecuta si enabled Y hay proyecto
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // ✅ React Query: Cargar viviendas de la manzana (para calcular números disponibles)
  const {
    data: viviendasManzana = [],
    isLoading: cargandoNumeros,
  } = useQuery({
    queryKey: ['viviendas-manzana', manzanaSeleccionada],
    queryFn: () => viviendasService.obtenerPorManzana(manzanaSeleccionada!),
    enabled: enabled && !!manzanaSeleccionada, // ← Solo ejecuta si enabled Y hay manzana
    staleTime: 1 * 60 * 1000, // 1 minuto
  })

  // ✅ Calcular números disponibles (useMemo para optimización)
  const numerosDisponibles = useMemo(() => {
    if (!manzanaSeleccionada || !manzanas.length) return []

    const manzanaInfo = manzanas.find(m => m.id === manzanaSeleccionada)
    if (!manzanaInfo) return []

    const numerosUsados = viviendasManzana.map(v => parseInt(v.numero))
    const todosNumeros = Array.from({ length: manzanaInfo.total_viviendas }, (_, i) => i + 1)

    return todosNumeros.filter(num => !numerosUsados.includes(num))
  }, [manzanaSeleccionada, manzanas, viviendasManzana])

  // ✅ Limpiar manzana y número cuando cambia el proyecto
  useEffect(() => {
    if (proyectoSeleccionado) {
      setValue('manzana_id', '')
      setValue('numero', '')
    }
  }, [proyectoSeleccionado, setValue])

  // ✅ Limpiar número cuando cambia la manzana
  useEffect(() => {
    if (manzanaSeleccionada) {
      setValue('numero', '')
    }
  }, [manzanaSeleccionada, setValue])

  // ✅ Información de la manzana seleccionada
  const manzanaInfo = useMemo(() =>
    manzanas.find(m => m.id === manzanaSeleccionada),
    [manzanas, manzanaSeleccionada]
  )

  return {
    // Datos
    proyectos,
    manzanas,
    numerosDisponibles,
    manzanaInfo,

    // Estados de carga
    cargandoProyectos,
    cargandoManzanas,
    cargandoNumeros,

    // Errores (para mostrar en UI si es necesario)
    errorProyectos,
    errorManzanas,
  }
}

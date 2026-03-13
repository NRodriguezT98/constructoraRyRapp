/**
 * Hook: useLocationSelector
 *
 * Hook para manejar la selección en cascada de departamento → ciudad.
 * Sigue el patrón de separación de responsabilidades del proyecto.
 */

'use client'

import { useEffect, useState } from 'react'
import { getCiudadesPorDepartamento, getDepartamentos } from '../data/colombia-locations'

interface UseLocationSelectorParams {
  departamentoInicial?: string
  ciudadInicial?: string
  onDepartamentoChange?: (departamento: string) => void
  onCiudadChange?: (ciudad: string) => void
}

export function useLocationSelector({
  departamentoInicial = '',
  ciudadInicial = '',
  onDepartamentoChange,
  onCiudadChange,
}: UseLocationSelectorParams = {}) {
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(departamentoInicial)
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(ciudadInicial)
  const [ciudadesDisponibles, setCiuداdesDisponibles] = useState<string[]>([])

  // Cargar todos los departamentos (memoizado)
  const departamentos = getDepartamentos()

  // Cargar ciudades cuando cambie el departamento
  useEffect(() => {
    if (departamentoSeleccionado) {
      const ciudades = getCiudadesPorDepartamento(departamentoSeleccionado)
      setCiuداdesDisponibles(ciudades)

      // Si la ciudad actual no pertenece al nuevo departamento, resetearla
      if (ciudadSeleccionada && !ciudades.includes(ciudadSeleccionada)) {
        setCiudadSeleccionada('')
        onCiudadChange?.('')
      }
    } else {
      setCiuداdesDisponibles([])
      setCiudadSeleccionada('')
      onCiudadChange?.('')
    }
  }, [departamentoSeleccionado])

  // Sincronizar con valores externos (modo edición)
  useEffect(() => {
    if (departamentoInicial !== departamentoSeleccionado) {
      setDepartamentoSeleccionado(departamentoInicial)
    }
  }, [departamentoInicial])

  useEffect(() => {
    if (ciudadInicial !== ciudadSeleccionada) {
      setCiudadSeleccionada(ciudadInicial)
    }
  }, [ciudadInicial])

  const handleDepartamentoChange = (departamento: string) => {
    setDepartamentoSeleccionado(departamento)
    onDepartamentoChange?.(departamento)
  }

  const handleCiudadChange = (ciudad: string) => {
    setCiudadSeleccionada(ciudad)
    onCiudadChange?.(ciudad)
  }

  const resetSeleccion = () => {
    setDepartamentoSeleccionado('')
    setCiudadSeleccionada('')
    setCiuداdesDisponibles([])
  }

  return {
    // Datos
    departamentos,
    departamentoSeleccionado,
    ciudadesDisponibles,
    ciudadSeleccionada,

    // Handlers
    handleDepartamentoChange,
    handleCiudadChange,
    resetSeleccion,

    // Estado
    ciudadDeshabilitada: !departamentoSeleccionado || ciudadesDisponibles.length === 0,
  }
}

/**
 * useConfirmarCambiosModal - Hook con lógica del modal de confirmación
 * ✅ Separación de responsabilidades
 * ✅ Lógica de negocio centralizada
 * ✅ Funciones puras reutilizables
 */

import { useMemo } from 'react'

import type { ResumenCambios } from './useDetectarCambios'

interface UseConfirmarCambiosModalParams {
  cambios: ResumenCambios
  isLoading?: boolean
}

export function useConfirmarCambiosModal({
  cambios,
  isLoading = false
}: UseConfirmarCambiosModalParams) {

  // Calcular si hay cambios en el proyecto
  const tieneCambiosProyecto = useMemo(() => {
    return cambios.proyecto.length > 0
  }, [cambios.proyecto])

  // Calcular si hay cambios en manzanas
  const tieneCambiosManzanas = useMemo(() => {
    return cambios.manzanas.length > 0
  }, [cambios.manzanas])

  // Obtener tipo de contenedor para manzana según tipo de cambio
  const getManzanaContainerClass = (tipo: 'agregada' | 'eliminada' | 'modificada') => {
    const classMap = {
      agregada: 'agregada',
      eliminada: 'eliminada',
      modificada: 'modificada',
    }
    return classMap[tipo]
  }

  // Obtener tipo de badge para manzana según tipo de cambio
  const getManzanaBadgeClass = (tipo: 'agregada' | 'eliminada' | 'modificada') => {
    const classMap = {
      agregada: 'badgeAgregada',
      eliminada: 'badgeEliminada',
      modificada: 'badgeModificada',
    }
    return classMap[tipo]
  }

  // Obtener tipo de ícono para manzana según tipo de cambio
  const getManzanaIconClass = (tipo: 'agregada' | 'eliminada' | 'modificada') => {
    const classMap = {
      agregada: 'iconAgregada',
      eliminada: 'iconEliminada',
      modificada: 'iconModificada',
    }
    return classMap[tipo]
  }

  // Formatear texto del botón confirmar
  const getConfirmButtonText = () => {
    return isLoading ? 'Guardando...' : 'Confirmar y Guardar'
  }

  // Validar si hay cambios para mostrar
  const hayCambios = useMemo(() => {
    return cambios.totalCambios > 0
  }, [cambios.totalCambios])

  return {
    // Estados computados
    tieneCambiosProyecto,
    tieneCambiosManzanas,
    hayCambios,

    // Funciones helpers
    getManzanaContainerClass,
    getManzanaBadgeClass,
    getManzanaIconClass,
    getConfirmButtonText,
  }
}

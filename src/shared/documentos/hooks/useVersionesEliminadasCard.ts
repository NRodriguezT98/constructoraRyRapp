/**
 * Hook para manejar expansión y selección de versiones eliminadas
 * en cards de Papelera
 *
 * Funcionalidad:
 * - Expandir/colapsar lista de versiones
 * - Seleccionar versiones individuales
 * - Restaurar versiones seleccionadas
 */

import { useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { DocumentosService } from '../services/documentos.service'
import type { TipoEntidad } from '../types/entidad.types'

interface UseVersionesEliminadasCardProps {
  documentoId: string
  documentoTitulo: string
  modulo: 'proyectos' | 'viviendas' | 'clientes'
  tipoEntidad?: TipoEntidad
}

export function useVersionesEliminadasCard({
  documentoId,
  documentoTitulo: _documentoTitulo,
  modulo,
  tipoEntidad = 'proyecto',
}: UseVersionesEliminadasCardProps) {
  // Estado de expansión del card
  const [isExpanded, setIsExpanded] = useState(false)

  // Query para obtener versiones eliminadas (solo cuando está expandido)
  const {
    data: versiones = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['versiones-eliminadas', documentoId, modulo, tipoEntidad],
    queryFn: async () => {
      // ✅ GENÉRICO: usar servicio central con tipoEntidad
      return DocumentosService.obtenerVersionesEliminadas(
        documentoId,
        tipoEntidad
      )
    },
    enabled: isExpanded, // Solo cargar cuando se expande
    staleTime: 30000, // 30 segundos
  })

  // Toggle expansión
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  // Estadísticas (todas las versiones son eliminadas)
  const stats = useMemo(() => {
    return {
      totalVersiones: versiones.length,
      eliminadas: versiones.length, // Todas son eliminadas
    }
  }, [versiones.length])

  return {
    // Estado
    isExpanded,
    versiones,
    isLoading,
    error,
    stats,

    // Acciones
    toggleExpansion,
  }
}

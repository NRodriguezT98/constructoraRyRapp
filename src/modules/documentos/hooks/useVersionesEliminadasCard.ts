/**
 * Hook para manejar expansión y selección de versiones eliminadas
 * en cards de Papelera
 *
 * Funcionalidad:
 * - Expandir/colapsar lista de versiones
 * - Seleccionar versiones individuales
 * - Restaurar versiones seleccionadas
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
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
  documentoTitulo,
  modulo,
  tipoEntidad = 'proyecto',
}: UseVersionesEliminadasCardProps) {
  const queryClient = useQueryClient()

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
      console.log('🔍 Cargando versiones eliminadas:', { documentoId, modulo, tipoEntidad })

      // Usar servicio correcto según módulo
      if (modulo === 'viviendas') {
        // Importar dinámicamente para viviendas (path directo al archivo)
        const { DocumentosEliminacionService: ViviendaEliminacionService } = await import('@/modules/viviendas/services/documentos/documentos-eliminacion.service')
        return ViviendaEliminacionService.obtenerVersionesEliminadas(documentoId)
      }

      // Por defecto, proyectos
      return DocumentosService.obtenerVersionesEliminadas(documentoId, tipoEntidad)
    },
    enabled: isExpanded, // Solo cargar cuando se expande
    staleTime: 30000, // 30 segundos
  })

  // Toggle expansión
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  // Estadísticas (todas las versiones son eliminadas)
  const stats = useMemo(
    () => {
      return {
        totalVersiones: versiones.length,
        eliminadas: versiones.length, // Todas son eliminadas
      }
    },
    [versiones.length]
  )

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

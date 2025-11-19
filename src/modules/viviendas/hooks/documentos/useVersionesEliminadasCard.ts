/**
 * Hook para manejar expansión y selección de versiones eliminadas
 * en cards de Papelera - VIVIENDAS
 *
 * Funcionalidad:
 * - Expandir/colapsar lista de versiones
 * - Seleccionar versiones individuales
 * - Restaurar versiones seleccionadas
 *
 * ADAPTADO DESDE: src/modules/documentos/hooks/useVersionesEliminadasCard.ts
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DocumentosViviendaService } from '../../services/documentos'

interface UseVersionesEliminadasCardProps {
  documentoId: string
  documentoTitulo: string
}

export function useVersionesEliminadasCard({
  documentoId,
  documentoTitulo,
}: UseVersionesEliminadasCardProps) {
  const queryClient = useQueryClient()

  // Estado de expansión del card
  const [isExpanded, setIsExpanded] = useState(false)

  // Estado de versiones seleccionadas
  const [versionesSeleccionadas, setVersionesSeleccionadas] = useState<Set<string>>(new Set())

  // 🆕 Estado de modal para restaurar seleccionadas
  const [modalRestaurar, setModalRestaurar] = useState({
    isOpen: false,
    cantidad: 0,
    mensaje: '',
  })

  // Query para obtener versiones eliminadas (solo cuando está expandido)
  const {
    data: versiones = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['versiones-eliminadas-vivienda', documentoId],
    queryFn: () => DocumentosViviendaService.obtenerVersionesEliminadas(documentoId),
    enabled: isExpanded, // Solo cargar cuando se expande
    staleTime: 30000, // 30 segundos
  })

  // Mutation para restaurar versiones seleccionadas
  const restaurarMutation = useMutation({
    mutationFn: (versionIds: string[]) =>
      DocumentosViviendaService.restaurarVersionesSeleccionadas(versionIds),
    onSuccess: async () => {
      toast.success('Versiones restauradas exitosamente')

      // 🔧 FIX: Usar refetchQueries para forzar recarga INMEDIATA (sin recargar página)
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['documentos-vivienda-eliminados'] }),
        queryClient.refetchQueries({ queryKey: ['versiones-eliminadas-vivienda', documentoId] }),
        queryClient.refetchQueries({ queryKey: ['documentos-vivienda'] }), // ← Viviendas activas
        queryClient.refetchQueries({ queryKey: ['versiones-documento-vivienda'] }), // ← Historial
      ])

      // Resetear selección pero MANTENER card expandido para ver versiones restantes
      setVersionesSeleccionadas(new Set())
      // ❌ NO cerrar el card: setIsExpanded(false) - Mantener abierto para ver qué quedó
    },
    onError: (error: Error) => {
      console.error('Error al restaurar versiones:', error)
      toast.error(`Error al restaurar: ${error.message}`)
    },
  })

  // Toggle expansión
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
    if (isExpanded) {
      // Al colapsar, limpiar selección
      setVersionesSeleccionadas(new Set())
    }
  }

  // Toggle selección de versión individual
  const toggleVersion = (versionId: string) => {
    setVersionesSeleccionadas((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(versionId)) {
        newSet.delete(versionId)
      } else {
        newSet.add(versionId)
      }
      return newSet
    })
  }

  // Seleccionar todas las versiones (ya vienen filtradas como eliminadas del servicio)
  const seleccionarTodas = () => {
    setVersionesSeleccionadas(new Set(versiones.map((v) => v.id)))
  }

  // Limpiar selección
  const limpiarSeleccion = () => {
    setVersionesSeleccionadas(new Set())
  }

  // Restaurar versiones seleccionadas
  const restaurarSeleccionadas = async () => {
    const idsArray = Array.from(versionesSeleccionadas)

    if (idsArray.length === 0) {
      toast.error('Debe seleccionar al menos una versión eliminada')
      return
    }

    const mensaje =
      idsArray.length === versiones.length
        ? `¿Restaurar todas las ${versiones.length} versiones de "${documentoTitulo}"?`
        : `¿Restaurar ${idsArray.length} versión(es) seleccionada(s) de "${documentoTitulo}"?`

    // Abrir modal de confirmación
    setModalRestaurar({
      isOpen: true,
      cantidad: idsArray.length,
      mensaje,
    })
  }

  // Confirmar restauración de modal
  const confirmarRestaurar = async () => {
    const idsArray = Array.from(versionesSeleccionadas)
    await restaurarMutation.mutateAsync(idsArray)
    setModalRestaurar({ isOpen: false, cantidad: 0, mensaje: '' })
    limpiarSeleccion()
  }

  // Estadísticas (todas las versiones son eliminadas)
  const stats = useMemo(
    () => {
      return {
        totalVersiones: versiones.length,
        eliminadas: versiones.length, // Todas son eliminadas
        seleccionadas: versionesSeleccionadas.size,
        todasSeleccionadas: versionesSeleccionadas.size === versiones.length && versiones.length > 0,
      }
    },
    [versiones.length, versionesSeleccionadas.size]
  )

  return {
    // Estado
    isExpanded,
    versiones,
    versionesSeleccionadas,
    isLoading,
    error,
    stats,

    // Acciones
    toggleExpansion,
    toggleVersion,
    seleccionarTodas,
    limpiarSeleccion,
    restaurarSeleccionadas,
    confirmarRestaurar,

    // Mutations state
    isRestaurando: restaurarMutation.isPending,

    // 🆕 Modal
    modalRestaurar,
    setModalRestaurar,
  }
}

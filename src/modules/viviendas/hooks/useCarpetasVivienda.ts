/**
 * @file useCarpetasVivienda.ts
 * @description Hook de React Query para gestión de carpetas de viviendas
 * @module viviendas/hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    carpetasViviendaService,
    type ActualizarCarpetaParams,
    type CrearCarpetaParams
} from '../services/carpetas-vivienda.service'

// ============================================
// HOOK PRINCIPAL: Carpetas de una vivienda
// ============================================

export function useCarpetasVivienda(viviendaId: string) {
  const queryClient = useQueryClient()

  // ✅ QUERY: Obtener árbol de carpetas
  const {
    data: arbolCarpetas = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['carpetas-vivienda-arbol', viviendaId],
    queryFn: () => carpetasViviendaService.obtenerArbolCarpetas(viviendaId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10,
    enabled: !!viviendaId,
  })

  // ✅ QUERY: Carpetas planas (para selects/dropdowns)
  const { data: carpetasPlanas = [] } = useQuery({
    queryKey: ['carpetas-vivienda-planas', viviendaId],
    queryFn: () => carpetasViviendaService.obtenerCarpetas(viviendaId),
    staleTime: 1000 * 60 * 5,
    enabled: !!viviendaId,
  })

  // ✅ MUTATION: Crear carpeta
  const crearCarpetaMutation = useMutation({
    mutationFn: (params: CrearCarpetaParams) =>
      carpetasViviendaService.crearCarpeta(params),
    onMutate: () => {
      toast.loading('Creando carpeta...', { id: 'create-folder' })
    },
    onSuccess: (data) => {
      // Invalidar queries
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-arbol', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-planas', viviendaId],
      })

      toast.success(`Carpeta "${data.nombre}" creada correctamente`, {
        id: 'create-folder',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear carpeta', {
        id: 'create-folder',
      })
    },
  })

  // ✅ MUTATION: Actualizar carpeta
  const actualizarCarpetaMutation = useMutation({
    mutationFn: (params: ActualizarCarpetaParams) =>
      carpetasViviendaService.actualizarCarpeta(params),
    onMutate: () => {
      toast.loading('Actualizando carpeta...', { id: 'update-folder' })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-arbol', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-planas', viviendaId],
      })

      toast.success(`Carpeta "${data.nombre}" actualizada`, {
        id: 'update-folder',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar carpeta', {
        id: 'update-folder',
      })
    },
  })

  // ✅ MUTATION: Eliminar carpeta
  const eliminarCarpetaMutation = useMutation({
    mutationFn: (id: string) => carpetasViviendaService.eliminarCarpeta(id),
    onMutate: () => {
      toast.loading('Eliminando carpeta...', { id: 'delete-folder' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-arbol', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-planas', viviendaId],
      })

      toast.success('Carpeta eliminada correctamente', {
        id: 'delete-folder',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar carpeta', {
        id: 'delete-folder',
      })
    },
  })

  // ✅ MUTATION: Mover documento a carpeta
  const moverDocumentoMutation = useMutation({
    mutationFn: ({
      documentoId,
      carpetaId,
    }: {
      documentoId: string
      carpetaId: string | null
    }) => carpetasViviendaService.moverDocumentoACarpeta(documentoId, carpetaId),
    onMutate: () => {
      toast.loading('Moviendo documento...', { id: 'move-document' })
    },
    onSuccess: () => {
      // Invalidar queries de carpetas y documentos
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-arbol', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['documentos-vivienda', viviendaId],
      })

      toast.success('Documento movido correctamente', {
        id: 'move-document',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al mover documento', {
        id: 'move-document',
      })
    },
  })

  // ✅ MUTATION: Crear carpetas predeterminadas
  const crearCarpetasPredeterminadasMutation = useMutation({
    mutationFn: (viviendaId: string) =>
      carpetasViviendaService.crearCarpetasPredeterminadas(viviendaId),
    onMutate: () => {
      toast.loading('Creando estructura de carpetas...', {
        id: 'create-default-folders',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-arbol', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-planas', viviendaId],
      })

      toast.success('Estructura de carpetas creada correctamente', {
        id: 'create-default-folders',
        description: 'Se crearon 4 carpetas principales con subcarpetas',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear carpetas predeterminadas', {
        id: 'create-default-folders',
      })
    },
  })

  // ✅ MUTATION: Reordenar carpetas
  const reordenarCarpetasMutation = useMutation({
    mutationFn: (carpetas: Array<{ id: string; orden: number }>) =>
      carpetasViviendaService.reordenarCarpetas(carpetas),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-arbol', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['carpetas-vivienda-planas', viviendaId],
      })

      toast.success('Carpetas reordenadas correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al reordenar carpetas')
    },
  })

  return {
    // Data
    arbolCarpetas,
    carpetasPlanas,
    isLoading,
    error,

    // Actions
    crearCarpeta: crearCarpetaMutation.mutateAsync,
    actualizarCarpeta: actualizarCarpetaMutation.mutateAsync,
    eliminarCarpeta: eliminarCarpetaMutation.mutateAsync,
    moverDocumento: moverDocumentoMutation.mutateAsync,
    crearCarpetasPredeterminadas: crearCarpetasPredeterminadasMutation.mutateAsync,
    reordenarCarpetas: reordenarCarpetasMutation.mutateAsync,
    refetch,

    // States
    isCreando: crearCarpetaMutation.isPending,
    isActualizando: actualizarCarpetaMutation.isPending,
    isEliminando: eliminarCarpetaMutation.isPending,
    isMoviendo: moverDocumentoMutation.isPending,
    isReordenando: reordenarCarpetasMutation.isPending,
  }
}

// ============================================
// HOOK: Carpeta individual
// ============================================

export function useCarpeta(carpetaId: string | null) {
  const { data: carpeta, isLoading, error } = useQuery({
    queryKey: ['carpeta', carpetaId],
    queryFn: () => carpetasViviendaService.obtenerCarpeta(carpetaId!),
    enabled: !!carpetaId,
    staleTime: 1000 * 60 * 5,
  })

  return { carpeta, isLoading, error }
}

// ============================================
// HOOK: Ruta de carpeta (breadcrumbs)
// ============================================

export function useRutaCarpeta(carpetaId: string | null) {
  const { data: ruta = [], isLoading } = useQuery({
    queryKey: ['ruta-carpeta', carpetaId],
    queryFn: () => carpetasViviendaService.obtenerRutaCarpeta(carpetaId!),
    enabled: !!carpetaId,
    staleTime: 1000 * 60 * 5,
  })

  return { ruta, isLoading }
}

// ============================================
// HOOK: Buscar carpetas
// ============================================

export function useBuscarCarpetas(viviendaId: string, termino: string) {
  const { data: resultados = [], isLoading } = useQuery({
    queryKey: ['buscar-carpetas', viviendaId, termino],
    queryFn: () => carpetasViviendaService.buscarCarpetas(viviendaId, termino),
    enabled: !!viviendaId && termino.length >= 2,
    staleTime: 1000 * 30, // 30 segundos para búsqueda
  })

  return { resultados, isLoading }
}

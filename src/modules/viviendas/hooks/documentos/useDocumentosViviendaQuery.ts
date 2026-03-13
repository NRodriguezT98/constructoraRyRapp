/**
 * ============================================
 * USE DOCUMENTOS VIVIENDA QUERY (REACT QUERY)
 * ============================================
 *
 * Hooks para gestionar documentos de vivienda usando React Query
 * Reemplaza Zustand store con cache inteligente
 *
 * BENEFICIOS vs Zustand:
 * - âœ… Cache automático (stale-while-revalidate)
 * - âœ… Sin race conditions
 * - âœ… Invalidación automática después de mutations
 * - âœ… Background refetching inteligente
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { CategoriasService } from '@/modules/documentos/services'
import { DocumentosViviendaService } from '../../services/documentos'
import type { DocumentoVivienda } from '../../types/documento-vivienda.types'

// ============================================
// QUERY KEYS (Constantes para cache)
// ============================================
export const documentosViviendaKeys = {
  all: ['documentos-vivienda'] as const,
  lists: () => [...documentosViviendaKeys.all, 'list'] as const,
  list: (viviendaId: string) => [...documentosViviendaKeys.lists(), viviendaId] as const,
  categorias: (userId: string) => ['categorias-vivienda', userId] as const,
}

// ============================================
// 1. HOOK: useDocumentosViviendaQuery
// ============================================
export function useDocumentosViviendaQuery(viviendaId: string) {
  const {
    data: documentos = [],
    isLoading: cargando,
    error,
    refetch,
  } = useQuery({
    queryKey: documentosViviendaKeys.list(viviendaId),
    queryFn: () => DocumentosViviendaService.obtenerDocumentosPorVivienda(viviendaId),
    enabled: !!viviendaId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    documentos,
    cargando,
    error: error as Error | null,
    refrescar: refetch,
  }
}

// ============================================
// 2. HOOK: useCategoriasViviendaQuery
// ============================================
export function useCategoriasViviendaQuery(userId?: string) {
  const queryClient = useQueryClient()

  const {
    data: categorias = [],
    isLoading: cargando,
    error,
  } = useQuery({
    queryKey: [...documentosViviendaKeys.categorias(userId!), 'viviendas'],
    queryFn: async () => {
      const cats = await CategoriasService.obtenerCategoriasPorModulo(userId!, 'viviendas')

      // âœ… SEED AUTOMÁTICO: Si no hay categorías para viviendas, crear las por defecto
      if (cats.length === 0) {
        // Por ahora retornar vacío, el usuario puede crear manualmente o usar las de proyectos
        return []
      }

      return cats
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutos (categorías cambian poco)
    gcTime: 30 * 60 * 1000, // 30 minutos
  })

  return {
    categorias,
    cargando,
    error: error as Error | null,
  }
}

// ============================================
// 3. HOOK: useSubirDocumentoViviendaMutation
// ============================================
export function useSubirDocumentoViviendaMutation(viviendaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      archivo: File
      titulo: string
      descripcion?: string
      categoriaId?: string
      fechaDocumento?: string
      fechaVencimiento?: string
      esImportante?: boolean
      userId: string
    }) =>
      DocumentosViviendaService.subirDocumento(
        {
          vivienda_id: viviendaId,
          categoria_id: params.categoriaId,
          titulo: params.titulo,
          descripcion: params.descripcion,
          archivo: params.archivo,
          fecha_documento: params.fechaDocumento,
          fecha_vencimiento: params.fechaVencimiento,
          es_importante: params.esImportante,
        },
        params.userId
      ),
    onSuccess: async (nuevoDocumento) => {
      // âœ… PASO 1: Invalidar todas las queries relacionadas con documentos
      await queryClient.invalidateQueries({
        queryKey: documentosViviendaKeys.list(viviendaId),
      })

      // âœ… PASO 2: Refetch INMEDIATO y FORZADO
      await queryClient.refetchQueries({
        queryKey: documentosViviendaKeys.list(viviendaId),
        type: 'active',
      })

      // âœ… PASO 3: Actualización optimista del cache (agregar documento manualmente)
      queryClient.setQueryData<DocumentoVivienda[]>(
        documentosViviendaKeys.list(viviendaId),
        (oldDocumentos = []) => {
          // Si el documento ya está en la lista (del refetch), no duplicar
          const existe = oldDocumentos.some(doc => doc.id === nuevoDocumento.id)
          if (existe) return oldDocumentos

          // Agregar el nuevo documento al inicio de la lista
          return [nuevoDocumento, ...oldDocumentos]
        }
      )

      toast.success('Documento subido correctamente', {
        description: nuevoDocumento.titulo,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al subir documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 4. HOOK: useActualizarDocumentoViviendaMutation
// ============================================
export function useActualizarDocumentoViviendaMutation(viviendaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentoId,
      updates,
    }: {
      documentoId: string
      updates: Partial<DocumentoVivienda>
    }) => DocumentosViviendaService.actualizarDocumento(documentoId, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentosViviendaKeys.list(viviendaId) })
      toast.success('Documento actualizado')
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 5. HOOK: useEliminarDocumentoViviendaMutation
// ============================================
export function useEliminarDocumentoViviendaMutation(viviendaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: string) => DocumentosViviendaService.eliminarDocumento(documentoId),
    onSuccess: async () => {
      // ðŸ”§ FIX: Usar refetchQueries para forzar recarga INMEDIATA en Papelera
      await Promise.all([
        queryClient.refetchQueries({ queryKey: documentosViviendaKeys.list(viviendaId) }),
        queryClient.refetchQueries({ queryKey: ['documentos-vivienda-eliminados'] }), // â† Papelera
        queryClient.refetchQueries({ queryKey: ['versiones-vivienda-eliminadas'] }), // â† Versiones en papelera
      ])
      toast.success('Documento eliminado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 6. HOOK: useToggleImportanteViviendaMutation
// ============================================
export function useToggleImportanteViviendaMutation(viviendaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentoId: string) => {

      // Obtener documento actual del cache
      const documentos = queryClient.getQueryData<DocumentoVivienda[]>(
        documentosViviendaKeys.list(viviendaId)
      )
      const documento = documentos?.find((d) => d.id === documentoId)

      if (!documento) {
        console.error('âŒ [Toggle Importante] Documento no encontrado en cache')
        throw new Error('Documento no encontrado')
      }

      // Toggle importante
      return DocumentosViviendaService.actualizarDocumento(documentoId, {
        es_importante: !documento.es_importante,
      })
    },
    onSuccess: async (result) => {

      // âœ… Invalidar y refetch inmediato (sin optimistic update)
      await queryClient.invalidateQueries({
        queryKey: documentosViviendaKeys.list(viviendaId),
      })

      await queryClient.refetchQueries({
        queryKey: documentosViviendaKeys.list(viviendaId),
        type: 'active',
      })

      toast.success('âœ… Documento actualizado')
    },
    onError: (err) => {
      console.error('âŒ [Toggle Importante] Error:', err)
      toast.error('Error al actualizar documento')
    },
  })
}

// ============================================
// 7. HOOK: useArchivarDocumentoViviendaMutation
// ============================================
export function useArchivarDocumentoViviendaMutation(viviendaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: string) => DocumentosViviendaService.archivarDocumento(documentoId),
    onSuccess: async () => {
      // Invalidar ambas queries: activos y archivados
      await Promise.all([
        queryClient.refetchQueries({ queryKey: documentosViviendaKeys.list(viviendaId) }),
        queryClient.refetchQueries({ queryKey: [...documentosViviendaKeys.list(viviendaId), 'archivados'] }),
      ])

      toast.success('ðŸ“¦ Documento archivado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al archivar documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 8. HOOK: useRestaurarDocumentoViviendaMutation
// ============================================
export function useRestaurarDocumentoViviendaMutation(viviendaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: string) => DocumentosViviendaService.restaurarDocumento(documentoId),
    onSuccess: async () => {
      // Invalidar ambas queries: activos y archivados
      await Promise.all([
        queryClient.refetchQueries({ queryKey: documentosViviendaKeys.list(viviendaId) }),
        queryClient.refetchQueries({ queryKey: [...documentosViviendaKeys.list(viviendaId), 'archivados'] }),
      ])

      toast.success('âœ… Documento restaurado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al restaurar documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 9. HOOK: useDocumentosArchivadosViviendaQuery
// ============================================
export function useDocumentosArchivadosViviendaQuery(viviendaId: string) {
  const {
    data: documentos = [],
    isLoading: cargando,
    error,
    refetch,
  } = useQuery({
    queryKey: [...documentosViviendaKeys.list(viviendaId), 'archivados'],
    queryFn: () => DocumentosViviendaService.obtenerDocumentosArchivados(viviendaId),
    enabled: !!viviendaId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    documentos,
    cargando,
    error: error as Error | null,
    refrescar: refetch,
  }
}

// ============================================
// 10. HOOK: useCrearCategoriaMutation
// ============================================
export function useCrearCategoriaMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoria: { nombre: string; icono: string; color: string; descripcion?: string }) =>
      CategoriasService.crearCategoria(userId, {
        nombre: categoria.nombre,
        icono: categoria.icono,
        color: categoria.color,
        descripcion: categoria.descripcion,
        es_global: false,
        orden: 0,
        modulos_permitidos: ['viviendas'],
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...documentosViviendaKeys.categorias(userId), 'viviendas'],
      })
      toast.success('Categoría creada correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al crear categoría', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 11. HOOK: useActualizarCategoriaMutation
// ============================================
export function useActualizarCategoriaMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      categoriaId,
      updates,
    }: {
      categoriaId: string
      updates: { nombre?: string; icono?: string; color?: string }
    }) => CategoriasService.actualizarCategoria(categoriaId, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...documentosViviendaKeys.categorias(userId), 'viviendas'],
      })
      toast.success('Categoría actualizada correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar categoría', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 12. HOOK: useEliminarCategoriaMutation
// ============================================
export function useEliminarCategoriaMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoriaId: string) => CategoriasService.eliminarCategoria(categoriaId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...documentosViviendaKeys.categorias(userId), 'viviendas'],
      })
      toast.success('Categoría eliminada correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar categoría', {
        description: error.message,
      })
    },
  })
}

/**
 * ============================================
 * USE DOCUMENTOS QUERY (REACT QUERY)
 * ============================================
 *
 * Hooks para gestionar documentos usando React Query
 * Reemplaza Zustand store con cache inteligente
 *
 * BENEFICIOS vs Zustand:
 * - ✅ Cache automático (stale-while-revalidate)
 * - ✅ Sin race conditions
 * - ✅ Invalidación automática después de mutations
 * - ✅ Background refetching inteligente
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CategoriasService, DocumentosService } from '../services'
import type { DocumentoProyecto } from '../types'

// ============================================
// QUERY KEYS (Constantes para cache)
// ============================================
export const documentosKeys = {
  all: ['documentos'] as const,
  lists: () => [...documentosKeys.all, 'list'] as const,
  list: (proyectoId: string) => [...documentosKeys.lists(), proyectoId] as const,
  categorias: (userId: string) => ['categorias', userId] as const,
}

// ============================================
// 1. HOOK: useDocumentosProyectoQuery
// ============================================
export function useDocumentosProyectoQuery(proyectoId: string) {
  const {
    data: documentos = [],
    isLoading: cargando,
    error,
    refetch,
  } = useQuery({
    queryKey: documentosKeys.list(proyectoId),
    queryFn: () => DocumentosService.obtenerDocumentosPorProyecto(proyectoId),
    enabled: !!proyectoId,
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
// 2. HOOK: useCategoriasQuery
// ============================================
export function useCategoriasQuery(
  userId?: string,
  modulo: 'proyectos' | 'clientes' | 'viviendas' = 'proyectos'
) {
  const {
    data: categorias = [],
    isLoading: cargando,
    error,
  } = useQuery({
    queryKey: [...documentosKeys.categorias(userId!), modulo],
    queryFn: () => CategoriasService.obtenerCategoriasPorModulo(userId!, modulo),
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
// 3. HOOK: useSubirDocumentoMutation
// ============================================
export function useSubirDocumentoMutation(proyectoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      archivo: File
      titulo: string
      descripcion?: string
      categoriaId?: string
      etiquetas?: string[]
      esImportante?: boolean
      userId: string
    }) =>
      DocumentosService.subirDocumento(
        {
          proyecto_id: proyectoId,
          categoria_id: params.categoriaId,
          titulo: params.titulo,
          descripcion: params.descripcion,
          archivo: params.archivo,
          etiquetas: params.etiquetas,
          es_importante: params.esImportante,
        },
        params.userId
      ),
    onSuccess: (nuevoDocumento) => {
      // ✅ Invalidación automática del cache
      queryClient.invalidateQueries({ queryKey: documentosKeys.list(proyectoId) })

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
// 4. HOOK: useActualizarDocumentoMutation
// ============================================
export function useActualizarDocumentoMutation(proyectoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentoId,
      updates,
    }: {
      documentoId: string
      updates: Partial<DocumentoProyecto>
    }) => DocumentosService.actualizarDocumento(documentoId, updates),
    onSuccess: (documentoActualizado) => {
      queryClient.invalidateQueries({ queryKey: documentosKeys.list(proyectoId) })

      toast.success('Documento actualizado', {
        description: documentoActualizado.titulo,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 5. HOOK: useEliminarDocumentoMutation
// ============================================
export function useEliminarDocumentoMutation(proyectoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: string) => DocumentosService.eliminarDocumento(documentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentosKeys.list(proyectoId) })
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
// 6. HOOK: useToggleImportanteMutation
// ============================================
export function useToggleImportanteMutation(proyectoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentoId: string) => {
      // Obtener documento actual del cache
      const documentos = queryClient.getQueryData<DocumentoProyecto[]>(
        documentosKeys.list(proyectoId)
      )
      const documento = documentos?.find((d) => d.id === documentoId)

      if (!documento) throw new Error('Documento no encontrado')

      // Toggle importante
      return DocumentosService.actualizarDocumento(documentoId, {
        es_importante: !documento.es_importante,
      })
    },
    onMutate: async (documentoId) => {
      // ✅ Optimistic update
      await queryClient.cancelQueries({ queryKey: documentosKeys.list(proyectoId) })

      const previousDocumentos = queryClient.getQueryData<DocumentoProyecto[]>(
        documentosKeys.list(proyectoId)
      )

      // Actualizar cache optimísticamente
      queryClient.setQueryData<DocumentoProyecto[]>(
        documentosKeys.list(proyectoId),
        (old) =>
          old?.map((doc) =>
            doc.id === documentoId
              ? { ...doc, es_importante: !doc.es_importante }
              : doc
          ) || []
      )

      return { previousDocumentos }
    },
    onError: (err, documentoId, context) => {
      // Revertir si falla
      if (context?.previousDocumentos) {
        queryClient.setQueryData(documentosKeys.list(proyectoId), context.previousDocumentos)
      }
      toast.error('Error al actualizar documento')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: documentosKeys.list(proyectoId) })
    },
  })
}

// ============================================
// 7. HOOK: useCrearCategoriaMutation
// ============================================
export function useCrearCategoriaMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoria: {
      nombre: string
      descripcion?: string
      color: string
      icono?: string
      modulo: 'proyectos' | 'clientes' | 'viviendas'
    }) =>
      CategoriasService.crearCategoria(userId, {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        color: categoria.color,
        icono: categoria.icono,
        orden: 0,
        es_global: false,
        modulos_permitidos: [categoria.modulo],
      }),
    onSuccess: (nuevaCategoria) => {
      queryClient.invalidateQueries({ queryKey: documentosKeys.categorias(userId) })
      toast.success('Categoría creada', {
        description: nuevaCategoria.nombre,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear categoría', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 8. HOOK: useActualizarCategoriaMutation
// ============================================
export function useActualizarCategoriaMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      categoriaId,
      updates,
    }: {
      categoriaId: string
      updates: {
        nombre?: string
        descripcion?: string
        color?: string
        icono?: string
        orden?: number
      }
    }) => CategoriasService.actualizarCategoria(categoriaId, updates),
    onSuccess: (categoriaActualizada) => {
      queryClient.invalidateQueries({ queryKey: documentosKeys.categorias(userId) })
      toast.success('Categoría actualizada', {
        description: categoriaActualizada.nombre,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar categoría', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 9. HOOK: useEliminarCategoriaMutation
// ============================================
export function useEliminarCategoriaMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoriaId: string) => CategoriasService.eliminarCategoria(categoriaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentosKeys.categorias(userId) })
      toast.success('Categoría eliminada')
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar categoría', {
        description: error.message,
      })
    },
  })
}

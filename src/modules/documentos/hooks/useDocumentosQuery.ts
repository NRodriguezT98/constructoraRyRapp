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
  const queryClient = useQueryClient()

  const {
    data: categorias = [],
    isLoading: cargando,
    error,
  } = useQuery({
    queryKey: [...documentosKeys.categorias(userId!), modulo],
    queryFn: async () => {
      const cats = await CategoriasService.obtenerCategoriasPorModulo(userId!, modulo)

      // ✅ SEED AUTOMÁTICO: Si no hay categorías para proyectos, crear las por defecto
      if (cats.length === 0 && modulo === 'proyectos') {
        console.log('📋 No hay categorías para proyectos. Creando categorías por defecto...')
        await CategoriasService.crearCategoriasProyectosDefault(userId!)

        // Refrescar categorías después de crearlas
        const categoriasNuevas = await CategoriasService.obtenerCategoriasPorModulo(userId!, modulo)
        toast.success('✅ Categorías creadas automáticamente')
        return categoriasNuevas
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
      fechaDocumento?: string
      fechaVencimiento?: string
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
          fecha_documento: params.fechaDocumento,
          fecha_vencimiento: params.fechaVencimiento,
          es_importante: params.esImportante,
        },
        params.userId
      ),
    onSuccess: async (nuevoDocumento) => {
      // ✅ PASO 1: Invalidar todas las queries relacionadas con documentos
      await queryClient.invalidateQueries({
        queryKey: documentosKeys.list(proyectoId),
      })

      // ✅ PASO 2: Refetch INMEDIATO y FORZADO
      await queryClient.refetchQueries({
        queryKey: documentosKeys.list(proyectoId),
        type: 'active',
      })

      // ✅ PASO 3: Actualización optimista del cache (agregar documento manualmente)
      queryClient.setQueryData<DocumentoProyecto[]>(
        documentosKeys.list(proyectoId),
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
    onSuccess: async () => {
      // 🔧 FIX: Usar refetchQueries para forzar recarga INMEDIATA en Papelera
      await Promise.all([
        queryClient.refetchQueries({ queryKey: documentosKeys.list(proyectoId) }),
        queryClient.refetchQueries({ queryKey: ['documentos-eliminados'] }), // ← Papelera
        queryClient.refetchQueries({ queryKey: ['versiones-eliminadas'] }), // ← Versiones en papelera
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
// 6. HOOK: useToggleImportanteMutation
// ============================================
export function useToggleImportanteMutation(proyectoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentoId: string) => {
      console.log('🔄 [Toggle Importante] Iniciando para documento:', documentoId)

      // Obtener documento actual del cache
      const documentos = queryClient.getQueryData<DocumentoProyecto[]>(
        documentosKeys.list(proyectoId)
      )
      const documento = documentos?.find((d) => d.id === documentoId)

      if (!documento) {
        console.error('❌ [Toggle Importante] Documento no encontrado en cache')
        throw new Error('Documento no encontrado')
      }

      console.log('📄 [Toggle Importante] Documento actual:', {
        id: documento.id,
        titulo: documento.titulo,
        es_importante: documento.es_importante,
        nuevo_valor: !documento.es_importante
      })

      // Toggle importante
      return DocumentosService.actualizarDocumento(documentoId, {
        es_importante: !documento.es_importante,
      })
    },
    onSuccess: async (result) => {
      console.log('✅ [Toggle Importante] Actualización exitosa:', {
        id: result.id,
        titulo: result.titulo,
        es_importante: result.es_importante
      })

      // ✅ Invalidar y refetch inmediato (sin optimistic update)
      await queryClient.invalidateQueries({
        queryKey: documentosKeys.list(proyectoId),
      })

      await queryClient.refetchQueries({
        queryKey: documentosKeys.list(proyectoId),
        type: 'active',
      })

      toast.success(
        result.es_importante
          ? '⭐ Marcado como importante'
          : 'Desmarcado como importante'
      )
    },
    onError: (err) => {
      console.error('❌ [Toggle Importante] Error:', err)
      toast.error('Error al actualizar documento')
    },
  })
}// ============================================
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
        es_global: true, // ✅ FIX: Crear como global para que sea visible
        modulos_permitidos: [categoria.modulo],
      }),
    onSuccess: async (nuevaCategoria, variables) => {
      // ✅ FIX: Invalidar queries con el módulo específico
      await queryClient.invalidateQueries({
        queryKey: [...documentosKeys.categorias(userId), variables.modulo],
      })

      // ✅ Forzar refetch inmediato
      await queryClient.refetchQueries({
        queryKey: [...documentosKeys.categorias(userId), variables.modulo],
        type: 'active',
      })

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
    onSuccess: async (categoriaActualizada) => {
      // ✅ FIX: Invalidar todas las queries de categorías (todos los módulos)
      await queryClient.invalidateQueries({
        queryKey: documentosKeys.categorias(userId),
      })

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
    onSuccess: async () => {
      // ✅ FIX: Invalidar todas las queries de categorías (todos los módulos)
      await queryClient.invalidateQueries({
        queryKey: documentosKeys.categorias(userId),
      })

      toast.success('Categoría eliminada')
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar categoría', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 10. HOOK: useDocumentosArchivadosQuery
// ============================================
export function useDocumentosArchivadosQuery(proyectoId: string) {
  const {
    data: documentos = [],
    isLoading: cargando,
    error,
    refetch,
  } = useQuery({
    queryKey: [...documentosKeys.list(proyectoId), 'archivados'],
    queryFn: () => DocumentosService.obtenerDocumentosArchivados(proyectoId),
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
// 11. HOOK: useArchivarDocumentoMutation
// ============================================
export function useArchivarDocumentoMutation(proyectoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: string) => DocumentosService.archivarDocumento(documentoId),
    onSuccess: async () => {
      // Invalidar ambas queries: activos y archivados
      await Promise.all([
        queryClient.refetchQueries({ queryKey: documentosKeys.list(proyectoId) }),
        queryClient.refetchQueries({ queryKey: [...documentosKeys.list(proyectoId), 'archivados'] }),
      ])

      toast.success('📦 Documento archivado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al archivar documento', {
        description: error.message,
      })
    },
  })
}

// ============================================
// 12. HOOK: useRestaurarDocumentoMutation
// ============================================
export function useRestaurarDocumentoMutation(proyectoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: string) => DocumentosService.restaurarDocumento(documentoId),
    onSuccess: async () => {
      // Invalidar ambas queries: activos y archivados
      await Promise.all([
        queryClient.refetchQueries({ queryKey: documentosKeys.list(proyectoId) }),
        queryClient.refetchQueries({ queryKey: [...documentosKeys.list(proyectoId), 'archivados'] }),
      ])

      toast.success('✅ Documento restaurado correctamente')
    },
    onError: (error: Error) => {
      toast.error('Error al restaurar documento', {
        description: error.message,
      })
    },
  })
}

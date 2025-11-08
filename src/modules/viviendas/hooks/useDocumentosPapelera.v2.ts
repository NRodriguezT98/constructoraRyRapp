/**
 * 🗑️ HOOK: useDocumentosPapelera V2
 *
 * Lógica de negocio para gestión de documentos eliminados (papelera)
 * - Listar documentos eliminados (raíz + versiones jerárquicas)
 * - Restaurar documentos (completos o versiones individuales)
 * - Eliminar permanentemente (completo o versiones específicas seleccionadas)
 */

import { useCallback, useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'

import { documentosViviendaService } from '../services/documentos-vivienda.service'

interface UseDocumentosPapeleraParams {
  viviendaId: string
}

export interface DocumentoEliminadoJerarquico {
  id: string
  titulo: string
  version: number
  documento_padre_id: string | null
  metadata: any
  fecha_creacion: string
  versiones: DocumentoEliminadoJerarquico[] // Versiones hijas
  total_versiones: number // Total incluyendo hijas
}

export function useDocumentosPapeleraV2({ viviendaId }: UseDocumentosPapeleraParams) {
  const { user, perfil } = useAuth()
  const queryClient = useQueryClient()

  // Estado para versiones seleccionadas por documento
  const [versionesSeleccionadas, setVersionesSeleccionadas] = useState<Record<string, Set<string>>>({})

  // ✅ QUERY: Obtener documentos eliminados
  const {
    data: documentosEliminadosRaw = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['documentos-eliminados', viviendaId],
    queryFn: () => documentosViviendaService.obtenerDocumentosEliminados(viviendaId),
    enabled: perfil?.rol === 'Administrador', // Solo Admin puede ver
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // ✅ COMPUTED: Organizar documentos en jerarquía (raíz + versiones)
  const documentosEliminados = useMemo(() => {
    const raices = documentosEliminadosRaw.filter(doc => !doc.documento_padre_id)

    return raices.map(raiz => {
      const versiones = documentosEliminadosRaw.filter(
        doc => doc.documento_padre_id === raiz.id
      ).sort((a, b) => a.version - b.version)

      return {
        ...raiz,
        versiones: versiones.map(v => ({ ...v, versiones: [], total_versiones: 1 })),
        total_versiones: 1 + versiones.length
      } as DocumentoEliminadoJerarquico
    })
  }, [documentosEliminadosRaw])

  // ✅ Handlers de selección
  const toggleVersionSeleccionada = useCallback((documentoRaizId: string, versionId: string) => {
    setVersionesSeleccionadas(prev => {
      const seleccionadas = new Set(prev[documentoRaizId] || [])

      if (seleccionadas.has(versionId)) {
        seleccionadas.delete(versionId)
      } else {
        seleccionadas.add(versionId)
      }

      return {
        ...prev,
        [documentoRaizId]: seleccionadas
      }
    })
  }, [])

  const toggleTodasVersiones = useCallback((documentoRaizId: string, documento: DocumentoEliminadoJerarquico) => {
    setVersionesSeleccionadas(prev => {
      const seleccionadas = new Set(prev[documentoRaizId] || [])
      const todasLasVersiones = [documento.id, ...documento.versiones.map(v => v.id)]

      // Si todas están seleccionadas, deseleccionar todo
      const todasSeleccionadas = todasLasVersiones.every(id => seleccionadas.has(id))

      if (todasSeleccionadas) {
        return {
          ...prev,
          [documentoRaizId]: new Set()
        }
      } else {
        // Seleccionar todas
        return {
          ...prev,
          [documentoRaizId]: new Set(todasLasVersiones)
        }
      }
    })
  }, [])

  const limpiarSeleccion = useCallback((documentoRaizId: string) => {
    setVersionesSeleccionadas(prev => {
      const nuevo = { ...prev }
      delete nuevo[documentoRaizId]
      return nuevo
    })
  }, [])

  // ✅ MUTATION: Restaurar documento
  const restaurarMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user || !perfil) {
        throw new Error('Debe iniciar sesión')
      }
      return documentosViviendaService.restaurarDocumento(id, user.id, perfil.rol)
    },
    onMutate: () => {
      toast.loading('Restaurando documento...', { id: 'restore-doc' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['documentos-vivienda', viviendaId],
      })

      toast.success('Documento restaurado correctamente', {
        id: 'restore-doc',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al restaurar', {
        id: 'restore-doc',
      })
    },
  })

  // ✅ MUTATION: Eliminar permanentemente (múltiples versiones)
  const eliminarPermanenteMutation = useMutation({
    mutationFn: async ({ ids, motivo }: { ids: string[]; motivo: string }) => {
      if (!user || !perfil) {
        throw new Error('Debe iniciar sesión')
      }

      // Eliminar cada ID individualmente
      const promesas = ids.map(id =>
        documentosViviendaService.eliminarPermanente(id, user.id, perfil.rol, motivo)
      )

      return Promise.all(promesas)
    },
    onMutate: () => {
      toast.loading('Eliminando permanentemente...', { id: 'delete-permanent' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados', viviendaId],
      })

      toast.success('Documentos eliminados permanentemente', {
        id: 'delete-permanent',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar permanentemente', {
        id: 'delete-permanent',
      })
    },
  })

  // ✅ Handler: Restaurar documento (completo o versión individual)
  const handleRestaurar = useCallback(
    async (id: string, titulo: string, esRaiz: boolean) => {
      const mensaje = esRaiz
        ? `¿Restaurar el documento "${titulo}" con todas sus versiones?\n\nTodo volverá a estar activo.`
        : `¿Restaurar solo esta versión de "${titulo}"?`

      const confirmado = window.confirm(mensaje)

      if (!confirmado) return

      try {
        await restaurarMutation.mutateAsync(id)
      } catch (error) {
        console.error('❌ Error al restaurar documento:', error)
      }
    },
    [restaurarMutation]
  )

  // ✅ Handler: Eliminar permanentemente versiones seleccionadas
  const handleEliminarSeleccionadas = useCallback(
    async (documentoRaizId: string, titulo: string) => {
      const seleccionadas = versionesSeleccionadas[documentoRaizId]

      if (!seleccionadas || seleccionadas.size === 0) {
        toast.error('Selecciona al menos una versión para eliminar')
        return
      }

      const ids = Array.from(seleccionadas)
      const cantidad = ids.length

      // 1. Primera confirmación
      const textoConfirmacion = cantidad === 1
        ? `⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE\n\nVas a eliminar PERMANENTEMENTE 1 versión de:\n"${titulo}"`
        : `⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE\n\nVas a eliminar PERMANENTEMENTE ${cantidad} versiones de:\n"${titulo}"`

      const confirmado = window.confirm(
        `${textoConfirmacion}\n\n` +
        `Se eliminarán:\n` +
        `- ${cantidad} registro(s) de la base de datos\n` +
        `- ${cantidad} archivo(s) físicos de Storage\n\n` +
        `¿Estás ABSOLUTAMENTE seguro?`
      )

      if (!confirmado) return

      // 2. Solicitar motivo
      const motivo = window.prompt(
        `Proporciona el motivo de eliminación PERMANENTE (mínimo 20 caracteres):`
      )

      if (!motivo) return

      if (motivo.trim().length < 20) {
        toast.error('El motivo debe tener al menos 20 caracteres')
        return
      }

      // 3. Segunda confirmación (doble check)
      const confirmadoFinal = window.confirm(
        `🔥 ÚLTIMA CONFIRMACIÓN\n\n` +
        `Eliminarás PERMANENTEMENTE ${cantidad} versión(es) de "${titulo}"\n\n` +
        `Motivo: ${motivo}\n\n` +
        `Esta acción NO se puede deshacer.\n` +
        `¿Proceder?`
      )

      if (!confirmadoFinal) return

      try {
        await eliminarPermanenteMutation.mutateAsync({ ids, motivo: motivo.trim() })
        limpiarSeleccion(documentoRaizId)
      } catch (error) {
        console.error('❌ Error al eliminar permanentemente:', error)
      }
    },
    [versionesSeleccionadas, eliminarPermanenteMutation, limpiarSeleccion]
  )

  return {
    // Data
    documentosEliminados,
    isLoading,
    error: error ? (error as Error).message : null,
    cantidadEliminados: documentosEliminados.length,

    // Selección
    versionesSeleccionadas,
    toggleVersionSeleccionada,
    toggleTodasVersiones,
    limpiarSeleccion,

    // Actions
    handleRestaurar,
    handleEliminarSeleccionadas,
    refetch,

    // States
    isRestaurando: restaurarMutation.isPending,
    isEliminandoPermanente: eliminarPermanenteMutation.isPending,
  }
}

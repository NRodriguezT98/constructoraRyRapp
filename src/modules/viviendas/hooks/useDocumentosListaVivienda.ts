/**
 * ============================================
 * HOOK: useDocumentosListaVivienda
 * ============================================
 * Hook con lógica de negocio para listar y gestionar documentos de vivienda
 * SOLO LÓGICA - UI en DocumentosListaVivienda component
 */

import { useCallback, useMemo, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'

import { useDocumentosVivienda } from './useDocumentosVivienda'

interface UseDocumentosListaViviendaParams {
  viviendaId: string
}

export type OrdenDocumentos = 'fecha-desc' | 'fecha-asc' | 'nombre-asc' | 'nombre-desc' | 'categoria'

export function useDocumentosListaVivienda({ viviendaId }: UseDocumentosListaViviendaParams) {
  const { user, perfil } = useAuth()
  const {
    documentos,
    isLoading,
    error,
    descargarDocumento,
    verDocumento,
    eliminarDocumento,
    isDescargando,
    isViendoDocumento,
    isEliminando,
  } = useDocumentosVivienda(viviendaId)

  // ✅ Estados de filtros y búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [soloImportantes, setSoloImportantes] = useState(false)
  const [ordenamiento, setOrdenamiento] = useState<OrdenDocumentos>('fecha-desc')

  // ✅ Permisos: Solo Administrador puede eliminar
  const canDelete = perfil?.rol === 'Administrador'

  // ✅ Detectar si existe Certificado de Tradición
  const tieneCertificadoTradicion = useMemo(() => {
    return documentos.some(
      (doc) =>
        doc.categoria?.nombre === 'Certificado de Tradición' ||
        doc.titulo.toLowerCase().includes('certificado de tradición') ||
        doc.titulo.toLowerCase().includes('certificado tradicion') ||
        doc.titulo.toLowerCase().includes('tradición y libertad')
    )
  }, [documentos])

  // ✅ Documentos filtrados (búsqueda, categoría, importantes)
  const documentosFiltrados = useMemo(() => {
    let filtrados = [...documentos]

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase()
      filtrados = filtrados.filter(
        (doc) =>
          doc.titulo.toLowerCase().includes(termino) ||
          doc.descripcion?.toLowerCase().includes(termino) ||
          doc.categoria?.nombre.toLowerCase().includes(termino) ||
          doc.nombre_original.toLowerCase().includes(termino)
      )
    }

    // Filtro por categoría
    if (categoriaFiltro !== 'todas') {
      filtrados = filtrados.filter((doc) => doc.categoria?.nombre === categoriaFiltro)
    }

    // Filtro por importantes
    if (soloImportantes) {
      filtrados = filtrados.filter((doc) => doc.es_importante)
    }

    // Ordenamiento
    switch (ordenamiento) {
      case 'fecha-desc':
        filtrados.sort(
          (a, b) =>
            new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        )
        break
      case 'fecha-asc':
        filtrados.sort(
          (a, b) =>
            new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime()
        )
        break
      case 'nombre-asc':
        filtrados.sort((a, b) => a.titulo.localeCompare(b.titulo))
        break
      case 'nombre-desc':
        filtrados.sort((a, b) => b.titulo.localeCompare(a.titulo))
        break
      case 'categoria':
        filtrados.sort((a, b) =>
          (a.categoria?.nombre || 'Sin categoría').localeCompare(
            b.categoria?.nombre || 'Sin categoría'
          )
        )
        break
    }

    return filtrados
  }, [documentos, busqueda, categoriaFiltro, soloImportantes, ordenamiento])

  // ✅ Lista de categorías disponibles (para dropdown)
  const categoriasDisponibles = useMemo(() => {
    const categorias = new Set(documentos.map((doc) => doc.categoria?.nombre).filter(Boolean))
    return Array.from(categorias).sort()
  }, [documentos])

  // ✅ Agrupar documentos FILTRADOS por categoría
  const documentosPorCategoria = useMemo(() => {
    const agrupados = documentosFiltrados.reduce(
      (acc, doc) => {
        const categoria = doc.categoria?.nombre || 'Sin categoría'
        if (!acc[categoria]) {
          acc[categoria] = {
            nombre: categoria,
            color: doc.categoria?.color || '#6B7280',
            documentos: [],
          }
        }
        acc[categoria].documentos.push(doc)
        return acc
      },
      {} as Record<string, { nombre: string; color: string; documentos: typeof documentos }>
    )

    // Ordenar documentos dentro de cada categoría por fecha (más reciente primero)
    Object.values(agrupados).forEach((grupo) => {
      grupo.documentos.sort(
        (a, b) =>
          new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
      )
    })

    return agrupados
  }, [documentosFiltrados])

  // ✅ Documentos importantes FILTRADOS (es_importante = true)
  const documentosImportantes = useMemo(
    () =>
      documentosFiltrados
        .filter((doc) => doc.es_importante)
        .sort(
          (a, b) =>
            new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        ),
    [documentosFiltrados]
  )

  // ✅ Documentos recientes (últimos 7 días)
  const documentosRecientes = useMemo(() => {
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)
    return documentos
      .filter((doc) => new Date(doc.fecha_creacion) > hace7Dias)
      .sort(
        (a, b) =>
          new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
      )
      .slice(0, 5) // Máximo 5 recientes
  }, [documentos])

  // ✅ Estadísticas
  const estadisticas = useMemo(() => {
    const totalSize = documentos.reduce((acc, doc) => acc + (doc.tamano_bytes || 0), 0)
    const categorias = new Set(
      documentos.map((doc) => doc.categoria?.nombre || 'Sin categoría')
    )

    return {
      totalDocumentos: documentos.length,
      totalImportantes: documentosImportantes.length,
      totalCategorias: categorias.size,
      espacioUsado: totalSize,
      espacioUsadoMB: (totalSize / (1024 * 1024)).toFixed(2),
    }
  }, [documentos, documentosImportantes])

  // ✅ Handler: Ver documento (abrir en nueva pestaña)
  const handleVer = useCallback(
    async (id: string) => {
      try {
        await verDocumento(id)
      } catch (error) {
        console.error('❌ Error al ver documento:', error)
      }
    },
    [verDocumento]
  )

  // ✅ Handler: Descargar documento
  const handleDescargar = useCallback(
    async (id: string, nombreOriginal: string) => {
      try {
        await descargarDocumento({ id, nombreOriginal })
      } catch (error) {
        console.error('❌ Error al descargar documento:', error)
      }
    },
    [descargarDocumento]
  )

  // ✅ Handler: Eliminar documento
  const handleEliminar = useCallback(
    async (id: string, titulo: string) => {
      // 1. Confirmación inicial
      const confirmado = window.confirm(
        `¿Estás seguro de eliminar el documento "${titulo}"?\n\nEsta acción marcará el documento como eliminado.`
      )

      if (!confirmado) return

      // 2. Solicitar motivo detallado
      const motivo = window.prompt(
        `Por favor, proporciona el motivo de eliminación (mínimo 20 caracteres):`
      )

      if (!motivo) return

      if (motivo.trim().length < 20) {
        alert('❌ El motivo debe tener al menos 20 caracteres')
        return
      }

      try {
        await eliminarDocumento({ id, motivo: motivo.trim() })
      } catch (error) {
        console.error('❌ Error al eliminar documento:', error)
      }
    },
    [eliminarDocumento]
  )

  return {
    // Data
    documentos,
    documentosFiltrados,
    documentosPorCategoria,
    documentosImportantes,
    documentosRecientes,
    estadisticas,
    categoriasDisponibles,
    isLoading,
    error: error ? (error as Error).message : null,

    // Filtros y búsqueda
    busqueda,
    setBusqueda,
    categoriaFiltro,
    setCategoriaFiltro,
    soloImportantes,
    setSoloImportantes,
    ordenamiento,
    setOrdenamiento,

    // Actions
    handleVer,
    handleDescargar,
    handleEliminar,

    // States
    isViendoDocumento,
    isDescargando,
    isEliminando,
    canDelete,

    // Features
    tieneCertificadoTradicion,
  }
}

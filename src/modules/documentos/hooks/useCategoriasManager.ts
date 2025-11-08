import { useCallback, useState } from 'react'

import type { CategoriaFormData } from '../schemas/documento.schema'

import {
    useActualizarCategoriaMutation,
    useCategoriasQuery,
    useCrearCategoriaMutation,
    useEliminarCategoriaMutation
} from './useDocumentosQuery'

type Modo = 'lista' | 'crear' | 'editar'

interface UseCategoriasManagerProps {
  userId: string
  modulo?: 'proyectos' | 'clientes' | 'viviendas'
}

export function useCategoriasManager({ userId, modulo = 'proyectos' }: UseCategoriasManagerProps) {
  // Estado local
  const [modo, setModo] = useState<Modo>('lista')
  const [categoriaEditando, setCategoriaEditando] = useState<any>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)

  // Estado para modal de confirmación de eliminación
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<{ id: string; nombre: string } | null>(null)

  // ✅ REACT QUERY: Datos del servidor
  const { categorias = [], cargando: cargandoCategorias } = useCategoriasQuery(userId, modulo)

  // ✅ REACT QUERY: Mutations
  const crearMutation = useCrearCategoriaMutation(userId)
  const actualizarMutation = useActualizarCategoriaMutation(userId)
  const eliminarMutation = useEliminarCategoriaMutation(userId)

  // Handlers
  const handleCrear = useCallback(
    async (data: CategoriaFormData) => {
      await crearMutation.mutateAsync({
        nombre: data.nombre,
        descripcion: data.descripcion,
        color: data.color,
        icono: data.icono,
        modulo,
      })
      setModo('lista')
    },
    [userId, modulo, crearMutation]
  )

  const handleActualizar = useCallback(
    async (data: CategoriaFormData) => {
      if (!categoriaEditando) return

      await actualizarMutation.mutateAsync({
        categoriaId: categoriaEditando.id,
        updates: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          color: data.color,
          icono: data.icono,
        },
      })

      setModo('lista')
      setCategoriaEditando(null)
    },
    [categoriaEditando, actualizarMutation]
  )

  const handleEliminar = useCallback(
    async (categoriaId: string, categoriaNombre: string) => {
      // Abrir modal de confirmación
      setCategoriaAEliminar({ id: categoriaId, nombre: categoriaNombre })
      setModalEliminarAbierto(true)
    },
    []
  )

  const confirmarEliminar = useCallback(
    async () => {
      if (!categoriaAEliminar) return

      setEliminando(categoriaAEliminar.id)
      try {
        await eliminarMutation.mutateAsync(categoriaAEliminar.id)
        setModalEliminarAbierto(false)
        setCategoriaAEliminar(null)
      } finally {
        setEliminando(null)
      }
    },
    [categoriaAEliminar, eliminarMutation]
  )

  const cancelarEliminar = useCallback(() => {
    setModalEliminarAbierto(false)
    setCategoriaAEliminar(null)
  }, [])

  const handleIrACrear = useCallback(() => {
    setModo('crear')
  }, [])

  const handleIrAEditar = useCallback((categoria: any) => {
    setCategoriaEditando(categoria)
    setModo('editar')
  }, [])

  const handleVolverALista = useCallback(() => {
    setModo('lista')
    setCategoriaEditando(null)
  }, [])

  // Computed
  const tieneCategorias = categorias.length > 0
  const estaCargando = cargandoCategorias

  return {
    // Estado
    modo,
    categoriaEditando,
    eliminando,
    categorias,
    cargandoCategorias,
    tieneCategorias,
    estaCargando,

    // Estado modal eliminar
    modalEliminarAbierto,
    categoriaAEliminar,

    // Handlers de navegación
    handleIrACrear,
    handleIrAEditar,
    handleVolverALista,

    // Handlers de acciones
    handleCrear,
    handleActualizar,
    handleEliminar,
    confirmarEliminar,
    cancelarEliminar,
  }
}

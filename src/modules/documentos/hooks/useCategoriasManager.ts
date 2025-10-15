import { useCallback, useEffect, useState } from 'react'
import type { CategoriaFormData } from '../schemas/documento.schema'
import { useDocumentosStore } from '../store/documentos.store'

type Modo = 'lista' | 'crear' | 'editar'

interface UseCategoriasManagerProps {
  userId: string
}

export function useCategoriasManager({ userId }: UseCategoriasManagerProps) {
  // Estado local
  const [modo, setModo] = useState<Modo>('lista')
  const [categoriaEditando, setCategoriaEditando] = useState<any>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [cargado, setCargado] = useState(false)

  // Estado global
  const {
    categorias,
    cargandoCategorias,
    cargarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    inicializarCategoriasDefault,
  } = useDocumentosStore()

  // Cargar categorías
  useEffect(() => {
    if (userId && !cargado) {
      cargarCategorias(userId)
      setCargado(true)
    }
  }, [userId, cargado, cargarCategorias])

  // Handlers
  const handleCrear = useCallback(
    async (data: CategoriaFormData) => {
      await crearCategoria(userId, {
        ...data,
        orden: categorias.length + 1,
      })
      setModo('lista')
    },
    [userId, categorias.length, crearCategoria]
  )

  const handleActualizar = useCallback(
    async (data: CategoriaFormData) => {
      if (!categoriaEditando) return
      await actualizarCategoria(categoriaEditando.id, data)
      setModo('lista')
      setCategoriaEditando(null)
    },
    [categoriaEditando, actualizarCategoria]
  )

  const handleEliminar = useCallback(
    async (categoriaId: string) => {
      if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
      setEliminando(categoriaId)
      try {
        await eliminarCategoria(categoriaId)
      } finally {
        setEliminando(null)
      }
    },
    [eliminarCategoria]
  )

  const handleInicializarDefault = useCallback(async () => {
    await inicializarCategoriasDefault(userId)
  }, [userId, inicializarCategoriasDefault])

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
  const estaCargando = cargandoCategorias && !cargado

  return {
    // Estado
    modo,
    categoriaEditando,
    eliminando,
    categorias,
    cargandoCategorias,
    tieneCategorias,
    estaCargando,

    // Handlers de navegación
    handleIrACrear,
    handleIrAEditar,
    handleVolverALista,

    // Handlers de acciones
    handleCrear,
    handleActualizar,
    handleEliminar,
    handleInicializarDefault,
  }
}

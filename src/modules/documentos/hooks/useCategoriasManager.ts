import { useCallback, useEffect, useState } from 'react'
import type { CategoriaFormData } from '../schemas/documento.schema'
import { useDocumentosStore } from '../store/documentos.store'

type Modo = 'lista' | 'crear' | 'editar'

interface UseCategoriasManagerProps {
  userId: string
  modulo?: 'proyectos' | 'clientes' | 'viviendas' // ← Nuevo prop
}

export function useCategoriasManager({ userId, modulo = 'proyectos' }: UseCategoriasManagerProps) {
  // Estado local
  const [modo, setModo] = useState<Modo>('lista')
  const [categoriaEditando, setCategoriaEditando] = useState<any>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [cargado, setCargado] = useState(false)

  // Estado para modal de confirmación de eliminación
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<{ id: string; nombre: string } | null>(null)

  // Estado global
  const {
    categorias,
    cargandoCategorias,
    cargarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  } = useDocumentosStore()

  // Cargar categorías - SIEMPRE recarga para filtrar por módulo
  useEffect(() => {
    if (userId) {
      cargarCategorias(userId, modulo) // ← Pasar módulo
      setCargado(true)
    }
  }, [userId, modulo, cargarCategorias])

  // Handlers
  const handleCrear = useCallback(
    async (data: CategoriaFormData) => {
      await crearCategoria(userId, {
        ...data,
        orden: categorias.length + 1,
        // Asegurar que los módulos se pasen correctamente
        es_global: data.esGlobal ?? false,
        modulos_permitidos: data.esGlobal ? [] : (data.modulosPermitidos ?? [modulo]),
      })
      setModo('lista')
    },
    [userId, categorias.length, modulo, crearCategoria]
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
        await eliminarCategoria(categoriaAEliminar.id)
        setModalEliminarAbierto(false)
        setCategoriaAEliminar(null)
      } finally {
        setEliminando(null)
      }
    },
    [categoriaAEliminar, eliminarCategoria]
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

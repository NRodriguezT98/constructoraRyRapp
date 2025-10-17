// ============================================
// HOOK: useCategoriasCliente
// Gestión de categorías de documentos para clientes
// ============================================

import { CategoriasService } from '@/modules/documentos/services/categorias.service'
import type { CategoriaDocumento, CategoriaFormData } from '@/modules/documentos/types/documento.types'
import { useCallback, useEffect, useState } from 'react'
import { useDocumentosClienteStore } from '../store/documentos-cliente.store'

interface UseCategoriasClienteProps {
  userId: string
}

type ModoVista = 'lista' | 'crear' | 'editar'

export function useCategoriasCliente({ userId }: UseCategoriasClienteProps) {
  const { categorias, cargandoCategorias, cargarCategorias } = useDocumentosClienteStore()

  const [modo, setModo] = useState<ModoVista>('lista')
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaDocumento | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)

  // Cargar categorías al montar
  useEffect(() => {
    cargarCategorias(userId)
  }, [userId, cargarCategorias])

  // Navegación
  const handleIrACrear = useCallback(() => {
    setModo('crear')
    setCategoriaEditando(null)
  }, [])

  const handleIrAEditar = useCallback((categoria: CategoriaDocumento) => {
    setModo('editar')
    setCategoriaEditando(categoria)
  }, [])

  const handleVolverALista = useCallback(() => {
    setModo('lista')
    setCategoriaEditando(null)
  }, [])

  // CRUD
  const handleCrear = useCallback(
    async (data: CategoriaFormData) => {
      try {
        const maxOrden = Math.max(0, ...categorias.map(c => c.orden || 0))
        const datosAInsertar = {
          nombre: data.nombre,
          descripcion: data.descripcion,
          color: data.color,
          icono: data.icono,
          orden: maxOrden + 1,
          es_global: data.esGlobal ?? false,
          modulos_permitidos: data.esGlobal ? [] : (data.modulosPermitidos ?? ['clientes']),
        }

        await CategoriasService.crearCategoria(userId, datosAInsertar)
        await cargarCategorias(userId)
        handleVolverALista()
      } catch (error) {
        console.error('Error al crear categoría:', error)
        throw error
      }
    },
    [userId, categorias, cargarCategorias, handleVolverALista]
  )

  const handleActualizar = useCallback(
    async (data: CategoriaFormData) => {
      if (!categoriaEditando?.id) return

      try {
        await CategoriasService.actualizarCategoria(categoriaEditando.id, data)
        await cargarCategorias(userId)
        handleVolverALista()
      } catch (error) {
        console.error('Error al actualizar categoría:', error)
        throw error
      }
    },
    [categoriaEditando, userId, cargarCategorias, handleVolverALista]
  )

  const handleEliminar = useCallback(
    async (categoriaId: string) => {
      if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

      setEliminando(categoriaId)
      try {
        await CategoriasService.eliminarCategoria(categoriaId)
        await cargarCategorias(userId)
      } catch (error) {
        console.error('Error al eliminar categoría:', error)
      } finally {
        setEliminando(null)
      }
    },
    [userId, cargarCategorias]
  )

  const handleInicializarDefault = useCallback(async () => {
    try {
      await CategoriasService.crearCategoriasDefault(userId)
      await cargarCategorias(userId)
    } catch (error) {
      console.error('Error al inicializar categorías:', error)
    }
  }, [userId, cargarCategorias])

  return {
    // Estado
    modo,
    categoriaEditando,
    eliminando,
    categorias,
    estaCargando: cargandoCategorias,
    tieneCategorias: categorias.length > 0,

    // Acciones
    handleIrACrear,
    handleIrAEditar,
    handleVolverALista,
    handleCrear,
    handleActualizar,
    handleEliminar,
    handleInicializarDefault,
  }
}

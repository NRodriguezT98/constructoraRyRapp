import { construirURLProyecto } from '@/lib/utils/slug.utils'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import type { Proyecto } from '../types'

interface UseProyectoCardProps {
  proyecto: Proyecto
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
}

/**
 * Hook personalizado para manejar la lógica de ProyectoCard
 * Separa la lógica de negocio de la presentación
 */
export function useProyectoCard({
  proyecto,
  onEdit,
  onDelete,
}: UseProyectoCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Computed: Total de viviendas
  const totalViviendas = useMemo(() => {
    return proyecto.manzanas.reduce((sum, m) => sum + m.totalViviendas, 0)
  }, [proyecto.manzanas])

  // Computed: Total de viviendas vendidas
  const viviendasVendidas = useMemo(() => {
    return proyecto.manzanas.reduce((sum, m) => sum + m.viviendasVendidas, 0)
  }, [proyecto.manzanas])

  // Computed: Porcentaje de progreso de ventas
  const progresoVentas = useMemo(() => {
    if (totalViviendas === 0) return 0
    return Math.round((viviendasVendidas / totalViviendas) * 100)
  }, [viviendasVendidas, totalViviendas])

  // Handler: Eliminar con confirmación
  const handleDelete = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()

      if (!confirmDelete) {
        setConfirmDelete(true)
        // Reset confirmación después de 3 segundos
        setTimeout(() => setConfirmDelete(false), 3000)
        return
      }

      onDelete?.(proyecto.id)
      setConfirmDelete(false)
    },
    [confirmDelete, onDelete, proyecto.id]
  )

  // Handler: Editar proyecto
  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onEdit?.(proyecto)
      setShowMenu(false)
    },
    [onEdit, proyecto]
  )

  // Handler: Ver detalles (navegación)
  const handleViewDetails = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const url = construirURLProyecto({
        id: proyecto.id,
        nombre: proyecto.nombre
      })
      router.push(url)
    },
    [proyecto.id, proyecto.nombre, router]
  )

  // Handler: Toggle menú
  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(prev => !prev)
  }, [])

  // Handler: Cerrar menú
  const closeMenu = useCallback(() => {
    setShowMenu(false)
  }, [])

  return {
    // Estados
    showMenu,
    confirmDelete,
    totalViviendas,
    viviendasVendidas,
    progresoVentas,

    // Handlers
    handleDelete,
    handleEdit,
    handleViewDetails,
    toggleMenu,
    closeMenu,
  }
}

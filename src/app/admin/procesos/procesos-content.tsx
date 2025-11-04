'use client'

/**
 * ============================================
 * COMPONENTE: Contenido de Gestión de Procesos
 * ============================================
 */

import { ListaPlantillas } from '@/modules/admin/procesos/components'

interface ProcesosContentProps {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  isAdmin: boolean
}

export default function ProcesosContent({
  canView,
  canCreate,
  canEdit,
  canDelete,
  isAdmin,
}: ProcesosContentProps) {
  console.log('🔄 [PROCESOS CONTENT] Props recibidos:', {
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
  })

  // Verificar permiso de visualización
  if (!canView) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a este módulo
          </p>
        </div>
      </div>
    )
  }

  return <ListaPlantillas />
}

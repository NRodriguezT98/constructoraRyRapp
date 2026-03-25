'use client'

import { RenunciasPageMain } from '@/modules/renuncias/components/RenunciasPageMain'

/**
 * Permisos del usuario (pasados desde Server Component)
 */
interface RenunciasContentProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

/**
 * ✅ PROTEGIDO POR MIDDLEWARE
 * - Recibe permisos como props desde Server Component
 * - Delega a RenunciasPageMain del módulo
 */
export default function RenunciasContent({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView = true,
  isAdmin = false,
}: RenunciasContentProps = {}) {
  return (
    <RenunciasPageMain
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      canView={canView}
      isAdmin={isAdmin}
    />
  )
}

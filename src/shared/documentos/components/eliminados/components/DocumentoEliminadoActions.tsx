import { RotateCcw, Trash2 } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

interface DocumentoEliminadoActionsProps {
  onRestore: () => void
  onDelete: () => void
  isRestoring: boolean
  isDeleting: boolean
}

/**
 * Botones de acción para documento eliminado
 * Restaurar (todo) + Eliminar definitivo
 */
export function DocumentoEliminadoActions({
  onRestore,
  onDelete,
  isRestoring,
  isDeleting,
}: DocumentoEliminadoActionsProps) {
  return (
    <div className='flex items-center gap-2 p-4 pt-0'>
      <Button
        size='sm'
        variant='outline'
        onClick={onRestore}
        disabled={isRestoring || isDeleting}
        className='flex-1 border-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm transition-all hover:from-rose-600 hover:to-pink-600'
      >
        <RotateCcw className='mr-2 h-4 w-4' />
        {isRestoring ? 'Restaurando...' : 'Restaurar todo'}
      </Button>

      <Button
        size='sm'
        variant='outline'
        onClick={onDelete}
        disabled={isRestoring || isDeleting}
        className='flex-1 border-0 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm transition-all hover:from-red-700 hover:to-rose-700'
      >
        <Trash2 className='mr-2 h-4 w-4' />
        {isDeleting ? 'Eliminando...' : 'Eliminar definitivo'}
      </Button>
    </div>
  )
}

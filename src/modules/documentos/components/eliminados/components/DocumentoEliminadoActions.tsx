import { Button } from '@/components/ui/button'
import { RotateCcw, Trash2 } from 'lucide-react'

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
    <div className="p-4 pt-0 flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onRestore}
        disabled={isRestoring || isDeleting}
        className="flex-1 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-600 hover:text-green-600 transition-all"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        {isRestoring ? 'Restaurando...' : 'Restaurar todo'}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onDelete}
        disabled={isRestoring || isDeleting}
        className="flex-1 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-600 hover:text-red-600 transition-all"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {isDeleting ? 'Eliminando...' : 'Eliminar definitivo'}
      </Button>
    </div>
  )
}

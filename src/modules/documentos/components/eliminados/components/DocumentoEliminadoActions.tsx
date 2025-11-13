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
        className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 shadow-sm transition-all"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        {isRestoring ? 'Restaurando...' : 'Restaurar todo'}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onDelete}
        disabled={isRestoring || isDeleting}
        className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0 shadow-sm transition-all"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {isDeleting ? 'Eliminando...' : 'Eliminar definitivo'}
      </Button>
    </div>
  )
}

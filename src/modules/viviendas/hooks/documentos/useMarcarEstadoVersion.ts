/**
 * Hook para lógica de negocio del modal de marcar estado de versión (VIVIENDAS)
 * Separa la lógica del componente presentacional
 *
 * ✅ ALINEADO CON MÓDULO DE PROYECTOS
 */

import { MOTIVOS_VERSION_ERRONEA, MOTIVOS_VERSION_OBSOLETA } from '@/types/documento.types'
import { CheckCircle, Package, RotateCcw, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useEstadosVersionVivienda } from './useEstadosVersionVivienda'

// ============================================================================
// TYPES
// ============================================================================

export type AccionEstado = 'erronea' | 'obsoleta' | 'restaurar'

interface UseMarcarEstadoVersionParams {
  documentoId: string
  viviendaId: string
  documentoPadreId?: string // ✅ ID del documento padre para invalidar query correcta
  accion: AccionEstado
  onSuccess?: () => void
  onClose: () => void
}

interface ConfigEstado {
  titulo: string
  descripcion: string
  icon: any
  color: string
  motivosPredef: string[]
  gradient: string
}

// ============================================================================
// HOOK
// ============================================================================

export function useMarcarEstadoVersion({
  documentoId,
  viviendaId,
  documentoPadreId,
  accion,
  onSuccess,
  onClose,
}: UseMarcarEstadoVersionParams) {
  // Estado local
  const [motivo, setMotivo] = useState('')
  const [versionCorrectaId, setVersionCorrectaId] = useState('')
  const [motivoPersonalizado, setMotivoPersonalizado] = useState(false)

  // Mutations
  const { marcarComoErronea, marcarComoObsoleta, restaurarEstado } =
    useEstadosVersionVivienda(viviendaId)

  // ============================================================================
  // CONFIGURACIÓN POR ACCIÓN
  // ============================================================================

  const config: ConfigEstado = useMemo(() => {
    switch (accion) {
      case 'erronea':
        return {
          titulo: 'Marcar Versión como Errónea',
          descripcion:
            'Esta versión contiene información incorrecta y no debe ser utilizada.',
          icon: XCircle,
          color: 'red',
          motivosPredef: Object.values(MOTIVOS_VERSION_ERRONEA),
          gradient: 'from-red-600 to-rose-600',
        }
      case 'obsoleta':
        return {
          titulo: 'Marcar Versión como Obsoleta',
          descripcion:
            'Esta versión ya no es relevante y ha sido reemplazada por una versión más reciente.',
          icon: Package,
          color: 'gray',
          motivosPredef: Object.values(MOTIVOS_VERSION_OBSOLETA),
          gradient: 'from-gray-600 to-slate-600',
        }
      case 'restaurar':
        return {
          titulo: 'Restaurar Estado de Versión',
          descripcion:
            'Esta versión volverá a estar marcada como válida y podrá ser utilizada normalmente.',
          icon: RotateCcw,
          color: 'green',
          motivosPredef: [],
          gradient: 'from-green-600 to-emerald-600',
        }
      default:
        return {
          titulo: '',
          descripcion: '',
          icon: CheckCircle,
          color: 'blue',
          motivosPredef: [],
          gradient: 'from-blue-600 to-indigo-600',
        }
    }
  }, [accion])

  // ============================================================================
  // ESTADO COMPUTADO
  // ============================================================================

  const isPending = useMemo(
    () =>
      marcarComoErronea.isPending ||
      marcarComoObsoleta.isPending ||
      restaurarEstado.isPending,
    [marcarComoErronea.isPending, marcarComoObsoleta.isPending, restaurarEstado.isPending]
  )

  const isValid = useMemo(() => {
    if (accion === 'restaurar') return true
    return motivo.trim().length > 0
  }, [accion, motivo])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
    try {
      if (accion === 'erronea') {
        await marcarComoErronea.mutateAsync({
          documentoId,
          documentoPadreId, // ✅ Pasar ID del documento padre
          motivo,
          versionCorrectaId: versionCorrectaId || undefined,
        })
      } else if (accion === 'obsoleta') {
        await marcarComoObsoleta.mutateAsync({
          documentoId,
          documentoPadreId, // ✅ Pasar ID del documento padre
          motivo,
        })
      } else if (accion === 'restaurar') {
        await restaurarEstado.mutateAsync({
          documentoId,
          documentoPadreId, // ✅ Pasar ID del documento padre
        })
      }

      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Error al marcar estado:', error)
    }
  }

  const handleClose = () => {
    setMotivo('')
    setVersionCorrectaId('')
    setMotivoPersonalizado(false)
    onClose()
  }

  const handleSelectMotivo = (motivoSeleccionado: string) => {
    setMotivo(motivoSeleccionado)
  }

  const handleActivarMotivoPersonalizado = () => {
    setMotivoPersonalizado(true)
    setMotivo('')
  }

  const handleVolverMotivosPredef = () => {
    setMotivoPersonalizado(false)
    setMotivo('')
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    motivo,
    setMotivo,
    versionCorrectaId,
    setVersionCorrectaId,
    motivoPersonalizado,

    // Configuración
    config,

    // Estado computado
    isPending,
    isValid,

    // Handlers
    handleSubmit,
    handleClose,
    handleSelectMotivo,
    handleActivarMotivoPersonalizado,
    handleVolverMotivosPredef,
  }
}

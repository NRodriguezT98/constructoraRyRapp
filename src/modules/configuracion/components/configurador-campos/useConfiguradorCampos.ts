/**
 * Hook: useConfiguradorCampos
 *
 * Lógica de negocio para el configurador de campos dinámicos.
 * Maneja estado, validación, drag & drop, y guardado.
 *
 * @version 1.0 - Separación de Responsabilidades
 */

'use client'

import { useCallback, useState } from 'react'

import { toast } from 'sonner'

import { useModal } from '@/shared/components/modals'

import { useActualizarConfiguracionCampos } from '../../hooks/useTiposFuentesConCampos'
import type {
  CampoConfig,
  ConfiguracionCampos,
} from '../../types/campos-dinamicos.types'

interface UseConfiguradorCamposProps {
  tipoId: string
  configuracionInicial: ConfiguracionCampos
  onClose: () => void
}

export function useConfiguradorCampos({
  tipoId,
  configuracionInicial,
  onClose,
}: UseConfiguradorCamposProps) {
  // ============================================
  // ESTADO
  // ============================================

  const [campos, setCampos] = useState<CampoConfig[]>(
    configuracionInicial.campos
  )
  const [campoEditando, setCampoEditando] = useState<CampoConfig | null>(null)
  const [modoEditor, setModoEditor] = useState<'crear' | 'editar'>('crear')
  const [modalEditorAbierto, setModalEditorAbierto] = useState(false)
  const { confirm } = useModal()

  // ============================================
  // REACT QUERY
  // ============================================

  const { mutate: actualizar, isPending: guardando } =
    useActualizarConfiguracionCampos()

  // ============================================
  // HANDLERS: AGREGAR
  // ============================================

  const handleAgregarCampo = useCallback(() => {
    setCampoEditando(null)
    setModoEditor('crear')
    setModalEditorAbierto(true)
  }, [])

  const handleConfirmarAgregar = useCallback((nuevoCampo: CampoConfig) => {
    setCampos(prev => [...prev, nuevoCampo])
    setModalEditorAbierto(false)
    toast.success('Campo agregado', {
      description: `"${nuevoCampo.label}" agregado correctamente`,
    })
  }, [])

  // ============================================
  // HANDLERS: EDITAR
  // ============================================

  const handleEditarCampo = useCallback((campo: CampoConfig) => {
    setCampoEditando(campo)
    setModoEditor('editar')
    setModalEditorAbierto(true)
  }, [])

  const handleConfirmarEditar = useCallback(
    (campoActualizado: CampoConfig) => {
      setCampos(prev =>
        prev.map(c =>
          c.nombre === campoEditando?.nombre ? campoActualizado : c
        )
      )
      setModalEditorAbierto(false)
      toast.success('Campo actualizado', {
        description: `"${campoActualizado.label}" actualizado correctamente`,
      })
    },
    [campoEditando]
  )

  // ============================================
  // HANDLERS: ELIMINAR
  // ============================================

  const handleEliminarCampo = useCallback(
    async (nombreCampo: string) => {
      const campo = campos.find(c => c.nombre === nombreCampo)
      if (!campo) return

      // Confirmación
      const confirmado = await confirm({
        title: `Eliminar campo`,
        message: `¿Eliminar el campo "${campo.label}"?`,
        variant: 'danger',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      })
      if (!confirmado) return

      setCampos(prev => prev.filter(c => c.nombre !== nombreCampo))
      toast.success('Campo eliminado', {
        description: `"${campo.label}" eliminado correctamente`,
      })
    },
    [campos, confirm]
  )

  // ============================================
  // HANDLERS: REORDENAR (DRAG & DROP)
  // ============================================

  const handleReordenar = useCallback((camposReordenados: CampoConfig[]) => {
    // Actualizar propiedad "orden" según nuevo índice
    const camposConOrdenActualizado = camposReordenados.map((campo, index) => ({
      ...campo,
      orden: index + 1,
    }))
    setCampos(camposConOrdenActualizado)
  }, [])

  // ============================================
  // HANDLERS: GUARDAR
  // ============================================

  const handleGuardar = useCallback(() => {
    // Validar que haya al menos un campo
    if (campos.length === 0) {
      toast.error('Configuración inválida', {
        description: 'Debe haber al menos un campo configurado',
      })
      return
    }

    // Validar que todos los campos tengan nombre único
    const nombres = campos.map(c => c.nombre)
    const nombresUnicos = new Set(nombres)
    if (nombres.length !== nombresUnicos.size) {
      toast.error('Nombres duplicados', {
        description: 'Hay campos con el mismo nombre',
      })
      return
    }

    // 🔥 Validar que solo haya UN campo con rol='monto'
    const camposMonto = campos.filter(c => c.rol === 'monto')
    if (camposMonto.length === 0) {
      toast.error('Campo de Monto obligatorio', {
        description: 'Debe configurar al menos un campo de Monto Principal',
      })
      return
    }
    if (camposMonto.length > 1) {
      toast.error('Múltiples campos de Monto', {
        description: `Solo puede haber UN campo de Monto Principal. Actualmente hay ${camposMonto.length} campos con ese rol.`,
      })
      return
    }

    // Guardar en BD
    actualizar(
      {
        tipoId,
        configuracion: { campos },
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }, [campos, tipoId, actualizar, onClose])

  // ============================================
  // HANDLERS: CANCELAR
  // ============================================

  const handleCancelar = useCallback(async () => {
    // Confirmar si hay cambios sin guardar
    const tienesCambios =
      JSON.stringify(campos) !== JSON.stringify(configuracionInicial.campos)
    if (tienesCambios) {
      const confirmado = await confirm({
        title: 'Descartar cambios',
        message: '¿Descartar los cambios sin guardar?',
        variant: 'warning',
        confirmText: 'Descartar',
        cancelText: 'Cancelar',
      })
      if (!confirmado) return
    }
    onClose()
  }, [campos, configuracionInicial, onClose, confirm])

  const handleCancelarEditor = useCallback(() => {
    setModalEditorAbierto(false)
  }, [])

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    campos,
    campoEditando,
    modoEditor,
    modalEditorAbierto,
    guardando,

    // Handlers
    handleAgregarCampo,
    handleConfirmarAgregar,
    handleEditarCampo,
    handleConfirmarEditar,
    handleEliminarCampo,
    handleReordenar,
    handleGuardar,
    handleCancelar,
    handleCancelarEditor,
  }
}

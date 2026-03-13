/**
 * Componente: ConfiguradorCamposModal
 *
 * Modal principal con drag & drop para configurar campos dinámicos.
 * Integra: CampoItem (arrastrable) + EditarCampoModal (crear/editar).
 *
 * @version 1.0 - Diseño Premium con @dnd-kit
 */

'use client'

import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, FileCode, Plus, Save, X } from 'lucide-react'

import type { ConfiguracionCampos } from '../../types/campos-dinamicos.types'

import { CampoItem } from './CampoItem'
import { configuradorStyles as s } from './configurador-campos.styles'
import { EditarCampoModal } from './EditarCampoModal'
import { useConfiguradorCampos } from './useConfiguradorCampos'

interface ConfiguradorCamposModalProps {
  isOpen: boolean
  tipoId: string
  tipoNombre: string
  tipoColor: string
  configuracionInicial: ConfiguracionCampos
  onClose: () => void
}

export function ConfiguradorCamposModal({
  isOpen,
  tipoId,
  tipoNombre,
  tipoColor,
  configuracionInicial,
  onClose,
}: ConfiguradorCamposModalProps) {
  // ============================================
  // HOOK CON LÓGICA
  // ============================================

  const hook = useConfiguradorCampos({
    tipoId,
    configuracionInicial,
    onClose,
  })

  // ============================================
  // DRAG & DROP SENSORS
  // ============================================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Evitar activar drag en clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = hook.campos.findIndex((c) => c.nombre === active.id)
      const newIndex = hook.campos.findIndex((c) => c.nombre === over.id)
      const reordenados = arrayMove(hook.campos, oldIndex, newIndex)
      hook.handleReordenar(reordenados)
    }
  }

  if (!isOpen) return null

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <>
      {/* Modal Principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={s.modal.overlay}
        onClick={hook.handleCancelar}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={s.modal.container}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={s.modal.header.container}
            style={{
              background: `linear-gradient(135deg, ${tipoColor}, ${adjustColor(tipoColor, -20)})`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  ⚙️ Configurar Campos - {tipoNombre}
                </h2>
                <p className="text-xs text-white/90 mt-0.5">
                  Arrastra los campos para reordenar • Edita o elimina campos existentes
                </p>
              </div>
              <button
                type="button"
                onClick={hook.handleCancelar}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={s.modal.body.container}>
            <div className={s.modal.body.content}>
              {/* Sin campos */}
              {hook.campos.length === 0 && (
                <div className={s.modal.body.empty}>
                  <FileCode className={s.modal.body.emptyIcon} />
                  <p className={s.modal.body.emptyText}>
                    No hay campos configurados aún.
                    <br />
                    Presiona <strong>"Agregar Campo"</strong> para comenzar.
                  </p>
                </div>
              )}

              {/* Lista de campos con drag & drop */}
              {hook.campos.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={hook.campos.map((c) => c.nombre)}
                    strategy={verticalListSortingStrategy}
                  >
                    {hook.campos.map((campo) => (
                      <CampoItem
                        key={campo.nombre}
                        campo={campo}
                        onEditar={hook.handleEditarCampo}
                        onEliminar={hook.handleEliminarCampo}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}

              {/* Info: Campos editables */}
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-900 dark:text-blue-100 font-semibold">
                      💡 Arrastra para reordenar
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                      El orden de los campos en esta lista será el mismo que se mostrará en el
                      formulario.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={s.modal.footer.container}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={hook.handleAgregarCampo}
                className={s.modal.footer.buttonAdd}
              >
                <Plus className="w-4 h-4" />
                Agregar Campo
              </button>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {hook.campos.length} campo{hook.campos.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={hook.handleCancelar}
                className={s.modal.footer.buttonSecondary}
                disabled={hook.guardando}
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>

              <button
                type="button"
                onClick={hook.handleGuardar}
                disabled={hook.guardando || hook.campos.length === 0}
                className={`${s.modal.footer.buttonPrimary} bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {hook.guardando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Configuración
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal Editor (Crear/Editar Campo) */}
      <AnimatePresence>
        {hook.modalEditorAbierto && (
          <EditarCampoModal
            isOpen={hook.modalEditorAbierto}
            modo={hook.modoEditor}
            campoInicial={hook.campoEditando}
            camposExistentes={hook.campos}
            onConfirmar={
              hook.modoEditor === 'crear'
                ? hook.handleConfirmarAgregar
                : hook.handleConfirmarEditar
            }
            onCancelar={hook.handleCancelarEditor}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Ajusta brillo de un color hexadecimal
 */
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

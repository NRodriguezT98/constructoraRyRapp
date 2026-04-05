/**
 * Componente: CampoItem
 *
 * Item de campo arrastrable con drag & drop.
 * Muestra información del campo y acciones (editar/eliminar).
 *
 * @version 1.0 - Diseño Compacto
 */

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit2, GripVertical, Trash2 } from 'lucide-react'

import type { CampoConfig } from '../../types/campos-dinamicos.types'

import { configuradorStyles as s } from './configurador-campos.styles'

interface CampoItemProps {
  campo: CampoConfig
  onEditar: (campo: CampoConfig) => void
  onEliminar: (nombreCampo: string) => void
}

export function CampoItem({ campo, onEditar, onEliminar }: CampoItemProps) {
  // ============================================
  // DRAG & DROP
  // ============================================

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: campo.nombre })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${s.campoItem.container} ${isDragging ? s.campoItem.containerDragging : ''}`}
    >
      <div className='flex items-start gap-3'>
        {/* Drag Handle */}
        <button
          type='button'
          className={s.campoItem.dragHandle}
          {...attributes}
          {...listeners}
        >
          <GripVertical className={s.campoItem.dragIcon} />
        </button>

        {/* Contenido */}
        <div className={s.campoItem.content}>
          {/* Header */}
          <div className={s.campoItem.header}>
            <span className={s.campoItem.orden}>{campo.orden}</span>
            <span className={s.campoItem.nombre}>{campo.label}</span>
            {campo.requerido && (
              <span className={s.campoItem.required}>Requerido</span>
            )}
            {/* 🔥 Badge de Rol */}
            {campo.rol && campo.rol !== 'informativo' && (
              <span
                className={
                  campo.rol === 'monto'
                    ? 'rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : campo.rol === 'entidad'
                      ? 'rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                }
              >
                {campo.rol === 'monto'
                  ? '💰 Monto'
                  : campo.rol === 'entidad'
                    ? '🏦 Entidad'
                    : '📄 Ref'}
              </span>
            )}
          </div>

          {/* Detalles */}
          <div className={s.campoItem.details}>
            <span className={s.campoItem.tipo}>{campo.tipo}</span>
            <span>•</span>
            <span className='font-mono text-[10px]'>{campo.nombre}</span>
            {campo.placeholder && (
              <>
                <span>•</span>
                <span className='italic'>&quot;{campo.placeholder}&quot;</span>
              </>
            )}
          </div>

          {/* Ayuda */}
          {campo.ayuda && (
            <p className='mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
              💡 {campo.ayuda}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className={s.campoItem.actions}>
          <button
            type='button'
            onClick={() => onEditar(campo)}
            className={`${s.campoItem.button} ${s.campoItem.buttonEdit}`}
            title='Editar campo'
          >
            <Edit2 className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={() => onEliminar(campo.nombre)}
            className={`${s.campoItem.button} ${s.campoItem.buttonDelete}`}
            title='Eliminar campo'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Compass } from 'lucide-react'
import { LABELS, PLACEHOLDERS } from '../constants'
import { fieldClasses, linderosClasses, sectionClasses } from '../styles/vivienda-form.styles'

interface PasoLinderosProps {
  linderoNorte: string
  linderoSur: string
  linderoOriente: string
  linderoOccidente: string
  errores: Record<string, string>
  onChange: (campo: string, valor: string) => void
}

/**
 * Paso 2: Linderos
 * Grid 2x2 con los 4 linderos de la vivienda
 */
export function PasoLinderos({
  linderoNorte,
  linderoSur,
  linderoOriente,
  linderoOccidente,
  errores,
  onChange,
}: PasoLinderosProps) {
  return (
    <div className={sectionClasses.container}>
      <div className={sectionClasses.card}>
        <div className={sectionClasses.header}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
              <Compass className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className={sectionClasses.title}>Linderos</h2>
              <p className={sectionClasses.subtitle}>
                Define los límites de la vivienda en cada dirección
              </p>
            </div>
          </div>
        </div>

        <div className={linderosClasses.grid}>
          {/* Lindero Norte */}
          <div className={linderosClasses.item}>
            <label htmlFor="lindero_norte" className={fieldClasses.label}>
              🧭 {LABELS.LINDERO_NORTE}
              <span className={fieldClasses.required}>*</span>
            </label>
            <textarea
              id="lindero_norte"
              value={linderoNorte}
              onChange={(e) => onChange('lindero_norte', e.target.value)}
              placeholder={PLACEHOLDERS.LINDERO}
              rows={3}
              className={`${fieldClasses.textarea.base} ${errores.lindero_norte ? fieldClasses.textarea.error : ''}`}
            />
            {errores.lindero_norte && (
              <p className={fieldClasses.error}>{errores.lindero_norte}</p>
            )}
          </div>

          {/* Lindero Sur */}
          <div className={linderosClasses.item}>
            <label htmlFor="lindero_sur" className={fieldClasses.label}>
              🧭 {LABELS.LINDERO_SUR}
              <span className={fieldClasses.required}>*</span>
            </label>
            <textarea
              id="lindero_sur"
              value={linderoSur}
              onChange={(e) => onChange('lindero_sur', e.target.value)}
              placeholder={PLACEHOLDERS.LINDERO}
              rows={3}
              className={`${fieldClasses.textarea.base} ${errores.lindero_sur ? fieldClasses.textarea.error : ''}`}
            />
            {errores.lindero_sur && (
              <p className={fieldClasses.error}>{errores.lindero_sur}</p>
            )}
          </div>

          {/* Lindero Oriente */}
          <div className={linderosClasses.item}>
            <label htmlFor="lindero_oriente" className={fieldClasses.label}>
              🧭 {LABELS.LINDERO_ORIENTE}
              <span className={fieldClasses.required}>*</span>
            </label>
            <textarea
              id="lindero_oriente"
              value={linderoOriente}
              onChange={(e) => onChange('lindero_oriente', e.target.value)}
              placeholder={PLACEHOLDERS.LINDERO}
              rows={3}
              className={`${fieldClasses.textarea.base} ${errores.lindero_oriente ? fieldClasses.textarea.error : ''}`}
            />
            {errores.lindero_oriente && (
              <p className={fieldClasses.error}>{errores.lindero_oriente}</p>
            )}
          </div>

          {/* Lindero Occidente */}
          <div className={linderosClasses.item}>
            <label htmlFor="lindero_occidente" className={fieldClasses.label}>
              🧭 {LABELS.LINDERO_OCCIDENTE}
              <span className={fieldClasses.required}>*</span>
            </label>
            <textarea
              id="lindero_occidente"
              value={linderoOccidente}
              onChange={(e) => onChange('lindero_occidente', e.target.value)}
              placeholder={PLACEHOLDERS.LINDERO}
              rows={3}
              className={`${fieldClasses.textarea.base} ${errores.lindero_occidente ? fieldClasses.textarea.error : ''}`}
            />
            {errores.lindero_occidente && (
              <p className={fieldClasses.error}>{errores.lindero_occidente}</p>
            )}
          </div>
        </div>

        {/* Info complementaria */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Consejo:</strong> Describe claramente cada límite de la vivienda.
            Por ejemplo: "Por el Norte con la Calle 123", "Por el Sur con el lote 45", etc.
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, KeyboardEvent } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag } from 'lucide-react'

import { ETIQUETAS_SUGERIDAS } from '../../../../types/documento.types'

interface EtiquetasInputProps {
  value: string[]
  onChange: (etiquetas: string[]) => void
  maxEtiquetas?: number
}

export function EtiquetasInput({
  value = [],
  onChange,
  maxEtiquetas = 10,
}: EtiquetasInputProps) {
  const [input, setInput] = useState('')
  const [sugerenciasVisibles, setSugerenciasVisibles] = useState(false)

  const agregarEtiqueta = (etiqueta: string) => {
    const etiquetaNormalizada = etiqueta.trim()

    if (!etiquetaNormalizada) return
    if (value.length >= maxEtiquetas) return
    if (value.includes(etiquetaNormalizada)) return

    onChange([...value, etiquetaNormalizada])
    setInput('')
    setSugerenciasVisibles(false)
  }

  const eliminarEtiqueta = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      agregarEtiqueta(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      eliminarEtiqueta(value.length - 1)
    }
  }

  const sugerenciasFiltradas = ETIQUETAS_SUGERIDAS.filter(
    sug =>
      !value.includes(sug) && sug.toLowerCase().includes(input.toLowerCase())
  )

  return (
    <div className='space-y-2'>
      {/* Etiquetas actuales */}
      {value.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          <AnimatePresence mode='popLayout'>
            {value.map((etiqueta, index) => (
              <motion.span
                key={etiqueta}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className='inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              >
                <Tag size={14} />
                {etiqueta}
                <button
                  type='button'
                  onClick={() => eliminarEtiqueta(index)}
                  className='rounded p-0.5 transition-colors hover:bg-blue-200 dark:hover:bg-blue-800'
                >
                  <X size={14} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Input */}
      <div className='relative'>
        <input
          type='text'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setSugerenciasVisibles(true)}
          onBlur={() => setTimeout(() => setSugerenciasVisibles(false), 200)}
          placeholder={
            value.length >= maxEtiquetas
              ? `Máximo ${maxEtiquetas} etiquetas`
              : 'Escribe y presiona Enter...'
          }
          disabled={value.length >= maxEtiquetas}
          className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-400'
        />

        {/* Sugerencias */}
        <AnimatePresence>
          {sugerenciasVisibles && sugerenciasFiltradas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='absolute top-full z-10 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'
            >
              <div className='max-h-48 space-y-1 overflow-y-auto p-2'>
                {sugerenciasFiltradas.map(sugerencia => (
                  <button
                    key={sugerencia}
                    type='button'
                    onClick={() => agregarEtiqueta(sugerencia)}
                    className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    <Tag size={14} className='text-gray-400' />
                    {sugerencia}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contador */}
      <p className='text-xs text-gray-500 dark:text-gray-400'>
        {value.length}/{maxEtiquetas} etiquetas
        {value.length < maxEtiquetas && ' • Presiona Enter para agregar'}
      </p>
    </div>
  )
}

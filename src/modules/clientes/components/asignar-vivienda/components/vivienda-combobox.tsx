/**
 * Combobox con búsqueda para seleccionar viviendas
 *
 * ✅ Búsqueda inteligente: "A3" → Manzana A - Casa 3
 * ✅ Filtrado por manzana o número
 * ✅ Glassmorphism premium
 * ✅ Teclado accesible (Arrow keys, Enter, Escape)
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Home, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { pageStyles as s } from '@/modules/clientes/pages/asignar-vivienda/styles'
import type { ViviendaDetalle } from '../types'

interface ViviendaComboboxProps {
  viviendas: ViviendaDetalle[]
  value: string
  onChange: (viviendaId: string) => void
  disabled?: boolean
  placeholder?: string
  error?: boolean
}

export function ViviendaCombobox({
  viviendas,
  value,
  onChange,
  disabled = false,
  placeholder = 'Busca por manzana o número (ej: A3)',
  error = false,
}: ViviendaComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Vivienda seleccionada
  const selectedVivienda = useMemo(() => {
    return viviendas.find((v) => v.id === value)
  }, [viviendas, value])

  // Filtrado inteligente
  const filteredViviendas = useMemo(() => {
    if (!searchTerm) return viviendas

    const term = searchTerm.toLowerCase().trim()

    return viviendas.filter((v) => {
      const manzana = (v.manzana_nombre || '').toLowerCase()
      const numero = v.numero.toString()
      const fullText = `${manzana}${numero}` // "a3"
      const displayText = `manzana ${manzana} casa ${numero}` // "manzana a casa 3"

      // Búsqueda directa: "a3" encuentra Manzana A - Casa 3
      if (fullText.includes(term)) return true

      // Búsqueda con espacios: "a 3" o "manzana a"
      if (displayText.includes(term)) return true

      // Búsqueda solo por número: "3"
      if (numero.includes(term)) return true

      // Búsqueda solo por manzana: "a"
      if (manzana.includes(term)) return true

      return false
    })
  }, [viviendas, searchTerm])

  // Resetear highlight cuando cambia el filtro
  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchTerm])

  // Scroll automático al item highlighted
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        })
      }
    }
  }, [highlightedIndex, isOpen])

  // Handlers
  const handleSelect = (viviendaId: string) => {
    onChange(viviendaId)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(0)
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
    setHighlightedIndex(0)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredViviendas.length - 1)
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredViviendas[highlightedIndex]) {
          handleSelect(filteredViviendas[highlightedIndex].id)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        break
    }
  }

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const inputClasses = error
    ? s.input.error
    : value
      ? s.input.success
      : s.input.base

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : selectedVivienda ? `Manzana ${selectedVivienda.manzana_nombre} - Casa ${selectedVivienda.numero}` : ''}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            setSearchTerm('')
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputClasses} pl-10 pr-20`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            type="button"
          >
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown de resultados */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 backdrop-blur-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl shadow-cyan-500/10 overflow-hidden"
          >
            {filteredViviendas.length > 0 ? (
              <>
                {/* Contador de resultados */}
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {filteredViviendas.length} vivienda{filteredViviendas.length !== 1 ? 's' : ''} disponible{filteredViviendas.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="p-2 max-h-[260px] overflow-y-auto">
                {filteredViviendas.map((vivienda, index) => {
                  const isSelected = vivienda.id === value
                  const isHighlighted = index === highlightedIndex

                  return (
                    <button
                      key={vivienda.id}
                      onClick={() => handleSelect(vivienda.id)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                        isHighlighted
                          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/40 dark:to-blue-900/40'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Home className={`w-4 h-4 ${
                            isSelected ? 'text-white' : 'text-gray-400'
                          }`} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {vivienda.manzana_nombre ? `Manzana ${vivienda.manzana_nombre}` : 'Sin manzana'} - Casa {vivienda.numero}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ${vivienda.valor_total?.toLocaleString('es-CO') || '0'}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <Home className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'No se encontraron viviendas' : 'No hay viviendas disponibles'}
                </p>
                {searchTerm && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Intenta con otro término de búsqueda
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

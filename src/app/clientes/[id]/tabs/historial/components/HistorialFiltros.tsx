/**
 * HistorialFiltros - Filtros por Categoría + Búsqueda
 * Pills de categoría + barra de búsqueda + botón de nota manual
 */

'use client'

import type { LucideIcon } from 'lucide-react'
import {
  DollarSign,
  FileText,
  HandshakeIcon,
  Heart,
  Layers,
  LogOut,
  NotebookPen,
  Search,
  UserPen,
  X,
} from 'lucide-react'

import { historialStyles as styles } from '../historial-tab.styles'

interface CategoriaFiltro {
  id: string
  label: string
  icon: LucideIcon
}

const CATEGORIAS: CategoriaFiltro[] = [
  { id: 'todos', label: 'Todos', icon: Layers },
  { id: 'clientes', label: 'Cliente', icon: UserPen },
  { id: 'negociaciones', label: 'Negociaciones', icon: HandshakeIcon },
  { id: 'abonos_historial', label: 'Abonos', icon: DollarSign },
  { id: 'documentos_cliente', label: 'Documentos', icon: FileText },
  { id: 'intereses', label: 'Intereses', icon: Heart },
  { id: 'renuncias', label: 'Renuncias', icon: LogOut },
  { id: 'notas', label: 'Notas', icon: NotebookPen },
]

interface HistorialFiltrosProps {
  busqueda: string
  onBusquedaChange: (valor: string) => void
  categoriaActiva: string
  onCategoriaChange: (categoria: string) => void
  totalFiltrados: number
  totalGeneral: number
  tieneAplicados: boolean
  onLimpiarFiltros: () => void
  onAgregarNota: () => void
}

export function HistorialFiltros({
  busqueda,
  onBusquedaChange,
  categoriaActiva,
  onCategoriaChange,
  totalFiltrados,
  totalGeneral,
  tieneAplicados,
  onLimpiarFiltros,
  onAgregarNota,
}: HistorialFiltrosProps) {
  return (
    <div className={styles.filtros.wrapper}>
      {/* Fila superior: búsqueda + botón nota */}
      <div className={styles.filtros.row}>
        <div className={styles.filtros.searchContainer}>
          <label htmlFor='historial-search' className='sr-only'>
            Buscar en historial
          </label>
          <Search className={styles.filtros.searchIcon} />
          <input
            id='historial-search'
            type='text'
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder='Buscar eventos, usuarios...'
            className={styles.filtros.searchInput}
          />
        </div>
        <button
          type='button'
          onClick={onAgregarNota}
          className={styles.filtros.notaButton}
        >
          <NotebookPen className='h-3.5 w-3.5' />
          Agregar nota
        </button>
      </div>

      {/* Fila de pills de categoría */}
      <div className={`${styles.filtros.row} mt-2`}>
        {CATEGORIAS.map(cat => {
          const isActive = categoriaActiva === cat.id
          const Icon = cat.icon

          return (
            <button
              key={cat.id}
              type='button'
              onClick={() => onCategoriaChange(cat.id)}
              className={`${styles.filtros.pillBase} ${isActive ? styles.filtros.pillActive : styles.filtros.pillInactive}`}
            >
              <Icon className={styles.filtros.pillIcon} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Fila inferior: resultados + limpiar */}
      <div className='mt-2 flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700'>
        <span className={styles.filtros.resultCount}>
          {tieneAplicados
            ? `${totalFiltrados} de ${totalGeneral} eventos`
            : `${totalGeneral} eventos`}
        </span>
        {tieneAplicados ? (
          <button
            type='button'
            onClick={onLimpiarFiltros}
            className={styles.filtros.clearButton}
          >
            <X className='h-3 w-3' />
            Limpiar
          </button>
        ) : null}
      </div>
    </div>
  )
}

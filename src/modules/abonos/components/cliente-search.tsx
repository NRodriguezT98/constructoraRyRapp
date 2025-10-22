'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { inputStyles } from '../styles'

interface ClienteSearchProps {
  busqueda: string
  onBusquedaChange: (value: string) => void
}

/**
 * Barra de búsqueda para filtrar clientes
 * Diseño limpio y minimalista
 */
export function ClienteSearch({ busqueda, onBusquedaChange }: ClienteSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
      <Input
        type="text"
        placeholder="Buscar por nombre, documento o proyecto..."
        value={busqueda}
        onChange={(e) => onBusquedaChange(e.target.value)}
        className={inputStyles.search}
      />
    </div>
  )
}

/**
 * useViviendasFiltros - Hook para lógica de filtros premium
 * ✅ SOLO LÓGICA DE NEGOCIO
 * ✅ Sin renderizado
 * ✅ Gestión de estado de filtros
 */

import { useCallback, useMemo, useState } from 'react'
import type { FiltrosViviendas } from '../types'

export function useViviendasFiltros() {
  const [filtros, setFiltros] = useState<FiltrosViviendas>({
    search: '',
    proyecto_id: '',
    estado: '',
  })

  const actualizarFiltros = useCallback((nuevosFiltros: Partial<FiltrosViviendas>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      search: '',
      proyecto_id: '',
      estado: '',
    })
  }, [])

  const hayFiltrosActivos = useMemo(() => {
    return Boolean(filtros.search || filtros.proyecto_id || filtros.estado)
  }, [filtros])

  return {
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    hayFiltrosActivos,
  }
}

'use client'

import { Pagination } from '@/shared/components/ui'

import type { PageSizeOption } from '../../hooks/useAbonosList'

interface AbonosPaginacionProps {
  paginaActual: number
  totalPaginas: number
  totalFiltrado: number
  pageSize: PageSizeOption
  setPaginaActual: (p: number | ((prev: number) => number)) => void
  setPageSize: (size: PageSizeOption) => void
}

export function AbonosPaginacion({
  paginaActual,
  totalPaginas,
  totalFiltrado,
  pageSize,
  setPaginaActual,
  setPageSize,
}: AbonosPaginacionProps) {
  return (
    <Pagination
      currentPage={paginaActual}
      totalPages={totalPaginas}
      totalItems={totalFiltrado}
      itemsPerPage={pageSize}
      onPageChange={setPaginaActual}
      onItemsPerPageChange={n => setPageSize(n as PageSizeOption)}
      itemsPerPageOptions={[10, 25, 50]}
    />
  )
}

/**
 * Componente: Breadcrumbs para navegación en Crear Negociación
 * UI presentacional pura
 */

'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbsNegociacionProps {
  clienteId: string
  clienteNombre?: string
}

const breadcrumbsStyles = {
  container: 'flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400',
  link: 'hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1',
  current: 'text-gray-900 dark:text-gray-100 font-medium',
}

export function BreadcrumbsNegociacion({
  clienteId,
  clienteNombre,
}: BreadcrumbsNegociacionProps) {
  return (
    <nav className={breadcrumbsStyles.container}>
      <Link href={'/' as any} className={breadcrumbsStyles.link}>
        <Home className="h-3.5 w-3.5" />
      </Link>

      <ChevronRight className="h-3 w-3" />

      <Link href={'/clientes' as any} className={breadcrumbsStyles.link}>
        Clientes
      </Link>

      <ChevronRight className="h-3 w-3" />

      <Link href={`/clientes/${clienteId}` as any} className={breadcrumbsStyles.link}>
        {clienteNombre || 'Cliente'}
      </Link>

      <ChevronRight className="h-3 w-3" />

      <span className={breadcrumbsStyles.current}>Nueva Negociación</span>
    </nav>
  )
}

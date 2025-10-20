/**
 * Componente: Breadcrumbs para navegación
 * UI presentacional pura
 */

'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { pageStyles } from '../styles'

interface BreadcrumbsNegociacionProps {
  clienteId: string
  clienteNombre?: string
}

export function BreadcrumbsNegociacion({
  clienteId,
  clienteNombre,
}: BreadcrumbsNegociacionProps) {
  return (
    <nav className={pageStyles.breadcrumbs.container}>
      <Link href={"/" as any} className={pageStyles.breadcrumbs.link}>
        <Home className="h-4 w-4" />
      </Link>

      <ChevronRight className="h-4 w-4 text-gray-400" />

      <Link href={"/clientes" as any} className={pageStyles.breadcrumbs.link}>
        Clientes
      </Link>

      <ChevronRight className="h-4 w-4 text-gray-400" />

      <Link
        href={`/clientes/${clienteId}` as any}
        className={pageStyles.breadcrumbs.link}
      >
        {clienteNombre || 'Cliente'}
      </Link>

      <ChevronRight className="h-4 w-4 text-gray-400" />

      <span className={pageStyles.breadcrumbs.current}>
        Crear Negociación
      </span>
    </nav>
  )
}

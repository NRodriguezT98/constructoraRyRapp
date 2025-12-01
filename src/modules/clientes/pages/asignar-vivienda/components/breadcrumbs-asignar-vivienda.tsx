/**
 * Componente: Breadcrumbs discretos para navegación
 * Diseño sutil y minimalista
 */

'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

import { pageStyles as s } from '../styles'

interface BreadcrumbsAsignarViviendaProps {
  clienteId: string
  clienteNombre?: string
}

export function BreadcrumbsAsignarVivienda({
  clienteId,
  clienteNombre,
}: BreadcrumbsAsignarViviendaProps) {
  return (
    <nav className={s.breadcrumbs.container}>
      <Link href={'/' as any} className={s.breadcrumbs.link}>
        <Home className="h-3.5 w-3.5" />
      </Link>

      <ChevronRight className={`h-3 w-3 ${s.breadcrumbs.separator}`} />

      <Link href={'/clientes' as any} className={s.breadcrumbs.link}>
        Clientes
      </Link>

      <ChevronRight className={`h-3 w-3 ${s.breadcrumbs.separator}`} />

      <Link href={`/clientes/${clienteId}` as any} className={s.breadcrumbs.link}>
        {clienteNombre || 'Cliente'}
      </Link>

      <ChevronRight className={`h-3 w-3 ${s.breadcrumbs.separator}`} />

      <span className={s.breadcrumbs.current}>Asignar Vivienda</span>
    </nav>
  )
}

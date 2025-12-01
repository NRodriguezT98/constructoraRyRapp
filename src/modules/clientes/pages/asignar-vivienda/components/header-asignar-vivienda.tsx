/**
 * Componente: Header - Asignar Vivienda
 * ✅ Sigue el patrón estándar de nueva-vivienda
 * ✅ Breadcrumbs integrados
 * ✅ Gradiente Cyan→Blue→Indigo
 */

'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

import { pageStyles } from '../styles'

interface HeaderAsignarViviendaProps {
  clienteId: string
  clienteNombre?: string
}

export function HeaderAsignarVivienda({
  clienteId,
  clienteNombre,
}: HeaderAsignarViviendaProps) {
  return (
    <div className={pageStyles.header.container}>
      {/* Pattern grid overlay */}
      <div className={pageStyles.header.pattern} />

      {/* Content */}
      <div className={pageStyles.header.content}>
        {/* Breadcrumbs */}
        <nav className={pageStyles.header.breadcrumbs}>
          <Link href="/clientes" className={pageStyles.header.breadcrumbItem}>
            Clientes
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/clientes/${clienteId}`} className={pageStyles.header.breadcrumbItem}>
            {clienteNombre || 'Cliente'}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className={pageStyles.header.breadcrumbCurrent}>Asignar Vivienda</span>
        </nav>

        {/* Título */}
        <div className={pageStyles.header.topRow}>
          <div className={pageStyles.header.titleGroup}>
            <div className={pageStyles.header.iconCircle}>
              <Home className={pageStyles.header.icon} />
            </div>
            <div className={pageStyles.header.titleWrapper}>
              <h1 className={pageStyles.header.title}>Asignar Vivienda</h1>
              <p className={pageStyles.header.subtitle}>
                Completa los 3 pasos • Cierre financiero para {clienteNombre || 'el cliente'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

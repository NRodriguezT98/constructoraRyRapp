'use client'

import { ChevronRight, Home } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { styles as s } from '../styles'

interface AsignarViviendaHeaderProps {
  clienteId: string
  clienteNombre: string
  pasoActivo: 1 | 2 | 3
}

export function AsignarViviendaHeader({
  clienteId,
  clienteNombre,
  pasoActivo,
}: AsignarViviendaHeaderProps) {
  const router = useRouter()

  return (
    <div className={s.header.wrapper}>
      {/* Breadcrumb */}
      <nav className={s.header.breadcrumb} aria-label='Breadcrumb'>
        <button
          onClick={() => router.push('/clientes')}
          className={s.header.breadcrumbLink}
        >
          Clientes
        </button>
        <ChevronRight className={`h-3 w-3 ${s.header.breadcrumbSep}`} />
        <button
          onClick={() => router.push(`/clientes/${clienteId}`)}
          className={s.header.breadcrumbLink}
        >
          {clienteNombre}
        </button>
        <ChevronRight className={`h-3 w-3 ${s.header.breadcrumbSep}`} />
        <span className={s.header.breadcrumbCurrent}>Asignar Vivienda</span>
      </nav>

      {/* Título + badge */}
      <div className={s.header.titleRow}>
        <div className={s.header.iconWrapper}>
          <Home className={s.header.icon} />
        </div>
        <div className='flex-1 min-w-0'>
          <h1 className={s.header.h1}>Asignar Vivienda</h1>
          <p className={s.header.subtitle}>{clienteNombre}</p>
        </div>
        <span className={s.header.stepBadge}>Paso {pasoActivo} / 3</span>
      </div>
    </div>
  )
}

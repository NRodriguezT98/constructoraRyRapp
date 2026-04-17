/**
 * CarpetaBreadcrumbs — Navegación de ruta de carpetas.
 * Muestra: Documentos > Carpeta Padre > Carpeta Actual
 */
'use client'

import { ChevronRight, Home } from 'lucide-react'

import type { ModuleName } from '@/shared/config/module-themes'
import type { CarpetaBreadcrumb } from '@/shared/documentos/types/carpeta.types'

import { getCarpetaStyles } from './carpetas.styles'

interface CarpetaBreadcrumbsProps {
  breadcrumbs: CarpetaBreadcrumb[]
  onNavigate: (carpetaId: string | null) => void
  moduleName?: ModuleName
}

export function CarpetaBreadcrumbs({
  breadcrumbs,
  onNavigate,
  moduleName = 'proyectos',
}: CarpetaBreadcrumbsProps) {
  const styles = getCarpetaStyles(moduleName)

  if (breadcrumbs.length <= 1) return null

  return (
    <nav
      className={styles.breadcrumbs.container}
      aria-label='Navegación de carpetas'
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        const isFirst = index === 0

        return (
          <span key={crumb.id ?? 'root'} className='flex items-center gap-1'>
            {index > 0 ? (
              <ChevronRight
                className={`h-3.5 w-3.5 flex-shrink-0 ${styles.breadcrumbs.separator}`}
              />
            ) : null}

            {isLast ? (
              <span className={styles.breadcrumbs.active}>{crumb.nombre}</span>
            ) : (
              <button
                type='button'
                onClick={() => onNavigate(crumb.id)}
                className={styles.breadcrumbs.item}
              >
                {isFirst ? (
                  <span className='flex items-center gap-1'>
                    <Home className='h-3.5 w-3.5' />
                    {crumb.nombre}
                  </span>
                ) : (
                  crumb.nombre
                )}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}

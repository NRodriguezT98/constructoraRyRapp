'use client'

/**
 * ARCHIVO TEMPORAL - Solo para previsualizar los loading screens.
 * Borrar despues de revisar.
 * URL: /preview-loadings
 */

import { useState } from 'react'

import LoadingAbonos from '@/app/abonos/loading'
import LoadingAuditorias from '@/app/auditorias/loading'
import LoadingClientes from '@/app/clientes/loading'
import LoadingNuevoCliente from '@/app/clientes/nuevo/loading'
import LoadingProyectos from '@/app/proyectos/loading'
import LoadingRenuncias from '@/app/renuncias/loading'
import LoadingReportes from '@/app/reportes/loading'
import LoadingViviendas from '@/app/viviendas/loading'

const SCREENS = [
  { id: 'proyectos', label: 'Proyectos', component: LoadingProyectos },
  { id: 'viviendas', label: 'Viviendas', component: LoadingViviendas },
  { id: 'clientes', label: 'Clientes', component: LoadingClientes },
  {
    id: 'nuevo-cliente',
    label: 'Nuevo cliente',
    component: LoadingNuevoCliente,
  },
  { id: 'abonos', label: 'Abonos', component: LoadingAbonos },
  { id: 'renuncias', label: 'Renuncias', component: LoadingRenuncias },
  { id: 'reportes', label: 'Reportes', component: LoadingReportes },
  { id: 'auditorias', label: 'Auditorias', component: LoadingAuditorias },
] as const

type ScreenId = (typeof SCREENS)[number]['id']

export default function PreviewLoadings() {
  const [active, setActive] = useState<ScreenId>('proyectos')

  const activeScreen = SCREENS.find(s => s.id === active)
  if (!activeScreen) return null
  const Component = activeScreen.component

  return (
    <div className='flex h-screen flex-col'>
      <div className='relative z-10 flex flex-wrap gap-2 border-b border-gray-200 bg-white p-3 shadow-md dark:border-gray-700 dark:bg-gray-900'>
        <span className='mr-2 self-center text-xs font-semibold uppercase tracking-widest text-gray-400'>
          Preview Loadings ({SCREENS.length})
        </span>
        {SCREENS.map(screen => (
          <button
            key={screen.id}
            onClick={() => setActive(screen.id)}
            className={
              active === screen.id
                ? 'rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-md'
                : 'rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }
          >
            {screen.label}
          </button>
        ))}
      </div>
      <div className='flex-1 overflow-hidden'>
        <Component />
      </div>
    </div>
  )
}

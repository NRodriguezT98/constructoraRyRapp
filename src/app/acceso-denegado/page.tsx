import { Home, ShieldX } from 'lucide-react'
import type { Metadata } from 'next'

import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Acceso denegado',
}

export default function AccesoDenegadoPage() {
  return (
    <div className='flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 via-red-50/20 to-rose-50/20 dark:from-gray-900 dark:via-red-950/10 dark:to-rose-950/10'>
      <div className='flex max-w-md flex-col items-center gap-6 px-6 text-center duration-500 animate-in fade-in slide-in-from-bottom-4'>
        {/* 403 number */}
        <span className='select-none bg-gradient-to-br from-red-400 to-rose-600 bg-clip-text text-9xl font-black text-transparent'>
          403
        </span>

        {/* Icon */}
        <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-500/30'>
          <ShieldX className='h-10 w-10 text-white' strokeWidth={2} />
        </div>

        {/* Text */}
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Acceso denegado
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            No tienes permisos para acceder a esta sección. Si crees que esto es
            un error, contacta al administrador del sistema.
          </p>
        </div>

        {/* Action */}
        <Link
          href='/'
          className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105 hover:shadow-red-500/40 active:scale-95'
        >
          <Home className='h-4 w-4' />
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}

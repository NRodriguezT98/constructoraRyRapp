import { FileSearch, Home } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 via-amber-50/20 to-orange-50/20 dark:from-gray-900 dark:via-amber-950/10 dark:to-orange-950/10">
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* 404 number */}
        <span className="text-9xl font-black bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-transparent select-none">
          404
        </span>

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
          <FileSearch className="w-10 h-10 text-white" strokeWidth={2} />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Página no encontrada
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            La página que buscas no existe o fue movida. Verifica la URL o
            regresa al inicio.
          </p>
        </div>

        {/* Action */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-105 active:scale-95"
        >
          <Home className="w-4 h-4" />
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}

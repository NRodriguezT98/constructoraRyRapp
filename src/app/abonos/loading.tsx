import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600 dark:border-orange-800 dark:border-t-orange-400" />
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cargando Abonos...
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Preparando la información
          </p>
        </div>
      </div>
    </div>
  )
}

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reportes - RyR Constructora',
  description: 'Reportes y estadísticas del sistema',
}

export default function ReportesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reportes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Módulo en construcción
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Módulo en Desarrollo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            El módulo de reportes estará disponible próximamente. Aquí podrás
            generar reportes financieros, de ventas, proyectos y más.
          </p>
        </div>
      </div>
    </div>
  )
}

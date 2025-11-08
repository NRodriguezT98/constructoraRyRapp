/**
 * 📄 PÁGINA: EDITAR PLANTILLA
 *
 * Ruta: /admin/procesos/[id]
 */

import { ArrowLeft, Code, Database } from 'lucide-react'

import Link from 'next/link'

export const metadata = {
  title: 'Editar Plantilla de Proceso | RyR Constructora',
  description: 'Editar plantilla de proceso de negociación'
}

interface EditarPlantillaPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarPlantillaPage({ params }: EditarPlantillaPageProps) {
  const { id } = await params
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Botón volver */}
        <Link
          href="/admin/procesos"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a lista de plantillas
        </Link>

        {/* Card principal */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Editor Visual en Desarrollo
            </h1>
            <p className="text-gray-600">
              El editor visual con drag & drop estará disponible próximamente
            </p>
          </div>

          {/* Información */}
          <div className="space-y-6">
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Por ahora: Editar en Supabase
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Puedes editar la plantilla directamente en la base de datos:
                  </p>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Ve a tu proyecto en Supabase</li>
                    <li>Abre el SQL Editor o Table Editor</li>
                    <li>Busca la tabla <code className="px-2 py-0.5 rounded bg-blue-100 font-mono text-xs">plantillas_proceso</code></li>
                    <li>Edita el campo <code className="px-2 py-0.5 rounded bg-blue-100 font-mono text-xs">pasos</code> (tipo JSONB)</li>
                    <li>Guarda los cambios</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* ID de plantilla */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">ID de esta plantilla:</h3>
              <code className="block px-4 py-2 rounded-lg bg-gray-800 text-green-400 font-mono text-sm break-all">
                {id}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                Usa este ID para buscar la plantilla en Supabase
              </p>
            </div>

            {/* Referencia */}
            <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
              <h3 className="font-semibold text-purple-900 mb-2">📚 Referencia de estructura:</h3>
              <p className="text-sm text-purple-800 mb-2">
                Consulta el archivo con la plantilla de ejemplo:
              </p>
              <code className="block px-4 py-2 rounded-lg bg-purple-900 text-purple-100 font-mono text-xs break-all">
                supabase/migrations/20251023_plantilla_proceso_predeterminada.sql
              </code>
            </div>
          </div>

          {/* Botón volver */}
          <div className="mt-8 text-center">
            <Link
              href="/admin/procesos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Lista de Plantillas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

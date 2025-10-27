/**
 * 📝 COMPONENTE: FORMULARIO INFO BÁSICA
 *
 * Sección de información básica de la plantilla:
 * - Nombre
 * - Descripción
 * - Checkbox "Es Predeterminado"
 */

'use client'

interface FormularioInfoBasicaProps {
  nombre: string
  descripcion: string
  esPredeterminado: boolean
  onNombreChange: (valor: string) => void
  onDescripcionChange: (valor: string) => void
  onPredeterminadoChange: (valor: boolean) => void
}

export function FormularioInfoBasica({
  nombre,
  descripcion,
  esPredeterminado,
  onNombreChange,
  onDescripcionChange,
  onPredeterminadoChange
}: FormularioInfoBasicaProps) {
  return (
    <div className="space-y-6">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nombre de la Plantilla *
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          placeholder="Ej: Proceso de Compra Estándar"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
          rows={4}
          placeholder="Describe el propósito de esta plantilla..."
        />
      </div>

      {/* Checkbox Predeterminado */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <input
          type="checkbox"
          id="esPredeterminado"
          checked={esPredeterminado}
          onChange={(e) => onPredeterminadoChange(e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
        />
        <label htmlFor="esPredeterminado" className="text-sm font-medium text-gray-700 cursor-pointer">
          Establecer como plantilla predeterminada
        </label>
      </div>
    </div>
  )
}

'use client'

import { CheckCircle, Compass, DollarSign, FileText, MapPin } from 'lucide-react'
import { sectionClasses } from '../styles/vivienda-form.styles'
import type { ManzanaConDisponibilidad, Proyecto, ResumenFinanciero, ViviendaFormData } from '../types'
import { ResumenFinancieroCard } from './resumen-financiero-card'

interface PasoResumenProps {
  formData: Partial<ViviendaFormData>
  resumen: ResumenFinanciero
  proyecto?: Proyecto
  manzana?: ManzanaConDisponibilidad
}

/**
 * Paso 5: Resumen Final
 * Muestra todos los datos antes de crear la vivienda
 */
export function PasoResumen({
  formData,
  resumen,
  proyecto,
  manzana,
}: PasoResumenProps) {
  return (
    <div className={sectionClasses.container}>
      <div className={sectionClasses.card}>
        <div className={sectionClasses.header}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className={sectionClasses.title}>Resumen</h2>
              <p className={sectionClasses.subtitle}>
                Revisa la información antes de guardar
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ubicación */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Ubicación
              </h3>
            </div>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <strong>Proyecto:</strong> {proyecto?.nombre || 'N/A'}
              </p>
              <p>
                <strong>Manzana:</strong> {manzana?.nombre || 'N/A'}
              </p>
              <p>
                <strong>Vivienda:</strong> #{formData.numero || 'N/A'}
              </p>
            </div>
          </div>

          {/* Linderos */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-3 flex items-center gap-2">
              <Compass className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Linderos
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Norte
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.lindero_norte || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Sur
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.lindero_sur || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Oriente
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.lindero_oriente || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Occidente
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.lindero_occidente || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Información Legal */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Información Legal
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Matrícula Inmobiliaria
                  </p>
                  <p>{formData.matricula_inmobiliaria || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Nomenclatura
                  </p>
                  <p>{formData.nomenclatura || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Área del Lote
                  </p>
                  <p>{formData.area_lote ? `${formData.area_lote} m²` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Área Construida
                  </p>
                  <p>
                    {formData.area_construida ? `${formData.area_construida} m²` : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Tipo de Vivienda
                </p>
                <p>{formData.tipo_vivienda || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Certificado de Tradición
                </p>
                <p>
                  {formData.certificado_tradicion_file ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      Adjunto: {formData.certificado_tradicion_file.name}
                    </span>
                  ) : (
                    'No adjuntado'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Información Financiera
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <strong>Casa Esquinera:</strong> {formData.es_esquinera ? 'Sí' : 'No'}
              </p>
            </div>
          </div>

          {/* Resumen Financiero */}
          <ResumenFinancieroCard resumen={resumen} mostrarDesglose={true} />

          {/* Advertencia final */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              ⚠️ <strong>Importante:</strong> Verifica que todos los datos sean correctos
              antes de continuar. Una vez creada la vivienda, algunos campos no podrán ser
              modificados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

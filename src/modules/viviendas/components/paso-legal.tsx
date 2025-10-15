'use client'

import { CheckCircle, FileText, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { LABELS, PLACEHOLDERS, TIPO_VIVIENDA_OPTIONS } from '../constants'
import {
    fieldClasses,
    legalClasses,
    sectionClasses,
} from '../styles/vivienda-form.styles'
import type { TipoVivienda } from '../types'
import { validarArchivoPDF } from '../utils'

interface PasoLegalProps {
  matriculaInmobiliaria: string
  nomenclatura: string
  areaLote: number | undefined
  areaConstruida: number | undefined
  tipoVivienda: TipoVivienda | undefined
  certificadoFile: File | undefined
  errores: Record<string, string>
  onChange: (campo: string, valor: any) => void
}

/**
 * Paso 3: Información Legal
 * Datos catastrales y documento de certificado de tradición
 */
export function PasoLegal({
  matriculaInmobiliaria,
  nomenclatura,
  areaLote,
  areaConstruida,
  tipoVivienda,
  certificadoFile,
  errores,
  onChange,
}: PasoLegalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validacion = validarArchivoPDF(file)
    if (!validacion.valido) {
      setFileError(validacion.mensaje!)
      onChange('certificado_tradicion_file', undefined)
      return
    }

    setFileError('')
    onChange('certificado_tradicion_file', file)
  }

  const removeFile = () => {
    onChange('certificado_tradicion_file', undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={sectionClasses.container}>
      <div className={sectionClasses.card}>
        <div className={sectionClasses.header}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className={sectionClasses.title}>Información Legal</h2>
              <p className={sectionClasses.subtitle}>
                Datos catastrales y documentos de la vivienda
              </p>
            </div>
          </div>
        </div>

        <div className={legalClasses.grid}>
          {/* Matrícula Inmobiliaria */}
          <div className={fieldClasses.group}>
            <label htmlFor="matricula" className={fieldClasses.label}>
              {LABELS.MATRICULA}
              <span className={fieldClasses.required}>*</span>
            </label>
            <input
              id="matricula"
              type="text"
              value={matriculaInmobiliaria}
              onChange={(e) => onChange('matricula_inmobiliaria', e.target.value)}
              placeholder={PLACEHOLDERS.MATRICULA}
              className={`${fieldClasses.input.base} ${errores.matricula_inmobiliaria ? fieldClasses.input.error : ''}`}
            />
            {errores.matricula_inmobiliaria && (
              <p className={fieldClasses.error}>{errores.matricula_inmobiliaria}</p>
            )}
          </div>

          {/* Nomenclatura */}
          <div className={fieldClasses.group}>
            <label htmlFor="nomenclatura" className={fieldClasses.label}>
              {LABELS.NOMENCLATURA}
              <span className={fieldClasses.required}>*</span>
            </label>
            <input
              id="nomenclatura"
              type="text"
              value={nomenclatura}
              onChange={(e) => onChange('nomenclatura', e.target.value)}
              placeholder={PLACEHOLDERS.NOMENCLATURA}
              className={`${fieldClasses.input.base} ${errores.nomenclatura ? fieldClasses.input.error : ''}`}
            />
            {errores.nomenclatura && (
              <p className={fieldClasses.error}>{errores.nomenclatura}</p>
            )}
          </div>

          {/* Área del Lote */}
          <div className={fieldClasses.group}>
            <label htmlFor="area_lote" className={fieldClasses.label}>
              {LABELS.AREA_LOTE}
              <span className={fieldClasses.required}>*</span>
            </label>
            <div className="relative">
              <input
                id="area_lote"
                type="number"
                step="0.01"
                value={areaLote || ''}
                onChange={(e) => onChange('area_lote', parseFloat(e.target.value) || 0)}
                placeholder={PLACEHOLDERS.AREA}
                className={`${fieldClasses.input.base} ${errores.area_lote ? fieldClasses.input.error : ''} pr-12`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                m²
              </span>
            </div>
            {errores.area_lote && (
              <p className={fieldClasses.error}>{errores.area_lote}</p>
            )}
          </div>

          {/* Área Construida */}
          <div className={fieldClasses.group}>
            <label htmlFor="area_construida" className={fieldClasses.label}>
              {LABELS.AREA_CONSTRUIDA}
              <span className={fieldClasses.required}>*</span>
            </label>
            <div className="relative">
              <input
                id="area_construida"
                type="number"
                step="0.01"
                value={areaConstruida || ''}
                onChange={(e) => onChange('area_construida', parseFloat(e.target.value) || 0)}
                placeholder={PLACEHOLDERS.AREA}
                className={`${fieldClasses.input.base} ${errores.area_construida ? fieldClasses.input.error : ''} pr-12`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                m²
              </span>
            </div>
            {errores.area_construida && (
              <p className={fieldClasses.error}>{errores.area_construida}</p>
            )}
          </div>

          {/* Tipo de Vivienda */}
          <div className={`${fieldClasses.group} ${legalClasses.fullWidth}`}>
            <label htmlFor="tipo_vivienda" className={fieldClasses.label}>
              {LABELS.TIPO_VIVIENDA}
              <span className={fieldClasses.required}>*</span>
            </label>
            <select
              id="tipo_vivienda"
              value={tipoVivienda || ''}
              onChange={(e) => onChange('tipo_vivienda', e.target.value as TipoVivienda)}
              className={`${fieldClasses.select.base} ${errores.tipo_vivienda ? fieldClasses.select.error : ''}`}
            >
              <option value="">Selecciona el tipo</option>
              {TIPO_VIVIENDA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errores.tipo_vivienda && (
              <p className={fieldClasses.error}>{errores.tipo_vivienda}</p>
            )}
          </div>

          {/* Certificado de Tradición (Opcional) */}
          <div className={`${fieldClasses.group} ${legalClasses.fullWidth}`}>
            <label className={fieldClasses.label}>{LABELS.CERTIFICADO}</label>

            <div className={legalClasses.fileUpload.container}>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!certificadoFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={legalClasses.fileUpload.button}
                >
                  <Upload className="h-4 w-4" />
                  Seleccionar archivo PDF
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {certificadoFile.name}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {(certificadoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="rounded-lg p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {fileError && <p className={fieldClasses.error}>{fileError}</p>}

              <p className={fieldClasses.hint}>
                Formato: PDF | Tamaño máximo: 10MB | Opcional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

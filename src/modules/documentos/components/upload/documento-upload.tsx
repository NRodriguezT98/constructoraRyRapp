'use client'

import { CheckCircle2, Info, Link2 } from 'lucide-react'

import { DocumentoFormBase } from '@/shared/components/forms/documento'
import { type ModuleName } from '@/shared/config/module-themes'

import { useDocumentoUpload } from '../../hooks'
import { type TipoEntidad, obtenerConfiguracionEntidad } from '../../types'

import { CheckboxDocumentoIdentidad } from './CheckboxDocumentoIdentidad'

interface DocumentoUploadProps {
  entidadId: string // ✅ GENÉRICO (antes proyectoId)
  tipoEntidad: TipoEntidad // ✅ NUEVO: 'proyecto', 'vivienda', etc.
  onSuccess?: () => void
  onCancel?: () => void
  moduleName?: ModuleName // 🎨 Tema del módulo
  metadata?: Record<string, unknown> | null // ✅ NUEVO: Metadata para vincular documento pendiente
}

export function DocumentoUpload({
  entidadId,
  tipoEntidad,
  onSuccess,
  onCancel,
  moduleName, // 🎨 Inferir desde tipoEntidad si no se pasa
  metadata, // ✅ Metadata para vincular
}: DocumentoUploadProps) {
  // 🎨 Auto-inferir moduleName desde tipoEntidad si no se especifica
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const themeModuleName = moduleName || config.moduleName

  const {
    isDragging,
    archivoSeleccionado,
    errorArchivo,
    subiendoDocumento,
    categorias,
    esDocumentoIdentidad,
    categoriaIdentidad,
    categoriaSeleccionada,
    checkboxDeshabilitado, // ✅ Nuevo
    yaExisteDocumentoIdentidad, // ✅ Nuevo
    tipoDocumento, // ✅ NUEVO: Tipo de documento para validación
    infoTipoDocumento, // ✅ NUEVO: Info del tipo
    fuentePagoId, // ✅ NUEVO: ID de fuente de pago
    fileInputRef,
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    limpiarArchivo,
  } = useDocumentoUpload({ entidadId, tipoEntidad, metadata, onSuccess })

  return (
    <>
      {/* ✅ NUEVO: Banner de vinculación automática si viene de requisito */}
      {tipoDocumento && infoTipoDocumento && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <Link2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                🔗 Vinculación automática activada
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Este documento se vinculará automáticamente al requisito <strong>&quot;{infoTipoDocumento.titulo}&quot;</strong>
                {' '}y completará el paso de validación para permitir el desembolso.
              </p>
              {fuentePagoId && (
                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
                  <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>ID Fuente:</strong> <code className="font-mono text-[10px]">{fuentePagoId.slice(0, 8)}...</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkbox de documento de identidad (solo para clientes SIN documento existente) */}
      {tipoEntidad === 'cliente' && !yaExisteDocumentoIdentidad && !tipoDocumento && (
        <div className="mb-4">
          <CheckboxDocumentoIdentidad
            checked={esDocumentoIdentidad ?? false}
            onChange={(checked) => setValue('es_documento_identidad', checked)}
            disabled={checkboxDeshabilitado || metadata?.auto_check_identidad === true}
          />
          {metadata?.auto_check_identidad === true && esDocumentoIdentidad && (
            <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Documento marcado automáticamente como identificación oficial
            </p>
          )}
        </div>
      )}

      {/* Mensaje informativo si ya existe documento de identidad (SOLO si NO es un requisito específico) */}
      {tipoEntidad === 'cliente' && yaExisteDocumentoIdentidad && !tipoDocumento && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-green-900 dark:text-green-100 mb-1">
                ✓ Este cliente ya tiene un documento de identidad registrado
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300">
                Ya no es necesario marcar documentos adicionales como documento de identidad.
                Puedes continuar subiendo otros documentos normalmente.
              </p>
            </div>
          </div>
        </div>
      )}

      <DocumentoFormBase
        mode="create"
        moduleName={themeModuleName}

      // Estado de archivo
      archivoSeleccionado={archivoSeleccionado}
      errorArchivo={errorArchivo}
      isDragging={isDragging}
      fileInputRef={fileInputRef}

      // Datos del formulario
      categorias={categorias}
      isSubmitting={subiendoDocumento}
      esDocumentoIdentidad={esDocumentoIdentidad}
      categoriaIdentidad={categoriaIdentidad}
      categoriaBloqueada={!!tipoDocumento && !!infoTipoDocumento?.categoria_sugerida} // ✅ Bloquear si viene de requisito

      // React Hook Form
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      setValue={setValue}
      watch={watch}

      // Handlers de archivo
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onFileInputChange={handleFileInputChange}
      onLimpiarArchivo={limpiarArchivo}

      // Handlers de formulario
      onCancel={onCancel}

      // Textos personalizables
      submitButtonText="Subir documento"
      submittingButtonText="Subiendo..."
      />
    </>
  )
}

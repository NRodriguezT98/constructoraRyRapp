'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Tab de Documentos - Refactorizado
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - TODA la lógica está en useDocumentosTab hook
 * - Este componente SOLO renderiza UI
 */

import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, FileText, FolderCog, IdCard, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/auth-context'
import { SeccionDocumentosPendientes } from '@/modules/clientes/components/documentos-pendientes'
import { SubirCartaModal } from '@/modules/clientes/components/fuentes-pago'
import { BannerDocumentoRequerido } from '@/modules/clientes/documentos/components/BannerDocumentoRequerido'
import { useDocumentosTab } from '@/modules/clientes/hooks'
import { useCategoriasSistemaClientes } from '@/modules/clientes/hooks/useCategoriasSistemaClientes'
import type { Cliente } from '@/modules/clientes/types'
import { CategoriasManager } from '@/modules/documentos/components/categorias/categorias-manager'
import { DocumentosLista } from '@/modules/documentos/components/lista/documentos-lista'
import { DocumentoUpload } from '@/modules/documentos/components/upload/documento-upload'
import { moduleThemes } from '@/shared/config/module-themes'

interface DocumentosTabProps {
  cliente: Cliente
}

export function DocumentosTab({ cliente }: DocumentosTabProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Tema cyan/azul para clientes
  const theme = moduleThemes.clientes

  // ✅ AUTO-SEED: Verificar y crear categorías del sistema
  const { verificarYCrear } = useCategoriasSistemaClientes()

  useEffect(() => {
    verificarYCrear()
  }, [verificarYCrear])

  // Estado para modal de carta de aprobación
  const [modalCartaOpen, setModalCartaOpen] = useState(false)
  const [fuenteParaCarta, setFuenteParaCarta] = useState<{
    id: string
    tipo: string
    entidad?: string
    monto_aprobado: number
    tipo_documento_sistema?: string
    requisito_config_id?: string
    vivienda?: { numero: string; manzana: string }
    cliente?: { nombre_completo: string }
  } | null>(null)

  // ✅ Hook con TODA la lógica
  const {
    vistaActual,
    tieneCedula,
    cargandoValidacion,
    uploadTipoCedula,
    metadataPendiente,
    mostrandoUpload,
    mostrandoCategorias,
    mostrandoDocumentos,
    mostrarUpload,
    mostrarCategorias,
    volverADocumentos,
    onSuccessUpload,
    onCancelUpload,
  } = useDocumentosTab({ clienteId: cliente.id })

  // Si está mostrando categorías (PATRÓN IGUAL A PROYECTOS)
  if (mostrandoCategorias && user) {
    return (
      <div className='space-y-4'>
        {/* Header con botón volver */}
        <div className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}>
          <div className='mb-4 flex items-center gap-2.5'>
            <button
              onClick={volverADocumentos}
              className={`flex items-center gap-1.5 rounded-lg ${theme.classes.button.secondary} px-3 py-1.5 text-xs font-medium transition-colors`}
            >
              <ArrowLeft className='h-3.5 w-3.5' />
              <span>Volver a Documentos</span>
            </button>
          </div>

          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Gestionar Categorías
          </h2>
          <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>
            Organiza los documentos del cliente con categorías personalizadas
          </p>
        </div>

        {/* Gestor de categorías */}
        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800'>
          <CategoriasManager
            userId={user.id}
            onClose={volverADocumentos}
            modulo="clientes"
          />
        </div>
      </div>
    )
  }

  // Si está mostrando formulario de upload (PATRÓN IGUAL A PROYECTOS)
  if (mostrandoUpload && user) {
    return (
      <div className='space-y-3'>
        {/* Header premium compacto con glassmorphism */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 p-4 shadow-xl shadow-cyan-500/20">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <IdCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className='text-lg font-bold text-white'>
                    {uploadTipoCedula ? 'Subir Documento de Identidad' : 'Subir Documento'}
                  </h2>
                  <p className='text-cyan-100 dark:text-cyan-200 text-xs'>
                    {uploadTipoCedula
                      ? 'Sube la cédula o pasaporte oficial del cliente'
                      : 'Completa la información y selecciona el archivo a subir'}
                  </p>
                </div>
              </div>

              {/* Botón volver a la derecha */}
              <button
                onClick={volverADocumentos}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium hover:bg-white/30 transition-all"
              >
                <ArrowLeft className='h-3.5 w-3.5' />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`rounded-lg border ${theme.classes.border.light} bg-white p-3 shadow-sm dark:bg-gray-800`}>
          <DocumentoUpload
            entidadId={cliente.id}
            tipoEntidad="cliente"
            moduleName="clientes"
            metadata={metadataPendiente}
            onSuccess={onSuccessUpload}
            onCancel={onCancelUpload}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header con acciones - PREMIUM GLASSMORPHISM */}
      <div className={`relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-cyan-50/80 via-blue-50/80 to-indigo-50/80 dark:from-cyan-950/50 dark:via-blue-950/50 dark:to-indigo-950/50 border ${theme.classes.border.light} p-4 shadow-2xl shadow-cyan-500/10 dark:shadow-cyan-500/5`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)] pointer-events-none" />

        <div className='relative z-10 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className={`rounded-xl bg-gradient-to-br ${theme.classes.gradient.primary} p-2.5 shadow-lg shadow-cyan-500/30`}>
              <FileText className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2 className='text-base font-bold bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent'>
                Documentos del Cliente
              </h2>
              <p className='text-xs text-cyan-700 dark:text-cyan-300 font-medium'>
                Gestiona cédula, contratos y documentación legal
              </p>
            </div>
          </div>

          <div className='flex gap-2'>
            {/* Botón especial para subir cédula si no existe - DESTACADO */}
            {!tieneCedula && (
              <button
                onClick={() => mostrarUpload(true)}
                className='group flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/60 ring-2 ring-orange-300/50 dark:ring-orange-700/50 ring-offset-2 dark:ring-offset-gray-900 transition-all hover:from-orange-600 hover:to-amber-600 hover:scale-[1.02] active:scale-[0.98]'
              >
                <IdCard className='h-4 w-4 group-hover:rotate-12 transition-transform' />
                <span>Subir Cédula/Pasaporte</span>
              </button>
            )}

            <button
              onClick={mostrarCategorias}
              className={`group flex items-center gap-1.5 rounded-lg backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 border ${theme.classes.border.light} px-3 py-1.5 text-xs font-medium transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
            >
              <FolderCog className='h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform' />
              <span className='text-gray-700 dark:text-gray-300'>Categorías</span>
            </button>
            {/* Botón genérico - primario si tiene cédula, secundario si no */}
            <button
              onClick={() => mostrarUpload(false)}
              className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${
                tieneCedula
                  ? `bg-gradient-to-r ${theme.classes.gradient.primary} text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40`
                  : 'backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:shadow-lg'
              }`}
            >
              <Upload className='h-3.5 w-3.5 group-hover:-translate-y-0.5 transition-transform' />
              <span>{tieneCedula ? 'Subir Documento' : 'Otros documentos'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 Banner informativo cuando no hay documento de identidad */}
      <AnimatePresence>
        {!tieneCedula && !cargandoValidacion && (
          <BannerDocumentoRequerido />
        )}
      </AnimatePresence>

      {/* 📄 Sección de documentos pendientes de fuentes (colapsable) */}
      <SeccionDocumentosPendientes
        clienteId={cliente.id}
        onSubirDocumento={(pendienteId, tipoDocumento, metadata) => {
          // ✅ Solo abrir SubirCartaModal para cartas de aprobación específicas
          const esCarta = tipoDocumento.toLowerCase().includes('carta de aprobaci')
          if (metadata.fuente_pago_id && esCarta) {
            setFuenteParaCarta({
              id: metadata.fuente_pago_id,
              tipo: metadata.tipo_fuente,
              // ✅ La vista usa 'entidad_fuente', no 'entidad'
              entidad: metadata.entidad_fuente,
              monto_aprobado: metadata.monto_aprobado || 0,
              // ✅ Pasar tipo exacto del doc para que la vista haga match al subir
              tipo_documento_sistema: tipoDocumento,
              // ✅ FK al requisito: documentos-base.service lo guarda → vista lo detecta por UUID
              requisito_config_id: metadata.requisito_config_id,
              vivienda: metadata.vivienda,
              cliente: metadata.cliente,
            })
            setModalCartaOpen(true)
          } else {
            // Para otros documentos (Solicitud Desembolso, Boleta de Registro, etc.)
            mostrarUpload(false, metadata)
          }
        }}
      />

      {/* ✅ Lista de documentos - Componente genérico estándar */}
      <DocumentosLista
        entidadId={cliente.id}
        tipoEntidad="cliente"
        moduleName="clientes"
        onUploadClick={() => mostrarUpload(false)}
      />

      {/* Modal de subir carta de aprobación */}
      {fuenteParaCarta && (
        <SubirCartaModal
          isOpen={modalCartaOpen}
          onClose={() => {
            setModalCartaOpen(false)
            setFuenteParaCarta(null)
          }}
          fuente={fuenteParaCarta}
          clienteId={cliente.id}
          onSuccess={() => {
            // Refrescar documentos
            onSuccessUpload()
          }}
        />
      )}
    </div>
  )
}

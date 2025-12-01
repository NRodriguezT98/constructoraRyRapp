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
import { AlertCircle, ArrowLeft, FileText, FolderCog, Upload } from 'lucide-react'
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/auth-context'
import { BannerDocumentosPendientes } from '@/modules/clientes/components/documentos-pendientes'
import { SubirCartaModal } from '@/modules/clientes/components/fuentes-pago'
import { BannerDocumentoRequerido } from '@/modules/clientes/documentos/components/BannerDocumentoRequerido'
import { useDocumentosTab } from '@/modules/clientes/hooks'
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

  // Estado para modal de carta de aprobación
  const [modalCartaOpen, setModalCartaOpen] = useState(false)
  const [fuenteParaCarta, setFuenteParaCarta] = useState<{
    id: string
    tipo: string
    entidad?: string
    monto_aprobado: number
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
      <div className='space-y-4'>
        <div className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}>
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
      {/* Header con acciones - IGUAL A VIVIENDAS Y PROYECTOS */}
      <div className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className={`rounded-lg bg-gradient-to-br ${theme.classes.gradient.primary} p-2.5`}>
              <FileText className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2 className='text-base font-bold text-gray-900 dark:text-white'>
                Documentos del Cliente
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Gestiona cédula, contratos y documentación legal
              </p>
            </div>
          </div>

          <div className='flex gap-1.5'>
            {/* Botón especial para subir cédula si no existe - DESTACADO */}
            {!tieneCedula && (
              <button
                onClick={() => mostrarUpload(true)}
                className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/40 ring-2 ring-orange-300 dark:ring-orange-700 ring-offset-2 dark:ring-offset-gray-800 transition-all hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:shadow-orange-500/50'
              >
                <AlertCircle className='h-4 w-4' />
                <span>⚠️ Subir Cédula (Requerido)</span>
              </button>
            )}

            <button
              onClick={mostrarCategorias}
              className={`flex items-center gap-1.5 rounded-lg ${theme.classes.button.secondary} px-3 py-1.5 text-xs font-medium transition-colors`}
            >
              <FolderCog className='h-3.5 w-3.5' />
              <span>Categorías</span>
            </button>
            <button
              onClick={() => mostrarUpload(false)}
              className={`flex items-center gap-1.5 rounded-lg ${theme.classes.button.primary} px-3 py-1.5 text-xs font-medium`}
            >
              <Upload className='h-3.5 w-3.5' />
              <span>Subir Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 Banner de advertencia cuando no hay documento de identidad */}
      <AnimatePresence>
        {!tieneCedula && !cargandoValidacion && (
          <BannerDocumentoRequerido
            onSubirDocumento={() => mostrarUpload(false)}
          />
        )}
      </AnimatePresence>

      {/* 📄 Banner de documentos pendientes (fuentes de pago sin carta) */}
      <BannerDocumentosPendientes
        clienteId={cliente.id}
        onSubirDocumento={(pendienteId, tipoDocumento, metadata) => {
          console.log('📤 Subir documento pendiente:', { pendienteId, tipoDocumento, metadata })

          // Si es carta de aprobación, abrir modal específico
          if (metadata.fuente_pago_id) {
            // ✅ Pasar datos completos incluyendo vivienda y cliente
            setFuenteParaCarta({
              id: metadata.fuente_pago_id, // ✅ ID viene ahora en metadata
              tipo: metadata.tipo_fuente,
              entidad: metadata.entidad,
              monto_aprobado: metadata.monto_aprobado || 0,
              vivienda: metadata.vivienda, // ✅ Datos de vivienda desde JOIN
              cliente: metadata.cliente,   // ✅ Datos de cliente desde JOIN
            })
            setModalCartaOpen(true)
          } else {
            // Para otros tipos de documento, usar modal genérico
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

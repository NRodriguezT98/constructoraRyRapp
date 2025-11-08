'use client'

import { useEffect, useState } from 'react'

import { ArrowLeft, FileText, FolderCog, Upload } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/auth-context'
import { DocumentoUploadCliente } from '@/modules/clientes/documentos/components/documento-upload-cliente'
import { DocumentosListaCliente } from '@/modules/clientes/documentos/components/documentos-lista-cliente'
import { useDocumentosClienteStore } from '@/modules/clientes/documentos/store/documentos-cliente.store'
import type { Cliente } from '@/modules/clientes/types'
import { CategoriasManager } from '@/modules/documentos/components/categorias/categorias-manager'


interface DocumentosTabProps {
  cliente: Cliente
}

export function DocumentosTab({ cliente }: DocumentosTabProps) {
  const router = useRouter()
  const { user } = useAuth()
  const {
    documentos,
    categorias,
    cargandoDocumentos,
    vistaCategoriasActual,
    mostrarCategorias,
    ocultarCategorias,
    cargarDocumentos,
    cargarCategorias,
  } = useDocumentosClienteStore()

  // Estados locales para vistas (PATRÓN IGUAL A PROYECTOS)
  const [showUpload, setShowUpload] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)
  const [uploadTipoCedula, setUploadTipoCedula] = useState(false) // Flag para indicar si se está subiendo cédula

  // Cargar documentos y categorías al montar
  useEffect(() => {
    cargarDocumentos(cliente.id)
    if (user) {
      cargarCategorias(user.id)
    }
  }, [cliente.id, user, cargarDocumentos, cargarCategorias])

  const tieneCedula = !!cliente.documento_identidad_url
  const totalDocumentos = documentos.length + (tieneCedula ? 1 : 0)

  // Si está mostrando categorías (PATRÓN IGUAL A PROYECTOS)
  if (showCategorias && user) {
    return (
      <div className='space-y-4'>
        {/* Header con botón volver */}
        <div className='rounded-lg border border-purple-200 bg-white p-4 shadow-sm dark:border-purple-800 dark:bg-gray-800'>
          <div className='mb-4 flex items-center gap-2.5'>
            <button
              onClick={() => setShowCategorias(false)}
              className='flex items-center gap-1.5 rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-700 dark:bg-gray-700 dark:text-purple-300 dark:hover:bg-gray-600'
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
            onClose={() => setShowCategorias(false)}
            modulo="clientes"
          />
        </div>
      </div>
    )
  }

  // Si está mostrando formulario de upload (PATRÓN IGUAL A PROYECTOS)
  if (showUpload && user) {
    return (
      <div className='space-y-4'>
        <div className='rounded-lg border border-purple-200 bg-white p-4 shadow-sm dark:border-purple-800 dark:bg-gray-800'>
          <DocumentoUploadCliente
            clienteId={cliente.id}
            esCedula={uploadTipoCedula}
            numeroDocumento={cliente.numero_documento}
            nombreCliente={`${cliente.nombres} ${cliente.apellidos}`}
            onSuccess={() => {
              setShowUpload(false)
              setUploadTipoCedula(false)
              // Si era cédula, refrescar ruta para obtener datos actualizados
              if (uploadTipoCedula) {
                router.refresh() // ✅ Revalida datos del servidor SIN recargar página
              } else {
                cargarDocumentos(cliente.id)
              }
            }}
            onCancel={() => {
              setShowUpload(false)
              setUploadTipoCedula(false)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header con acciones */}
      <div className='rounded-lg border border-purple-200 bg-white p-4 shadow-sm dark:border-purple-800 dark:bg-gray-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-2.5'>
              <FileText className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2 className='text-base font-bold text-gray-900 dark:text-white'>
                Documentos del Cliente
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {totalDocumentos} {totalDocumentos === 1 ? 'documento' : 'documentos'} almacenados
              </p>
            </div>
          </div>

          <div className='flex gap-1.5'>
            {/* Botón especial para subir cédula si no existe */}
            {!tieneCedula && (
              <button
                onClick={() => {
                  setUploadTipoCedula(true)
                  setShowUpload(true)
                }}
                className='flex items-center gap-1.5 rounded-lg border-2 border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-all hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30'
              >
                <FileText className='h-3.5 w-3.5' />
                <span>Subir Cédula</span>
              </button>
            )}

            <button
              onClick={() => setShowCategorias(true)}
              className='flex items-center gap-1.5 rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-700 dark:bg-gray-700 dark:text-purple-300 dark:hover:bg-gray-600'
            >
              <FolderCog className='h-3.5 w-3.5' />
              <span>Categorías</span>
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className='flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg'
            >
              <Upload className='h-3.5 w-3.5' />
              <span>Subir Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de documentos - USANDO COMPONENTE DE PROYECTOS (CONSISTENTE) */}
      <DocumentosListaCliente
        clienteId={cliente.id}
        cedulaUrl={cliente.documento_identidad_url}
        numeroDocumento={cliente.numero_documento}
        cedulaTituloPersonalizado={cliente.documento_identidad_titulo}
      />
    </div>
  )
}

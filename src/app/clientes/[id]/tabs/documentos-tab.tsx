'use client'

import { useAuth } from '@/contexts/auth-context'
import SeccionDocumentosIdentidad from '@/modules/clientes/components/documentos/seccion-documentos-identidad'
import { DocumentoUploadCliente } from '@/modules/clientes/documentos/components/documento-upload-cliente'
import { DocumentosListaCliente } from '@/modules/clientes/documentos/components/documentos-lista-cliente'
import { useDocumentosClienteStore } from '@/modules/clientes/documentos/store/documentos-cliente.store'
import type { Cliente } from '@/modules/clientes/types'
import { CategoriasManager } from '@/modules/documentos/components/categorias/categorias-manager'
import { ArrowLeft, FileText, FolderCog, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DocumentosTabProps {
  cliente: Cliente
}

export function DocumentosTab({ cliente }: DocumentosTabProps) {
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
  const [cedulaUrl, setCedulaUrl] = useState<string | null>(cliente.documento_identidad_url)
  const [showUpload, setShowUpload] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)

  // Cargar documentos y categorías al montar
  useEffect(() => {
    cargarDocumentos(cliente.id)
    if (user) {
      cargarCategorias(user.id)
    }
  }, [cliente.id, user, cargarDocumentos, cargarCategorias])

  // Sincronizar con cambios en el cliente
  useEffect(() => {
    setCedulaUrl(cliente.documento_identidad_url)
  }, [cliente.documento_identidad_url])

  const tieneCedula = !!cedulaUrl
  const totalDocumentos = documentos.length

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
            onSuccess={() => {
              setShowUpload(false)
              cargarDocumentos(cliente.id)
            }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Sección de Documentos de Identidad (PRIORITARIA) */}
      <SeccionDocumentosIdentidad
        clienteId={cliente.id}
        clienteNombre={`${cliente.nombres} ${cliente.apellidos}`}
        numeroDocumento={cliente.numero_documento}
        documentoIdentidadUrl={cedulaUrl}
        onActualizar={(nuevaUrl) => {
          console.log('Actualizando cédula en UI:', nuevaUrl);
          setCedulaUrl(nuevaUrl);
          // Forzar recarga del cliente si es necesario
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cliente-actualizado'));
          }
        }}
      />

      {/* Separador visual */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Header con acciones */}
      <div className='rounded-lg border border-purple-200 bg-white p-4 shadow-sm dark:border-purple-800 dark:bg-gray-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-2.5'>
              <FileText className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2 className='text-base font-bold text-gray-900 dark:text-white'>
                Otros Documentos
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {totalDocumentos} {totalDocumentos === 1 ? 'documento' : 'documentos'} almacenados
              </p>
            </div>
          </div>

          <div className='flex gap-1.5'>
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
      <DocumentosListaCliente clienteId={cliente.id} />
    </div>
  )
}

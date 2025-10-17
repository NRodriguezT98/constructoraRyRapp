'use client'

import { useAuth } from '@/contexts/auth-context'
import { useDocumentosClienteStore } from '@/modules/clientes/documentos/store/documentos-cliente.store'
import type { Cliente } from '@/modules/clientes/types'
import { CategoriasManager } from '@/modules/documentos/components/categorias/categorias-manager'
import { AlertTriangle, ArrowLeft, FileText, FolderCog, Upload } from 'lucide-react'
import { useEffect } from 'react'
import * as styles from '../cliente-detalle.styles'

interface DocumentosTabProps {
  cliente: Cliente
}

export function DocumentosTab({ cliente }: DocumentosTabProps) {
  const { user } = useAuth()
  const {
    documentos,
    cargandoDocumentos,
    vistaCategoriasActual,
    abrirModalSubir,
    mostrarCategorias,
    ocultarCategorias,
    cargarDocumentos,
  } = useDocumentosClienteStore()

  // Cargar documentos al montar
  useEffect(() => {
    cargarDocumentos(cliente.id)
  }, [cliente.id, cargarDocumentos])

  const tieneCedula = !!cliente.documento_identidad_url
  const totalDocumentos = documentos.length

  // Si está mostrando categorías, renderizar el gestor
  if (vistaCategoriasActual === 'visible' && user) {
    return (
      <div className='space-y-6'>
        {/* Header con botón volver */}
        <div className='rounded-xl border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-800 dark:bg-gray-800'>
          <div className='mb-6 flex items-center gap-3'>
            <button
              onClick={ocultarCategorias}
              className='flex items-center gap-2 rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-700 dark:bg-gray-700 dark:text-purple-300 dark:hover:bg-gray-600'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>Volver a Documentos</span>
            </button>
          </div>

          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Gestionar Categorías
          </h2>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
            Organiza los documentos del cliente con categorías personalizadas
          </p>
        </div>

        {/* Gestor de categorías */}
        <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800'>
          <CategoriasManager
            userId={user.id}
            onClose={ocultarCategorias}
            modulo="clientes"
          />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header con acciones */}
      <div className='rounded-xl border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-800 dark:bg-gray-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-3'>
              <FileText className='h-6 w-6 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Documentos del Cliente
              </h2>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {totalDocumentos} {totalDocumentos === 1 ? 'documento' : 'documentos'} almacenados
              </p>
            </div>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={mostrarCategorias}
              className='flex items-center gap-2 rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-700 dark:bg-gray-700 dark:text-purple-300 dark:hover:bg-gray-600'
            >
              <FolderCog className='h-4 w-4' />
              <span>Categorías</span>
            </button>
            <button
              onClick={abrirModalSubir}
              className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg'
            >
              <Upload className='h-4 w-4' />
              <span>Subir Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warning si no tiene cédula */}
      {!tieneCedula && (
        <div className={styles.warningStateClasses.container}>
          <div className={styles.warningStateClasses.header}>
            <AlertTriangle className={styles.warningStateClasses.icon} />
            <h3 className={styles.warningStateClasses.title}>
              Documento de Identidad Requerido
            </h3>
          </div>
          <p className={styles.warningStateClasses.description}>
            La cédula de identidad es <strong>OBLIGATORIA</strong> para realizar las siguientes
            acciones:
          </p>
          <ul className={styles.warningStateClasses.list}>
            <li className={styles.warningStateClasses.listItem}>
              <span className={styles.warningStateClasses.listIcon}>▸</span>
              <span>Asignar vivienda al cliente</span>
            </li>
            <li className={styles.warningStateClasses.listItem}>
              <span className={styles.warningStateClasses.listIcon}>▸</span>
              <span>Registrar abonos o pagos</span>
            </li>
            <li className={styles.warningStateClasses.listItem}>
              <span className={styles.warningStateClasses.listIcon}>▸</span>
              <span>Generar contratos de compraventa</span>
            </li>
            <li className={styles.warningStateClasses.listItem}>
              <span className={styles.warningStateClasses.listIcon}>▸</span>
              <span>Aprobar negociaciones formales</span>
            </li>
          </ul>
        </div>
      )}

      {/* Lista de documentos */}
      {cargandoDocumentos ? (
        <div className='flex items-center justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600'></div>
        </div>
      ) : totalDocumentos === 0 ? (
        <div className={styles.emptyStateClasses.container}>
          <FileText className={styles.emptyStateClasses.icon} />
          <h3 className={styles.emptyStateClasses.title}>Sin documentos</h3>
          <p className={styles.emptyStateClasses.description}>
            {tieneCedula
              ? 'Comienza subiendo documentos adicionales como carta laboral, referencias, etc.'
              : 'Sube primero la cédula del cliente para comenzar.'}
          </p>
          <button
            onClick={abrirModalSubir}
            className={styles.emptyStateClasses.button}
          >
            <Upload className='h-4 w-4' />
            Subir Primer Documento
          </button>
        </div>
      ) : (
        <div className='grid gap-4'>
          {documentos.map((documento) => (
            <div
              key={documento.id}
              className='group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'
            >
              <div className='flex items-start gap-4'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30'>
                  <FileText className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <h4 className='truncate font-semibold text-gray-900 dark:text-white'>
                        {documento.titulo}
                      </h4>
                      {documento.descripcion && (
                        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2'>
                          {documento.descripcion}
                        </p>
                      )}
                      <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500'>
                        <span>{documento.nombre_original}</span>
                        <span>•</span>
                        <span>
                          {new Date(documento.fecha_creacion).toLocaleDateString('es-CO')}
                        </span>
                        {documento.es_importante && (
                          <>
                            <span>•</span>
                            <span className='rounded-full bg-yellow-100 px-2 py-0.5 font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'>
                              ⭐ Importante
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aquí irán los botones de acción cuando implementemos los modales */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

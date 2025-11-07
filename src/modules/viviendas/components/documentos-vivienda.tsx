/**
 * ============================================
 * COMPONENTE: DocumentosVivienda
 * ============================================
 * Componente presentacional puro para mostrar documentos de vivienda
 * SOLO UI - Toda la lógica está en useDocumentosVivienda
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Download, FileText, FolderOpen, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDocumentosVivienda } from '../hooks'

interface DocumentosViviendaProps {
  viviendaId: string
}

export function DocumentosVivienda({ viviendaId }: DocumentosViviendaProps) {
  const {
    documentos,
    isLoading,
    subirDocumento,
    eliminarDocumento,
    descargarDocumento,
    isSubiendo,
    isEliminando,
  } = useDocumentosVivienda(viviendaId)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      setUploadError('Solo se permiten archivos PDF')
      return
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('El archivo no puede superar los 10MB')
      return
    }

    try {
      setUploadError(null)
      
      // Buscar categoría "Certificado de Tradición"
      await subirDocumento({
        viviendaId,
        archivo: file,
        titulo: 'Certificado de Tradición y Libertad',
        descripcion: 'Documento oficial de tradición y libertad de la vivienda',
        categoriaNombre: 'Certificado de Tradición',
      })

      // Limpiar input
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      setUploadError('Error al subir el archivo. Intenta nuevamente.')
    }
  }

  const handleDescargar = async (documentoId: string, nombreOriginal: string) => {
    try {
      await descargarDocumento({ id: documentoId, nombreOriginal })
    } catch (error) {
      console.error('Error al descargar:', error)
    }
  }

  const handleEliminar = async (documentoId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return
    
    try {
      await eliminarDocumento(documentoId)
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  // Buscar certificado de tradición
  const certificadoDocumento = documentos.find(
    (doc) => doc.titulo?.toLowerCase().includes('certificado') || 
             doc.titulo?.toLowerCase().includes('tradición')
  )
  const hasCertificado = !!certificadoDocumento

  if (isLoading) {
    return (
      <Card>
        <CardContent className='py-12 text-center'>
          <FileText className='mx-auto mb-4 h-16 w-16 animate-pulse text-gray-400' />
          <p className='text-gray-600 dark:text-gray-400'>Cargando documentos...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5 text-blue-600' />
            Documentos de la Vivienda
          </CardTitle>
          {!hasCertificado && (
            <>
              <input
                ref={fileInputRef}
                type='file'
                accept='application/pdf'
                onChange={handleFileSelect}
                className='hidden'
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubiendo}
              >
                <Upload className='mr-2 h-4 w-4' />
                {isSubiendo ? 'Subiendo...' : 'Subir Certificado'}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {uploadError && (
          <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
            ⚠️ {uploadError}
          </div>
        )}

        {hasCertificado && certificadoDocumento ? (
          <div className='space-y-4'>
            {/* Certificado de Tradición */}
            <motion.div
              className='group relative overflow-hidden rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 transition-all hover:shadow-lg dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30'
              whileHover={{ scale: 1.02 }}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg'>
                    <FileText className='h-6 w-6' />
                  </div>
                  <div className='flex-1'>
                    <h4 className='mb-1 font-bold text-gray-900 dark:text-gray-100'>
                      {certificadoDocumento.titulo}
                    </h4>
                    <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                      {certificadoDocumento.descripcion || 'Certificado de Tradición y Libertad'}
                    </p>
                    <div className='flex items-center gap-2'>
                      <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'>
                        <span className='h-1.5 w-1.5 rounded-full bg-green-600'></span>
                        Disponible
                      </span>
                      {certificadoDocumento.tamano_bytes && (
                        <span className='text-xs text-gray-500'>
                          {(certificadoDocumento.tamano_bytes / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleDescargar(certificadoDocumento.id, certificadoDocumento.nombre_original)}
                  >
                    <Download className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => handleEliminar(certificadoDocumento.id)}
                    disabled={isEliminando}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Mensaje informativo */}
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                💡 <strong>Próximamente:</strong> Podrás subir y gestionar más documentos
                como planos, escrituras, licencias y otros documentos legales.
              </p>
            </div>
          </div>
        ) : (
          <div className='py-12 text-center'>
            <FolderOpen className='mx-auto mb-4 h-16 w-16 text-gray-400' />
            <p className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              No hay documentos adjuntos
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Esta vivienda no tiene documentos cargados todavía
            </p>
            <ul className='mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400'>
              <li>📄 Certificado de Tradición y Libertad</li>
              <li>📐 Planos y diseños</li>
              <li>📝 Escrituras</li>
              <li>🏗️ Licencias de construcción</li>
              <li>📋 Otros documentos legales</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

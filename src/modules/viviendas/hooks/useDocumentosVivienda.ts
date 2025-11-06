/**
 * ============================================
 * HOOK: useDocumentosVivienda
 * ============================================
 * Gestiona la lógica de documentos de una vivienda
 * Sigue el patrón de useDocumentosListaCliente
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Vivienda } from '../types'

interface UseDocumentosViviendaProps {
  viviendaId: string
}

interface DocumentoVirtual {
  id: string
  titulo: string
  descripcion: string
  url_storage: string
  nombre_original: string
  nombre_archivo: string
  tipo_mime: string
  tamano_bytes: number
  es_importante: boolean
  fecha_subida: string
}

export function useDocumentosVivienda({ viviendaId }: UseDocumentosViviendaProps) {
  const [vivienda, setVivienda] = useState<Vivienda | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // ✅ CARGAR DATOS DE LA VIVIENDA
  useEffect(() => {
    let mounted = true

    const cargarVivienda = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('🔍 [DOCUMENTOS VIVIENDA] Cargando vivienda:', viviendaId)
        const { viviendasService } = await import('../services/viviendas.service')
        const viviendaData = await viviendasService.obtenerVivienda(viviendaId)

        if (!mounted) return // ← Prevenir actualizaciones si el componente se desmontó

        console.log('📄 [DOCUMENTOS VIVIENDA] Vivienda cargada:', viviendaData)
        console.log('📄 [DOCUMENTOS VIVIENDA] Certificado URL:', viviendaData.certificado_tradicion_url)
        setVivienda(viviendaData)
      } catch (err) {
        if (!mounted) return
        console.error('❌ Error al cargar documentos de vivienda:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    cargarVivienda()

    return () => {
      mounted = false
      setLoading(false) // ✅ Limpiar estado de cargando
    }
  }, [viviendaId]) // ← Solo depende de viviendaId, no de la función

  // ✅ FUNCIÓN PARA REFRESCAR MANUALMENTE
  const refrescar = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { viviendasService } = await import('../services/viviendas.service')
      const viviendaData = await viviendasService.obtenerVivienda(viviendaId)
      setVivienda(viviendaData)
    } catch (err) {
      console.error('❌ Error al refrescar:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [viviendaId])

  // ✅ DOCUMENTO VIRTUAL PARA CERTIFICADO DE TRADICIÓN
  const certificadoDocumento = useMemo((): DocumentoVirtual | null => {
    console.log('🔍 [CERTIFICADO MEMO] Evaluando certificado...')
    console.log('🔍 [CERTIFICADO MEMO] Vivienda:', vivienda)
    console.log('🔍 [CERTIFICADO MEMO] certificado_tradicion_url:', vivienda?.certificado_tradicion_url)

    if (!vivienda?.certificado_tradicion_url) {
      console.log('❌ [CERTIFICADO MEMO] No hay URL de certificado')
      return null
    }

    const matricula = vivienda.matricula_inmobiliaria || 'N/A'
    const fechaCreacion = typeof vivienda.fecha_creacion === 'string'
      ? vivienda.fecha_creacion
      : new Date().toISOString()

    const doc = {
      id: 'certificado-tradicion',
      titulo: 'Certificado de Tradición y Libertad',
      descripcion: `Matrícula Inmobiliaria: ${matricula}`,
      url_storage: vivienda.certificado_tradicion_url,
      nombre_original: `certificado-tradicion-${matricula}.pdf`,
      nombre_archivo: `certificado-tradicion-${matricula}.pdf`,
      tipo_mime: 'application/pdf',
      tamano_bytes: 1024,
      es_importante: true,
      fecha_subida: fechaCreacion,
    }

    console.log('✅ [CERTIFICADO MEMO] Documento creado:', doc)
    return doc
  }, [vivienda])

  // ✅ LISTA DE TODOS LOS DOCUMENTOS (actualmente solo certificado)
  const documentos = useMemo(() => {
    const docs: DocumentoVirtual[] = []

    if (certificadoDocumento) {
      docs.push(certificadoDocumento)
    }

    return docs
  }, [certificadoDocumento])

  // ✅ HANDLERS
  const handleVerDocumento = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const handleDescargarDocumento = useCallback((url: string, nombreArchivo: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = nombreArchivo
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const handleSubirCertificado = useCallback(async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      console.log('📤 [DOCUMENTOS VIVIENDA] Subiendo certificado...')
      const { viviendasService } = await import('../services/viviendas.service')
      const url = await viviendasService.actualizarCertificado(viviendaId, file)
      console.log('✅ [DOCUMENTOS VIVIENDA] Certificado subido:', url)

      // Recargar datos
      await refrescar()
    } catch (err) {
      console.error('❌ Error al subir certificado:', err)
      setError(err instanceof Error ? err.message : 'Error al subir certificado')
      throw err
    } finally {
      setUploading(false)
    }
  }, [viviendaId, refrescar])

  return {
    // Estado
    vivienda,
    loading,
    error,
    uploading,

    // Documentos
    documentos,
    certificadoDocumento,
    hasCertificado: !!certificadoDocumento,
    totalDocumentos: documentos.length,

    // Handlers
    handleVerDocumento,
    handleDescargarDocumento,
    handleSubirCertificado,
    refrescar,
  }
}

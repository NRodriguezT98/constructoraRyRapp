/**
 * ============================================
 * HOOK: useSubirCartaModal
 * ============================================
 *
 * ✅ LÓGICA DE NEGOCIO SEPARADA
 * Maneja upload de carta de aprobación con vinculación automática
 *
 * Features:
 * - Validación de archivo (tipo, tamaño)
 * - Generación de título automático
 * - Metadata para vinculación
 * - Upload a Supabase Storage
 * - Invalidación de cache React Query
 *
 * @version 1.0.0 - 2025-12-01
 */

import { useQueryClient } from '@tanstack/react-query'
import { DragEvent, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { negociacionesQueryKeys } from '@/modules/clientes/hooks/useNegociacionesQuery'
import { DocumentosBaseService } from '@/modules/documentos/services/documentos-base.service'

import type { DatosFuente } from './SubirCartaModal'

// ============================================
// TYPES
// ============================================

interface UseSubirCartaModalProps {
  fuente: DatosFuente
  clienteId: string
  onClose: () => void
  onSuccess?: () => void
}

// ============================================
// HOOK
// ============================================

export function useSubirCartaModal({
  fuente,
  clienteId,
  onClose,
  onSuccess,
}: UseSubirCartaModalProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // =====================================================
  // ESTADO
  // =====================================================

  const [archivo, setArchivo] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')

  // =====================================================
  // COMPUTED - Título inteligente
  // =====================================================

  const tituloSugerido = useMemo(() => {
    // Parte principal: "Carta de Aprobación [Tipo de Fuente]"
    let titulo = `Carta de Aprobación ${fuente.tipo}`

    // Agregar vivienda y cliente con separador " - "
    const extras: string[] = []

    if (fuente.vivienda) {
      extras.push(`${fuente.vivienda.manzana}${fuente.vivienda.numero}`)
    }

    if (fuente.cliente) {
      extras.push(fuente.cliente.nombre_completo)
    }

    if (extras.length > 0) {
      titulo += ` - ${extras.join(' ')}`
    }

    return titulo
  }, [fuente])

  // Título para el header del modal (más corto)
  const tituloHeader = useMemo(() => {
    const extras: string[] = []

    if (fuente.vivienda) {
      extras.push(`${fuente.vivienda.manzana}${fuente.vivienda.numero}`)
    }

    if (fuente.cliente) {
      extras.push(fuente.cliente.nombre_completo)
    }

    return extras.length > 0 ? `Carta de Aprobación - ${extras.join(' ')}` : 'Carta de Aprobación'
  }, [fuente])

  // Inicializar título cuando se abre el modal o cambia la fuente
  useEffect(() => {
    console.log('🔍 Debug - Datos de fuente:', {
      tipo: fuente.tipo,
      vivienda: fuente.vivienda,
      cliente: fuente.cliente,
      tituloSugerido,
    })

    setTitulo(tituloSugerido)
  }, [tituloSugerido, fuente])

  // =====================================================
  // VALIDACIONES
  // =====================================================

  const validarArchivo = (file: File): boolean => {
    setErrorArchivo(null)

    // Validar tipo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!tiposPermitidos.includes(file.type)) {
      setErrorArchivo('Solo se permiten archivos PDF, JPG o PNG')
      return false
    }

    // Validar tamaño (10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setErrorArchivo('El archivo no puede pesar más de 10MB')
      return false
    }

    return true
  }

  // =====================================================
  // HANDLERS: Drag & Drop
  // =====================================================

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && validarArchivo(file)) {
      setArchivo(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validarArchivo(file)) {
      setArchivo(file)
    }
  }

  const limpiarArchivo = () => {
    setArchivo(null)
    setErrorArchivo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // =====================================================
  // HANDLER: Submit
  // =====================================================

  const handleSubmit = async () => {
    if (!archivo || !user) return

    setIsUploading(true)

    try {
      // 1. ID fijo de categoría "Cartas de Aprobación" (categoría global del sistema)
      const CATEGORIA_CARTAS_APROBACION = '4898e798-c188-4f02-bfcf-b2b15be48e34'

      // 2. Metadata para vinculación automática
      const metadata = {
        tipo_fuente: fuente.tipo,
        entidad: fuente.entidad || '',
        monto_aprobado: fuente.monto_aprobado,
        fuente_pago_id: fuente.id,
      }

      console.log('📤 Subiendo carta con metadata:', metadata)

      // 3. Subir documento
      await DocumentosBaseService.subirDocumento(
        {
          entidad_id: clienteId,
          tipoEntidad: 'cliente',
          categoria_id: CATEGORIA_CARTAS_APROBACION, // ✅ ID fijo de categoría global
          titulo, // ✅ Título editable
          descripcion: `Carta de aprobación para ${fuente.tipo}`,
          archivo,
          metadata, // ✅ Metadata para trigger de vinculación
        },
        user.id
      )

      // 4. Invalidar cache para refrescar datos
      await Promise.all([
        // Refrescar negociaciones (para actualizar estado_documentacion de fuentes)
        queryClient.invalidateQueries({
          queryKey: negociacionesQueryKeys.all,
        }),
        // Refrescar documentos pendientes (para eliminar el banner)
        queryClient.invalidateQueries({
          queryKey: ['documentos-pendientes', clienteId],
        }),
        // Refrescar lista de documentos (para mostrar el nuevo documento)
        queryClient.invalidateQueries({
          queryKey: ['documentos', 'list', 'cliente', clienteId],
        }),
      ])

      toast.success('✅ Carta subida correctamente', {
        description: 'El documento se ha vinculado automáticamente a la fuente de pago',
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('❌ Error subiendo carta:', error)
      toast.error('Error al subir la carta', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente o contacta al soporte',
      })
    } finally {
      setIsUploading(false)
    }
  }

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    archivo,
    isDragging,
    isUploading,
    errorArchivo,

    // Título
    titulo,
    setTitulo,
    tituloSugerido,
    tituloHeader,

    // Refs
    fileInputRef,

    // Handlers
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleSubmit,
    limpiarArchivo,
  }
}

'use client'

import { supabase } from '@/lib/supabase/client'
import { useState } from 'react'
import { toast } from 'sonner'

interface ReemplazarArchivoData {
  nuevoArchivo: File
  justificacion: string
  password: string
}

interface DocumentoInfo {
  id: string
  nombre_archivo: string
  ruta_storage: string
  tamano_bytes: number
  version: number
}

export function useDocumentoReemplazarArchivo() {
  const [reemplazando, setReemplazando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const reemplazarArchivo = async (
    documento: DocumentoInfo,
    data: ReemplazarArchivoData
  ): Promise<boolean> => {
    setReemplazando(true)
    setProgreso(0)
    setError(null)

    try {
      // 1. Validaciones básicas
      if (!data.justificacion || data.justificacion.trim().length < 10) {
        throw new Error('La justificación debe tener al menos 10 caracteres')
      }

      if (!data.password || data.password.length < 1) {
        throw new Error('Debes ingresar tu contraseña para confirmar')
      }

      if (!data.nuevoArchivo) {
        throw new Error('Debes seleccionar un archivo')
      }

      // Validar tamaño (max 50MB)
      const MAX_SIZE = 50 * 1024 * 1024
      if (data.nuevoArchivo.size > MAX_SIZE) {
        throw new Error('El archivo no puede superar los 50MB')
      }

      setProgreso(10)

      // 2. Verificar que el usuario es admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No autenticado')
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (usuarioError || !usuario) {
        throw new Error('No se pudo verificar el usuario')
      }

      if (usuario.rol !== 'Administrador') {
        throw new Error('Solo administradores pueden reemplazar archivos')
      }

      setProgreso(20)

      // 3. Validar contraseña
      const { data: passwordData, error: passwordError } = await supabase.rpc(
        'validar_password_admin',
        {
          p_user_id: user.id,
          p_password: data.password
        }
      )

      if (passwordError) {
        console.error('Error validando password:', passwordError)
        throw new Error('Error al validar contraseña')
      }

      if (!passwordData) {
        throw new Error('Contraseña incorrecta')
      }

      setProgreso(30)

      // 4. Obtener información de la IP (opcional)
      let ipOrigen = null
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        ipOrigen = ipData.ip
      } catch (e) {
        console.warn('No se pudo obtener IP:', e)
      }

      setProgreso(40)

      // 5. Registrar en tabla de auditoría ANTES de eliminar
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null

      const { error: auditoriaError } = await supabase
        .from('documento_reemplazos_admin')
        .insert({
          documento_id: documento.id,
          archivo_anterior: documento.nombre_archivo,
          ruta_anterior: documento.ruta_storage,
          tamano_anterior: documento.tamano_bytes,
          archivo_nuevo: data.nuevoArchivo.name,
          ruta_nueva: `${documento.ruta_storage.split('/').slice(0, -1).join('/')}/${Date.now()}_${data.nuevoArchivo.name}`,
          tamano_nuevo: data.nuevoArchivo.size,
          admin_id: user.id,
          justificacion: data.justificacion.trim(),
          ip_origen: ipOrigen,
          user_agent: userAgent,
          version_afectada: documento.version
        })

      if (auditoriaError) {
        console.error('Error registrando auditoría:', auditoriaError)
        throw new Error('No se pudo registrar la auditoría del reemplazo')
      }

      setProgreso(50)

      // 6. Eliminar archivo viejo del storage
      const { error: deleteError } = await supabase.storage
        .from('documentos-proyectos')
        .remove([documento.ruta_storage])

      if (deleteError) {
        console.error('Error eliminando archivo viejo:', deleteError)
        // No lanzamos error aquí porque el archivo podría no existir
        toast.warning('Archivo anterior no encontrado', {
          description: 'Se continuará con la subida del nuevo archivo'
        })
      }

      setProgreso(60)

      // 7. Subir archivo nuevo
      const timestamp = Date.now()
      const extension = data.nuevoArchivo.name.split('.').pop()
      const nombreLimpio = data.nuevoArchivo.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
      const nombreFinal = `${timestamp}_${nombreLimpio}.${extension}`

      // Mantener la estructura de carpetas del archivo anterior
      const carpetaPadre = documento.ruta_storage.split('/').slice(0, -1).join('/')
      const rutaNueva = `${carpetaPadre}/${nombreFinal}`

      const { error: uploadError } = await supabase.storage
        .from('documentos-proyectos')
        .upload(rutaNueva, data.nuevoArchivo, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error subiendo archivo nuevo:', uploadError)
        throw new Error('No se pudo subir el nuevo archivo')
      }

      setProgreso(80)

      // 8. Actualizar registro en base de datos
      const { error: updateError } = await supabase
        .from('documentos_proyecto')
        .update({
          nombre_archivo: data.nuevoArchivo.name,
          ruta_storage: rutaNueva,
          tamano_bytes: data.nuevoArchivo.size,
          updated_at: new Date().toISOString()
          // ⚠️ version NO cambia - se mantiene igual
        })
        .eq('id', documento.id)

      if (updateError) {
        console.error('Error actualizando documento:', updateError)

        // Intentar eliminar el archivo nuevo que subimos
        await supabase.storage
          .from('documentos-proyectos')
          .remove([rutaNueva])

        throw new Error('No se pudo actualizar el documento en la base de datos')
      }

      setProgreso(100)

      toast.success('Archivo reemplazado exitosamente', {
        description: `${documento.nombre_archivo} → ${data.nuevoArchivo.name}`
      })

      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      toast.error('Error al reemplazar archivo', {
        description: errorMsg
      })
      return false
    } finally {
      setReemplazando(false)
      setProgreso(0)
    }
  }

  return {
    reemplazando,
    progreso,
    error,
    reemplazarArchivo
  }
}

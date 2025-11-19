// ============================================
// SERVICE: Documentos Vivienda - Reemplazo Seguro
// ============================================

import { supabase } from '@/lib/supabase/client'
import { auditService } from '@/services/audit.service'

const BUCKET_NAME = 'documentos-viviendas'

/**
 * Servicio de reemplazo seguro de archivos
 * Responsabilidades: reemplazar archivo con validación, backup automático y auditoría
 */
export class DocumentosReemplazoService {
  /**
   * REEMPLAZAR ARCHIVO SEGURO (Admin Only)
   * Crea backup automático antes de reemplazar
   */
  static async reemplazarArchivoSeguro(
    documentoId: string,
    nuevoArchivo: File,
    motivo: string,
    password: string
  ): Promise<void> {
    console.log('🔄 Iniciando reemplazo seguro de archivo:', {
      documentoId,
      nuevoArchivo: nuevoArchivo.name,
      tamano: nuevoArchivo.size,
      motivo
    })

    // 1. Verificar usuario y validar contraseña de admin
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    // Verificar que es administrador
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

    // Validar contraseña usando función RPC
    const { data: passwordValid, error: passwordError } = await supabase.rpc(
      'validar_password_admin',
      {
        p_user_id: user.id,
        p_password: password
      }
    )

    if (passwordError) {
      console.error('Error validando password:', passwordError)
      throw new Error('Error al validar contraseña')
    }

    if (!passwordValid) {
      throw new Error('Contraseña incorrecta')
    }

    console.log('✅ Validación de contraseña de admin exitosa')

    // 2. Validar que el documento existe
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_vivienda')
      .select('*')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      throw new Error('Documento no encontrado')
    }

    // 3. Crear backup del archivo original
    const backupPath = `${documento.vivienda_id}/backups/reemplazos/${documentoId}_backup_${Date.now()}_${documento.nombre_archivo}`

    // Descargar archivo original para backup
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(documento.url_storage)

    if (downloadError) {
      console.error('❌ Error al descargar archivo original:', downloadError)
      throw new Error(`Error al descargar archivo original: ${downloadError.message}`)
    }

    console.log('✅ Archivo original descargado para backup')

    // Subir backup
    const { error: backupError } = await supabase.storage.from(BUCKET_NAME).upload(backupPath, downloadData, {
      contentType: documento.tipo_mime,
      upsert: false
    })

    if (backupError) {
      console.error('❌ Error al crear backup:', backupError)
      throw new Error(`Error al crear backup: ${backupError.message}`)
    }

    console.log('✅ Backup creado:', backupPath)

    // 5. Reemplazar archivo original
    const { error: replaceError } = await supabase.storage
      .from(BUCKET_NAME)
      .update(documento.url_storage, nuevoArchivo, {
        contentType: nuevoArchivo.type,
        upsert: true
      })

    if (replaceError) {
      console.error('❌ Error al reemplazar archivo:', replaceError)
      throw new Error(`Error al reemplazar archivo: ${replaceError.message}`)
    }

    console.log('✅ Archivo reemplazado exitosamente en storage')

    // 6. Actualizar metadata con información del reemplazo
    const metadataReemplazo = {
      ...(typeof documento.metadata === 'object' && documento.metadata !== null
        ? documento.metadata
        : {}),
      reemplazo: {
        fecha: new Date().toISOString(),
        motivo,
        archivo_original: documento.nombre_archivo,
        archivo_nuevo: nuevoArchivo.name,
        tamano_original: documento.tamano_bytes,
        tamano_nuevo: nuevoArchivo.size,
        backup_path: backupPath
      }
    }

    const { error: updateError } = await supabase
      .from('documentos_vivienda')
      .update({
        nombre_archivo: nuevoArchivo.name,
        nombre_original: nuevoArchivo.name,
        tamano_bytes: nuevoArchivo.size,
        tipo_mime: nuevoArchivo.type,
        metadata: metadataReemplazo,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', documentoId)

    if (updateError) {
      console.error('❌ Error al actualizar metadata:', updateError)
      throw new Error(`Error al actualizar metadata: ${updateError.message}`)
    }

    console.log('✅ Archivo reemplazado exitosamente')

    // 7. Registrar en auditoría
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      // Obtener URL de descarga del backup
      const { data: backupUrlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(backupPath, 31536000) // 1 año de validez

      // Obtener URL del nuevo archivo
      const { data: nuevoUrlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(documento.url_storage, 31536000)

      await auditService.registrarAccion({
        tabla: 'documentos_vivienda',
        accion: 'UPDATE',
        registroId: documentoId,
        datosAnteriores: {
          nombre_archivo: documento.nombre_archivo,
          nombre_original: documento.nombre_original,
          tamano_bytes: documento.tamano_bytes,
          tipo_mime: documento.tipo_mime,
          url_storage: documento.url_storage,
          fecha_actualizacion: documento.fecha_actualizacion
        },
        datosNuevos: {
          nombre_archivo: nuevoArchivo.name,
          nombre_original: nuevoArchivo.name,
          tamano_bytes: nuevoArchivo.size,
          tipo_mime: nuevoArchivo.type,
          url_storage: documento.url_storage,
          fecha_actualizacion: new Date().toISOString()
        },
        metadata: {
          tipo_operacion: 'REEMPLAZO_ARCHIVO',
          motivo_reemplazo: motivo,
          archivo_original: {
            nombre: documento.nombre_archivo,
            tamano_bytes: documento.tamano_bytes,
            tamano_mb: (documento.tamano_bytes / (1024 * 1024)).toFixed(2),
            tipo_mime: documento.tipo_mime,
            url_backup: backupUrlData?.signedUrl || null,
            backup_path: backupPath
          },
          archivo_nuevo: {
            nombre: nuevoArchivo.name,
            tamano_bytes: nuevoArchivo.size,
            tamano_mb: (nuevoArchivo.size / (1024 * 1024)).toFixed(2),
            tipo_mime: nuevoArchivo.type,
            url_actual: nuevoUrlData?.signedUrl || null
          },
          tiempo: {
            fecha_creacion_documento: documento.fecha_creacion,
            fecha_reemplazo: new Date().toISOString()
          },
          comparacion: {
            diferencia_bytes: nuevoArchivo.size - documento.tamano_bytes,
            diferencia_mb: ((nuevoArchivo.size - documento.tamano_bytes) / (1024 * 1024)).toFixed(2),
            porcentaje_cambio: (
              ((nuevoArchivo.size - documento.tamano_bytes) / documento.tamano_bytes) *
              100
            ).toFixed(2)
          },
          contexto: {
            vivienda_id: documento.vivienda_id,
            categoria_id: documento.categoria_id,
            titulo: documento.titulo,
            version: documento.version,
            es_version_actual: documento.es_version_actual,
            estado_version: documento.estado_version || 'valida'
          },
          usuario_reemplazo: {
            usuario_id: user?.id || 'desconocido',
            email: user?.email || 'desconocido',
            timestamp: new Date().toISOString()
          }
        },
        modulo: 'viviendas'
      })

      console.log('✅ Auditoría registrada')
    } catch (auditError) {
      console.error('⚠️ Error al registrar auditoría:', auditError)
    }
  }
}

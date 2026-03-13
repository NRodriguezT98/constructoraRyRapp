// ============================================
// SERVICE: Documentos - Reemplazo Seguro (GENÉRICO)
// ============================================

import { supabase } from '@/lib/supabase/client'
import { auditService } from '@/services/audit.service'
import { type TipoEntidad, obtenerConfiguracionEntidad } from '../types/entidad.types'

/**
 * Servicio de reemplazo seguro de archivos con rollback automático
 * Responsabilidades: reemplazar archivo con validación, backup automático, transacciones y auditoría
 */
export class DocumentosReemplazoService {
  /**
   * REEMPLAZAR ARCHIVO SEGURO (Admin Only)
   * ✅ Con rollback automático en caso de error
   * ✅ Manejo de transacciones
   * ✅ Backup verificado antes de proceder
   */
  static async reemplazarArchivoSeguro(
    documentoId: string,
    nuevoArchivo: File,
    motivo: string,
    password: string,
    tipoEntidad: TipoEntidad = 'proyecto'
  ): Promise<void> {
    // ✅ Obtener configuración dinámica
    const config = obtenerConfiguracionEntidad(tipoEntidad)
    const { bucket, tabla, campoEntidad, nombreSingular } = config

    // Variables para rollback
    let backupPath: string | null = null
    let archivoReemplazado = false
    let documento: any = null

    try {
      // ============================================
      // 1. VALIDACIÓN DE SEGURIDAD
      // ============================================
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Verificar rol de administrador
      const { data: usuarioResult, error: usuarioError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()
      const usuario = usuarioResult as any

      if (usuarioError || !usuario) {
        throw new Error('No se pudo verificar el usuario')
      }

      if (usuario.rol !== 'Administrador') {
        throw new Error('⛔ Solo administradores pueden reemplazar archivos')
      }

      // Validar contraseña
      const { data: passwordValid, error: passwordError } = await supabase.rpc(
        'validar_password_admin',
        { p_user_id: user.id, p_password: password }
      )

      if (passwordError) {
        console.error('❌ [REEMPLAZO] Error validando contraseña:', passwordError)
        throw new Error('Error al validar contraseña de administrador')
      }

      if (!passwordValid) {
        throw new Error('❌ Contraseña incorrecta')
      }


      // ============================================
      // 2. OBTENER DOCUMENTO Y VALIDAR
      // ============================================
      const { data: _docData, error: fetchError } = await supabase
        .from(tabla as any)
        .select('*')
        .eq('id', documentoId)
        .single()
      documento = _docData as any

      if (fetchError || !documento) {
        throw new Error(`Documento no encontrado en ${tabla}`)
      }

      const entidadId = documento[campoEntidad]
      if (!entidadId) {
        throw new Error(`Campo ${campoEntidad} no encontrado en documento`)
      }


      // ============================================
      // 3. CREAR Y VERIFICAR BACKUP
      // ============================================
      backupPath = `${entidadId}/backups/reemplazos/${documentoId}_backup_${Date.now()}_${documento.nombre_archivo}`


      // Descargar archivo original
      const { data: archivoOriginal, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(documento.url_storage)

      if (downloadError || !archivoOriginal) {
        throw new Error(`No se pudo descargar archivo original: ${downloadError?.message}`)
      }

      // Verificar que el archivo descargado tiene contenido
      if (archivoOriginal.size === 0) {
        throw new Error('El archivo original descargado está vacío')
      }

      // Subir backup
      const { error: backupError } = await supabase.storage
        .from(bucket)
        .upload(backupPath, archivoOriginal, {
          contentType: documento.tipo_mime,
          upsert: false
        })

      if (backupError) {
        throw new Error(`Error al crear backup: ${backupError.message}`)
      }

      // Verificar que el backup existe
      const { data: backupExists, error: verifyError } = await supabase.storage
        .from(bucket)
        .list(backupPath.split('/').slice(0, -1).join('/'), {
          search: backupPath.split('/').pop()
        })

      if (verifyError || !backupExists || backupExists.length === 0) {
        throw new Error('No se pudo verificar la creación del backup')
      }


      // ============================================
      // 4. REEMPLAZAR ARCHIVO EN STORAGE
      // ============================================

      const { error: replaceError } = await supabase.storage
        .from(bucket)
        .update(documento.url_storage, nuevoArchivo, {
          contentType: nuevoArchivo.type,
          upsert: true
        })

      if (replaceError) {
        throw new Error(`Error al reemplazar archivo: ${replaceError.message}`)
      }

      archivoReemplazado = true

      // ============================================
      // 5. ACTUALIZAR METADATA EN BD
      // ============================================
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
          backup_path: backupPath,
          reemplazado_por: user.email
        }
      }

      const { error: updateError } = await supabase
        .from(tabla as any)
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
        throw new Error(`Error al actualizar metadata: ${updateError.message}`)
      }


      // ============================================
      // 6. REGISTRAR AUDITORÍA
      // ============================================
      await this.registrarAuditoriaReemplazo({
        documento,
        nuevoArchivo,
        motivo,
        backupPath,
        entidadId,
        tipoEntidad,
        tabla,
        campoEntidad,
        bucket,
        user
      })


    } catch (error) {
      console.error('💥 [REEMPLAZO] Error en el proceso:', error)

      // ============================================
      // ROLLBACK AUTOMÁTICO
      // ============================================
      if (archivoReemplazado && backupPath) {
        console.warn('⚠️ [ROLLBACK] Intentando restaurar archivo original...')
        try {
          // Descargar backup
          const { data: backupData } = await supabase.storage
            .from(bucket)
            .download(backupPath)

          if (backupData) {
            // Restaurar archivo original
            await supabase.storage
              .from(bucket)
              .update(documento.url_storage, backupData, {
                contentType: documento.tipo_mime,
                upsert: true
              })

          }
        } catch (rollbackError) {
          console.error('💥 [ROLLBACK] Error crítico al restaurar archivo:', rollbackError)
          console.error(`⚠️ ACCIÓN MANUAL REQUERIDA: Restaurar desde backup: ${backupPath}`)
        }
      }

      throw error
    }
  }

  /**
   * Registrar auditoría del reemplazo
   * Separado para mantener método principal limpio
   */
  private static async registrarAuditoriaReemplazo(params: {
    documento: any
    nuevoArchivo: File
    motivo: string
    backupPath: string
    entidadId: string
    tipoEntidad: TipoEntidad
    tabla: string
    campoEntidad: string
    bucket: string
    user: any
  }) {
    const {
      documento,
      nuevoArchivo,
      motivo,
      backupPath,
      entidadId,
      tipoEntidad,
      tabla,
      campoEntidad,
      bucket,
      user
    } = params

    try {
      // Obtener URLs firmadas
      const { data: backupUrlData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(backupPath, 31536000)

      const { data: nuevoUrlData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(documento.url_storage, 31536000)

      await auditService.registrarAccion({
        tabla: tabla as any,
        accion: 'UPDATE',
        registroId: documento.id,
        datosAnteriores: {
          nombre_archivo: documento.nombre_archivo,
          tamano_bytes: documento.tamano_bytes,
          tipo_mime: documento.tipo_mime
        },
        datosNuevos: {
          nombre_archivo: nuevoArchivo.name,
          tamano_bytes: nuevoArchivo.size,
          tipo_mime: nuevoArchivo.type
        },
        metadata: {
          tipo_operacion: 'REEMPLAZO_ARCHIVO',
          tipo_entidad: tipoEntidad,
          entidad_id: entidadId,
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
          comparacion: {
            diferencia_bytes: nuevoArchivo.size - documento.tamano_bytes,
            diferencia_mb: ((nuevoArchivo.size - documento.tamano_bytes) / (1024 * 1024)).toFixed(2),
            porcentaje_cambio: documento.tamano_bytes > 0
              ? (((nuevoArchivo.size - documento.tamano_bytes) / documento.tamano_bytes) * 100).toFixed(2)
              : '0.00'
          },
          contexto: {
            [campoEntidad]: entidadId,
            categoria_id: documento.categoria_id,
            titulo: documento.titulo,
            version: documento.version
          },
          usuario_reemplazo: {
            usuario_id: user.id,
            email: user.email,
            timestamp: new Date().toISOString()
          }
        },
        modulo: 'documentos'
      })

    } catch (auditError) {
      console.error('⚠️ [AUDITORÍA] Error al registrar (no crítico):', auditError)
    }
  }
}

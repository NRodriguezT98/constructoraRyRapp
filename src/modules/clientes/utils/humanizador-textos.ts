/**
 * Genera el título y descripción legibles para cada tipo de evento.
 */

import type {
  EventoHistorialCliente,
  TipoEventoHistorial,
} from '../types/historial.types'

import { CAMPOS_EXCLUIDOS, ETIQUETAS } from './humanizador-constantes'

export function generarTextos(
  evento: EventoHistorialCliente,
  tipo: TipoEventoHistorial
): { titulo: string; descripcion: string } {
  const { datos_nuevos, datos_anteriores, cambios_especificos, metadata } =
    evento

  switch (tipo) {
    // ========== CLIENTE ==========
    case 'cliente_creado':
      return {
        titulo: 'Cliente registrado',
        descripcion: `Se creó el cliente ${datos_nuevos?.nombres || ''} ${datos_nuevos?.apellidos || ''} en la aplicación con los siguientes datos`,
      }

    case 'cliente_actualizado': {
      const camposVisibles = cambios_especificos
        ? Object.keys(cambios_especificos).filter(
            campo => !CAMPOS_EXCLUIDOS.has(campo)
          )
        : []
      const descripcionCampos =
        camposVisibles.length > 0
          ? camposVisibles.join(', ')
          : 'información del perfil'
      return {
        titulo: 'Perfil actualizado',
        descripcion: `Se modificó ${descripcionCampos} del cliente`,
      }
    }

    case 'cliente_estado_cambiado': {
      const estadoAnterior = cambios_especificos?.estado?.antes || 'desconocido'
      const estadoNuevo = cambios_especificos?.estado?.despues || 'desconocido'
      return {
        titulo: 'Estado modificado',
        descripcion: `Estado cambió de "${estadoAnterior}" a "${estadoNuevo}"`,
      }
    }

    case 'cliente_eliminado':
      return {
        titulo: 'Cliente eliminado',
        descripcion: `Se eliminó el registro del cliente ${datos_anteriores?.nombres || ''} ${datos_anteriores?.apellidos || ''}`,
      }

    // ========== NEGOCIACIÓN ==========
    case 'negociacion_creada': {
      const viviendaNombre =
        metadata?.vivienda_nombre || metadata?.vivienda_numero || 'N/A'
      const valorTotal = datos_nuevos?.valor_total
        ? `$${(datos_nuevos.valor_total as number).toLocaleString('es-CO')}`
        : 'N/A'
      return {
        titulo: 'Negociación iniciada',
        descripcion: `Nueva negociación para vivienda ${viviendaNombre} por ${valorTotal}`,
      }
    }

    case 'negociacion_actualizada':
      return {
        titulo: 'Negociación actualizada',
        descripcion: `Se modificaron los términos de la negociación`,
      }

    case 'negociacion_estado_cambiada': {
      const negEstadoAnterior =
        cambios_especificos?.estado?.antes || 'desconocido'
      const negEstadoNuevo =
        cambios_especificos?.estado?.despues || 'desconocido'
      return {
        titulo: 'Estado de negociación cambió',
        descripcion: `De "${negEstadoAnterior}" a "${negEstadoNuevo}"`,
      }
    }

    case 'negociacion_completada':
      return {
        titulo: '¡Negociación completada!',
        descripcion: `La negociación se finalizó exitosamente`,
      }

    // ========== ABONO ==========
    case 'abono_registrado': {
      const valorAbono = datos_nuevos?.valor_abono
        ? `$${(datos_nuevos.valor_abono as number).toLocaleString('es-CO')}`
        : 'N/A'
      return {
        titulo: 'Abono registrado',
        descripcion: `Pago de ${valorAbono} aplicado a la negociación`,
      }
    }

    case 'abono_anulado': {
      const valorAnulado = datos_anteriores?.valor_abono
        ? `$${(datos_anteriores.valor_abono as number).toLocaleString('es-CO')}`
        : 'N/A'
      return {
        titulo: 'Abono anulado',
        descripcion: `Se anuló un pago de ${valorAnulado}`,
      }
    }

    // ========== RENUNCIA ==========
    case 'renuncia_creada':
      return {
        titulo: 'Renuncia solicitada',
        descripcion: `Se registró una solicitud de renuncia a la negociación`,
      }

    case 'renuncia_aprobada':
      return {
        titulo: 'Renuncia aprobada',
        descripcion: `La solicitud de renuncia fue aprobada`,
      }

    case 'renuncia_rechazada':
      return {
        titulo: 'Renuncia rechazada',
        descripcion: `La solicitud de renuncia fue rechazada`,
      }

    // ========== INTERÉS ==========
    case 'interes_registrado': {
      const proyectoNombre = metadata?.proyecto_nombre || 'N/A'
      return {
        titulo: 'Interés registrado',
        descripcion: `Cliente mostró interés en proyecto "${proyectoNombre}"`,
      }
    }

    case 'interes_actualizado':
      return {
        titulo: 'Interés actualizado',
        descripcion: `Se modificó el registro de interés del cliente`,
      }

    case 'interes_descartado':
      return {
        titulo: 'Interés descartado',
        descripcion: `El cliente descartó el interés en este proyecto`,
      }

    // ========== DOCUMENTO ==========
    case 'documento_subido': {
      const nombreDoc = datos_nuevos?.titulo || 'documento'
      return {
        titulo: 'Documento cargado',
        descripcion: `Se subió el documento "${nombreDoc}"`,
      }
    }

    case 'documento_actualizado': {
      const tipoOp = metadata?.tipo_operacion as string | undefined
      const docTitulo =
        (metadata?.titulo as string | undefined) ??
        (datos_anteriores?.titulo as string | undefined) ??
        'documento'
      if (tipoOp === 'ARCHIVAR_DOCUMENTO') {
        return {
          titulo: 'Documento archivado',
          descripcion: `Se archivó el documento "${docTitulo}"`,
        }
      }
      if (tipoOp === 'RESTAURAR_DOCUMENTO_ARCHIVADO') {
        return {
          titulo: 'Documento restaurado',
          descripcion: `Se restauró el documento "${docTitulo}" del archivo`,
        }
      }
      if (tipoOp === 'ELIMINAR_DOCUMENTO_SOFTDELETE') {
        return {
          titulo: 'Documento eliminado',
          descripcion: `Se eliminó el documento "${docTitulo}"`,
        }
      }
      if (tipoOp === 'NUEVA_VERSION_DOCUMENTO') {
        const versionNueva = metadata?.version_nueva as number | undefined
        const sufijo = versionNueva ? ` (v${versionNueva})` : ''
        return {
          titulo: 'Nueva versión cargada',
          descripcion: `Se subió una nueva versión${sufijo} de "${docTitulo}"`,
        }
      }
      if (tipoOp === 'REEMPLAZO_ARCHIVO') {
        return {
          titulo: 'Archivo reemplazado',
          descripcion: `Se reemplazó el archivo de "${docTitulo}"`,
        }
      }
      const camposActualizados = metadata?.campos_actualizados as
        | string[]
        | undefined
      const resumen =
        camposActualizados && camposActualizados.length > 0
          ? camposActualizados.map(c => ETIQUETAS[c] ?? c).join(', ')
          : 'sus campos'
      return {
        titulo: 'Documento editado',
        descripcion: `Se editó ${resumen} del documento "${docTitulo}"`,
      }
    }

    case 'documento_eliminado': {
      const docEliminado =
        (metadata?.titulo as string | undefined) ??
        datos_anteriores?.titulo ??
        'documento'
      return {
        titulo: 'Documento eliminado',
        descripcion: `Se eliminó el documento "${docEliminado}"`,
      }
    }

    // ========== GENÉRICO ==========
    default:
      return {
        titulo: 'Evento registrado',
        descripcion: `Acción ${evento.accion} en ${evento.tabla}`,
      }
  }
}

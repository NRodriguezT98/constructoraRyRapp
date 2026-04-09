/**
 * Genera el título y descripción legibles para cada tipo de evento.
 */

import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'

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
      const manzanaParte = metadata?.manzana_nombre
        ? `Mza. ${metadata.manzana_nombre}`
        : null
      const casaParte = metadata?.vivienda_numero
        ? `Casa ${metadata.vivienda_numero}`
        : (metadata?.vivienda_nombre ?? null)
      const viviendaLabel =
        [manzanaParte, casaParte].filter(Boolean).join(' · ') || 'N/A'
      const proyectoParte = metadata?.proyecto_nombre
        ? ` del proyecto ${metadata.proyecto_nombre}`
        : ''
      return {
        titulo: 'Negociación iniciada',
        descripcion: `Se asignó la vivienda ${viviendaLabel}${proyectoParte}`,
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
      const montoVal =
        (metadata?.abono_monto as number | undefined) ??
        (datos_nuevos?.monto as number | undefined)
      const montoStr = montoVal ? `$${montoVal.toLocaleString('es-CO')}` : 'N/A'
      const consecutivo = metadata?.abono_numero_recibo
        ? formatearNumeroRecibo(Number(metadata.abono_numero_recibo))
        : null
      const fuente = metadata?.fuente_tipo ? String(metadata.fuente_tipo) : null
      const metodo = metadata?.abono_metodo_pago
        ? String(metadata.abono_metodo_pago)
        : null
      const partes = [
        consecutivo ? `Consecutivo: ${consecutivo}` : null,
        `Valor: ${montoStr}`,
        fuente ? `Fuente: ${fuente}` : null,
        metodo ? `Método: ${metodo}` : null,
      ].filter(Boolean)
      return {
        titulo: 'Abono registrado',
        descripcion: `Se registró abono — ${partes.join(' · ')}`,
      }
    }

    case 'abono_anulado': {
      const montoVal =
        (metadata?.abono_monto as number | undefined) ??
        (datos_anteriores?.monto as number | undefined)
      const montoStr = montoVal ? `$${montoVal.toLocaleString('es-CO')}` : 'N/A'
      const consecutivo = metadata?.abono_numero_recibo
        ? formatearNumeroRecibo(Number(metadata.abono_numero_recibo))
        : null
      const motivo = metadata?.motivo_categoria
        ? String(metadata.motivo_categoria)
        : null
      const partes = [
        consecutivo ? `Consecutivo: ${consecutivo}` : null,
        `Valor: ${montoStr}`,
        motivo ? `Motivo: ${motivo}` : null,
      ].filter(Boolean)
      return {
        titulo: 'Abono anulado',
        descripcion: `Se anuló abono — ${partes.join(' · ')}`,
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

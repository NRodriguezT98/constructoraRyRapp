/**
 * Humanizador de Eventos de Historial
 * Convierte eventos raw de audit_log en mensajes legibles para usuarios
 */

import {
    AlertCircle,
    CheckCircle,
    DollarSign,
    Edit3,
    FileCheck,
    FileText,
    FileX,
    HandshakeIcon,
    Heart,
    HeartOff,
    RefreshCw,
    Trash2,
    Upload,
    UserCheck,
    UserPen,
    UserPlus,
    UserX,
    XCircle,
    type LucideIcon,
} from 'lucide-react'

import type {
    ColorEvento,
    DetalleEvento,
    EventoHistorialCliente,
    EventoHistorialHumanizado,
    TipoEventoHistorial,
} from '../types/historial.types'

/**
 * Humanizar un evento de audit_log
 * Convierte JSON raw en información legible
 */
export function humanizarEvento(
  evento: EventoHistorialCliente
): EventoHistorialHumanizado {
  const tipo = detectarTipoEvento(evento)
  const { titulo, descripcion } = generarTextos(evento, tipo)
  const icono = obtenerIcono(tipo)
  const color = obtenerColor(tipo)
  const detalles = extraerDetalles(evento, tipo)

  return {
    id: evento.id,
    tipo,
    titulo,
    descripcion,
    fecha: evento.fecha_evento,
    usuario: {
      email: evento.usuario_email,
      nombres: evento.usuario_nombres,
      rol: evento.usuario_rol,
    },
    icono,
    color,
    detalles: detalles.length > 0 ? detalles : undefined,
    metadata: evento.metadata,
  }
}

/**
 * Detectar tipo específico de evento
 * Analiza tabla + acción + metadata para determinar tipo exacto
 */
function detectarTipoEvento(evento: EventoHistorialCliente): TipoEventoHistorial {
  const { tabla, accion, cambios_especificos, metadata } = evento

  // ========== CLIENTE ==========
  if (tabla === 'clientes') {
    if (accion === 'CREATE') return 'cliente_creado'
    if (accion === 'DELETE') return 'cliente_eliminado'
    if (accion === 'UPDATE') {
      // Detectar cambio de estado
      if (cambios_especificos?.estado) return 'cliente_estado_cambiado'
      return 'cliente_actualizado'
    }
  }

  // ========== NEGOCIACIÓN ==========
  if (tabla === 'negociaciones') {
    if (accion === 'CREATE') return 'negociacion_creada'
    if (accion === 'UPDATE') {
      // Detectar si se completó
      if (cambios_especificos?.estado?.despues === 'Completada') {
        return 'negociacion_completada'
      }
      // Detectar cambio de estado
      if (cambios_especificos?.estado) return 'negociacion_estado_cambiada'
      return 'negociacion_actualizada'
    }
  }

  // ========== ABONO ==========
  if (tabla === 'abonos_historial') {
    if (accion === 'CREATE') return 'abono_registrado'
    if (accion === 'DELETE') return 'abono_anulado'
  }

  // ========== RENUNCIA ==========
  if (tabla === 'renuncias') {
    if (accion === 'CREATE') return 'renuncia_creada'
    if (accion === 'UPDATE') {
      const estadoNuevo = cambios_especificos?.estado?.despues
      if (estadoNuevo === 'Aprobada') return 'renuncia_aprobada'
      if (estadoNuevo === 'Rechazada') return 'renuncia_rechazada'
    }
  }

  // ========== INTERÉS ==========
  if (tabla === 'intereses') {
    if (accion === 'CREATE') return 'interes_registrado'
    if (accion === 'UPDATE') {
      if (cambios_especificos?.estado?.despues === 'Descartado') {
        return 'interes_descartado'
      }
      return 'interes_actualizado'
    }
  }

  // ========== DOCUMENTO ==========
  if (tabla === 'documentos_cliente') {
    if (accion === 'CREATE') return 'documento_subido'
    if (accion === 'UPDATE') return 'documento_actualizado'
    if (accion === 'DELETE') return 'documento_eliminado'
  }

  return 'evento_generico'
}

/**
 * Generar título y descripción legibles
 */
function generarTextos(
  evento: EventoHistorialCliente,
  tipo: TipoEventoHistorial
): { titulo: string; descripcion: string } {
  const { datos_nuevos, datos_anteriores, cambios_especificos, metadata } = evento

  switch (tipo) {
    // ========== CLIENTE ==========
    case 'cliente_creado':
      return {
        titulo: 'Cliente registrado',
        descripcion: `Se creó el cliente ${datos_nuevos?.nombres || ''} ${datos_nuevos?.apellidos || ''} en la aplicación con los siguientes datos`,
      }

    case 'cliente_actualizado':
      const camposModificados = cambios_especificos
        ? Object.keys(cambios_especificos).join(', ')
        : 'información del perfil'
      return {
        titulo: 'Perfil actualizado',
        descripcion: `Se modificó ${camposModificados} del cliente`,
      }

    case 'cliente_estado_cambiado':
      const estadoAnterior = cambios_especificos?.estado?.antes || 'desconocido'
      const estadoNuevo = cambios_especificos?.estado?.despues || 'desconocido'
      return {
        titulo: 'Estado modificado',
        descripcion: `Estado cambió de "${estadoAnterior}" a "${estadoNuevo}"`,
      }

    case 'cliente_eliminado':
      return {
        titulo: 'Cliente eliminado',
        descripcion: `Se eliminó el registro del cliente ${datos_anteriores?.nombres || ''} ${datos_anteriores?.apellidos || ''}`,
      }

    // ========== NEGOCIACIÓN ==========
    case 'negociacion_creada':
      const viviendaNombre = metadata?.vivienda_nombre || metadata?.vivienda_numero || 'N/A'
      const valorTotal = datos_nuevos?.valor_total
        ? `$${datos_nuevos.valor_total.toLocaleString('es-CO')}`
        : 'N/A'
      return {
        titulo: 'Negociación iniciada',
        descripcion: `Nueva negociación para vivienda ${viviendaNombre} por ${valorTotal}`,
      }

    case 'negociacion_actualizada':
      return {
        titulo: 'Negociación actualizada',
        descripcion: `Se modificaron los términos de la negociación`,
      }

    case 'negociacion_estado_cambiada':
      const negEstadoAnterior = cambios_especificos?.estado?.antes || 'desconocido'
      const negEstadoNuevo = cambios_especificos?.estado?.despues || 'desconocido'
      return {
        titulo: 'Estado de negociación cambió',
        descripcion: `De "${negEstadoAnterior}" a "${negEstadoNuevo}"`,
      }

    case 'negociacion_completada':
      return {
        titulo: '¡Negociación completada!',
        descripcion: `La negociación se finalizó exitosamente`,
      }

    // ========== ABONO ==========
    case 'abono_registrado':
      const valorAbono = datos_nuevos?.valor_abono
        ? `$${datos_nuevos.valor_abono.toLocaleString('es-CO')}`
        : 'N/A'
      return {
        titulo: 'Abono registrado',
        descripcion: `Pago de ${valorAbono} aplicado a la negociación`,
      }

    case 'abono_anulado':
      const valorAnulado = datos_anteriores?.valor_abono
        ? `$${datos_anteriores.valor_abono.toLocaleString('es-CO')}`
        : 'N/A'
      return {
        titulo: 'Abono anulado',
        descripcion: `Se anuló un pago de ${valorAnulado}`,
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
    case 'interes_registrado':
      const proyectoNombre = metadata?.proyecto_nombre || 'N/A'
      return {
        titulo: 'Interés registrado',
        descripcion: `Cliente mostró interés en proyecto "${proyectoNombre}"`,
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
    case 'documento_subido':
      const nombreDoc = datos_nuevos?.titulo || 'documento'
      return {
        titulo: 'Documento cargado',
        descripcion: `Se subió el documento "${nombreDoc}"`,
      }

    case 'documento_actualizado':
      return {
        titulo: 'Documento actualizado',
        descripcion: `Se modificó un documento del cliente`,
      }

    case 'documento_eliminado':
      const docEliminado = datos_anteriores?.titulo || 'documento'
      return {
        titulo: 'Documento eliminado',
        descripcion: `Se eliminó el documento "${docEliminado}"`,
      }

    // ========== GENÉRICO ==========
    default:
      return {
        titulo: 'Evento registrado',
        descripcion: `Acción ${evento.accion} en ${evento.tabla}`,
      }
  }
}

/**
 * Obtener icono según tipo de evento
 */
function obtenerIcono(tipo: TipoEventoHistorial): LucideIcon {
  const iconos: Record<TipoEventoHistorial, LucideIcon> = {
    cliente_creado: UserPlus,
    cliente_actualizado: UserPen,
    cliente_eliminado: UserX,
    cliente_estado_cambiado: UserCheck,
    negociacion_creada: HandshakeIcon,
    negociacion_actualizada: RefreshCw,
    negociacion_estado_cambiada: RefreshCw,
    negociacion_completada: CheckCircle,
    abono_registrado: DollarSign,
    abono_anulado: XCircle,
    renuncia_creada: FileText,
    renuncia_aprobada: FileCheck,
    renuncia_rechazada: FileX,
    interes_registrado: Heart,
    interes_actualizado: Edit3,
    interes_descartado: HeartOff,
    documento_subido: Upload,
    documento_actualizado: Edit3,
    documento_eliminado: Trash2,
    evento_generico: AlertCircle,
  }

  return iconos[tipo] || AlertCircle
}

/**
 * Obtener color según tipo de evento
 */
function obtenerColor(tipo: TipoEventoHistorial): ColorEvento {
  const colores: Record<TipoEventoHistorial, ColorEvento> = {
    cliente_creado: 'green',
    cliente_actualizado: 'yellow',
    cliente_eliminado: 'red',
    cliente_estado_cambiado: 'blue',
    negociacion_creada: 'green',
    negociacion_actualizada: 'yellow',
    negociacion_estado_cambiada: 'blue',
    negociacion_completada: 'purple',
    abono_registrado: 'green',
    abono_anulado: 'red',
    renuncia_creada: 'orange',
    renuncia_aprobada: 'green',
    renuncia_rechazada: 'red',
    interes_registrado: 'cyan',
    interes_actualizado: 'yellow',
    interes_descartado: 'orange',
    documento_subido: 'cyan',
    documento_actualizado: 'yellow',
    documento_eliminado: 'red',
    evento_generico: 'gray',
  }

  return colores[tipo] || 'gray'
}

/**
 * Extraer detalles de cambios (para eventos UPDATE)
 */
function extraerDetalles(
  evento: EventoHistorialCliente,
  tipo: TipoEventoHistorial
): DetalleEvento[] {
  const { cambios_especificos, datos_nuevos, accion } = evento

  // Para CREATE de cliente, mostrar TODOS los campos del formulario
  if (tipo === 'cliente_creado' && accion === 'CREATE' && datos_nuevos) {
    const detalles: DetalleEvento[] = []

    // ========== STEP 0: INFORMACIÓN PERSONAL ==========
    detalles.push({
      campo: 'nombres',
      etiqueta: 'Nombres',
      valorAnterior: null,
      valorNuevo: datos_nuevos.nombres || 'No especificado',
      tipo: 'texto',
    })
    detalles.push({
      campo: 'apellidos',
      etiqueta: 'Apellidos',
      valorAnterior: null,
      valorNuevo: datos_nuevos.apellidos || 'No especificado',
      tipo: 'texto',
    })
    detalles.push({
      campo: 'tipo_documento',
      etiqueta: 'Tipo de documento',
      valorAnterior: null,
      valorNuevo: datos_nuevos.tipo_documento || 'No especificado',
      tipo: 'enum',
    })
    detalles.push({
      campo: 'numero_documento',
      etiqueta: 'Número de documento',
      valorAnterior: null,
      valorNuevo: datos_nuevos.numero_documento || 'No especificado',
      tipo: 'texto',
    })
    detalles.push({
      campo: 'fecha_nacimiento',
      etiqueta: 'Fecha de nacimiento',
      valorAnterior: null,
      valorNuevo: datos_nuevos.fecha_nacimiento || 'No diligenciado',
      tipo: 'fecha',
    })
    detalles.push({
      campo: 'estado_civil',
      etiqueta: 'Estado civil',
      valorAnterior: null,
      valorNuevo: datos_nuevos.estado_civil || 'No diligenciado',
      tipo: 'enum',
    })

    // ========== STEP 1: INFORMACIÓN DE CONTACTO ==========
    detalles.push({
      campo: 'telefono',
      etiqueta: 'Teléfono principal',
      valorAnterior: null,
      valorNuevo: datos_nuevos.telefono || 'No diligenciado',
      tipo: 'texto',
    })
    detalles.push({
      campo: 'telefono_alternativo',
      etiqueta: 'Teléfono alternativo',
      valorAnterior: null,
      valorNuevo: datos_nuevos.telefono_alternativo || 'No diligenciado',
      tipo: 'texto',
    })
    detalles.push({
      campo: 'email',
      etiqueta: 'Correo electrónico',
      valorAnterior: null,
      valorNuevo: datos_nuevos.email || 'No diligenciado',
      tipo: 'texto',
    })
    detalles.push({
      campo: 'direccion',
      etiqueta: 'Dirección',
      valorAnterior: null,
      valorNuevo: datos_nuevos.direccion || 'No diligenciado',
      tipo: 'texto',
    })
    detalles.push({
      campo: 'ciudad',
      etiqueta: 'Ciudad',
      valorAnterior: null,
      valorNuevo: datos_nuevos.ciudad || 'No diligenciado',
      tipo: 'texto',
    })
    detalles.push({
      campo: 'departamento',
      etiqueta: 'Departamento',
      valorAnterior: null,
      valorNuevo: datos_nuevos.departamento || 'No diligenciado',
      tipo: 'texto',
    })

    // ========== STEP 2: INTERÉS (OPCIONAL) ==========
    // Nota: estos campos solo existen si el cliente registró interés
    if (datos_nuevos.proyecto_interes_inicial || datos_nuevos.vivienda_interes_inicial) {
      detalles.push({
        campo: 'proyecto_interes_inicial',
        etiqueta: 'Proyecto de interés',
        valorAnterior: null,
        valorNuevo: datos_nuevos.proyecto_interes_inicial || 'Sin proyecto específico',
        tipo: 'texto',
      })

      if (datos_nuevos.vivienda_interes_inicial) {
        detalles.push({
          campo: 'vivienda_interes_inicial',
          etiqueta: 'Vivienda de interés',
          valorAnterior: null,
          valorNuevo: datos_nuevos.vivienda_interes_inicial || 'Sin vivienda específica',
          tipo: 'texto',
        })
      }

      if (datos_nuevos.notas_interes) {
        detalles.push({
          campo: 'notas_interes',
          etiqueta: 'Notas del interés',
          valorAnterior: null,
          valorNuevo: datos_nuevos.notas_interes,
          tipo: 'texto',
        })
      }
    } else {
      detalles.push({
        campo: 'interes_inicial',
        etiqueta: 'Interés en proyecto/vivienda',
        valorAnterior: null,
        valorNuevo: 'Sin interés específico registrado',
        tipo: 'texto',
      })
    }

    // ========== STEP 3: INFORMACIÓN ADICIONAL ==========
    detalles.push({
      campo: 'notas',
      etiqueta: 'Notas y observaciones',
      valorAnterior: null,
      valorNuevo: datos_nuevos.notas || 'Sin observaciones',
      tipo: 'texto',
    })

    // ========== ESTADO INICIAL ==========
    detalles.push({
      campo: 'estado',
      etiqueta: 'Estado inicial del cliente',
      valorAnterior: null,
      valorNuevo: datos_nuevos.estado || 'Interesado',
      tipo: 'enum',
    })

    return detalles
  }

  if (!cambios_especificos || evento.accion !== 'UPDATE') return []

  const detalles: DetalleEvento[] = []

  // Mapeo de campos a etiquetas legibles
  const etiquetas: Record<string, string> = {
    nombres: 'Nombres',
    apellidos: 'Apellidos',
    tipo_documento: 'Tipo de documento',
    numero_documento: 'Número de documento',
    telefono: 'Teléfono',
    email: 'Correo electrónico',
    direccion: 'Dirección',
    ciudad: 'Ciudad',
    departamento: 'Departamento',
    fecha_nacimiento: 'Fecha de nacimiento',
    estado: 'Estado',
    origen: 'Origen',
    referido_por: 'Referido por',
    ocupacion: 'Ocupación',
    empresa: 'Empresa',
    ingresos_mensuales: 'Ingresos mensuales',
    valor_total: 'Valor total',
    cuota_inicial: 'Cuota inicial',
    saldo_pendiente: 'Saldo pendiente',
    valor_abono: 'Valor del abono',
    metodo_pago: 'Método de pago',
  }

  for (const [campo, cambio] of Object.entries(cambios_especificos)) {
    detalles.push({
      campo,
      etiqueta: etiquetas[campo] || campo,
      valorAnterior: cambio.antes,
      valorNuevo: cambio.despues,
      tipo: detectarTipoCampo(campo),
    })
  }

  return detalles
}

/**
 * Detectar tipo de campo para formato adecuado
 */
function detectarTipoCampo(campo: string): 'texto' | 'numero' | 'fecha' | 'booleano' | 'enum' {
  if (campo.includes('fecha')) return 'fecha'
  if (campo.includes('valor') || campo.includes('ingresos') || campo === 'cuota_inicial' || campo === 'saldo_pendiente') {
    return 'numero'
  }
  if (campo === 'estado' || campo === 'origen' || campo === 'tipo_documento' || campo === 'metodo_pago') {
    return 'enum'
  }
  if (campo.includes('activo') || campo.includes('es_')) return 'booleano'
  return 'texto'
}

/**
 * Humanizar múltiples eventos
 */
export function humanizarEventos(
  eventos: EventoHistorialCliente[]
): EventoHistorialHumanizado[] {
  return eventos.map(humanizarEvento)
}

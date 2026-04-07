/**
 * Mapas de iconos y colores para cada tipo de evento de historial.
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

import type { ColorEvento, TipoEventoHistorial } from '../types/historial.types'

const ICONOS: Record<TipoEventoHistorial, LucideIcon> = {
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
  nota_manual: Edit3,
  interes_actualizado: Edit3,
  interes_descartado: HeartOff,
  documento_subido: Upload,
  documento_actualizado: Edit3,
  documento_eliminado: Trash2,
  evento_generico: AlertCircle,
}

const COLORES: Record<TipoEventoHistorial, ColorEvento> = {
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
  nota_manual: 'gray',
  interes_actualizado: 'yellow',
  interes_descartado: 'orange',
  documento_subido: 'cyan',
  documento_actualizado: 'cyan',
  documento_eliminado: 'red',
  evento_generico: 'gray',
}

export function obtenerIcono(tipo: TipoEventoHistorial): LucideIcon {
  return ICONOS[tipo] ?? AlertCircle
}

export function obtenerColor(tipo: TipoEventoHistorial): ColorEvento {
  return COLORES[tipo] ?? 'gray'
}

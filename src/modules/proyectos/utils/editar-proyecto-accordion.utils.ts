/**
 * Constantes, configuración de pasos y funciones auxiliares para
 * el wizard accordion de edición de proyectos.
 */

import {
  Building2,
  CalendarDays,
  FileText,
  Home,
  LayoutGrid,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react'

import type { WizardStepConfig } from '@/shared/components/accordion-wizard'
import type {
  CambioDetectado,
  CategoriaConfig,
} from '@/shared/components/modulos/ConfirmarCambiosModal'

import type { CambioManzana, ResumenCambios } from '../hooks/useDetectarCambios'

// ── Campos por paso (sin react-hook-form) ─────────────────────────
export const CAMPOS_PASO_1 = [
  'nombre',
  'departamento',
  'ciudad',
  'direccion',
  'descripcion',
]
export const CAMPOS_PASO_2 = [
  'estado',
  'fechaInicio',
  'fechaFinEstimada',
  'responsable',
]
export const FIELDS_PASO_1 = [
  'nombre',
  'departamento',
  'ciudad',
  'direccion',
  'descripcion',
] as const
export const FIELDS_PASO_2 = [
  'estado',
  'fechaInicio',
  'fechaFinEstimada',
] as const

// ── Configuración de pasos ────────────────────────────────────────
export const PASOS_PROYECTO_EDICION: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Información General',
    description:
      'Modifica el nombre, departamento, ciudad, dirección y descripción del proyecto.',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Estado y Fechas',
    description:
      'Actualiza el estado actual del proyecto y las fechas de inicio y fin estimada.',
    icon: CalendarDays,
  },
  {
    id: 3,
    title: 'Manzanas',
    description:
      'Ajusta la distribución de manzanas y la cantidad de viviendas por cada una.',
    icon: LayoutGrid,
  },
]

// ── Labels y configuración de UI ─────────────────────────────────
export const ESTADO_LABELS: Record<string, string> = {
  en_planificacion: 'En Planificación',
  en_proceso: 'En Proceso',
  en_construccion: 'En Construcción',
  completado: 'Completado',
  pausado: 'Pausado',
}

export const CAMPO_ICONO: Record<string, import('lucide-react').LucideIcon> = {
  nombre: Building2,
  departamento: MapPin,
  ciudad: MapPin,
  direccion: MapPin,
  descripcion: FileText,
  estado: TrendingUp,
  fechaInicio: CalendarDays,
  fechaFinEstimada: CalendarDays,
  responsable: User,
}

export const CATEGORIAS_CAMBIOS_PROYECTO: Record<string, CategoriaConfig> = {
  proyecto: { titulo: 'Cambios en el Proyecto', icono: Building2 },
  manzanas: { titulo: 'Cambios en Manzanas', icono: Home },
}

// ── Funciones auxiliares ──────────────────────────────────────────

/** Convierte ResumenCambios (específico de proyectos) al formato genérico CambioDetectado[] */
export function convertirAGenerico(resumen: ResumenCambios): CambioDetectado[] {
  const resultado: CambioDetectado[] = []

  for (const c of resumen.proyecto) {
    resultado.push({
      campo: c.campo,
      label: c.label,
      valorAnterior: c.valorAnterior ?? '—',
      valorNuevo: c.valorNuevo ?? '—',
      icono: CAMPO_ICONO[c.campo] ?? FileText,
      categoria: 'proyecto',
    })
  }

  for (const m of resumen.manzanas) {
    const icono =
      m.tipo === 'agregada' ? Plus : m.tipo === 'eliminada' ? Trash2 : Pencil
    const label =
      m.tipo === 'agregada'
        ? `Manzana ${m.nombre} (nueva)`
        : m.tipo === 'eliminada'
          ? `Manzana ${m.nombre} (eliminada)`
          : `Manzana ${m.nombre}`

    const anterior = formatManzanaValor(m, 'anterior')
    const nuevo = formatManzanaValor(m, 'nuevo')

    resultado.push({
      campo: `manzana_${m.nombre}`,
      label,
      valorAnterior: anterior,
      valorNuevo: nuevo,
      icono,
      categoria: 'manzanas',
    })
  }

  return resultado
}

export function formatManzanaValor(
  m: CambioManzana,
  tipo: 'anterior' | 'nuevo'
): string {
  if (m.tipo === 'agregada')
    return tipo === 'anterior'
      ? '—'
      : `${m.cambios?.viviendasNuevo ?? 0} viviendas`
  if (m.tipo === 'eliminada')
    return tipo === 'anterior' ? `${m.nombre}` : '— (eliminada)'
  const partes: string[] = []
  if (tipo === 'anterior') {
    if (m.cambios?.nombreAnterior) partes.push(m.cambios.nombreAnterior)
    if (m.cambios?.viviendasAnterior != null)
      partes.push(`${m.cambios.viviendasAnterior} viv.`)
  } else {
    if (m.cambios?.nombreNuevo) partes.push(m.cambios.nombreNuevo)
    if (m.cambios?.viviendasNuevo != null)
      partes.push(`${m.cambios.viviendasNuevo} viv.`)
  }
  return partes.join(', ') || '—'
}

/** Parsea el campo `ubicacion` de la DB en sus 3 campos separados */
export function parsearUbicacion(ubicacion: string): {
  departamento: string
  ciudad: string
  direccion: string
} {
  const partes = ubicacion.split(', ')
  if (partes.length >= 3) {
    return {
      departamento: partes[partes.length - 1],
      ciudad: partes[partes.length - 2],
      direccion: partes.slice(0, -2).join(', '),
    }
  }
  if (partes.length === 2) {
    return { departamento: partes[1], ciudad: partes[0], direccion: '' }
  }
  return { departamento: '', ciudad: '', direccion: ubicacion }
}

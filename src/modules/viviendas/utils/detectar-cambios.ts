/**
 * Utilidad para detectar cambios entre vivienda original y formData
 * ✅ Retorna solo los campos modificados
 * ✅ Formato consistente para el modal de confirmación
 */

import { Compass, DollarSign, FileText, Home, Maximize } from 'lucide-react'

import type { CambioDetectado } from '@/shared/components/modulos/ConfirmarCambiosModal'

import type { Vivienda } from '../types'

interface DetectarCambiosParams {
  viviendaActual: Vivienda
  formData: any
}

export function detectarCambiosVivienda({ viviendaActual, formData }: DetectarCambiosParams): CambioDetectado[] {
  const cambios: CambioDetectado[] = []

  // Helper para formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  // ==================== LINDEROS ====================
  if (formData.lindero_norte !== viviendaActual.lindero_norte) {
    cambios.push({
      campo: 'lindero_norte',
      label: '⬆️ Lindero Norte',
      valorAnterior: viviendaActual.lindero_norte || 'Sin definir',
      valorNuevo: formData.lindero_norte || 'Sin definir',
      icono: Compass,
      categoria: 'linderos',
    })
  }

  if (formData.lindero_sur !== viviendaActual.lindero_sur) {
    cambios.push({
      campo: 'lindero_sur',
      label: '⬇️ Lindero Sur',
      valorAnterior: viviendaActual.lindero_sur || 'Sin definir',
      valorNuevo: formData.lindero_sur || 'Sin definir',
      icono: Compass,
      categoria: 'linderos',
    })
  }

  if (formData.lindero_oriente !== viviendaActual.lindero_oriente) {
    cambios.push({
      campo: 'lindero_oriente',
      label: '➡️ Lindero Oriente',
      valorAnterior: viviendaActual.lindero_oriente || 'Sin definir',
      valorNuevo: formData.lindero_oriente || 'Sin definir',
      icono: Compass,
      categoria: 'linderos',
    })
  }

  if (formData.lindero_occidente !== viviendaActual.lindero_occidente) {
    cambios.push({
      campo: 'lindero_occidente',
      label: '⬅️ Lindero Occidente',
      valorAnterior: viviendaActual.lindero_occidente || 'Sin definir',
      valorNuevo: formData.lindero_occidente || 'Sin definir',
      icono: Compass,
      categoria: 'linderos',
    })
  }

  // ==================== INFORMACIÓN LEGAL ====================
  if (formData.matricula_inmobiliaria !== viviendaActual.matricula_inmobiliaria) {
    cambios.push({
      campo: 'matricula_inmobiliaria',
      label: 'Matrícula Inmobiliaria',
      valorAnterior: viviendaActual.matricula_inmobiliaria || 'Sin definir',
      valorNuevo: formData.matricula_inmobiliaria || 'Sin definir',
      icono: FileText,
      categoria: 'legal',
    })
  }

  if (formData.nomenclatura !== viviendaActual.nomenclatura) {
    cambios.push({
      campo: 'nomenclatura',
      label: 'Nomenclatura',
      valorAnterior: viviendaActual.nomenclatura || 'Sin definir',
      valorNuevo: formData.nomenclatura || 'Sin definir',
      icono: FileText,
      categoria: 'legal',
    })
  }

  if (Number(formData.area_lote) !== viviendaActual.area_lote) {
    cambios.push({
      campo: 'area_lote',
      label: 'Área del Lote',
      valorAnterior: `${viviendaActual.area_lote} m²`,
      valorNuevo: `${formData.area_lote} m²`,
      icono: Maximize,
      categoria: 'legal',
    })
  }

  if (Number(formData.area_construida) !== viviendaActual.area_construida) {
    cambios.push({
      campo: 'area_construida',
      label: 'Área Construida',
      valorAnterior: `${viviendaActual.area_construida} m²`,
      valorNuevo: `${formData.area_construida} m²`,
      icono: Maximize,
      categoria: 'legal',
    })
  }

  if (formData.tipo_vivienda !== viviendaActual.tipo_vivienda) {
    cambios.push({
      campo: 'tipo_vivienda',
      label: 'Tipo de Vivienda',
      valorAnterior: viviendaActual.tipo_vivienda || 'Sin definir',
      valorNuevo: formData.tipo_vivienda || 'Sin definir',
      icono: Home,
      categoria: 'legal',
    })
  }

  // ==================== INFORMACIÓN FINANCIERA ====================
  if (formData.valor_base !== viviendaActual.valor_base) {
    cambios.push({
      campo: 'valor_base',
      label: 'Valor Base',
      valorAnterior: formatCurrency(viviendaActual.valor_base || 0),
      valorNuevo: formatCurrency(formData.valor_base || 0),
      icono: DollarSign,
      categoria: 'financiero',
    })
  }

  if (formData.es_esquinera !== viviendaActual.es_esquinera) {
    cambios.push({
      campo: 'es_esquinera',
      label: 'Es Esquinera',
      valorAnterior: viviendaActual.es_esquinera ? 'Sí' : 'No',
      valorNuevo: formData.es_esquinera ? 'Sí' : 'No',
      icono: Home,
      categoria: 'financiero',
    })
  }

  if (formData.recargo_esquinera !== viviendaActual.recargo_esquinera) {
    cambios.push({
      campo: 'recargo_esquinera',
      label: 'Recargo Esquinera',
      valorAnterior: formatCurrency(viviendaActual.recargo_esquinera || 0),
      valorNuevo: formatCurrency(formData.recargo_esquinera || 0),
      icono: DollarSign,
      categoria: 'financiero',
    })
  }

  return cambios
}

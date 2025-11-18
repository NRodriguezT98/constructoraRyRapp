/**
 * useViviendaTabla - Hook para formateo de datos de tabla
 * ✅ SOLO LÓGICA DE NEGOCIO
 * ✅ Sin renderizado
 * ✅ Formateo de montos, estados, identificadores
 */

import { useMemo } from 'react'
import type { Vivienda } from '../types'

export function useViviendaTabla(vivienda: Vivienda) {
  return useMemo(() => {
    // Formatear monto
    const valorFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(vivienda.valor_total)

    // Formatear total abonado
    const totalAbonadoFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(vivienda.total_abonado || 0)

    // Calcular porcentaje pagado
    const porcentajePagado = vivienda.porcentaje_pagado || 0

    // Verificar si está asignada
    const estaAsignada = vivienda.estado === 'Asignada' || vivienda.estado === 'Entregada'

    // Determinar clase de estado
    const estadoClase = {
      Disponible: 'disponible',
      Asignada: 'asignada',
      Entregada: 'entregada',
    }[vivienda.estado] || 'default'

    // Construir identificador completo (Manzana + Número)
    const identificadorCompleto = `Mz. ${vivienda.manzanas?.nombre || 'N/A'} Casa ${vivienda.numero}`

    return {
      valorFormateado,
      totalAbonadoFormateado,
      porcentajePagado,
      estadoClase,
      proyectoNombre: vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto',
      manzanaNombre: vivienda.manzanas?.nombre || 'Sin manzana',
      identificadorCompleto,
      estaAsignada,
    }
  }, [vivienda])
}

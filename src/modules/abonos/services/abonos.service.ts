// =====================================================
// SERVICIO: Módulo de Abonos
// Lógica de negocio y comunicación con Supabase
// =====================================================

import { supabase } from '@/lib/supabase/client';
import type {
    AbonoHistorial,
    CrearAbonoDTO,
    EstadisticasAbonos,
    FiltrosAbonos,
    FuentePagoConAbonos,
    NegociacionConAbonos,
} from '../types';

// =====================================================
// OBTENER NEGOCIACIONES ACTIVAS
// =====================================================

/**
 * Obtiene todas las negociaciones en estado activo
 * ✅ ACTUALIZADO (2025-10-23): Estados según migración 003
 * Estados considerados: 'Activa' (negociaciones activas que permiten abonos)
 * Consultar: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 */
export async function obtenerNegociacionesActivas(): Promise<NegociacionConAbonos[]> {
  console.log('🔍 Obteniendo negociaciones activas...');

  // Query con campos REALES verificados en DB
  // Solo negociaciones 'Activa' permiten registrar abonos
  // Especificamos la relación exacta para evitar ambigüedad
  const { data, error } = await supabase
    .from('negociaciones')
    .select(`
      *,
      clientes!negociaciones_cliente_id_fkey(id, nombres, apellidos, numero_documento, telefono, email, ciudad),
      viviendas!negociaciones_vivienda_id_fkey(id, numero, manzana_id, valor_base, area, tipo_vivienda),
      fuentes_pago!fuentes_pago_negociacion_id_fkey(*)
    `)
    .eq('estado', 'Activa')
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('❌ Error obteniendo negociaciones activas:', error);
    throw new Error(`Error al obtener negociaciones: ${error.message}`);
  }

  console.log('✅ Negociaciones obtenidas:', data?.length || 0);

  // Obtener manzanas y proyectos por separado (viviendas → manzanas → proyectos)
  const manzanaIds = [...new Set(data?.map((n: any) => {
    const vivienda = Array.isArray(n.viviendas) ? n.viviendas[0] : n.viviendas;
    return vivienda?.manzana_id;
  }).filter(Boolean))];

  const { data: manzanas } = await supabase
    .from('manzanas')
    .select('id, nombre, proyecto_id')
    .in('id', manzanaIds);

  const proyectoIds = [...new Set(manzanas?.map((m: any) => m.proyecto_id).filter(Boolean))];

  const { data: proyectos } = await supabase
    .from('proyectos')
    .select('id, nombre, ubicacion')
    .in('id', proyectoIds);

  // Crear maps
  const manzanaMap = new Map(manzanas?.map((m: any) => [m.id, m]) || []);
  const proyectoMap = new Map(proyectos?.map((p: any) => [p.id, p]) || []);

  return (data as any[]).map((item) => {
    const vivienda = Array.isArray(item.viviendas) ? item.viviendas[0] : item.viviendas;
    const manzana = manzanaMap.get(vivienda?.manzana_id);
    const proyecto = proyectoMap.get(manzana?.proyecto_id);

    return {
      ...item,
      cliente: Array.isArray(item.clientes) ? item.clientes[0] : item.clientes,
      vivienda: {
        ...vivienda,
        manzana: manzana || undefined,
      },
      proyecto: proyecto || { id: '', nombre: 'Sin proyecto', ubicacion: '' },
      fuentes_pago: Array.isArray(item.fuentes_pago) ? item.fuentes_pago.map((fp: any) => ({
        ...fp,
        abonos: [],
      })) : [],
    };
  });
}

/**
 * Obtiene una negociación específica con su información completa
 */
export async function obtenerNegociacionPorId(
  negociacionId: string
): Promise<NegociacionConAbonos | null> {
  const { data, error } = await supabase
    .from('negociaciones')
    .select(`
      *,
      clientes!negociaciones_cliente_id_fkey(*),
      viviendas!negociaciones_vivienda_id_fkey(*),
      fuentes_pago!fuentes_pago_negociacion_id_fkey(*)
    `)
    .eq('id', negociacionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('❌ Error obteniendo negociación:', error);
    throw new Error(`Error al obtener negociación: ${error.message}`);
  }

  // Obtener proyecto a través de manzana (viviendas → manzanas → proyectos)
  const vivienda = Array.isArray(data.viviendas) ? data.viviendas[0] : data.viviendas;

  const { data: manzana } = await supabase
    .from('manzanas')
    .select('proyecto_id')
    .eq('id', vivienda?.manzana_id)
    .single();

  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('id, nombre, ubicacion')
    .eq('id', manzana?.proyecto_id)
    .single();

  // Transformar manualmente (sin usar el mapa)
  return transformNegociacion(data, proyecto);
}

// =====================================================
// FUENTES DE PAGO CON ABONOS
// =====================================================

/**
 * Obtiene las fuentes de pago de una negociación con su historial de abonos
 */
export async function obtenerFuentesPagoConAbonos(
  negociacionId: string
): Promise<FuentePagoConAbonos[]> {
  const { data, error } = await supabase
    .from('fuentes_pago')
    .select(`
      *,
      abonos:abonos_historial!fuente_pago_id(*)
    `)
    .eq('negociacion_id', negociacionId)
    .order('tipo', { ascending: true }) as any;

  if (error) {
    console.error('❌ Error obteniendo fuentes de pago:', error);
    throw new Error(`Error al obtener fuentes de pago: ${error.message}`);
  }

  // Ordenar abonos por fecha descendente
  return (data as any[]).map((fuente) => ({
    ...fuente,
    abonos: (fuente.abonos || []).sort(
      (a: AbonoHistorial, b: AbonoHistorial) =>
        new Date(b.fecha_abono).getTime() - new Date(a.fecha_abono).getTime()
    ),
  }));
}

// =====================================================
// REGISTRAR ABONO
// =====================================================

/**
 * Registra un nuevo abono
/**
 * Registra un nuevo abono
 * Los triggers automáticamente actualizarán monto_recibido
 */
export async function registrarAbono(
  datos: CrearAbonoDTO
): Promise<AbonoHistorial> {
  console.log('🔍 Registrando abono:', datos);
  if (datos.monto <= 0) {
    throw new Error('El monto debe ser mayor a cero');
  }

  // Obtener información de la fuente para validación
  const { data: fuente, error: fuenteError } = await supabase
    .from('fuentes_pago')
    .select('monto_aprobado, monto_recibido, saldo_pendiente, tipo')
    .eq('id', datos.fuente_pago_id)
    .single();

  if (fuenteError || !fuente) {
    throw new Error('Fuente de pago no encontrada');
  }

  // Validar que no exceda el saldo (validación adicional en cliente)
  if (datos.monto > fuente.saldo_pendiente) {
    throw new Error(
      `El abono de $${datos.monto.toLocaleString('es-CO')} excede el saldo pendiente de $${fuente.saldo_pendiente.toLocaleString('es-CO')}`
    );
  }

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Insertar abono
  const { data, error } = await supabase
    .from('abonos_historial' as any)
    .insert({
      ...datos,
      usuario_registro: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error registrando abono:', error);

    // Traducir errores comunes
    if (error.message.includes('excede el saldo pendiente')) {
      throw new Error(
        `El abono excede el saldo disponible. Saldo actual: $${fuente.saldo_pendiente.toLocaleString('es-CO')}`
      );
    }

    throw new Error(`Error al registrar abono: ${error.message}`);
  }

  console.log('✅ Abono registrado exitosamente:', (data as any)?.id);

  return data as unknown as AbonoHistorial;
}

// =====================================================
// HISTORIAL DE ABONOS
// =====================================================

/**
 * Obtiene el historial de abonos con filtros opcionales
/**
 * Obtiene el historial de abonos con filtros opcionales
 */
export async function obtenerHistorialAbonos(
  filtros: FiltrosAbonos = {}
): Promise<AbonoHistorial[]> {
  let query = supabase
    .order('fecha_abono', { ascending: false });

  // Aplicar filtros
  if (filtros.negociacion_id) {
    query = query.eq('negociacion_id', filtros.negociacion_id);
  }

  if (filtros.fuente_pago_id) {
    query = query.eq('fuente_pago_id', filtros.fuente_pago_id);
  }

  if (filtros.metodo_pago) {
    query = query.eq('metodo_pago', filtros.metodo_pago);
  }

  if (filtros.fecha_desde) {
    query = query.gte('fecha_abono', filtros.fecha_desde);
  }

  if (filtros.fecha_hasta) {
    query = query.lte('fecha_abono', filtros.fecha_hasta);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error obteniendo historial:', error);
    throw new Error(`Error al obtener historial: ${error.message}`);
  }

  return (data as any[]) || [];
}

// =====================================================
// ESTADÍSTICAS
// =====================================================

/**
 * Obtiene estadísticas de abonos para una negociación
 */
export async function obtenerEstadisticasAbonos(
  negociacionId: string
): Promise<EstadisticasAbonos> {
  const abonos = await obtenerHistorialAbonos({ negociacion_id: negociacionId });

  const total_abonos = abonos.length;
  const monto_total_abonado = abonos.reduce((sum, a) => sum + a.monto, 0);
  const promedio_por_abono = total_abonos > 0 ? monto_total_abonado / total_abonos : 0;

  const abonos_por_metodo = abonos.reduce(
    (acc, abono) => {
      acc[abono.metodo_pago] = (acc[abono.metodo_pago] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total_abonos,
    monto_total_abonado,
    promedio_por_abono,
    abonos_por_metodo: abonos_por_metodo as any,
    ultima_actualizacion: new Date().toISOString(),
  };
}

// =====================================================
// ELIMINAR ABONO
// =====================================================

/**
 * Elimina un abono (reversa la operación)
/**
 * Elimina un abono (reversa la operación)
 * El trigger automáticamente actualizará monto_recibido
 */
export async function eliminarAbono(abonoId: string): Promise<void> {
  console.log('🗑️ Eliminando abono:', abonoId);

  const { error } = await supabase
    .from('abonos_historial' as any)
    .delete()
    .eq('id', abonoId);

  if (error) {
    console.error('❌ Error eliminando abono:', error);
    throw new Error(`Error al eliminar abono: ${error.message}`);
  }

  console.log('✅ Abono eliminado exitosamente');
}

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Transforma datos de la BD al tipo NegociacionConAbonos
 */
function transformNegociacion(data: any, proyecto?: any): NegociacionConAbonos {
  // Extraer el primer elemento del array (Supabase devuelve arrays para relaciones)
  const cliente = Array.isArray(data.clientes) ? data.clientes[0] : data.clientes;
  const vivienda = Array.isArray(data.viviendas) ? data.viviendas[0] : data.viviendas;

  // Usar el proyecto proporcionado o buscar en datos anidados
  let proyectoFinal = proyecto;

  if (!proyectoFinal) {
    // Fallback: buscar proyecto anidado
    proyectoFinal = Array.isArray(vivienda?.proyectos)
      ? vivienda.proyectos[0]
      : vivienda?.proyectos;
  }

  return {
    id: data.id,
    cliente_id: data.cliente_id,
    vivienda_id: data.vivienda_id,
    estado: data.estado,
    valor_negociado: data.valor_negociado || 0,
    descuento_aplicado: data.descuento_aplicado,
    valor_total: data.valor_total,
    total_fuentes_pago: data.total_fuentes_pago,
    total_abonado: data.total_abonado,
    saldo_pendiente: data.saldo_pendiente,
    porcentaje_pagado: data.porcentaje_pagado,
    fecha_negociacion: data.fecha_negociacion,
    fecha_completada: data.fecha_completada,
    notas: data.notas,
    fecha_creacion: data.fecha_creacion,
    fecha_actualizacion: data.fecha_actualizacion,
    cliente: cliente,
    vivienda: vivienda,
    proyecto: proyectoFinal,
    fuentes_pago: (data.fuentes_pago || []).map((f: any) => ({
      ...f,
      abonos: [],
    })),
  };
}

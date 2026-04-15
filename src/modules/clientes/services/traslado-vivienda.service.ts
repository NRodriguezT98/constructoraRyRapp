/**
 * Servicio de Traslado de Vivienda
 *
 * Gestiona el proceso de trasladar un cliente de una vivienda a otra,
 * cerrando la negociación vieja y creando una nueva con los abonos trasladados.
 *
 * Reglas de negocio:
 * 1. Negociación debe estar 'Activa'
 * 2. Sin desembolsos externos (hipotecario, subsidios)
 * 3. Vivienda actual no 'Entregada'
 * 4. Sin escritura firmada
 * 5. Vivienda destino 'Disponible'
 * 6. Cliente no en proceso de renuncia
 * 7. Fuentes internas con abonos obligatorias en destino con monto >= abonado
 */

import { supabase } from '@/lib/supabase/client'
import { getTodayDateString } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'
import type { FuentePago, Negociacion } from '@/modules/clientes/types'
import { esCuotaInicial } from '@/shared/constants/fuentes-pago.constants'

// ── Tipos ───────────────────────────────────────────

/** Tipos de fuente externa (desembolso bloquea traslado) */
const FUENTES_EXTERNAS = [
  'Crédito Hipotecario',
  'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación',
]

export interface FuenteTrasladoDTO {
  tipo: string
  monto_aprobado: number
  capital_para_cierre?: number
  entidad?: string
  numero_referencia?: string
  permite_multiples_abonos?: boolean
  parametrosCredito?: {
    capital: number
    tasaMensual: number
    numCuotas: number
    fechaInicio: Date | string
    tasaMoraDiaria?: number
  }
}

export interface TrasladoViviendaDTO {
  negociacion_origen_id: string
  vivienda_destino_id: string
  valor_negociado: number
  descuento_aplicado?: number
  tipo_descuento?: string
  motivo_descuento?: string
  fuentes_pago: FuenteTrasladoDTO[]
  motivo: string
  autorizado_por: string
}

export interface FuenteConAbonos extends FuentePago {
  abonos_count: number
  es_externa: boolean
  bloquea_traslado: boolean
}

export interface ValidacionTraslado {
  valido: boolean
  errores: string[]
  fuentesConAbonos: FuenteConAbonos[]
  negociacion: Negociacion | null
}

// ── Service ─────────────────────────────────────────

class TrasladoViviendaService {
  /**
   * Validar si una negociación puede ser trasladada.
   * Retorna errores detallados y las fuentes con abonos para la UI.
   */
  async validarTraslado(
    negociacionId: string,
    clienteId: string
  ): Promise<ValidacionTraslado> {
    const errores: string[] = []

    // 1. Cargar negociación con vivienda y fuentes
    const { data: negociacion, error: errorNeg } = await supabase
      .from('negociaciones')
      .select(
        `
        *,
        viviendas!negociaciones_vivienda_id_fkey(id, estado, numero, manzanas(nombre, proyectos(id, nombre))),
        fuentes_pago(*)
      `
      )
      .eq('id', negociacionId)
      .single()

    if (errorNeg || !negociacion) {
      logger.error('Error cargando negociación para traslado:', {
        negociacionId,
        errorNeg,
      })
      return {
        valido: false,
        errores: [
          `No se encontró la negociación: ${errorNeg?.message ?? 'sin datos'}`,
        ],
        fuentesConAbonos: [],
        negociacion: null,
      }
    }

    // Regla 1: Estado Activa
    if (negociacion.estado !== 'Activa') {
      errores.push(
        `La negociación debe estar en estado "Activa" (actualmente: "${negociacion.estado}")`
      )
    }

    // Regla 3: Vivienda no entregada
    const vivienda = negociacion.viviendas as unknown as {
      id: string
      estado: string
    }
    if (vivienda?.estado === 'Entregada') {
      errores.push('La vivienda actual ya fue entregada al cliente')
    }

    // Regla 6: Cliente no en renuncia
    const { data: cliente } = await supabase
      .from('clientes')
      .select('estado')
      .eq('id', clienteId)
      .single()

    if (
      cliente?.estado === 'En Proceso de Renuncia' ||
      cliente?.estado === 'Renunció'
    ) {
      errores.push(
        `El cliente está en estado "${cliente.estado}" y no se puede trasladar`
      )
    }

    // Regla 4: Sin escritura firmada
    const { data: escritura } = await supabase
      .from('documentos_cliente')
      .select('id')
      .eq('cliente_id', clienteId)
      .eq('tipo_documento', 'escritura_vivienda')
      .limit(1)
      .maybeSingle()

    if (escritura) {
      errores.push(
        'Ya existe una escritura firmada vinculada — no se puede trasladar'
      )
    }

    // Analizar fuentes
    const fuentes = (negociacion.fuentes_pago ?? []) as unknown as FuentePago[]
    const fuentesConInfo: FuenteConAbonos[] = []

    for (const fuente of fuentes) {
      if (fuente.estado !== 'Activa') continue

      const esExterna = FUENTES_EXTERNAS.some(
        ext => fuente.tipo.toLowerCase() === ext.toLowerCase()
      )
      const tieneDesembolso = (fuente.monto_recibido ?? 0) > 0

      // Contar abonos activos
      const { count: abonosCount } = await supabase
        .from('abonos_historial')
        .select('id', { count: 'exact', head: true })
        .eq('fuente_pago_id', fuente.id)
        .eq('estado', 'Activo')

      const bloqueaTraslado = esExterna && tieneDesembolso

      // Regla 2: Fuentes externas con desembolso bloquean
      if (bloqueaTraslado) {
        errores.push(
          `La fuente "${fuente.tipo}" (${fuente.entidad ?? ''}) tiene desembolso de $${(fuente.monto_recibido ?? 0).toLocaleString('es-CO')} — no se puede trasladar`
        )
      }

      fuentesConInfo.push({
        ...fuente,
        abonos_count: abonosCount ?? 0,
        es_externa: esExterna,
        bloquea_traslado: bloqueaTraslado,
      })
    }

    return {
      valido: errores.length === 0,
      errores,
      fuentesConAbonos: fuentesConInfo,
      negociacion: negociacion as unknown as Negociacion,
    }
  }

  /**
   * Ejecutar el traslado completo en pasos secuenciales (pseudo-transaccional).
   *
   * Flujo:
   * 1. Snapshot de negociación vieja
   * 2. Crear negociación nueva
   * 3. Crear fuentes de la nueva negociación
   * 4. Trasladar abonos de fuentes internas
   * 5. Cerrar negociación vieja → 'Cerrada por Traslado'
   * 6. Liberar vivienda vieja → 'Disponible'
   * 7. Asignar vivienda nueva → 'Asignada'
   * 8. Vincular bidireccional entre negociaciones
   * 9. Auditoría
   */
  async ejecutarTraslado(
    dto: TrasladoViviendaDTO,
    clienteId: string
  ): Promise<{ negociacionNuevaId: string }> {
    const {
      negociacion_origen_id,
      vivienda_destino_id,
      valor_negociado,
      descuento_aplicado = 0,
      tipo_descuento,
      motivo_descuento,
      fuentes_pago,
      motivo,
      autorizado_por,
    } = dto

    // ── Re-validar antes de ejecutar ──────────────────
    const validacion = await this.validarTraslado(
      negociacion_origen_id,
      clienteId
    )
    if (!validacion.valido) {
      throw new Error(
        `No se puede ejecutar el traslado: ${validacion.errores.join('; ')}`
      )
    }

    // Validar vivienda destino
    const { data: viviendaDestino, error: errorVD } = await supabase
      .from('viviendas')
      .select('id, estado, numero, manzanas(nombre, proyectos(id, nombre))')
      .eq('id', vivienda_destino_id)
      .single()

    if (errorVD || !viviendaDestino) {
      throw new Error('La vivienda destino no existe')
    }
    if (viviendaDestino.estado !== 'Disponible') {
      throw new Error(
        `La vivienda destino no está disponible (estado: ${viviendaDestino.estado})`
      )
    }

    // Validar regla 7: fuentes internas con abonos obligatorias
    const fuentesInternesConAbonos = validacion.fuentesConAbonos.filter(
      f => !f.es_externa && f.monto_recibido > 0
    )
    for (const fuenteOrigen of fuentesInternesConAbonos) {
      const fuenteDestino = fuentes_pago.find(
        f => f.tipo.toLowerCase() === fuenteOrigen.tipo.toLowerCase()
      )
      if (!fuenteDestino) {
        throw new Error(
          `La fuente "${fuenteOrigen.tipo}" tiene $${fuenteOrigen.monto_recibido.toLocaleString('es-CO')} abonados y debe incluirse en la nueva negociación`
        )
      }
      if (fuenteDestino.monto_aprobado < fuenteOrigen.monto_recibido) {
        throw new Error(
          `La fuente "${fuenteOrigen.tipo}" debe tener monto mínimo de $${fuenteOrigen.monto_recibido.toLocaleString('es-CO')} (ya abonado). Se configuró $${fuenteDestino.monto_aprobado.toLocaleString('es-CO')}`
        )
      }
    }

    // Cargar negociación origen para obtener vivienda_id vieja
    const { data: negOrigen } = await supabase
      .from('negociaciones')
      .select('vivienda_id')
      .eq('id', negociacion_origen_id)
      .single()

    if (!negOrigen) {
      throw new Error('No se pudo cargar la negociación origen')
    }

    const viviendaOrigenId = negOrigen.vivienda_id

    // ── PASO 1: Crear nueva negociación ──────────────
    const datosNuevaNeg = {
      cliente_id: clienteId,
      vivienda_id: vivienda_destino_id,
      valor_negociado,
      descuento_aplicado: descuento_aplicado || 0,
      estado: 'Activa' as const,
      negociacion_origen_id: negociacion_origen_id,
      motivo_traslado: motivo,
      autorizado_por,
      fecha_traslado: new Date().toISOString(),
      ...(tipo_descuento && descuento_aplicado > 0
        ? { tipo_descuento, motivo_descuento }
        : {}),
    }

    const { data: nuevaNeg, error: errorNuevaNeg } = await supabase
      .from('negociaciones')
      .insert(datosNuevaNeg)
      .select('id')
      .single()

    if (errorNuevaNeg || !nuevaNeg) {
      logger.error('Error creando nueva negociación:', errorNuevaNeg)
      throw new Error(
        `Error al crear la nueva negociación: ${errorNuevaNeg?.message ?? 'desconocido'}`
      )
    }

    const nuevaNegId = nuevaNeg.id

    try {
      // ── PASO 2: Crear fuentes de pago nuevas ──────
      const { data: tiposFuentes } = await supabase
        .from('tipos_fuentes_pago')
        .select('id, nombre')

      const tipoIdMap = Object.fromEntries(
        (tiposFuentes ?? []).map(t => [t.nombre, t.id])
      )

      const fuentesParaInsertar = fuentes_pago.map(f => ({
        negociacion_id: nuevaNegId,
        tipo: f.tipo,
        tipo_fuente_id: tipoIdMap[f.tipo] ?? '',
        monto_aprobado: f.monto_aprobado,
        capital_para_cierre: f.capital_para_cierre ?? null,
        entidad: f.entidad || null,
        numero_referencia: f.numero_referencia || null,
        permite_multiples_abonos:
          f.permite_multiples_abonos ?? esCuotaInicial(f.tipo),
        estado: 'Activa',
        estado_fuente: 'activa',
      }))

      const { data: fuentesCreadas, error: errorFuentes } = await supabase
        .from('fuentes_pago')
        .insert(fuentesParaInsertar)
        .select('id, tipo')

      if (errorFuentes) {
        logger.error('Error creando fuentes:', errorFuentes)
        throw new Error(
          `Error creando fuentes de pago: ${errorFuentes.message}`
        )
      }

      // ── PASO 3: Trasladar abonos de fuentes internas ──
      for (const fuenteOrigen of fuentesInternesConAbonos) {
        const fuenteDestinoCreada = (fuentesCreadas ?? []).find(
          f => f.tipo.toLowerCase() === fuenteOrigen.tipo.toLowerCase()
        )
        if (!fuenteDestinoCreada) continue

        // Mover abonos activos a la nueva negociación/fuente
        const { error: errorTraslado } = await supabase
          .from('abonos_historial')
          .update({
            negociacion_id: nuevaNegId,
            fuente_pago_id: fuenteDestinoCreada.id,
            trasladado_desde_negociacion_id: negociacion_origen_id,
          })
          .eq('fuente_pago_id', fuenteOrigen.id)
          .eq('estado', 'Activo')

        if (errorTraslado) {
          logger.error(
            `Error trasladando abonos de ${fuenteOrigen.tipo}:`,
            errorTraslado
          )
          throw new Error(`Error trasladando abonos: ${errorTraslado.message}`)
        }
      }

      // ── PASO 4: Cerrar negociación vieja ──────────
      const { error: errorCerrar } = await supabase
        .from('negociaciones')
        .update({
          estado: 'Cerrada por Traslado',
          traslado_destino_id: nuevaNegId,
          motivo_traslado: motivo,
          autorizado_por,
          fecha_traslado: new Date().toISOString(),
        })
        .eq('id', negociacion_origen_id)

      if (errorCerrar) {
        logger.error('Error cerrando negociación origen:', errorCerrar)
        throw new Error(`Error cerrando negociación: ${errorCerrar.message}`)
      }

      // ── PASO 5: Inactivar fuentes de negociación vieja ──
      const { error: errorInactivar } = await supabase
        .from('fuentes_pago')
        .update({
          estado: 'Inactiva',
          estado_fuente: 'inactiva',
          razon_inactivacion: 'Traslado de vivienda',
        })
        .eq('negociacion_id', negociacion_origen_id)
        .eq('estado', 'Activa')

      if (errorInactivar) {
        logger.error('Error inactivando fuentes viejas:', errorInactivar)
      }

      // ── PASO 6: Liberar vivienda vieja ──────────────
      const { error: errorLiberar } = await supabase
        .from('viviendas')
        .update({
          estado: 'Disponible',
          cliente_id: null,
          negociacion_id: null,
          fecha_asignacion: null,
        })
        .eq('id', viviendaOrigenId)

      if (errorLiberar) {
        logger.error('Error liberando vivienda origen:', errorLiberar)
      }

      // ── PASO 7: Asignar vivienda destino ────────────
      const { error: errorAsignar } = await supabase
        .from('viviendas')
        .update({
          estado: 'Asignada',
          cliente_id: clienteId,
          negociacion_id: nuevaNegId,
          fecha_asignacion: getTodayDateString(),
        })
        .eq('id', vivienda_destino_id)

      if (errorAsignar) {
        logger.error('Error asignando vivienda destino:', errorAsignar)
      }

      // ── PASO 8: Auditoría ──────────────────────────
      try {
        const { auditService } = await import('@/services/audit.service')
        await auditService.registrarAccion({
          tabla: 'negociaciones',
          accion: 'CREATE',
          registroId: nuevaNegId,
          modulo: 'negociaciones',
          datosNuevos: {
            id: nuevaNegId,
            cliente_id: clienteId,
            vivienda_id: vivienda_destino_id,
            valor_negociado,
            negociacion_origen_id,
            motivo_traslado: motivo,
            autorizado_por,
          },
          metadata: {
            tipo: 'TRASLADO_VIVIENDA',
            negociacion_origen_id,
            vivienda_origen_id: viviendaOrigenId,
            vivienda_destino_id,
            motivo,
            autorizado_por,
            valor_anterior: validacion.negociacion?.valor_negociado,
            valor_nuevo: valor_negociado,
            abonos_trasladados: fuentesInternesConAbonos.reduce(
              (sum, f) => sum + (f.abonos_count ?? 0),
              0
            ),
            monto_abonos_trasladados: fuentesInternesConAbonos.reduce(
              (sum, f) => sum + (f.monto_recibido ?? 0),
              0
            ),
          },
        })
      } catch (auditError) {
        logger.error('Error en auditoría (no bloquea):', auditError)
      }

      return { negociacionNuevaId: nuevaNegId }
    } catch (error) {
      // Rollback: eliminar negociación nueva si falló algo posterior
      logger.error('Error en traslado, haciendo rollback:', error)
      await supabase
        .from('fuentes_pago')
        .delete()
        .eq('negociacion_id', nuevaNegId)
      await supabase.from('negociaciones').delete().eq('id', nuevaNegId)
      throw error
    }
  }
}

export const trasladoViviendaService = new TrasladoViviendaService()

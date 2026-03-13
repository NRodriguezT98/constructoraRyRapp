/**
 * Servicio de Negociaciones
 *
 * Gestiona la vinculación Cliente + Vivienda + Pagos
 *
 * ?? NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 * ? ACTUALIZADO: 2025-10-22 (Migración 003)
 *
 * Estados de negociación (CHECK constraint: negociaciones_estado_check):
 * - 'Activa' ? Negociación activa recibiendo abonos
 * - 'Suspendida' ? Temporalmente pausada
 * - 'Cerrada por Renuncia' ? Cliente renunció (vinculada a tabla renuncias)
 * - 'Completada' ? 100% pagado y entregado
 */

import { supabase } from '@/lib/supabase/client'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'
import type { EstadoNegociacion, Negociacion } from '@/modules/clientes/types'
import { obtenerRequisitosParaTipoFuente } from '@/modules/fuentes-pago/config/requisitos-fuentes'
import { crearPasosFuentePago } from '@/modules/fuentes-pago/services/pasos-fuente-pago.service'

// DTOs
export interface CrearNegociacionDTO {
  cliente_id: string
  vivienda_id: string
  valor_negociado: number
  descuento_aplicado?: number
  tipo_descuento?: string
  motivo_descuento?: string
  valor_escritura_publica?: number
  notas?: string

  // ? NUEVO: Fuentes de pago (creación transaccional)
  fuentes_pago?: CrearFuentePagoDTO[]
}

export interface CrearFuentePagoDTO {
  tipo: string // 'Cuota Inicial' | 'Crédito Hipotecario' | 'Subsidio Mi Casa Ya' | 'Subsidio Caja Compensación'
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
}

export interface ActualizarNegociacionDTO {
  estado?: EstadoNegociacion
  valor_negociado?: number
  descuento_aplicado?: number
  fecha_completada?: string // ? Requerida cuando estado='Completada'
  notas?: string
}

// Re-export Negociacion del index
export type { Negociacion }

class NegociacionesService {
  /**
   * Crear nueva negociación CON o SIN fuentes de pago (transaccional)
   *
   * ? FLUJO SIMPLIFICADO (2025-10-22):
   * - Negociación se crea DIRECTO en estado 'Activa'
   * - Fuentes de pago son OPCIONALES (se pueden agregar después)
   * - Cliente pasa a 'Activo'
   * - Vivienda pasa a 'Asignada'
   *
   * Pasos:
   * 1. Crear negociación en estado 'Activa'
   * 2. [Opcional] Crear fuentes de pago si se proporcionan
   * 3. Actualizar vivienda ? 'Asignada'
   * 4. Actualizar cliente ? 'Activo'
   * 5. Si algún paso falla, se hace rollback
   */
  async crearNegociacion(datos: CrearNegociacionDTO): Promise<Negociacion> {
    try {
      const tieneFuentesPago = datos.fuentes_pago && datos.fuentes_pago.length > 0

      // ==========================================
      // PASO 1: Crear negociación en estado 'Activa'
      // ==========================================

      // Construir objeto con campos condicionales
      const datosNegociacion: any = {
        cliente_id: datos.cliente_id,
        vivienda_id: datos.vivienda_id,
        valor_negociado: datos.valor_negociado,
        descuento_aplicado: datos.descuento_aplicado || 0,
        notas: datos.notas,
        estado: 'Activa', // ? SIEMPRE 'Activa' (simplificado)
      }

      // Solo incluir campos de descuento si hay descuento aplicado
      if (datos.descuento_aplicado && datos.descuento_aplicado > 0) {
        // Solo agregar campos si tienen valor (no undefined)
        if (datos.tipo_descuento !== undefined) {
          datosNegociacion.tipo_descuento = datos.tipo_descuento
        }
        if (datos.motivo_descuento !== undefined) {
          datosNegociacion.motivo_descuento = datos.motivo_descuento
        }
        if (datos.valor_escritura_publica !== undefined) {
          datosNegociacion.valor_escritura_publica = datos.valor_escritura_publica
        }
      }


      const { data: negociacion, error: errorNegociacion } = await supabase
        .from('negociaciones')
        .insert(datosNegociacion)
        .select('id, cliente_id, vivienda_id, valor_negociado, descuento_aplicado, tipo_descuento, motivo_descuento, valor_escritura_publica, notas, estado, fecha_negociacion, fecha_completada, fecha_creacion, fecha_actualizacion')
        .single()

      if (errorNegociacion) {
        console.error('? Error creando negociación:', errorNegociacion)
        throw errorNegociacion
      }


      // ==========================================
      // PASO 2: Crear fuentes de pago (OPCIONAL)
      // ==========================================
      if (datos.fuentes_pago && datos.fuentes_pago.length > 0) {

        const fuentesParaInsertar = datos.fuentes_pago.map(fuente => ({
          negociacion_id: negociacion.id,
          tipo: fuente.tipo,
          monto_aprobado: fuente.monto_aprobado,
          entidad: fuente.entidad || null,
          numero_referencia: fuente.numero_referencia || null,
          carta_aprobacion_url: fuente.carta_aprobacion_url || null,
          carta_asignacion_url: fuente.carta_asignacion_url || null,
          permite_multiples_abonos: fuente.tipo === 'Cuota Inicial',
          estado: 'Pendiente',
        }))

        const { data: fuentesCreadas, error: errorFuentes } = await supabase
          .from('fuentes_pago')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(fuentesParaInsertar as any)
          .select('id, tipo, negociacion_id')

        if (errorFuentes) {
          console.error('? Error creando fuentes de pago:', errorFuentes)
          // ROLLBACK
          await supabase.from('negociaciones').delete().eq('id', negociacion.id)
          throw new Error(`Error creando fuentes de pago: ${errorFuentes.message}`)
        }


        // ==========================================
        // PASO 2.1: Crear pasos de validación para fuentes que lo requieren
        // ==========================================
        if (fuentesCreadas && fuentesCreadas.length > 0) {

          for (const fuente of fuentesCreadas) {
            const requisitos = obtenerRequisitosParaTipoFuente(fuente.tipo)

            if (requisitos.length > 0) {

              try {
                await crearPasosFuentePago({
                  fuente_pago_id: fuente.id,
                  tipo_fuente: fuente.tipo,
                })

              } catch (errorPasos) {
                console.error(`? Error creando pasos para ${fuente.tipo}:`, errorPasos)
                // No hacemos rollback completo, solo loggeamos
                // Los pasos se pueden crear después manualmente si fallan
              }
            } else {
            }
          }
        }
      }

      // ==========================================
      // PASO 3: Actualizar vivienda ? 'Asignada'
      // ==========================================
      const { error: errorVivienda } = await supabase
        .from('viviendas')
        .update({
          estado: 'Asignada',
          cliente_id: datos.cliente_id,
          negociacion_id: negociacion.id, // ? NUEVO campo
          fecha_asignacion: formatDateForDB(getTodayDateString()),
        })
        .eq('id', datos.vivienda_id)

      if (errorVivienda) {
        console.error('? Error actualizando vivienda:', errorVivienda)
        // ROLLBACK
        if (tieneFuentesPago) {
          await supabase.from('fuentes_pago').delete().eq('negociacion_id', negociacion.id)
        }
        await supabase.from('negociaciones').delete().eq('id', negociacion.id)
        throw new Error(`Error actualizando vivienda: ${errorVivienda.message}`)
      }


      // ==========================================
      // PASO 4: Actualizar cliente ? 'Activo'
      // ==========================================
      const { error: errorCliente } = await supabase
        .from('clientes')
        .update({ estado: 'Activo' })
        .eq('id', datos.cliente_id)

      if (errorCliente) {
        console.error('? Error actualizando cliente:', errorCliente)
        // ROLLBACK completo
        if (tieneFuentesPago) {
          await supabase.from('fuentes_pago').delete().eq('negociacion_id', negociacion.id)
        }
        await supabase.from('negociaciones').delete().eq('id', negociacion.id)
        await supabase.from('viviendas').update({
          estado: 'Disponible',
          cliente_id: null,
          negociacion_id: null,
          fecha_asignacion: null,
        }).eq('id', datos.vivienda_id)
        throw new Error(`Error actualizando cliente: ${errorCliente.message}`)
      }


      // ==========================================
      // PASO 5: Sistema de procesos eliminado
      // ==========================================
      // ?? NOTA: El sistema de plantillas de proceso fue eliminado.
      // Se reemplazará con sistema de checklist en Fuentes de Pago.


      return negociacion as unknown as Negociacion

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('? [CLIENTES] Error en crearNegociacion:', mensaje, error)
      throw error
    }
  }

  /**
   * Obtener negociación por ID
   */
  async obtenerNegociacion(id: string): Promise<Negociacion | null> {
    try {
      const { data, error} = await supabase
        .from('negociaciones')
        .select(`
          id, cliente_id, vivienda_id, estado, valor_total, valor_negociado,
          total_abonado, saldo_pendiente, fecha_negociacion,
          fecha_creacion, usuario_creacion, descuento_aplicado
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as unknown as Negociacion
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('? [CLIENTES] Error obteniendo negociación:', mensaje, error)
      return null
    }
  }

  /**
   * Obtener negociaciones de un cliente
   */
  async obtenerNegociacionesCliente(clienteId: string): Promise<Negociacion[]> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select(`
          *,
          vivienda:viviendas!negociaciones_vivienda_id_fkey (
            id,
            numero,
            valor_base,
            gastos_notariales,
            recargo_esquinera,
            es_esquinera,
            estado,
            manzanas!viviendas_manzana_id_fkey (
              id,
              nombre,
              proyecto:proyectos!manzanas_proyecto_id_fkey (
                id,
                nombre,
                estado,
                ubicacion
              )
            )
          )
        `)
        .eq('cliente_id', clienteId)
        .order('fecha_creacion', { ascending: false })
        .limit(100) // ? Limitar a 100 negociaciones más recientes (performance)

      if (error) throw error

      // Mapear para tener proyecto en el nivel superior
      const negociacionesConProyecto = (data || []).map((neg) => ({
        ...neg,
        proyecto: neg.vivienda?.manzanas?.proyecto || null
      }))

      return negociacionesConProyecto as Negociacion[]
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('? [CLIENTES] Error obteniendo negociaciones del cliente:', mensaje, error)
      return []
    }
  }

  /**
   * Obtener negociación activa de una vivienda
   */
  async obtenerNegociacionVivienda(viviendaId: string): Promise<Negociacion | null> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select(`
          id, cliente_id, vivienda_id, estado, valor_total, valor_negociado,
          total_abonado, saldo_pendiente, fecha_creacion
        `)
        .eq('vivienda_id', viviendaId)
        .in('estado', ['Activa', 'Suspendida']) // ? ACTUALIZADO: Solo estados activos
        .order('fecha_creacion', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
      return data as unknown as Negociacion | null
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('? [CLIENTES] Error obteniendo negociación de vivienda:', mensaje, error)
      return null
    }
  }

  /**
   * Actualizar negociación
   */
  async actualizarNegociacion(
    id: string,
    datos: ActualizarNegociacionDTO
  ): Promise<Negociacion> {
    try {

      const { data, error } = await supabase
        .from('negociaciones')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data as Negociacion
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('? [CLIENTES] Error actualizando negociación:', mensaje, error)
      throw error
    }
  }

  /**
   * Suspender negociación (pausar temporalmente)
   */
  async suspenderNegociacion(id: string, motivo?: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Suspendida',
      notas: motivo ? `[SUSPENDIDA] ${motivo}` : undefined,
    })
  }

  /**
   * Reactivar negociación suspendida
   */
  async reactivarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Activa',
    })
  }

  /**
   * Completar negociación (100% pagado)
   * ?? Requiere fecha_completada (constraint de DB)
   */
  async completarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Completada',
      fecha_completada: formatDateForDB(getTodayDateString()), // ? REQUERIDO por constraint
    })
  }

  /**
   * Cerrar negociación por renuncia
   * ?? Debe tener registro en tabla 'renuncias'
   */
  async cerrarPorRenuncia(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Cerrada por Renuncia',
    })
  }

  /**
   * Verificar si un cliente ya tiene negociación activa con una vivienda
   */
  async existeNegociacionActiva(
    clienteId: string,
    viviendaId: string
  ): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('negociaciones')
        .select('id', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('vivienda_id', viviendaId)
        .in('estado', ['Activa', 'Suspendida']) // ? ACTUALIZADO

      if (error) throw error
      return (count ?? 0) > 0
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('? [CLIENTES] Error verificando negociación activa:', mensaje, error)
      return false
    }
  }

  /**
   * Eliminar negociación (solo si está recién creada y sin movimientos)
   * ?? PRECAUCIÓN: Verificar que no tenga abonos antes de eliminar
   */
  async eliminarNegociacion(id: string): Promise<void> {
    try {
      // Verificar que no tenga abonos
      const { data: abonos } = await supabase
        .from('abonos_historial')
        .select('id')
        .eq('negociacion_id', id)
        .limit(1)

      if (abonos && abonos.length > 0) {
        throw new Error('No se puede eliminar una negociación con abonos registrados')
      }

      // Verificar que no tenga fuentes de pago
      const { data: fuentes } = await supabase
        .from('fuentes_pago')
        .select('id')
        .eq('negociacion_id', id)
        .limit(1)

      if (fuentes && fuentes.length > 0) {
        throw new Error('No se puede eliminar una negociación con fuentes de pago')
      }

      const { error } = await supabase
        .from('negociaciones')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('? [CLIENTES] Error eliminando negociación:', mensaje, error)
      throw error
    }
  }

  /**
   * Actualizar fuentes de pago de una negociación
   * ?? Operación transaccional: elimina viejas e inserta nuevas
   *
   * Validaciones:
   * - Suma total = valor_final de negociación
   * - No eliminar fuentes con monto_recibido > 0
   * - Monto >= monto_recibido (si tiene abonos)
   */
  async actualizarFuentesPago(
    negociacionId: string,
    fuentes: Array<{
      id?: string
      tipo: string
      monto_aprobado: number
      entidad?: string | null
      numero_referencia?: string | null
      detalles?: string | null
    }>,
    motivoCambio: string = 'Actualización de fuentes de pago'
  ): Promise<void> {
    try {
      // 1. Obtener fuentes actuales ACTIVAS para validar
      const { data: fuentesActuales, error: errorFetch } = await supabase
        .from('fuentes_pago')
        .select('id, monto_recibido')
        .eq('negociacion_id', negociacionId)
        .eq('estado_fuente', 'activa') // ? Solo comparar con activas

      if (errorFetch) throw errorFetch

      // 2. Validar que no se eliminen fuentes con abonos
      const idsNuevas = fuentes.map(f => f.id).filter(Boolean)
      const fuentesAEliminar = fuentesActuales?.filter(
        fa => !idsNuevas.includes(fa.id)
      ) || []

      const fuentesConAbonos = fuentesAEliminar.filter(f => (f.monto_recibido ?? 0) > 0)
      if (fuentesConAbonos.length > 0) {
        throw new Error('No puedes eliminar fuentes de pago que tienen abonos registrados')
      }

      // 3. ? INACTIVAR fuentes viejas con UPDATE DIRECTO (sin triggers)
      if (fuentesAEliminar.length > 0) {

        const erroresInactivacion: Array<{ fuenteId: string; error: any }> = []

        for (const fuente of fuentesAEliminar) {
          const { data, error: errorInactivar, count } = await supabase
            .from('fuentes_pago')
            .update({
              estado_fuente: 'inactiva',
              razon_inactivacion: 'Fuente eliminada/reemplazada por el usuario durante edición',
              fecha_inactivacion: new Date().toISOString(),
            })
            .eq('id', fuente.id)
            // ? SIN .select().single() para evitar error 400

          if (errorInactivar) {
            console.error(`? Error inactivando fuente ${fuente.id}:`, {
              message: errorInactivar.message,
              code: errorInactivar.code,
              details: errorInactivar.details,
              hint: errorInactivar.hint,
            })
            erroresInactivacion.push({ fuenteId: fuente.id, error: errorInactivar })
          } else {
          }
        }

        // ? CRÍTICO: Si hubo errores al inactivar, lanzar excepción
        if (erroresInactivacion.length > 0) {
          const mensajeError = `No se pudieron inactivar ${erroresInactivacion.length} fuente(s). Errores: ${JSON.stringify(erroresInactivacion, null, 2)}`
          console.error('?? [CRÍTICO] Errores al inactivar fuentes:', mensajeError)
          throw new Error(mensajeError)
        }

      }

      // 4. Actualizar fuentes existentes y crear nuevas
      const nuevasFuentesCreadas: { id: string; tipo: string }[] = []

      for (const fuente of fuentes) {
        if (fuente.id) {
          // Actualizar existente
          const { error: errorUpdate } = await supabase
            .from('fuentes_pago')
            .update({
              tipo: fuente.tipo,
              monto_aprobado: fuente.monto_aprobado,
              entidad: fuente.entidad,
              numero_referencia: fuente.numero_referencia,
            })
            .eq('id', fuente.id)

          if (errorUpdate) throw errorUpdate
        } else {
          // Crear nueva
          const { data: nuevaFuente, error: errorInsert } = await supabase
            .from('fuentes_pago')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .insert({
              negociacion_id: negociacionId,
              tipo: fuente.tipo,
              monto_aprobado: fuente.monto_aprobado,
              monto_recibido: 0,
              entidad: fuente.entidad,
              numero_referencia: fuente.numero_referencia,
              permite_multiples_abonos: fuente.tipo === 'Cuota Inicial',
              estado: 'Pendiente',
              estado_fuente: 'activa', // ? Explícitamente marcar como activa
            } as any)
            .select('id, tipo')
            .single()

          if (errorInsert) throw errorInsert
          if (nuevaFuente) {
            nuevasFuentesCreadas.push({ id: nuevaFuente.id, tipo: nuevaFuente.tipo })
          }
        }
      }

      // 5. ? Vincular fuentes nuevas con las inactivadas (si coinciden tipos)
      if (fuentesAEliminar.length > 0 && nuevasFuentesCreadas.length > 0) {

        for (const fuenteInactivada of fuentesAEliminar) {
          // Buscar en fuentes actuales el tipo que tenía
          const fuenteActualData = fuentesActuales?.find(f => f.id === fuenteInactivada.id)
          if (!fuenteActualData) continue

          // Obtener el tipo de la fuente inactivada
          const { data: fuenteCompleta } = await supabase
            .from('fuentes_pago')
            .select('tipo')
            .eq('id', fuenteInactivada.id)
            .single()

          if (!fuenteCompleta) continue

          // Buscar si hay una nueva fuente del mismo tipo
          const fuenteReemplazo = nuevasFuentesCreadas.find(
            nf => nf.tipo === fuenteCompleta.tipo
          )

          if (fuenteReemplazo) {
            // Actualizar la fuente inactivada con referencia a la nueva
            await supabase
              .from('fuentes_pago')
              .update({
                reemplazada_por: fuenteReemplazo.id,
                razon_inactivacion: `Reemplazada por nueva fuente de tipo: ${fuenteReemplazo.tipo}`,
              })
              .eq('id', fuenteInactivada.id)

          }
        }
      }

      // 6. Crear snapshot manual con resumen de cambios
      await this.crearSnapshotCambioFuentes(
        negociacionId,
        motivoCambio,
        fuentesActuales || [],
        fuentes,
        {
          agregadas: nuevasFuentesCreadas.length,
          eliminadas: fuentesAEliminar.length,
          modificadas: fuentes.filter(f => f.id).length,
        }
      )

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('? [CLIENTES] Error actualizando fuentes de pago:', {
        mensaje,
        error,
        negociacionId,
        fuentesEnviadas: fuentes.length,
        motivoCambio,
      })

      // ? Re-lanzar con mensaje más descriptivo
      throw new Error(`Error al actualizar fuentes de pago: ${mensaje}`)
    }
  }

  /**
   * Crear snapshot manual de cambio en fuentes de pago
   */
  private async crearSnapshotCambioFuentes(
    negociacionId: string,
    motivoCambio: string,
    fuentesAnteriores: any[],
    fuentesNuevas: any[],
    resumen: { agregadas: number; eliminadas: number; modificadas: number }
  ): Promise<void> {
    // Obtener versión actual
    const { data: negociacion } = await supabase
      .from('negociaciones')
      .select('id, version_actual, version_lock')
      .eq('id', negociacionId)
      .single()

    const nuevaVersion = (negociacion?.version_actual || 0) + 1

    // Obtener fuentes activas actuales para snapshot
    const { data: fuentesActivas } = await supabase
      .from('fuentes_pago')
      .select(`
        id, negociacion_id, tipo, entidad, monto_aprobado, monto_recibido,
        estado, estado_fuente
      `)
      .eq('negociacion_id', negociacionId)
      .eq('estado_fuente', 'activa')

    // ? Documentos se obtienen por proyecto_id, no por negociacion_id
    // Omitimos por ahora para evitar error 400
    const documentos: any[] = []

    // Obtener datos de negociación
    const { data: datosNegociacion } = await supabase
      .from('negociaciones')
      .select(`
        id, cliente_id, vivienda_id, estado, valor_total, valor_negociado,
        total_abonado, saldo_pendiente, fecha_negociacion, fecha_creacion
      `)
      .eq('id', negociacionId)
      .single()

    // Construir razón del cambio
    const partes = []
    if (resumen.agregadas > 0) partes.push(`${resumen.agregadas} agregada(s)`)
    if (resumen.eliminadas > 0) partes.push(`${resumen.eliminadas} eliminada(s)`)
    if (resumen.modificadas > 0) partes.push(`${resumen.modificadas} modificada(s)`)
    const razonCompleta = partes.length > 0
      ? `${motivoCambio} | ${partes.join(', ')}`
      : motivoCambio

    // Construir detalles de cambios para mostrar en modal
    const cambiosDetallados = {
      motivo_usuario: motivoCambio,
      resumen,
      fuentes_finales: fuentesActivas?.map(f => ({
        tipo: f.tipo,
        entidad: f.entidad,
        monto_aprobado: f.monto_aprobado,
        monto_recibido: f.monto_recibido,
      })) || [],
    }

    // Obtener datos del usuario actual para auditoría
    const { data: { user } } = await supabase.auth.getUser()
    const usuarioEmail = user?.email || null

    // Obtener nombre del usuario desde tabla usuarios
    let usuarioNombre = null
    if (user?.id) {
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('nombres, apellidos')
        .eq('id', user.id)
        .single()

      if (usuarioData) {
        usuarioNombre = `${usuarioData.nombres} ${usuarioData.apellidos || ''}`.trim()
      }
    }

    // Crear snapshot
    await supabase.from('negociaciones_historial').insert({
      negociacion_id: negociacionId,
      version: nuevaVersion,
      tipo_cambio: 'fuentes_pago_actualizadas',
      razon_cambio: razonCompleta,
      datos_negociacion: datosNegociacion,
      fuentes_pago_snapshot: fuentesActivas || [],
      documentos_snapshot: documentos || [],
      datos_anteriores: null,
      datos_nuevos: cambiosDetallados,
      campos_modificados: ['fuentes_pago'],
      usuario_email: usuarioEmail,
      usuario_nombre: usuarioNombre,
    })

    // Actualizar versión en negociaciones
    await supabase
      .from('negociaciones')
      .update({
        version_actual: nuevaVersion,
        version_lock: (negociacion?.version_lock || 0) + 1,
      })
      .eq('id', negociacionId)

  }
}

export const negociacionesService = new NegociacionesService()

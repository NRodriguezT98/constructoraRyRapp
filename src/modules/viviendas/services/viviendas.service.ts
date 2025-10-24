import { supabase } from '@/lib/supabase/client-browser'
import type {
    ConfiguracionRecargo,
    FiltrosViviendas,
    ManzanaConDisponibilidad,
    Proyecto,
    Vivienda,
    ViviendaFormData,
} from '../types'

/**
 * Servicio para operaciones CRUD de Viviendas
 */

class ViviendasService {
  // ============================================
  // PROYECTOS
  // ============================================

  /**
   * Obtiene todos los proyectos activos
   */
  async obtenerProyectos(): Promise<Proyecto[]> {
    const { data, error } = await supabase
      .from('proyectos')
      .select('id, nombre, estado')
      .in('estado', ['en_planificacion', 'en_construccion'])
      .order('nombre')

    if (error) throw error
    return data || []
  }

  // ============================================
  // MANZANAS
  // ============================================

  /**
   * Obtiene manzanas de un proyecto con información de disponibilidad
   */
  async obtenerManzanasDisponibles(
    proyectoId: string
  ): Promise<ManzanaConDisponibilidad[]> {
    const { data, error } = await supabase
      .from('vista_manzanas_disponibilidad')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('tiene_disponibles', true)
      .order('nombre')

    if (error) throw error
    return data || []
  }

  /**
   * Obtiene el siguiente número de vivienda disponible en una manzana
   */
  async obtenerSiguienteNumeroVivienda(manzanaId: string): Promise<number> {
    const { data, error } = await supabase.rpc('obtener_siguiente_numero_vivienda', {
      p_manzana_id: manzanaId,
    })

    if (error) throw error
    return data || 1
  }

  /**
   * Obtiene los números de viviendas ya creadas en una manzana
   */
  async obtenerNumerosOcupados(manzanaId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('viviendas')
      .select('numero')
      .eq('manzana_id', manzanaId)
      .order('numero')

    if (error) throw error
    return data?.map((v) => v.numero) || []
  }

  /**
   * Verifica si una matrícula inmobiliaria ya existe
   */
  async verificarMatriculaUnica(matricula: string, viviendaId?: string): Promise<boolean> {
    let query = supabase
      .from('viviendas')
      .select('id')
      .eq('matricula_inmobiliaria', matricula)

    // Si estamos editando, excluir la vivienda actual
    if (viviendaId) {
      query = query.neq('id', viviendaId)
    }

    const { data, error } = await query

    if (error) throw error

    // Retorna true si NO existe (es única)
    return !data || data.length === 0
  }

  // ============================================
  // CONFIGURACIÓN DE RECARGOS
  // ============================================

  /**
   * Obtiene la configuración de recargos activos
   */
  async obtenerConfiguracionRecargos(): Promise<ConfiguracionRecargo[]> {
    const { data, error } = await supabase
      .from('configuracion_recargos')
      .select('*')
      .eq('activo', true)
      .order('tipo')

    if (error) throw error
    return data || []
  }

  /**
   * Obtiene el valor actual de los gastos notariales
   */
  async obtenerGastosNotariales(): Promise<number> {
    const { data, error } = await supabase
      .from('configuracion_recargos')
      .select('valor')
      .eq('tipo', 'gastos_notariales')
      .eq('activo', true)
      .maybeSingle()

    // Si no hay error y hay data, retornar el valor
    // Si no existe configuración, retornar default
    if (error) {
      console.error('Error obteniendo gastos notariales:', error)
      return 5_000_000 // Default si hay error
    }

    return data?.valor || 5_000_000 // Default si no existe
  }

  // ============================================
  // VIVIENDAS - CRUD
  // ============================================

  /**
   * Obtiene todas las viviendas
   */
  async obtenerTodas(): Promise<Vivienda[]> {
    const { data, error } = await supabase
      .from('viviendas')
      .select('*')
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtiene viviendas de una manzana específica
   */
  async obtenerPorManzana(manzanaId: string): Promise<Vivienda[]> {
    const { data, error } = await supabase
      .from('viviendas')
      .select('*')
      .eq('manzana_id', manzanaId)
      .order('numero')

    if (error) throw error
    return data || []
  }

  /**
   * Obtiene una vivienda por ID (alias para compatibilidad)
   */
  async obtenerPorId(id: string): Promise<Vivienda | null> {
    const { data, error } = await supabase
      .from('viviendas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Obtiene una vivienda completa con relaciones (para página de detalle)
   */
  async obtenerVivienda(id: string): Promise<Vivienda> {
    const { data, error } = await supabase
      .from('viviendas')
      .select(`
        *,
        manzanas (
          nombre,
          proyecto_id,
          proyectos (
            nombre
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Vivienda no encontrada')

    const vivienda = data as unknown as Vivienda

    // Si tiene cliente, obtener sus datos
    if (vivienda.cliente_id) {
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('id, nombre, apellido, telefono, email')
        .eq('id', vivienda.cliente_id)
        .single()

      if (!clienteError && clienteData) {
        vivienda.clientes = {
          id: clienteData.id,
          nombre_completo: `${clienteData.nombre} ${clienteData.apellido}`,
          telefono: clienteData.telefono,
          email: clienteData.email,
        }
      }

      // Obtener datos de abonos: vivienda → negociacion → abonos_historial
      if (vivienda.negociacion_id) {
        const { data: abonosData, error: abonosError } = await supabase
          .from('abonos_historial' as any)
          .select('monto')
          .eq('negociacion_id', vivienda.negociacion_id)

        if (!abonosError && abonosData) {
          const totalAbonado = (abonosData as any[]).reduce((sum: number, abono: any) => sum + Number(abono.monto), 0)
          vivienda.total_abonado = totalAbonado
          vivienda.saldo_pendiente = vivienda.valor_total - totalAbonado
          vivienda.porcentaje_pagado = vivienda.valor_total > 0
            ? Math.round((totalAbonado / vivienda.valor_total) * 100 * 100) / 100
            : 0
          vivienda.cantidad_abonos = abonosData.length
        } else {
          // Sin abonos
          vivienda.total_abonado = 0
          vivienda.saldo_pendiente = vivienda.valor_total
          vivienda.porcentaje_pagado = 0
          vivienda.cantidad_abonos = 0
        }
      } else {
        // Sin negociación = sin abonos
        vivienda.total_abonado = 0
        vivienda.saldo_pendiente = vivienda.valor_total
        vivienda.porcentaje_pagado = 0
        vivienda.cantidad_abonos = 0
      }
    }

    return vivienda
  }

  /**
   * Crea una nueva vivienda
   */
  async crear(formData: ViviendaFormData): Promise<Vivienda> {
    // Subir certificado si existe
    let certificadoUrl: string | undefined

    if (formData.certificado_tradicion_file) {
      certificadoUrl = await this.subirCertificado(
        formData.certificado_tradicion_file,
        formData.manzana_id,
        formData.numero
      )
    }

    // Calcular valor total
    const gastosNotariales = await this.obtenerGastosNotariales()
    const valorTotal =
      formData.valor_base + gastosNotariales + formData.recargo_esquinera

    // Preparar datos para inserción
    const viviendaData = {
      manzana_id: formData.manzana_id,
      numero: formData.numero,
      estado: 'Disponible' as const,

      // Linderos
      lindero_norte: formData.lindero_norte,
      lindero_sur: formData.lindero_sur,
      lindero_oriente: formData.lindero_oriente,
      lindero_occidente: formData.lindero_occidente,

      // Información Legal
      matricula_inmobiliaria: formData.matricula_inmobiliaria,
      nomenclatura: formData.nomenclatura,
      area: formData.area_construida || 0, // Campo legacy requerido
      area_lote: formData.area_lote,
      area_construida: formData.area_construida,
      tipo_vivienda: formData.tipo_vivienda,
      certificado_tradicion_url: certificadoUrl,

      // Información Financiera
      valor_base: formData.valor_base,
      es_esquinera: formData.es_esquinera,
      recargo_esquinera: formData.recargo_esquinera,
      gastos_notariales: gastosNotariales,
      // valor_total se calcula automáticamente en la BD
    }

    const { data, error } = await supabase
      .from('viviendas')
      .insert(viviendaData as any) // Cast temporal hasta regenerar types
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Actualiza una vivienda existente
   */
  async actualizar(
    id: string,
    formData: Partial<ViviendaFormData>
  ): Promise<Vivienda> {
    // Si hay nuevo certificado, subirlo
    let certificadoUrl: string | undefined

    if (formData.certificado_tradicion_file) {
      // Obtener datos de la vivienda para el path del archivo
      const vivienda = await this.obtenerPorId(id)
      if (!vivienda) throw new Error('Vivienda no encontrada')

      certificadoUrl = await this.subirCertificado(
        formData.certificado_tradicion_file,
        vivienda.manzana_id,
        vivienda.numero
      )
    }

    // Preparar datos de actualización
    const updateData: any = {}

    // Linderos
    if (formData.lindero_norte !== undefined)
      updateData.lindero_norte = formData.lindero_norte
    if (formData.lindero_sur !== undefined) updateData.lindero_sur = formData.lindero_sur
    if (formData.lindero_oriente !== undefined)
      updateData.lindero_oriente = formData.lindero_oriente
    if (formData.lindero_occidente !== undefined)
      updateData.lindero_occidente = formData.lindero_occidente

    // Información Legal
    if (formData.matricula_inmobiliaria !== undefined)
      updateData.matricula_inmobiliaria = formData.matricula_inmobiliaria
    if (formData.nomenclatura !== undefined)
      updateData.nomenclatura = formData.nomenclatura
    if (formData.area_lote !== undefined) updateData.area_lote = formData.area_lote
    if (formData.area_construida !== undefined)
      updateData.area_construida = formData.area_construida
    if (formData.tipo_vivienda !== undefined)
      updateData.tipo_vivienda = formData.tipo_vivienda
    if (certificadoUrl) updateData.certificado_tradicion_url = certificadoUrl

    // Información Financiera
    if (formData.valor_base !== undefined) updateData.valor_base = formData.valor_base
    if (formData.es_esquinera !== undefined)
      updateData.es_esquinera = formData.es_esquinera
    if (formData.recargo_esquinera !== undefined)
      updateData.recargo_esquinera = formData.recargo_esquinera

    const { data, error } = await supabase
      .from('viviendas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Elimina una vivienda
   */
  async eliminar(id: string): Promise<void> {
    // Obtener datos de la vivienda para eliminar el certificado si existe
    const vivienda = await this.obtenerPorId(id)

    if (vivienda?.certificado_tradicion_url) {
      await this.eliminarCertificado(vivienda.certificado_tradicion_url)
    }

    const { error } = await supabase.from('viviendas').delete().eq('id', id)

    if (error) throw error
  }

  /**
   * Lista viviendas con filtros opcionales
   * OPTIMIZADO: Usa vista_viviendas_completas (1 query vs 3-4 queries)
   * Incluye relaciones con manzanas, proyectos, clientes y cálculos de abonos
   */
  async listar(filtros?: FiltrosViviendas): Promise<Vivienda[]> {
    // Query a la vista optimizada
    // @ts-ignore - vista_viviendas_completas no está en types generados aún
    const queryBuilder = supabase.from('vista_viviendas_completas').select('*')

    // Aplicar filtros si existen
    // @ts-ignore
    let query = queryBuilder

    if (filtros?.proyectoId) {
      // @ts-ignore
      query = query.eq('proyecto_id', filtros.proyectoId)
    }

    if (filtros?.manzanaId) {
      // @ts-ignore
      query = query.eq('manzana_id', filtros.manzanaId)
    }

    if (filtros?.estado) {
      // @ts-ignore
      query = query.eq('estado', filtros.estado)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error cargando viviendas desde vista:', error)
      throw error
    }

    // Transformar datos de vista (flat) a estructura esperada (nested)
    const viviendas: Vivienda[] = (data || []).map((row: any) => ({
      // Campos base de vivienda
      id: row.id,
      manzana_id: row.manzana_id,
      numero: row.numero,
      estado: row.estado,
      cliente_id: row.cliente_id,
      negociacion_id: row.negociacion_id,

      // Linderos
      lindero_norte: row.lindero_norte,
      lindero_sur: row.lindero_sur,
      lindero_oriente: row.lindero_oriente,
      lindero_occidente: row.lindero_occidente,

      // Información Legal
      matricula_inmobiliaria: row.matricula_inmobiliaria,
      nomenclatura: row.nomenclatura,
      area: row.area,
      area_lote: row.area_lote,
      area_construida: row.area_construida,
      tipo_vivienda: row.tipo_vivienda,
      certificado_tradicion_url: row.certificado_tradicion_url,

      // Información Financiera
      valor_base: row.valor_base,
      es_esquinera: row.es_esquinera,
      recargo_esquinera: row.recargo_esquinera,
      gastos_notariales: row.gastos_notariales,
      valor_total: row.valor_total,

      // Auditoría
      fecha_creacion: row.fecha_creacion,
      fecha_actualizacion: row.fecha_actualizacion,

      // Relación con manzana (nested)
      manzanas: {
        nombre: row.manzana_nombre,
        proyecto_id: row.proyecto_id,
        proyectos: {
          nombre: row.proyecto_nombre,
        },
      },

      // Relación con cliente (nested) - solo si tiene cliente
      ...(row.cliente_id && {
        clientes: {
          id: row.cliente_id_data,
          nombre_completo: `${row.cliente_nombres} ${row.cliente_apellidos}`,
          telefono: row.cliente_telefono,
          email: row.cliente_email,
        },
      }),

      // Cálculos de abonos (ya vienen calculados de la vista)
      total_abonado: Number(row.total_abonado) || 0,
      cantidad_abonos: Number(row.cantidad_abonos) || 0,
      porcentaje_pagado: Number(row.porcentaje_pagado) || 0,
      saldo_pendiente: Number(row.saldo_pendiente) || row.valor_total,
    }))

    return viviendas
  }  // ============================================
  // STORAGE - CERTIFICADOS
  // ============================================

  /**
   * Sube un certificado de tradición a Supabase Storage
   */
  private async subirCertificado(
    file: File,
    manzanaId: string,
    numeroVivienda: string
  ): Promise<string> {
    const fileName = `certificado_${manzanaId}_${numeroVivienda}_${Date.now()}.pdf`
    const filePath = `certificados/${fileName}`

    const { error } = await supabase.storage
      .from('documentos-proyectos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('documentos-proyectos').getPublicUrl(filePath)

    return publicUrl
  }

  /**
   * Elimina un certificado de Supabase Storage
   */
  private async eliminarCertificado(url: string): Promise<void> {
    // Extraer path del URL
    const path = url.split('/documentos-proyectos/')[1]
    if (!path) return

    const { error } = await supabase.storage.from('documentos-proyectos').remove([path])

    if (error) console.error('Error eliminando certificado:', error)
  }
}

export const viviendasService = new ViviendasService()

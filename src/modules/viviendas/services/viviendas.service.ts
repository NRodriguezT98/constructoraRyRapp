import { supabase } from '@/lib/supabase/client'

import type {
    ConfiguracionRecargo,
    FiltrosViviendas,
    ManzanaConDisponibilidad,
    Proyecto,
    Vivienda,
    ViviendaFormData,
} from '../types'
import { sanitizeViviendaFormData, sanitizeViviendaUpdate } from '../utils/sanitize-vivienda.utils'

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
    return (data || []) as ManzanaConDisponibilidad[]
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
  async verificarMatriculaUnica(matricula: string, viviendaId?: string): Promise<{
    esUnica: boolean
    viviendaDuplicada?: { numero: string; manzana: string }
  }> {
    try {
      const { data, error } = await supabase
        .from('viviendas')
        .select(`
          id,
          numero,
          matricula_inmobiliaria,
          manzanas!inner(nombre)
        `)
        .eq('matricula_inmobiliaria', matricula)

      if (error) throw error

      // Si estamos editando, excluir la vivienda actual
      const duplicados = viviendaId
        ? data?.filter(v => v.id !== viviendaId) || []
        : data || []

      const esUnica = duplicados.length === 0

      if (!esUnica && duplicados[0]) {
        return {
          esUnica: false,
          viviendaDuplicada: {
            numero: duplicados[0].numero,
            manzana: duplicados[0].manzanas.nombre
          }
        }
      }

      return { esUnica: true }
    } catch (error) {
      if (error instanceof Error) {
        console.error('[VIVIENDAS] Error al verificar matrícula:', error.message)
      } else {
        console.error('[VIVIENDAS] Error desconocido al verificar matrícula:', String(error))
      }
      throw error
    }
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
    return (data || []) as ConfiguracionRecargo[]
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
    return (data || []) as unknown as Vivienda[]
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
    return (data || []) as unknown as Vivienda[]
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
    return data as unknown as Vivienda
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
        .select('id, nombres, apellidos, telefono, email')
        .eq('id', vivienda.cliente_id)
        .single()

      if (!clienteError && clienteData) {
        vivienda.clientes = {
          id: clienteData.id,
          nombre_completo: `${clienteData.nombres} ${clienteData.apellidos}`,
          telefono: clienteData.telefono ?? undefined,
          email: clienteData.email ?? undefined,
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
    // ✅ VALIDAR MATRÍCULA ÚNICA
    const resultado = await this.verificarMatriculaUnica(formData.matricula_inmobiliaria)
    if (!resultado.esUnica && resultado.viviendaDuplicada) {
      throw new Error(`La matrícula inmobiliaria "${formData.matricula_inmobiliaria}" ya está registrada en la Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`)
    }

    // Subir certificado si existe
    let certificadoUrl: string | undefined

    if (formData.certificado_tradicion_file) {
      certificadoUrl = await this.subirCertificado(
        formData.certificado_tradicion_file,
        formData.manzana_id,
        formData.numero
      )
    }

    // 🧹 Sanitizar datos (strings vacíos → null)
    const formDataSanitizada = sanitizeViviendaFormData(formData)

    // Calcular valor total
    const gastosNotariales = await this.obtenerGastosNotariales()
    const valorTotal =
      formDataSanitizada.valor_base + gastosNotariales + formDataSanitizada.recargo_esquinera

    // Preparar datos para inserción
    const viviendaData = {
      manzana_id: formDataSanitizada.manzana_id,
      numero: formDataSanitizada.numero,
      estado: 'Disponible' as const,

      // Linderos (sanitizados: null si vacíos)
      lindero_norte: formDataSanitizada.lindero_norte,
      lindero_sur: formDataSanitizada.lindero_sur,
      lindero_oriente: formDataSanitizada.lindero_oriente,
      lindero_occidente: formDataSanitizada.lindero_occidente,

      // Información Legal (sanitizados: null si vacíos)
      matricula_inmobiliaria: formDataSanitizada.matricula_inmobiliaria,
      nomenclatura: formDataSanitizada.nomenclatura,
      area: formDataSanitizada.area_construida || 0, // Campo legacy requerido
      area_lote: formDataSanitizada.area_lote,
      area_construida: formDataSanitizada.area_construida,
      tipo_vivienda: formDataSanitizada.tipo_vivienda,
      certificado_tradicion_url: certificadoUrl || null,

      // Información Financiera
      valor_base: formDataSanitizada.valor_base,
      es_esquinera: formDataSanitizada.es_esquinera,
      recargo_esquinera: formDataSanitizada.recargo_esquinera,
      gastos_notariales: gastosNotariales,
      // valor_total se calcula automáticamente en la BD
    }

    const { data, error } = await supabase
      .from('viviendas')
      .insert(viviendaData as any) // Cast temporal hasta regenerar types
      .select(`
        *,
        manzanas (
          id,
          nombre,
          proyectos (
            id,
            nombre
          )
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error al crear vivienda:', error)
      throw error
    }

    // ✅ Transformar a estructura esperada por Vivienda interface
    const viviendaCreada: Vivienda = {
      ...data,
      // Campos calculados (valores iniciales para vivienda nueva)
      total_abonado: 0,
      cantidad_abonos: 0,
      porcentaje_pagado: 0,
      saldo_pendiente: data.valor_total ?? undefined,
      fecha_creacion: new Date(data.fecha_creacion!),
      fecha_actualizacion: new Date(data.fecha_actualizacion!),
    } as unknown as Vivienda

    // 📄 CREAR REGISTRO EN DOCUMENTOS_VIVIENDA si hay certificado
    if (certificadoUrl && formData.certificado_tradicion_file) {
      try {
        // 1. Obtener categoría "Certificado de Tradición"
        const { data: categoria } = await supabase
          .from('categorias_documento')
          .select('id')
          .eq('nombre', 'Certificado de Tradición')
          .contains('modulos_permitidos', ['viviendas'])
          .eq('es_sistema', true)
          .maybeSingle()

        // 2. Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser()

        // 3. Crear registro en documentos_vivienda
        const { error: docError } = await supabase
          .from('documentos_vivienda')
          .insert({
            vivienda_id: data.id,
            categoria_id: categoria?.id || null,
            titulo: 'Certificado de Tradición y Libertad',
            descripcion: 'Documento oficial de tradición y libertad de la vivienda (subido en creación)',
            nombre_archivo: formData.certificado_tradicion_file!.name,
            nombre_original: formData.certificado_tradicion_file!.name,
            tamano_bytes: formData.certificado_tradicion_file.size,
            tipo_mime: formData.certificado_tradicion_file.type,
            url_storage: certificadoUrl,
            etiquetas: ['certificado', 'tradición', 'legal'],
            version: 1,
            es_version_actual: true,
            estado: 'activo',
            subido_por: user?.id || null,
            es_importante: true,
            metadata: {
              origen: 'creacion_vivienda',
              matricula: formData.matricula_inmobiliaria,
              nomenclatura: formData.nomenclatura
            }
          } as any)

        if (docError) {
          console.error('[VIVIENDAS] Error al crear registro de documento:', docError)
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('[VIVIENDAS] Error inesperado al crear documento:', error.message)
        } else {
          console.error('[VIVIENDAS] Error desconocido al crear documento:', String(error))
        }
      }
    }

    return viviendaCreada
  }

  /**
   * Obtiene la negociación activa de una vivienda (si existe)
   * Retorna datos financieros clave para validaciones de impacto
   */
  async obtenerNegociacionActivaPorVivienda(viviendaId: string) {
    const { data, error } = await supabase
      .from('negociaciones')
      .select(`
        id,
        valor_negociado,
        descuento_aplicado,
        total_abonado,
        saldo_pendiente,
        estado,
        cliente_id,
        clientes!negociaciones_cliente_id_fkey ( nombre_completo )
      `)
      .eq('vivienda_id', viviendaId)
      .eq('estado', 'Activa')
      .maybeSingle()

    if (error) {
      console.error('Error obteniendo negociación activa:', error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      valor_negociado: data.valor_negociado ?? 0,
      descuento_aplicado: data.descuento_aplicado ?? 0,
      total_abonado: data.total_abonado ?? 0,
      saldo_pendiente: data.saldo_pendiente ?? 0,
      estado: data.estado,
      cliente_id: data.cliente_id,
      cliente_nombre: (data.clientes as any)?.nombre_completo ?? 'Cliente',
    }
  }

  /**
   * Actualiza valor_negociado en la negociación cuando cambia valor_base de vivienda
   * Mantiene el descuento, recalcula valor_total automáticamente (campo generado)
   */
  async sincronizarNegociacionConVivienda(
    negociacionId: string,
    nuevoValorNegociado: number
  ) {
    const { error } = await supabase
      .from('negociaciones')
      .update({ valor_negociado: nuevoValorNegociado })
      .eq('id', negociacionId)

    if (error) {
      console.error('Error sincronizando negociación:', error)
      throw new Error('No se pudo actualizar el valor de la negociación')
    }
  }

  /**
   * Actualiza una vivienda existente
   */
  async actualizar(
    id: string,
    formData: Partial<ViviendaFormData>
  ): Promise<Vivienda> {
    // 🧹 Sanitizar datos de actualización (strings vacíos → null)
    const formDataSanitizada = sanitizeViviendaUpdate(formData)

    // ✅ VALIDAR MATRÍCULA ÚNICA (si se está cambiando)
    if (formDataSanitizada.matricula_inmobiliaria !== undefined) {
      const resultado = await this.verificarMatriculaUnica(formDataSanitizada.matricula_inmobiliaria, id)
      if (!resultado.esUnica && resultado.viviendaDuplicada) {
        console.error('❌ [ACTUALIZAR VIVIENDA] Matrícula duplicada:', formDataSanitizada.matricula_inmobiliaria)
        throw new Error(`La matrícula inmobiliaria "${formDataSanitizada.matricula_inmobiliaria}" ya está registrada en la Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`)
      }
    }

    // Si hay nuevo certificado, subirlo
    let certificadoUrl: string | undefined

    if (formDataSanitizada.certificado_tradicion_file) {
      // Obtener datos de la vivienda para el path del archivo
      const vivienda = await this.obtenerPorId(id)
      if (!vivienda) throw new Error('Vivienda no encontrada')

      certificadoUrl = await this.subirCertificado(
        formDataSanitizada.certificado_tradicion_file,
        vivienda.manzana_id,
        vivienda.numero
      )
    }

    // Preparar datos de actualización (con datos sanitizados)
    const updateData: any = {}

    // Linderos (todos sanitizados)
    if (formDataSanitizada.lindero_norte !== undefined)
      updateData.lindero_norte = formDataSanitizada.lindero_norte
    if (formDataSanitizada.lindero_sur !== undefined) updateData.lindero_sur = formDataSanitizada.lindero_sur
    if (formDataSanitizada.lindero_oriente !== undefined)
      updateData.lindero_oriente = formDataSanitizada.lindero_oriente
    if (formDataSanitizada.lindero_occidente !== undefined)
      updateData.lindero_occidente = formDataSanitizada.lindero_occidente

    // Información Legal (todos sanitizados)
    if (formDataSanitizada.matricula_inmobiliaria !== undefined)
      updateData.matricula_inmobiliaria = formDataSanitizada.matricula_inmobiliaria
    if (formDataSanitizada.nomenclatura !== undefined)
      updateData.nomenclatura = formDataSanitizada.nomenclatura
    if (formDataSanitizada.area_lote !== undefined) updateData.area_lote = formDataSanitizada.area_lote
    if (formDataSanitizada.area_construida !== undefined)
      updateData.area_construida = formDataSanitizada.area_construida
    if (formDataSanitizada.tipo_vivienda !== undefined)
      updateData.tipo_vivienda = formDataSanitizada.tipo_vivienda
    if (certificadoUrl) updateData.certificado_tradicion_url = certificadoUrl

    // Información Financiera
    if (formDataSanitizada.valor_base !== undefined) updateData.valor_base = formDataSanitizada.valor_base
    if (formDataSanitizada.es_esquinera !== undefined)
      updateData.es_esquinera = formDataSanitizada.es_esquinera
    if (formDataSanitizada.recargo_esquinera !== undefined)
      updateData.recargo_esquinera = formDataSanitizada.recargo_esquinera

    const { data, error } = await supabase
      .from('viviendas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as unknown as Vivienda
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
   * ✅ ORDENAMIENTO POR DEFECTO: Número de vivienda ascendente (1, 2, 3... → 101, 102...)
   */
  async listar(filtros?: FiltrosViviendas): Promise<Vivienda[]> {
    // Query a la vista optimizada
    // @ts-ignore - vista_viviendas_completas no está en types generados aún
    const queryBuilder = supabase.from('vista_viviendas_completas').select('*')

    // Aplicar filtros si existen
    // @ts-ignore
    let query = queryBuilder

    if (filtros?.proyecto_id) {
      // @ts-ignore
      query = query.eq('proyecto_id', filtros.proyecto_id)
    }

    if (filtros?.manzana_id) {
      // @ts-ignore
      query = query.eq('manzana_id', filtros.manzana_id)
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

    // ✅ ORDENAMIENTO POR DEFECTO: Manzana (alfabético) + Número (numérico ascendente)
    // Esto garantiza orden correcto: Mz.A Casa 1, 2, 3... 10, 11 (no 1, 10, 11, 2, 3)
    viviendas.sort((a, b) => {
      const manzanaA = a.manzanas?.nombre || ''
      const manzanaB = b.manzanas?.nombre || ''

      // Primero ordenar por manzana
      if (manzanaA !== manzanaB) {
        return manzanaA.localeCompare(manzanaB)
      }

      // Luego ordenar por número (convertir a entero para orden numérico)
      const numA = parseInt(a.numero, 10) || 0
      const numB = parseInt(b.numero, 10) || 0
      return numA - numB
    })

    return viviendas
  }  // ============================================
  // STORAGE - CERTIFICADOS
  // ============================================

  /**
   * Actualiza solo el certificado de tradición de una vivienda
   */
  async actualizarCertificado(viviendaId: string, file: File): Promise<string> {
    // Obtener datos de la vivienda
    const vivienda = await this.obtenerPorId(viviendaId)
    if (!vivienda) throw new Error('Vivienda no encontrada')

    // Subir nuevo certificado
    const certificadoUrl = await this.subirCertificado(
      file,
      vivienda.manzana_id,
      vivienda.numero
    )

    // Actualizar solo el campo certificado_tradicion_url
    const { error } = await supabase
      .from('viviendas')
      .update({ certificado_tradicion_url: certificadoUrl })
      .eq('id', viviendaId)

    if (error) throw error

    return certificadoUrl
  }

  /**
   * Sube un certificado de tradición a Supabase Storage
   */
  private async subirCertificado(
    file: File,
    manzanaId: string,
    numeroVivienda: string
  ): Promise<string> {

    // Obtener proyecto_id de la manzana
    const { data: manzana } = await supabase
      .from('manzanas')
      .select('proyecto_id')
      .eq('id', manzanaId)
      .single()

    if (!manzana?.proyecto_id) {
      throw new Error('No se pudo obtener el proyecto de la manzana')
    }

    const fileName = `certificado_${manzanaId}_${numeroVivienda}_${Date.now()}.pdf`
    const filePath = `${manzana.proyecto_id}/certificados/${fileName}`


    const { error: uploadError } = await supabase.storage
      .from('documentos-proyectos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('❌ [SUBIR CERTIFICADO] Error al subir:', uploadError)
      throw uploadError
    }


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

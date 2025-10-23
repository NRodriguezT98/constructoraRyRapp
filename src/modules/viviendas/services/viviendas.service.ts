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
   * Incluye relaciones con manzanas, proyectos
   * Los datos de clientes se obtienen por separado si es necesario
   */
  async listar(filtros?: FiltrosViviendas): Promise<Vivienda[]> {
    let query = supabase
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
      .order('fecha_creacion', { ascending: false })

    // Aplicar filtros si existen
    if (filtros?.proyectoId) {
      query = query.eq('manzanas.proyecto_id', filtros.proyectoId)
    }

    if (filtros?.manzanaId) {
      query = query.eq('manzana_id', filtros.manzanaId)
    }

    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado)
    }

    const { data, error } = await query

    if (error) throw error

    const viviendas = (data || []) as unknown as Vivienda[]

    // Obtener datos de clientes para viviendas con cliente_id
    const viviendasConCliente = viviendas.filter((v) => v.cliente_id)

    if (viviendasConCliente.length > 0) {
      const idsClientes = [...new Set(viviendasConCliente.map((v) => v.cliente_id).filter(Boolean))]

      // Obtener datos de clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nombres, apellidos, telefono, email')
        .in('id', idsClientes)

      if (!clientesError && clientesData) {
        // Mapear clientes a viviendas
        viviendas.forEach((vivienda) => {
          if (vivienda.cliente_id) {
            const cliente = clientesData.find((c) => c.id === vivienda.cliente_id)
            if (cliente) {
              vivienda.clientes = {
                id: cliente.id,
                nombre_completo: `${cliente.nombres} ${cliente.apellidos}`,
                telefono: cliente.telefono,
                email: cliente.email,
              }
            }
          }
        })
      }

      // Obtener cálculos de abonos: vivienda → negociacion → abonos_historial
      const viviendasConNegociacion = viviendasConCliente.filter(v => v.negociacion_id)
      const negociacionIds = viviendasConNegociacion.map((v) => v.negociacion_id!)

      if (negociacionIds.length > 0) {
        const { data: abonosData, error: abonosError } = await supabase
          .from('abonos_historial' as any)
          .select('negociacion_id, monto')
          .in('negociacion_id', negociacionIds)

        if (!abonosError && abonosData) {
          // Agrupar abonos por negociación
          const abonosPorNegociacion = (abonosData as any[]).reduce((acc: Record<string, number>, abono: any) => {
            if (!acc[abono.negociacion_id]) {
              acc[abono.negociacion_id] = 0
            }
            acc[abono.negociacion_id] += Number(abono.monto)
            return acc
          }, {})

          // Mapear datos de abonos a las viviendas
          viviendas.forEach((vivienda) => {
            if (vivienda.negociacion_id) {
              const totalAbonado = abonosPorNegociacion[vivienda.negociacion_id] || 0
              const cantidadAbonos = (abonosData as any[]).filter((a: any) => a.negociacion_id === vivienda.negociacion_id).length

              vivienda.total_abonado = totalAbonado
              vivienda.saldo_pendiente = vivienda.valor_total - totalAbonado
              vivienda.porcentaje_pagado = vivienda.valor_total > 0
                ? Math.round((totalAbonado / vivienda.valor_total) * 100 * 100) / 100
                : 0
              vivienda.cantidad_abonos = cantidadAbonos
            }
          })
        }
      }
    }

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

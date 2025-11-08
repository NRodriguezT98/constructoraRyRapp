/**
 * Hook para lógica de registro de interés de cliente
 * Ahora guarda en cliente_intereses en vez de negociaciones
 */

import { useCallback, useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { supabase } from '@/lib/supabase/client'

import { interesesService } from '../services/intereses.service'

interface Proyecto {
  id: string
  nombre: string
}

interface Vivienda {
  id: string
  numero: string
  valor_total: number
  manzana_id: string
  manzanas?: {
    nombre: string
  }
}

interface FormData {
  proyectoId: string
  viviendaId: string
  notas?: string
  origen?: string
  prioridad?: string
}

interface UseRegistrarInteresProps {
  clienteId: string
  onSuccess: () => void
  onClose: () => void
}

export function useRegistrarInteres({ clienteId, onSuccess, onClose }: UseRegistrarInteresProps) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [viviendas, setViviendas] = useState<Vivienda[]>([])
  const [cargandoProyectos, setCargandoProyectos] = useState(false)
  const [cargandoViviendas, setCargandoViviendas] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorNegociacionExistente, setErrorNegociacionExistente] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      proyectoId: '',
      viviendaId: '',
      notas: '',
      origen: 'Otro',
      prioridad: 'Media',
    },
  })

  const proyectoIdSeleccionado = watch('proyectoId')
  const viviendaIdSeleccionada = watch('viviendaId')

  // Cargar proyectos activos
  const cargarProyectos = useCallback(async () => {
    setCargandoProyectos(true)
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, nombre, estado')
        .in('estado', ['en_planificacion', 'en_construccion'])
        .order('nombre')

      if (error) {
        console.error('Error en query de proyectos:', error)
        throw error
      }

      setProyectos(data || [])
    } catch (error) {
      console.error('❌ Error al cargar proyectos:', error)
      setProyectos([])
    } finally {
      setCargandoProyectos(false)
    }
  }, [])

  // Cargar viviendas del proyecto seleccionado
  const cargarViviendas = useCallback(async (proyectoId: string) => {
    if (!proyectoId) {
      setViviendas([])
      return
    }

    setCargandoViviendas(true)
    try {
      // Primero obtenemos las manzanas del proyecto
      const { data: manzanasData, error: manzanasError } = await supabase
        .from('manzanas')
        .select('id')
        .eq('proyecto_id', proyectoId)

      if (manzanasError) {
        console.error('❌ Error al cargar manzanas:', manzanasError)
        throw manzanasError
      }

      const manzanaIds = manzanasData?.map((m) => m.id) || []

      if (manzanaIds.length === 0) {
        setViviendas([])
        setCargandoViviendas(false)
        return
      }

      console.log('🔍 Buscando viviendas en manzanas:', manzanaIds)

      // Ahora obtenemos las viviendas de esas manzanas
      const { data, error } = await supabase
        .from('viviendas')
        .select(`
          id,
          numero,
          valor_total,
          manzana_id,
          manzanas (
            nombre
          )
        `)
        .in('manzana_id', manzanaIds)
        .eq('estado', 'Disponible')
        .order('numero')

      if (error) {
        console.error('❌ Error en query de viviendas:', error)
        throw error
      }

      console.log('✅ Viviendas disponibles cargadas:', data?.length || 0)
      console.log('📊 Datos de viviendas:', data)

      // Mapear la respuesta al tipo correcto
      const viviendasMapeadas = (data || []).map((v: any) => ({
        id: v.id,
        numero: v.numero,
        valor_total: v.valor_total,
        manzana_id: v.manzana_id,
        manzanas: v.manzanas,
      }))

      setViviendas(viviendasMapeadas)
    } catch (error) {
      console.error('Error al cargar viviendas:', error)
      setViviendas([])
    } finally {
      setCargandoViviendas(false)
    }
  }, [])

  // Cargar proyectos al montar
  useEffect(() => {
    cargarProyectos()
  }, [cargarProyectos])

  // Cargar viviendas cuando cambia el proyecto
  useEffect(() => {
    if (proyectoIdSeleccionado) {
      cargarViviendas(proyectoIdSeleccionado)
      setValue('viviendaId', '') // Reset vivienda seleccionada
    } else {
      setViviendas([])
    }
  }, [proyectoIdSeleccionado, cargarViviendas, setValue])

  const handleRegistrar = async (data: FormData) => {
    setGuardando(true)
    setErrorNegociacionExistente(false)

    try {
      // ⚠️ PENDIENTE: Validación de cédula (TEMPORALMENTE DESHABILITADA)
      // TODO: Rehabilitar cuando se ejecute migración SQL en Supabase
      // Archivo: supabase/migrations/20250120_add_es_documento_identidad.sql
      // Documentación: PENDIENTE-VALIDACION-CEDULA.md
      /*
      const tieneCedula = await DocumentosClienteService.tieneCedulaActiva(clienteId)
      if (!tieneCedula) {
        toast.error('Debes subir la cédula del cliente antes de crear una negociación')
        setGuardando(false)
        return
      }
      */
      console.warn('⚠️ BYPASS TEMPORAL: Validación de cédula deshabilitada - Ver PENDIENTE-VALIDACION-CEDULA.md')

      // Verificar si ya existe un interés activo para esta vivienda
      const interesesExistentes = await interesesService.obtenerInteresesCliente(clienteId, true)
      const existe = interesesExistentes.some(i => i.vivienda_id === data.viviendaId)

      if (existe) {
        setErrorNegociacionExistente(true)
        setGuardando(false)
        return
      }

      // Registrar el interés (sin valor_estimado)
      await interesesService.crearInteres({
        cliente_id: clienteId,
        proyecto_id: data.proyectoId,
        vivienda_id: data.viviendaId,
        notas: data.notas,
        origen: (data.origen as any) || 'Otro',
        prioridad: (data.prioridad as any) || 'Media',
      })

      reset()
      onSuccess()
    } catch (error) {
      console.error('Error al registrar interés:', error)
      alert('Error al registrar el interés. Por favor intenta nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  const handleCancelar = () => {
    reset()
    setErrorNegociacionExistente(false)
    onClose()
  }

  return {
    // Estados
    proyectos,
    viviendas,
    cargandoProyectos,
    cargandoViviendas,
    guardando,
    errorNegociacionExistente,

    // Valores del form
    proyectoIdSeleccionado,
    viviendaIdSeleccionada,

    // React Hook Form
    register,
    handleSubmit,
    errors,

    // Handlers
    handleRegistrar,
    handleCancelar,
  }
}

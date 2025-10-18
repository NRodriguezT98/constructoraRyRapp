/**
 * Hook para lógica de registro de interés de cliente
 * Ahora guarda en cliente_intereses en vez de negociaciones
 */

import { supabase } from '@/lib/supabase/client-browser'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
  valorEstimado?: number  // Cambiado de valorNegociado
  notas?: string
  origen?: string  // Nuevo
  prioridad?: string  // Nuevo
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
      valorEstimado: 0,
      notas: '',
      origen: 'Otro',
      prioridad: 'Media',
    },
  })

  const proyectoIdSeleccionado = watch('proyectoId')
  const viviendaIdSeleccionada = watch('viviendaId')
  const valorEstimado = watch('valorEstimado')

  // Cargar proyectos disponibles
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

      console.log('✅ Proyectos cargados:', data?.length || 0, data)
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
    console.log('🔍 Buscando manzanas para proyecto:', proyectoId)
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

      console.log('📦 Manzanas encontradas:', manzanasData?.length || 0, manzanasData)

      const manzanaIds = manzanasData?.map((m) => m.id) || []

      if (manzanaIds.length === 0) {
        console.log('⚠️ No hay manzanas en este proyecto')
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
        .eq('estado', 'disponible')
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

      console.log('🏠 Viviendas mapeadas:', viviendasMapeadas.length, viviendasMapeadas)
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
    console.log('🔄 Cargando proyectos...')
    cargarProyectos()
  }, [cargarProyectos])

  // Cargar viviendas cuando cambia el proyecto
  useEffect(() => {
    if (proyectoIdSeleccionado) {
      console.log('🏗️ Proyecto seleccionado:', proyectoIdSeleccionado)
      cargarViviendas(proyectoIdSeleccionado)
      setValue('viviendaId', '') // Reset vivienda seleccionada
    } else {
      setViviendas([])
    }
  }, [proyectoIdSeleccionado, cargarViviendas, setValue])

  // Actualizar valor negociado cuando cambia la vivienda
  useEffect(() => {
    if (viviendaIdSeleccionada) {
      const vivienda = viviendas.find((v) => v.id === viviendaIdSeleccionada)
      if (vivienda) {
        console.log('🏠 Vivienda seleccionada:', vivienda.numero, '- Valor:', vivienda.valor_total)
        setValue('valorEstimado', vivienda.valor_total)
      }
    }
  }, [viviendaIdSeleccionada, viviendas, setValue])

  const handleRegistrar = async (data: FormData) => {
    setGuardando(true)
    setErrorNegociacionExistente(false)

    try {
      // Verificar si ya existe un interés activo para esta vivienda
      const interesesExistentes = await interesesService.obtenerInteresesCliente(clienteId, true)
      const existe = interesesExistentes.some(i => i.vivienda_id === data.viviendaId)

      if (existe) {
        setErrorNegociacionExistente(true)
        setGuardando(false)
        return
      }

      // Registrar el interés
      await interesesService.crearInteres({
        cliente_id: clienteId,
        proyecto_id: data.proyectoId,
        vivienda_id: data.viviendaId,
        valor_estimado: data.valorEstimado,
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
    valorEstimado,

    // React Hook Form
    register,
    handleSubmit,
    errors,

    // Handlers
    handleRegistrar,
    handleCancelar,
  }
}

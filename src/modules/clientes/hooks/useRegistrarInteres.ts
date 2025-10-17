/**
 * Hook para lógica de registro de interés (negociación)
 */

import { supabase } from '@/lib/supabase'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { NegociacionesService } from '../services/negociaciones.service'

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
  valorNegociado: number
  descuentoAplicado: number
  notas: string
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
      valorNegociado: 0,
      descuentoAplicado: 0,
      notas: '',
    },
  })

  const proyectoIdSeleccionado = watch('proyectoId')
  const viviendaIdSeleccionada = watch('viviendaId')
  const valorNegociado = watch('valorNegociado')

  // Cargar proyectos disponibles
  const cargarProyectos = useCallback(async () => {
    setCargandoProyectos(true)
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, nombre')
        .eq('estado', 'En Progreso')
        .order('nombre')

      if (error) throw error

      setProyectos(data || [])
    } catch (error) {
      console.error('Error al cargar proyectos:', error)
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
      const { data, error } = await supabase
        .from('viviendas')
        .select(`
          id,
          numero,
          valor_total,
          manzana_id,
          manzanas!inner (
            nombre,
            proyecto_id
          )
        `)
        .eq('manzanas.proyecto_id', proyectoId)
        .eq('estado', 'Disponible')
        .order('numero')

      if (error) throw error

      // Mapear la respuesta al tipo correcto (manzanas es objeto, no array)
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

  // Actualizar valor negociado cuando cambia la vivienda
  useEffect(() => {
    if (viviendaIdSeleccionada) {
      const vivienda = viviendas.find((v) => v.id === viviendaIdSeleccionada)
      if (vivienda) {
        setValue('valorNegociado', vivienda.valor_total)
      }
    }
  }, [viviendaIdSeleccionada, viviendas, setValue])

  const handleRegistrar = async (data: FormData) => {
    setGuardando(true)
    setErrorNegociacionExistente(false)

    try {
      // Verificar si ya existe una negociación
      const existe = await NegociacionesService.verificarNegociacionExistente(
        clienteId,
        data.viviendaId
      )

      if (existe) {
        setErrorNegociacionExistente(true)
        setGuardando(false)
        return
      }

      // Registrar el interés
      await NegociacionesService.registrarInteres({
        clienteId,
        viviendaId: data.viviendaId,
        valorNegociado: data.valorNegociado,
        descuentoAplicado: data.descuentoAplicado || 0,
        notas: data.notas,
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
    valorNegociado,

    // React Hook Form
    register,
    handleSubmit,
    errors,

    // Handlers
    handleRegistrar,
    handleCancelar,
  }
}

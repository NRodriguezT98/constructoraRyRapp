/**
 * Hook para lógica de registro de interés de cliente
 * Ahora guarda en cliente_intereses en vez de negociaciones
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'

import { useDocumentoIdentidad } from '../documentos/hooks/useDocumentoIdentidad'
import { interesesService } from '../services/intereses.service'
import { interesesKeys } from './useInteresesQuery'

// Orden natural: manzana alphabético → número de vivienda numérico
function sortViviendasNatural<T extends { numero: string; manzanas?: { nombre: string } | null }>(vivs: T[]): T[] {
  return [...vivs].sort((a, b) => {
    const ma = a.manzanas?.nombre ?? ''
    const mb = b.manzanas?.nombre ?? ''
    const mCmp = ma.localeCompare(mb, 'es', { sensitivity: 'base' })
    if (mCmp !== 0) return mCmp
    return a.numero.localeCompare(b.numero, 'es', { numeric: true, sensitivity: 'base' })
  })
}

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
}

interface UseRegistrarInteresProps {
  clienteId: string
  onSuccess: () => void
  onClose: () => void
}

export function useRegistrarInteres({ clienteId, onSuccess, onClose }: UseRegistrarInteresProps) {
  const queryClient = useQueryClient()
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [viviendas, setViviendas] = useState<Vivienda[]>([])
  const [busquedaVivienda, setBusquedaVivienda] = useState('')
  const [cargandoProyectos, setCargandoProyectos] = useState(false)

  // ✅ Validación de cédula reactiva (React Query - caché compartido)
  const { tieneCedula } = useDocumentoIdentidad({ clienteId })
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


      // Mapear la respuesta al tipo correcto
      const viviendasMapeadas = (data || []).map((v: any) => ({
        id: v.id,
        numero: v.numero,
        valor_total: v.valor_total,
        manzana_id: v.manzana_id,
        manzanas: v.manzanas,
      }))

      setViviendas(sortViviendasNatural(viviendasMapeadas))
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
      setBusquedaVivienda('')
    } else {
      setViviendas([])
      setBusquedaVivienda('')
    }
  }, [proyectoIdSeleccionado, cargarViviendas, setValue])

  // Filtrado client-side por manzana o número de vivienda
  const viviendasFiltradas = useMemo(() => {
    if (!busquedaVivienda.trim()) return viviendas
    const q = busquedaVivienda.toLowerCase()
    return viviendas.filter((v) => {
      const manzana = (v.manzanas?.nombre ?? '').toLowerCase()
      const numero = v.numero.toLowerCase()
      return (
        manzana.includes(q) ||
        numero.includes(q) ||
        `${manzana}${numero}`.includes(q.replace(/\s+/g, '')) ||
        `manzana ${manzana} casa ${numero}`.includes(q)
      )
    })
  }, [viviendas, busquedaVivienda])

  // Seleccionar vivienda desde el combobox
  const seleccionarVivienda = useCallback(
    (id: string) => {
      setValue('viviendaId', id, { shouldValidate: !!id, shouldDirty: true })
    },
    [setValue]
  )

  const handleRegistrar = async (data: FormData) => {
    setGuardando(true)
    setErrorNegociacionExistente(false)

    try {
      // ✅ Validar que el cliente tenga documento de identidad cargado
      if (!tieneCedula) {
        toast.error('El cliente debe tener su documento de identidad cargado antes de registrar un interés')
        setGuardando(false)
        return
      }

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
        notas: data.notas,
        origen: (data.origen as any) || 'Otro',
      })

      // Refrescar la lista de intereses en React Query sin recargar página
      await queryClient.invalidateQueries({ queryKey: interesesKeys.byCliente(clienteId) })
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
    setBusquedaVivienda('')
    setErrorNegociacionExistente(false)
    onClose()
  }

  return {
    // Estados
    proyectos,
    viviendas,
    viviendasFiltradas,
    busquedaVivienda,
    setBusquedaVivienda,
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
    seleccionarVivienda,
  }
}

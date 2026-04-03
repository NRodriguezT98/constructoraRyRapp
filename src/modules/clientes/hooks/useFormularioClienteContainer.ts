/**
 * Hook: useFormularioClienteContainer
 *
 * Lógica de negocio para el contenedor del formulario de clientes.
 * Maneja mutations, estados de modales, confirmaciones y guardado.
 *
 * Separación de responsabilidades:
 * - Este hook: Lógica de negocio (mutations, estados, callbacks)
 * - Container: Orquestación y renderizado
 * - Componente: UI presentacional pura
 */

import { useCallback, useState } from 'react'

import { logger } from '@/lib/utils/logger'

import { interesesService } from '../services/intereses.service'
import type {
  ActualizarClienteDTO,
  ClienteResumen,
  CrearClienteDTO,
} from '../types'

import {
  useActualizarClienteMutation,
  useClienteQuery,
  useCrearClienteMutation,
  useDetectarCambios,
  useFormularioCliente,
  useInteresFormulario,
} from '.'

interface UseFormularioClienteContainerProps {
  clienteId?: string | null
  cliente?: ClienteResumen | null // ✅ Type-safe
  isOpen?: boolean
  onClose?: () => void
}

export function useFormularioClienteContainer({
  clienteId,
  cliente: _cliente,
  isOpen = false,
  onClose,
}: UseFormularioClienteContainerProps) {
  // =====================================================
  // REACT QUERY: Datos y Mutations
  // =====================================================

  // ✅ SIEMPRE hacer fetch del cliente completo en edición
  // ClienteResumen puede no tener todos los campos necesarios
  // (Similar a Proyectos que hace fetch de proyectoConValidacion)
  const { data: clienteCompleto, isLoading: cargandoCliente } = useClienteQuery(
    clienteId ?? null
  )

  // Mutations
  const crearMutation = useCrearClienteMutation()
  const actualizarMutation = useActualizarClienteMutation()

  // =====================================================
  // ESTADOS LOCALES
  // =====================================================

  // Estados para los dos modales
  const [mostrarConfirmacionCambios, setMostrarConfirmacionCambios] =
    useState(false)
  const [mostrarDescarte, setMostrarDescarte] = useState(false)
  const [datosParaGuardar, setDatosParaGuardar] = useState<
    CrearClienteDTO | ActualizarClienteDTO | null
  >(null)

  // Estado del modal principal
  // ✅ En edición: esperar a que clienteCompleto esté listo (como Proyectos)
  const modalAbierto = clienteId
    ? isOpen &&
      !cargandoCliente &&
      clienteCompleto !== null &&
      clienteCompleto !== undefined
    : isOpen || crearMutation.isPending || actualizarMutation.isPending

  // =====================================================
  // HOOK DE INTERÉS (solo para nuevos clientes)
  // =====================================================

  const {
    proyectos,
    viviendas,
    cargandoProyectos,
    cargandoViviendas,
    handleProyectoChange,
    handleViviendaChange,
    getInteresData,
    resetInteres,
  } = useInteresFormulario()

  // =====================================================
  // LÓGICA DE GUARDADO
  // =====================================================

  /**
   * Ejecutar guardado real (después de confirmar o directo en creación)
   */
  const ejecutarGuardado = useCallback(
    async (datos: CrearClienteDTO | ActualizarClienteDTO) => {
      if (clienteCompleto?.id) {
        // Editar cliente existente
        await actualizarMutation.mutateAsync({
          id: clienteCompleto.id,
          datos: datos as ActualizarClienteDTO,
        })
      } else {
        // Crear nuevo cliente
        const nuevoCliente = await crearMutation.mutateAsync(
          datos as CrearClienteDTO
        )

        // Si tiene interés inicial, registrarlo
        const interesData = getInteresData()
        if (nuevoCliente && interesData) {
          try {
            await interesesService.crearInteres({
              cliente_id: nuevoCliente.id,
              proyecto_id: interesData.proyecto_id,
              vivienda_id: interesData.vivienda_id,
              notas: interesData.notas_interes,
            })
          } catch (error) {
            logger.error('Error al registrar interés inicial:', error)
          }
        }
        resetInteres()
      }
      // Cerrar modal después de completar exitosamente
      setMostrarConfirmacionCambios(false)
      onClose?.()
    },
    [
      clienteCompleto,
      crearMutation,
      actualizarMutation,
      getInteresData,
      resetInteres,
      onClose,
    ]
  )

  /**
   * Interceptar submit para mostrar modal de confirmación (solo en edición)
   */
  const handleFormSubmit = useCallback(
    async (datos: CrearClienteDTO | ActualizarClienteDTO) => {
      if (clienteCompleto?.id) {
        // Si es edición, guardar datos y mostrar modal de confirmación
        setDatosParaGuardar(datos)
        setMostrarConfirmacionCambios(true)
        return
      }

      // Si es creación, guardar directo (sin confirmación)
      await ejecutarGuardado(datos)
    },
    [clienteCompleto, ejecutarGuardado]
  )

  // =====================================================
  // HOOK DE FORMULARIO
  // =====================================================

  const {
    formData,
    errors,
    isSubmitting,
    esEdicion,
    handleChange,
    handleSubmit,
    validarStep0,
    validarStep1,
    validarStep2,
    validarStep3,
  } = useFormularioCliente({
    clienteInicial: clienteCompleto
      ? {
          ...clienteCompleto,
        }
      : undefined,
    onSubmit: handleFormSubmit,
    onCancel: () => {
      resetInteres()
      onClose?.()
    },
  })

  // =====================================================
  // DETECCIÓN DE CAMBIOS
  // =====================================================

  const cambiosDetectados = useDetectarCambios(
    esEdicion ? (clienteCompleto ?? null) : null,
    esEdicion ? formData : null
  )
  const hayCambios = cambiosDetectados.length > 0

  // =====================================================
  // HANDLERS DE MODALES
  // =====================================================

  /**
   * Intentar cerrar (al presionar X o Cancelar)
   */
  const handleIntentarCerrar = useCallback(() => {
    if (esEdicion && hayCambios && !isSubmitting) {
      setMostrarDescarte(true)
      return
    }

    resetInteres()
    onClose?.()
  }, [esEdicion, hayCambios, isSubmitting, resetInteres, onClose])

  /**
   * Confirmar guardado (desde modal de confirmación de cambios)
   */
  const confirmarGuardarCambios = useCallback(async () => {
    if (datosParaGuardar) {
      await ejecutarGuardado(datosParaGuardar)
      setDatosParaGuardar(null)
    }
  }, [datosParaGuardar, ejecutarGuardado])

  /**
   * Confirmar descarte de cambios (desde modal de descarte)
   */
  const confirmarDescartarCambios = useCallback(() => {
    setMostrarDescarte(false)
    resetInteres()
    onClose?.()
  }, [resetInteres, onClose])

  // =====================================================
  // RETURN: Exponer todo lo necesario para el container
  // =====================================================

  return {
    // Datos
    clienteCompleto,

    // Estado del formulario
    formData,
    errors,
    isSubmitting,
    esEdicion,

    // Handlers del formulario
    handleChange,
    handleSubmit,
    validarStep0,
    validarStep1,
    validarStep2,
    validarStep3,

    // Interés (para nuevos clientes)
    proyectos,
    viviendas,
    cargandoProyectos,
    cargandoViviendas,
    handleProyectoChange,
    handleViviendaChange,

    // Estados de modales
    modalAbierto,
    mostrarConfirmacionCambios,
    mostrarDescarte,

    // Handlers de modales
    handleIntentarCerrar,
    setMostrarConfirmacionCambios,
    confirmarGuardarCambios,
    setMostrarDescarte,
    confirmarDescartarCambios,

    // Cambios detectados
    cambiosDetectados,
    hayCambios,

    // Estados de mutations y queries
    isPending: crearMutation.isPending || actualizarMutation.isPending,
    cargandoCliente, // ✅ Expuesto para mostrar loading en formulario
  }
}

/**
 * Contenedor FormularioClienteContainer - Conecta el formulario con la lógica
 */

'use client'

import { useCallback } from 'react'
import { useClientes, useFormularioCliente, useInteresFormulario } from '../hooks'
import { interesesService } from '../services/intereses.service'
import { useClientesStore } from '../store/clientes.store'
import type { ActualizarClienteDTO, Cliente, CrearClienteDTO } from '../types'
import { FormularioCliente } from './formulario-cliente-modern'

interface FormularioClienteContainerProps {
  clienteSeleccionado?: Cliente | null
}

export function FormularioClienteContainer({
  clienteSeleccionado,
}: FormularioClienteContainerProps) {
  const { modalFormularioAbierto, cerrarModalFormulario } = useClientesStore()
  const { crearCliente, actualizarCliente } = useClientes()

  // Hook de interés (solo para nuevos clientes)
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

  // Función de submit
  const handleFormSubmit = useCallback(
    async (datos: CrearClienteDTO | ActualizarClienteDTO) => {
      if (clienteSeleccionado?.id) {
        // Editar cliente existente
        await actualizarCliente(clienteSeleccionado.id, datos as ActualizarClienteDTO)
      } else {
        // Crear nuevo cliente
        const nuevoCliente = await crearCliente(datos as CrearClienteDTO)

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
            console.error('Error al registrar interés inicial:', error)
            // No bloquear el flujo si falla el interés
          }
        }
        resetInteres()
      }
      cerrarModalFormulario()
    },
    [
      clienteSeleccionado,
      crearCliente,
      actualizarCliente,
      cerrarModalFormulario,
      getInteresData,
      resetInteres,
    ]
  )

  // Función de cancelación
  const handleFormCancel = useCallback(() => {
    resetInteres()
    cerrarModalFormulario()
  }, [cerrarModalFormulario, resetInteres])

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
    clienteInicial: clienteSeleccionado
      ? {
          id: clienteSeleccionado.id,
          ...clienteSeleccionado,
        }
      : undefined,
    onSubmit: handleFormSubmit,
    onCancel: handleFormCancel,
  })

  return (
    <FormularioCliente
      isOpen={modalFormularioAbierto}
      onClose={handleFormCancel}
      formData={formData}
      errors={errors}
      isSubmitting={isSubmitting}
      esEdicion={esEdicion}
      onSubmit={handleSubmit}
      onChange={handleChange}
      proyectos={proyectos}
      viviendas={viviendas}
      cargandoProyectos={cargandoProyectos}
      cargandoViviendas={cargandoViviendas}
      onProyectoChange={handleProyectoChange}
      onViviendaChange={handleViviendaChange}
      validarStep0={validarStep0}
      validarStep1={validarStep1}
      validarStep2={validarStep2}
      validarStep3={validarStep3}
    />
  )
}

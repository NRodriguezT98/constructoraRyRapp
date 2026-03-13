/**
 * Hook para el formulario de cliente
 * Maneja validaciones y estado del formulario
 */

import { useCallback, useEffect, useState } from 'react'

import { clientesService } from '../services/clientes.service'
import type {
    ActualizarClienteDTO,
    CrearClienteDTO,
    TipoDocumento,
    OrigenCliente,
} from '../types'
import { validarDocumentoIdentidad } from '../utils/validacion-documentos-colombia'

interface FormularioClienteHookProps {
  clienteInicial?: ActualizarClienteDTO & { id?: string }
  onSubmit: (datos: CrearClienteDTO | ActualizarClienteDTO) => Promise<void>
  onCancel?: () => void
}

export function useFormularioCliente({
  clienteInicial,
  onSubmit,
  onCancel,
}: FormularioClienteHookProps) {
  const [formData, setFormData] = useState<CrearClienteDTO>({
    nombres: clienteInicial?.nombres || '',
    apellidos: clienteInicial?.apellidos || '',
    tipo_documento: clienteInicial?.tipo_documento || 'CC',
    numero_documento: clienteInicial?.numero_documento || '',
    fecha_nacimiento: clienteInicial?.fecha_nacimiento ?? '',
    estado_civil: clienteInicial?.estado_civil ?? undefined,
    telefono: clienteInicial?.telefono || '',
    telefono_alternativo: clienteInicial?.telefono_alternativo || '',
    email: clienteInicial?.email || '',
    direccion: clienteInicial?.direccion || '',
    ciudad: clienteInicial?.ciudad || '',
    departamento: clienteInicial?.departamento || '',
    notas: clienteInicial?.notas || '',
    interes_inicial: undefined, // Solo para nuevos clientes
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // =====================================================
  // EFECTO: Actualizar formulario cuando cambia cliente
  // =====================================================
  useEffect(() => {
    if (clienteInicial) {
      // âœ… Solo actualizar si realmente hay un cambio (evitar re-renders innecesarios)
      setFormData((prev) => {
        // Si ya tiene los datos correctos, no actualizar
        if (
          prev.nombres === (clienteInicial.nombres || '') &&
          prev.numero_documento === (clienteInicial.numero_documento || '')
        ) {
          return prev
        }

        // Actualizar con datos del cliente
        return {
          nombres: clienteInicial.nombres || '',
          apellidos: clienteInicial.apellidos || '',
          tipo_documento: clienteInicial.tipo_documento || 'CC',
          numero_documento: clienteInicial.numero_documento || '',
          fecha_nacimiento: clienteInicial.fecha_nacimiento ?? '',
          estado_civil: clienteInicial.estado_civil ?? undefined,
          telefono: clienteInicial.telefono || '',
          telefono_alternativo: clienteInicial.telefono_alternativo || '',
          email: clienteInicial.email || '',
          direccion: clienteInicial.direccion || '',
          ciudad: clienteInicial.ciudad || '',
          departamento: clienteInicial.departamento || '',
          notas: clienteInicial.notas || '',
          interes_inicial: undefined,
        }
      })
    } else {
      // Reset para nuevo cliente
      setFormData({
        nombres: '',
        apellidos: '',
        tipo_documento: 'CC',
        numero_documento: '',
        fecha_nacimiento: '',
        estado_civil: undefined,
        telefono: '',
        telefono_alternativo: '',
        email: '',
        direccion: '',
        ciudad: '',
        departamento: '',
        notas: '',
        interes_inicial: undefined,
      })
    }
    // Limpiar errores cuando cambia el cliente
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteInicial?.id])

  // =====================================================
  // VALIDACIONES POR STEP
  // =====================================================

  /**
   * Validar Step 0: Información Personal
   * Campos obligatorios: nombres, apellidos, tipo_documento, numero_documento
   * âš ï¸ VALIDACIÃ“N ASYNC: Verifica duplicados en la base de datos
   * âœ… VALIDACIÃ“N ALGORITMO: Dígito verificador para NIT y formato para CC/CE
   */
  const validarStep0 = useCallback(async (): Promise<boolean> => {
    const nuevosErrores: Record<string, string> = {}

    // Nombres (requerido)
    if (!formData.nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son requeridos'
    }

    // Apellidos (requerido)
    if (!formData.apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son requeridos'
    }

    // Tipo documento (requerido)
    if (!formData.tipo_documento) {
      nuevosErrores.tipo_documento = 'El tipo de documento es requerido'
    }

    // Número documento (requerido + validación de formato/algoritmo)
    if (!formData.numero_documento.trim()) {
      nuevosErrores.numero_documento = 'El número de documento es requerido'
    } else {
      // âœ… VALIDACIÃ“N DE ALGORITMO (CC, CE, NIT, Pasaporte)
      const resultadoValidacion = validarDocumentoIdentidad(
        formData.tipo_documento as any,
        formData.numero_documento
      )

      if (!resultadoValidacion.valido) {
        nuevosErrores.numero_documento = resultadoValidacion.mensaje || 'Documento inválido'
        if (resultadoValidacion.detalles) {
          nuevosErrores.numero_documento += ` (${resultadoValidacion.detalles})`
        }
      } else if (!clienteInicial?.id) {
        // âš ï¸ VALIDACIÃ“N CRÃTICA: Verificar duplicados (solo si formato es válido y es cliente nuevo)
        try {
          const clienteExistente = await clientesService.buscarPorDocumento(
            formData.tipo_documento,
            formData.numero_documento
          )

          if (clienteExistente) {
            nuevosErrores.numero_documento = `Ya existe un cliente con este documento: ${clienteExistente.nombres} ${clienteExistente.apellidos}`
            console.error('âŒ Cliente duplicado encontrado en Step 0')
          } else {
          }
        } catch (error) {
          const mensaje = error instanceof Error ? error.message : 'Error desconocido'
          console.error('[CLIENTES] Error verificando duplicados:', mensaje, error)
          nuevosErrores.numero_documento = 'Error al verificar duplicados. Intenta de nuevo.'
        }
      }
    }

    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [formData, clienteInicial?.id])

  /**
   * Validar Step 1: Información de Contacto
   * Campos obligatorios:
   * - telefono OR email (al menos uno válido)
   * - departamento (obligatorio)
   * - ciudad (obligatoria)
   */
  const validarStep1 = useCallback((): boolean => {
    const nuevosErrores: Record<string, string> = {}

    const tieneTelefono = formData.telefono && formData.telefono.trim() !== ''
    const tieneEmail = formData.email && formData.email.trim() !== ''

    // Validar formato de teléfono si existe
    if (tieneTelefono && !/^[0-9+\-\s()]+$/.test(formData.telefono!)) {
      nuevosErrores.telefono = 'Teléfono inválido'
    }

    // Validar formato de email si existe
    if (tieneEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email!)) {
      nuevosErrores.email = 'Email inválido'
    }

    // Si no hay errores de formato, verificar que tenga al menos uno
    if (Object.keys(nuevosErrores).length === 0) {
      if (!tieneTelefono && !tieneEmail) {
        nuevosErrores.telefono = 'Requerido: teléfono o email'
        nuevosErrores.email = 'Requerido: teléfono o email'
      }
    }

    // Validar departamento (obligatorio)
    if (!formData.departamento || formData.departamento.trim() === '') {
      nuevosErrores.departamento = 'El departamento es obligatorio'
    }

    // Validar ciudad/municipio (obligatoria)
    if (!formData.ciudad || formData.ciudad.trim() === '') {
      nuevosErrores.ciudad = 'La ciudad/municipio es obligatoria'
    }

    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [formData])

  /**
   * Validar Step 2: Interés
   * Todo opcional, pero si selecciona vivienda â†’ proyecto es requerido
   */
  const validarStep2 = useCallback((): boolean => {
    const nuevosErrores: Record<string, string> = {}

    // Si tiene vivienda pero no proyecto
    if (formData.interes_inicial?.vivienda_id && !formData.interes_inicial?.proyecto_id) {
      nuevosErrores.proyecto_interes = 'Debe seleccionar un proyecto primero'
    }

    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [formData])

  /**
   * Validar Step 3: Adicional
   * Todo opcional - siempre válido
   */
  const validarStep3 = useCallback((): boolean => {
    // Step 3 no tiene validaciones
    return true
  }, [])

  // =====================================================
  // VALIDACIÃ“N COMPLETA (para submit final)
  // =====================================================

  const validarFormulario = useCallback((): boolean => {
    const nuevosErrores: Record<string, string> = {}

    // Nombres (requerido)
    if (!formData.nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son requeridos'
    }

    // Apellidos (requerido)
    if (!formData.apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son requeridos'
    }

    // Tipo documento (requerido)
    if (!formData.tipo_documento) {
      nuevosErrores.tipo_documento = 'El tipo de documento es requerido'
    }

    // Número documento (requerido)
    if (!formData.numero_documento.trim()) {
      nuevosErrores.numero_documento = 'El número de documento es requerido'
    } else if (!/^[0-9]+$/.test(formData.numero_documento)) {
      nuevosErrores.numero_documento = 'Solo se permiten números'
    }

    // Contacto: Al menos teléfono o email
    const tieneTelefono = formData.telefono && formData.telefono.trim() !== ''
    const tieneEmail = formData.email && formData.email.trim() !== ''

    if (!tieneTelefono && !tieneEmail) {
      nuevosErrores.telefono = 'Requerido: teléfono o email'
      nuevosErrores.email = 'Requerido: teléfono o email'
    }

    // Email (opcional pero con formato)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido'
    }

    // Teléfono (opcional pero con formato)
    if (formData.telefono && !/^[0-9+\-\s()]+$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'Teléfono inválido'
    }

    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [formData])

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleChange = useCallback(
    (campo: keyof CrearClienteDTO, valor: string | TipoDocumento | OrigenCliente) => {
      setFormData((prev) => ({ ...prev, [campo]: valor }))
      // Limpiar error del campo al escribir
      if (errors[campo]) {
        setErrors((prev) => {
          const nuevos = { ...prev }
          delete nuevos[campo]
          return nuevos
        })
      }
    },
    [errors]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validarFormulario()) {
        return
      }

      setIsSubmitting(true)

      try {
        await onSubmit(formData)
      } catch (error) {
        console.error('Error al guardar cliente:', error)
        // El error ya se maneja en el componente padre
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, onSubmit, validarFormulario]
  )

  const handleCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  const resetForm = useCallback(() => {
    setFormData({
      nombres: '',
      apellidos: '',
      tipo_documento: 'CC',
      numero_documento: '',
      fecha_nacimiento: '',
      telefono: '',
      telefono_alternativo: '',
      email: '',
      direccion: '',
      ciudad: '',
      departamento: '',
      notas: '',
      interes_inicial: undefined,
    })
    setErrors({})
  }, [])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    formData,
    errors,
    isSubmitting,
    esEdicion: !!clienteInicial?.id,
    handleChange,
    handleSubmit,
    handleCancel,
    resetForm,
    // Validaciones por step
    validarStep0,
    validarStep1,
    validarStep2,
    validarStep3,
  }
}

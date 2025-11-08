/**
 * Hook: useCrearNegociacion
 *
 * Gestiona la creación de negociaciones vinculando Cliente + Vivienda + Fuentes de Pago
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 *
 * Campos usados:
 * - negociaciones: cliente_id, vivienda_id, valor_negociado, descuento_aplicado, notas, estado
 * - viviendas: valor_total
 * - fuentes_pago: negociacion_id, tipo, monto_aprobado, entidad, numero_referencia, permite_multiples_abonos
 *
 * 🔄 RETROCOMPATIBILIDAD:
 * - El campo `fuentes_pago` es OPCIONAL para mantener compatibilidad con modal antiguo
 * - Modal nuevo (modal-crear-negociacion-nuevo.tsx) → SÍ envía fuentes_pago
 * - Modal viejo (modal-crear-negociacion.tsx) → NO envía fuentes_pago (aún funciona)
 */

import { useCallback, useState } from 'react'

import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import type { CrearFuentePagoDTO, Negociacion } from '@/modules/clientes/types'

interface FormDataNegociacion {
  cliente_id: string
  vivienda_id: string
  valor_negociado: number
  descuento_aplicado: number
  notas: string

  // ⭐ NUEVO: Fuentes de pago (OPCIONAL para retrocompatibilidad con modal viejo)
  fuentes_pago?: CrearFuentePagoDTO[]
}

interface UseCrearNegociacionReturn {
  // Estado
  creando: boolean
  error: string | null
  negociacionCreada: Negociacion | null

  // Acciones
  crearNegociacion: (datos: FormDataNegociacion) => Promise<Negociacion | null>
  limpiar: () => void

  // Validaciones
  validarDatos: (datos: FormDataNegociacion) => { valido: boolean; errores: string[] }
  calcularValorTotal: (valorNegociado: number, descuento: number) => number
}

export function useCrearNegociacion(): UseCrearNegociacionReturn {
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [negociacionCreada, setNegociacionCreada] = useState<Negociacion | null>(null)

  /**
   * Calcular valor total (valor negociado - descuento)
   */
  const calcularValorTotal = useCallback((valorNegociado: number, descuento: number): number => {
    return Math.max(0, valorNegociado - descuento)
  }, [])

  /**
   * Validar datos antes de crear
   */
  const validarDatos = useCallback((datos: FormDataNegociacion) => {
    const errores: string[] = []

    if (!datos.cliente_id) {
      errores.push('Debe seleccionar un cliente')
    }

    if (!datos.vivienda_id) {
      errores.push('Debe seleccionar una vivienda')
    }

    if (!datos.valor_negociado || datos.valor_negociado <= 0) {
      errores.push('El valor negociado debe ser mayor a 0')
    }

    if (datos.descuento_aplicado < 0) {
      errores.push('El descuento no puede ser negativo')
    }

    if (datos.descuento_aplicado >= datos.valor_negociado) {
      errores.push('El descuento no puede ser mayor o igual al valor negociado')
    }

    const valorTotal = calcularValorTotal(datos.valor_negociado, datos.descuento_aplicado)
    if (valorTotal <= 0) {
      errores.push('El valor total (valor negociado - descuento) debe ser mayor a 0')
    }

    // ⭐ VALIDACIONES DE FUENTES DE PAGO (solo si se proporcionan)
    if (datos.fuentes_pago && datos.fuentes_pago.length > 0) {
      // Validar que exista Cuota Inicial
      const tieneCuotaInicial = datos.fuentes_pago.some(f => f.tipo === 'Cuota Inicial')
      if (!tieneCuotaInicial) {
        errores.push('Debe configurar la Cuota Inicial (obligatoria)')
      }

      // Validar que la suma de fuentes = valor total
      const sumaFuentes = datos.fuentes_pago.reduce((sum, f) => sum + f.monto_aprobado, 0)
      if (Math.abs(sumaFuentes - valorTotal) > 0.01) {
        // Tolerancia de 1 centavo por redondeo
        errores.push(
          `La suma de fuentes de pago ($${sumaFuentes.toLocaleString()}) debe ser igual al valor total ($${valorTotal.toLocaleString()})`
        )
      }

      // Validar montos individuales
      datos.fuentes_pago.forEach(fuente => {
        if (!fuente.monto_aprobado || fuente.monto_aprobado <= 0) {
          errores.push(`${fuente.tipo}: El monto debe ser mayor a 0`)
        }
      })

      // Nota: Las validaciones de entidad y numero_referencia se hacen
      // en los pasos del wizard antes de llegar aquí
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }, [calcularValorTotal])

  /**
   * Validar que el cliente tenga documento de identidad
   */
  const validarDocumentoIdentidad = useCallback(async (clienteId: string): Promise<boolean> => {
    try {
      const { clientesService } = await import('@/modules/clientes/services/clientes.service')
      const cliente = await clientesService.obtenerCliente(clienteId)

      if (!cliente.documento_identidad_url) {
        setError('El cliente debe tener cargada su cédula de ciudadanía antes de crear una negociación')
        return false
      }

      return true
    } catch (err) {
      console.error('Error validando documento:', err)
      setError('Error al validar el documento del cliente')
      return false
    }
  }, [])

  /**
   * Crear negociación
   */
  const crearNegociacion = useCallback(async (datos: FormDataNegociacion): Promise<Negociacion | null> => {
    console.log('🔄 Iniciando creación de negociación:', datos)
    setCreando(true)
    setError(null)
    setNegociacionCreada(null)

    try {
      // Validar datos
      const validacion = validarDatos(datos)
      if (!validacion.valido) {
        const mensajeError = validacion.errores.join('\n')
        console.error('❌ Validación fallida:', validacion.errores)
        setError(mensajeError)
        return null
      }

      // ⚠️ VALIDACIÓN CRÍTICA: Verificar que el cliente tenga cédula cargada
      console.log('🔍 Validando documento de identidad del cliente...')
      const tieneDocumento = await validarDocumentoIdentidad(datos.cliente_id)
      if (!tieneDocumento) {
        return null // Error ya fue seteado en validarDocumentoIdentidad
      }

      // Verificar si ya existe negociación activa
      console.log('🔍 Verificando negociación existente...')
      const yaExiste = await negociacionesService.existeNegociacionActiva(
        datos.cliente_id,
        datos.vivienda_id
      )

      if (yaExiste) {
        const mensajeError = 'Ya existe una negociación activa para este cliente con esta vivienda.\n\nPara crear una nueva negociación, primero debe cancelar o completar la negociación existente.'
        console.warn('⚠️', mensajeError)
        setError(mensajeError)
        return null
      }

      // Crear negociación
      console.log('📝 Creando negociación en la base de datos...')
      const negociacion = await negociacionesService.crearNegociacion({
        cliente_id: datos.cliente_id,
        vivienda_id: datos.vivienda_id,
        valor_negociado: datos.valor_negociado,
        descuento_aplicado: datos.descuento_aplicado,
        notas: datos.notas,
        fuentes_pago: datos.fuentes_pago, // ⭐ NUEVO
      })

      console.log('✅ Negociación creada exitosamente:', negociacion.id)

      // Disparar evento para refrescar tab de negociaciones
      window.dispatchEvent(new Event('negociacion-creada'))
      console.log('📢 Evento "negociacion-creada" disparado')

      setNegociacionCreada(negociacion)
      return negociacion
    } catch (err) {
      let mensajeError = 'Error al crear negociación'

      // Manejar errores específicos de PostgreSQL
      if (err && typeof err === 'object' && 'code' in err) {
        const pgError = err as { code: string; message: string }

        if (pgError.code === '23505') {
          // Violación de constraint único
          if (pgError.message.includes('negociaciones_cliente_vivienda_unica')) {
            mensajeError = 'Ya existe una negociación activa para este cliente con esta vivienda.\n\nPara crear una nueva negociación, primero debe cancelar o completar la negociación existente desde el perfil del cliente.'
          } else {
            mensajeError = 'Ya existe un registro con estos datos. Por favor, verifique la información.'
          }
        } else if (pgError.code === '23503') {
          // Violación de foreign key
          mensajeError = 'Error de referencia: Verifique que el cliente y la vivienda existan.'
        } else {
          mensajeError = pgError.message || mensajeError
        }
      } else if (err instanceof Error) {
        mensajeError = err.message
      }

      console.error('❌ Error creando negociación:', err)
      setError(mensajeError)
      return null
    } finally {
      setCreando(false)
    }
  }, [validarDatos, validarDocumentoIdentidad])

  /**
   * Limpiar estado
   */
  const limpiar = useCallback(() => {
    setCreando(false)
    setError(null)
    setNegociacionCreada(null)
  }, [])

  return {
    creando,
    error,
    negociacionCreada,
    crearNegociacion,
    limpiar,
    validarDatos,
    calcularValorTotal,
  }
}

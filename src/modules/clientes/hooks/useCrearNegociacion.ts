/**
 * Hook: useCrearNegociacion
 *
 * Gestiona la creación de negociaciones vinculando Cliente + Vivienda
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 *
 * Campos usados:
 * - negociaciones: cliente_id, vivienda_id, valor_negociado, descuento_aplicado, notas, estado
 * - viviendas: valor_total
 */

import type { Negociacion } from '@/modules/clientes/services/negociaciones.service'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import { useCallback, useState } from 'react'

interface FormDataNegociacion {
  cliente_id: string
  vivienda_id: string
  valor_negociado: number
  descuento_aplicado: number
  notas: string
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

    return {
      valido: errores.length === 0,
      errores,
    }
  }, [calcularValorTotal])

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

      // Verificar si ya existe negociación activa
      console.log('🔍 Verificando negociación existente...')
      const yaExiste = await negociacionesService.existeNegociacionActiva(
        datos.cliente_id,
        datos.vivienda_id
      )

      if (yaExiste) {
        const mensajeError = 'Ya existe una negociación activa para este cliente y vivienda'
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
      })

      console.log('✅ Negociación creada exitosamente:', negociacion.id)
      setNegociacionCreada(negociacion)
      return negociacion
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'Error al crear negociación'
      console.error('❌ Error creando negociación:', err)
      setError(mensajeError)
      return null
    } finally {
      setCreando(false)
    }
  }, [validarDatos])

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

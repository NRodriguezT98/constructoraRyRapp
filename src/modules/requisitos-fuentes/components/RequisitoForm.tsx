/**
 * ============================================
 * COMPONENTE: Formulario de Requisito
 * ============================================
 * Formulario para crear/editar requisitos.
 * Componente PRESENTACIONAL con validación básica.
 */

'use client'

import { motion } from 'framer-motion'
import { Save, X } from 'lucide-react'
import { useState } from 'react'
import { requisitosConfigStyles as styles } from '../styles/requisitos-config.styles'
import type { CrearRequisitoDTO, RequisitoFuenteConfig } from '../types'
import { ALCANCES_REQUISITO, CATEGORIAS_DOCUMENTO, NIVELES_VALIDACION } from '../types'

interface RequisitoFormProps {
  tipoFuente: string
  ordenSiguiente: number
  requisitoEditar?: RequisitoFuenteConfig
  onGuardar: (datos: CrearRequisitoDTO) => void
  onCancelar: () => void
  tiposFuenteDisponibles: Array<{ value: string; label: string }> // ✅ Lista de fuentes
  defaultAlcance?: 'ESPECIFICO_FUENTE' | 'COMPARTIDO_CLIENTE' // ✅ Pre-selección de alcance
}

export function RequisitoForm({
  tipoFuente,
  ordenSiguiente,
  requisitoEditar,
  onGuardar,
  onCancelar,
  tiposFuenteDisponibles,
  defaultAlcance = 'ESPECIFICO_FUENTE',
}: RequisitoFormProps) {
  const [formData, setFormData] = useState<Partial<CrearRequisitoDTO>>(() => {
    // Inicializar tipo_fuente correctamente:
    // - Editando COMPARTIDO: usar fuentes_aplicables (null = todas las disponibles)
    // - Editando ESPECÍFICO: usar [tipo_fuente]
    // - Creando: usar [tipoFuente] inicial
    let tipoFuenteInicial: string | string[]
    if (requisitoEditar) {
      if (requisitoEditar.alcance === 'COMPARTIDO_CLIENTE') {
        // null significa "aplica a todas": pre-marcar todas
        tipoFuenteInicial = requisitoEditar.fuentes_aplicables
          ?? tiposFuenteDisponibles.map((f) => f.value)
      } else {
        tipoFuenteInicial = [requisitoEditar.tipo_fuente]
      }
    } else {
      tipoFuenteInicial = [tipoFuente]
    }
    return {
      tipo_fuente: tipoFuenteInicial,
      paso_identificador: requisitoEditar?.paso_identificador || '',
      titulo: requisitoEditar?.titulo || '',
      descripcion: requisitoEditar?.descripcion || '',
      instrucciones: requisitoEditar?.instrucciones || '',
      nivel_validacion: requisitoEditar?.nivel_validacion || 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_sugerido: requisitoEditar?.tipo_documento_sugerido || '',
      categoria_documento: requisitoEditar?.categoria_documento || '',
      alcance: requisitoEditar?.alcance || defaultAlcance,
      orden: requisitoEditar?.orden || ordenSiguiente,
    }
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Handler para checkbox de fuentes múltiples
  const handleFuenteToggle = (fuenteValue: string) => {
    setFormData((prev) => {
      const fuentes = Array.isArray(prev.tipo_fuente) ? prev.tipo_fuente : [prev.tipo_fuente || tipoFuente]
      const yaSeleccionada = fuentes.includes(fuenteValue)

      const nuevasFuentes = yaSeleccionada
        ? fuentes.filter(f => f !== fuenteValue)
        : [...fuentes, fuenteValue]

      return { ...prev, tipo_fuente: nuevasFuentes.length > 0 ? nuevasFuentes : [tipoFuente] }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!formData.paso_identificador || !formData.titulo || !formData.nivel_validacion) {
      alert('Los campos marcados con * son obligatorios')
      return
    }

    onGuardar(formData as CrearRequisitoDTO)
  }

  const modoEdicion = !!requisitoEditar

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className={styles.form.container}
    >
      <h3 className={styles.form.title}>
        {modoEdicion ? '✏️ Editar Requisito' : '➕ Nuevo Requisito'}
      </h3>

      <div className={styles.form.grid}>
        {/* ============================================ */}
        {/* ALCANCE DEL REQUISITO */}
        {/* ============================================ */}
        <div className={styles.form.fieldFull}>
          <label className={styles.form.label}>
            Alcance del Requisito *
            <span className="ml-1 text-[10px] text-gray-500">(¿Aplica a una o varias fuentes?)</span>
          </label>
          <div className="space-y-2">
            {ALCANCES_REQUISITO.map((alcance) => (
              <label
                key={alcance.value}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  formData.alcance === alcance.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <input
                  type="radio"
                  name="alcance"
                  value={alcance.value}
                  checked={formData.alcance === alcance.value}
                  onChange={handleChange}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {alcance.label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {alcance.descripcion}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* FUENTES APLICABLES (Multi-select) */}
        {/* ============================================ */}
        <div className={styles.form.fieldFull}>
          <label className={styles.form.label}>
            Fuentes de Pago Aplicables
            {requisitoEditar?.tipo_fuente === 'COMPARTIDO' ? (
              <span className="ml-1 text-[10px] text-gray-500">
                (Sin marcar = aplica a <strong>todas</strong> las fuentes del cliente)
              </span>
            ) : (
              <span className="ml-1 text-[10px] text-gray-500">
                * (Selecciona una o más fuentes donde se requiere este documento)
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tiposFuenteDisponibles.map((fuente) => {
              const fuentesSeleccionadas = Array.isArray(formData.tipo_fuente)
                ? formData.tipo_fuente
                : [formData.tipo_fuente || tipoFuente]
              const estaSeleccionada = fuentesSeleccionadas.includes(fuente.value)

              return (
                <label
                  key={fuente.value}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                    estaSeleccionada
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={estaSeleccionada}
                    onChange={() => handleFuenteToggle(fuente.value)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {fuente.label}
                  </span>
                </label>
              )
            })}
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
            <span>💡</span>
            {formData.alcance === 'COMPARTIDO_CLIENTE'
              ? 'COMPARTIDO: el cliente sube el documento UNA sola vez. Sin selección = aplica a todas las fuentes activas.'
              : 'ESPECÍFICO: el cliente debe subir un documento diferente para cada fuente seleccionada.'
            }
          </p>
        </div>

        {/* Paso Identificador */}
        <div>
          <label className={styles.form.label}>
            Identificador del Paso *
            <span className="ml-1 text-[10px] text-gray-500">(snake_case único)</span>
          </label>
          <input
            type="text"
            name="paso_identificador"
            value={formData.paso_identificador}
            onChange={handleChange}
            placeholder="Ej: boleta_registro"
            className={styles.form.input}
            required
            disabled={modoEdicion} // No editable en modo edición
          />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            Ejemplo: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">boleta_registro</code>
          </p>
        </div>

        {/* Título */}
        <div>
          <label className={styles.form.label}>Título del Paso *</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej: Boleta de Registro"
            className={styles.form.input}
            required
          />
        </div>

        {/* Descripción */}
        <div className={styles.form.fieldFull}>
          <label className={styles.form.label}>Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Breve descripción del requisito"
            rows={2}
            className={styles.form.textarea}
          />
        </div>

        {/* Instrucciones */}
        <div className={styles.form.fieldFull}>
          <label className={styles.form.label}>Instrucciones para el Usuario</label>
          <textarea
            name="instrucciones"
            value={formData.instrucciones}
            onChange={handleChange}
            placeholder="Instrucciones detalladas de qué debe subir"
            rows={2}
            className={styles.form.textarea}
          />
        </div>

        {/* Nivel de Validación */}
        <div>
          <label className={styles.form.label}>Nivel de Validación *</label>
          <select
            name="nivel_validacion"
            value={formData.nivel_validacion}
            onChange={handleChange}
            className={styles.form.select}
            required
          >
            {NIVELES_VALIDACION.map((nivel) => (
              <option key={nivel.value} value={nivel.value}>
                {nivel.label}
              </option>
            ))}
          </select>
        </div>

        {/* Orden */}
        <div>
          <label className={styles.form.label}>Orden de Aparición</label>
          <input
            type="number"
            name="orden"
            value={formData.orden}
            onChange={handleChange}
            min={1}
            className={styles.form.input}
          />
        </div>

        {/* Tipo de Documento Sugerido */}
        <div>
          <label className={styles.form.label}>Tipo de Documento Sugerido</label>
          <input
            type="text"
            name="tipo_documento_sugerido"
            value={formData.tipo_documento_sugerido}
            onChange={handleChange}
            placeholder="Ej: Boleta de Registro"
            className={styles.form.input}
          />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            Se mostrará como sugerencia al usuario
          </p>
        </div>

        {/* Categoría de Documento */}
        <div>
          <label className={styles.form.label}>Categoría de Documento</label>
          <select
            name="categoria_documento"
            value={formData.categoria_documento}
            onChange={handleChange}
            className={styles.form.select}
          >
            <option value="">-- Sin categoría --</option>
            {CATEGORIAS_DOCUMENTO.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Acciones */}
      <div className={styles.form.actions}>
        <motion.button
          type="button"
          onClick={onCancelar}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={styles.form.btnSecondary}
        >
          <X className="w-4 h-4" />
          Cancelar
        </motion.button>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={styles.form.btnPrimary}
        >
          <Save className="w-4 h-4" />
          {modoEdicion ? 'Guardar Cambios' : 'Crear Requisito'}
        </motion.button>
      </div>
    </motion.form>
  )
}

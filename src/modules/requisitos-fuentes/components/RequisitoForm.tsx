/**
 * ============================================
 * COMPONENTE: Formulario de Requisito (Compacto)
 * ============================================
 * Formulario para crear/editar requisitos.
 * Componente PRESENTACIONAL con validación básica.
 *
 * Diseño compacto (~320px vs ~600px anterior):
 * - Alcance: pill toggle (no radio cards grandes)
 * - Fuentes: solo visible cuando alcance = COMPARTIDO_CLIENTE
 * - paso_identificador: auto-generado desde titulo en creación
 * - tipo_documento_sugerido: oculto, auto-guardado = titulo
 * - instrucciones + categoria: acordeón "Opciones avanzadas"
 * - orden: removido de UI (D&D es el mecanismo)
 */

'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Save, X } from 'lucide-react'
import { toast } from 'sonner'

import { requisitosConfigStyles as styles } from '../styles/requisitos-config.styles'
import type { CrearRequisitoDTO, RequisitoFuenteConfig } from '../types'
import { CATEGORIAS_DOCUMENTO, NIVELES_VALIDACION } from '../types'


interface RequisitoFormProps {
  tipoFuente: string
  ordenSiguiente: number
  requisitoEditar?: RequisitoFuenteConfig
  onGuardar: (datos: CrearRequisitoDTO) => void
  onCancelar: () => void
  tiposFuenteDisponibles: Array<{ value: string; label: string }> // ✅ Lista de fuentes
  defaultAlcance?: 'ESPECIFICO_FUENTE' | 'COMPARTIDO_CLIENTE' // ✅ Pre-selección de alcance
}

// Auto-genera paso_identificador desde título (snake_case, sin acentos)
function autoIdentificador(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
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
  const [opcAvanzadasOpen, setOpcAvanzadasOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<CrearRequisitoDTO>>(() => {
    let tipoFuenteInicial: string | string[]
    if (requisitoEditar) {
      if (requisitoEditar.alcance === 'COMPARTIDO_CLIENTE') {
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
      paso_identificador: requisitoEditar?.paso_identificador ?? '',
      titulo: requisitoEditar?.titulo ?? '',
      descripcion: requisitoEditar?.descripcion ?? '',
      instrucciones: requisitoEditar?.instrucciones ?? '',
      nivel_validacion: requisitoEditar?.nivel_validacion ?? 'DOCUMENTO_OBLIGATORIO',
      tipo_documento_sugerido: requisitoEditar?.tipo_documento_sugerido ?? '',
      categoria_documento: requisitoEditar?.categoria_documento ?? '',
      alcance: requisitoEditar?.alcance ?? defaultAlcance,
      orden: requisitoEditar?.orden ?? ordenSiguiente,
    }
  })

  const modoEdicion = !!requisitoEditar

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Al cambiar título en modo creación → auto-generar paso_identificador
  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoTitulo = e.target.value
    setFormData((prev) => ({
      ...prev,
      titulo: nuevoTitulo,
      ...(!modoEdicion && { paso_identificador: autoIdentificador(nuevoTitulo) }),
    }))
  }

  // Cambio de alcance: si cambia a ESPECÍFICO, restaurar tipo_fuente al tab actual
  const handleAlcanceChange = (nuevoAlcance: 'ESPECIFICO_FUENTE' | 'COMPARTIDO_CLIENTE') => {
    setFormData((prev) => ({
      ...prev,
      alcance: nuevoAlcance,
      tipo_fuente: nuevoAlcance === 'COMPARTIDO_CLIENTE'
        ? tiposFuenteDisponibles.map((f) => f.value)
        : [tipoFuente],
    }))
  }

  // Handler para checkbox de fuentes múltiples (solo visible en COMPARTIDO)
  const handleFuenteToggle = (fuenteValue: string) => {
    setFormData((prev) => {
      const fuentes = Array.isArray(prev.tipo_fuente) ? prev.tipo_fuente : [prev.tipo_fuente ?? tipoFuente]
      const yaSeleccionada = fuentes.includes(fuenteValue)
      const nuevasFuentes = yaSeleccionada
        ? fuentes.filter((f) => f !== fuenteValue)
        : [...fuentes, fuenteValue]
      return { ...prev, tipo_fuente: nuevasFuentes.length > 0 ? nuevasFuentes : [tipoFuente] }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.paso_identificador || !formData.titulo || !formData.nivel_validacion) {
      toast.info('Los campos marcados con * son obligatorios')
      return
    }
    // tipo_documento_sugerido siempre sincronizado con titulo
    const dataToSave: CrearRequisitoDTO = {
      ...(formData as CrearRequisitoDTO),
      tipo_documento_sugerido: formData.titulo ?? '',
    }
    onGuardar(dataToSave)
  }

  const esCompartido = formData.alcance === 'COMPARTIDO_CLIENTE'
  const fuentesSeleccionadas = Array.isArray(formData.tipo_fuente)
    ? formData.tipo_fuente
    : [formData.tipo_fuente ?? tipoFuente]

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

      <div className="space-y-3">
        {/* ── ALCANCE: Pill toggle ── */}
        <div>
          <label className={styles.form.label}>Alcance *</label>
          <div className="flex gap-0 rounded-lg border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-50 dark:bg-gray-900/50 w-fit">
            <button
              type="button"
              onClick={() => handleAlcanceChange('ESPECIFICO_FUENTE')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                !esCompartido
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              ⚡ Específico
            </button>
            <button
              type="button"
              onClick={() => handleAlcanceChange('COMPARTIDO_CLIENTE')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                esCompartido
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              ↔ Compartido
            </button>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            {esCompartido
              ? 'El cliente sube el documento UNA sola vez, válido para todas las fuentes marcadas.'
              : 'El cliente sube un documento diferente por cada fuente de pago.'}
          </p>
        </div>

        {/* ── FUENTES (solo visible en COMPARTIDO) ── */}
        <AnimatePresence>
          {esCompartido && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-1">
                <label className={styles.form.label}>
                  Fuentes aplicables
                  <span className="ml-1 text-[10px] text-gray-500">(sin selección = todas)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {tiposFuenteDisponibles.map((fuente) => {
                    const seleccionada = fuentesSeleccionadas.includes(fuente.value)
                    return (
                      <label
                        key={fuente.value}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border-2 transition-all cursor-pointer text-xs font-medium ${
                          seleccionada
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-gray-900 dark:text-white'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionada}
                          onChange={() => handleFuenteToggle(fuente.value)}
                          className="rounded"
                        />
                        {fuente.label}
                      </label>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TÍTULO ── */}
        <div>
          <label className={styles.form.label}>Título *</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleTituloChange}
            placeholder="Ej: Boleta de Registro"
            className={styles.form.input}
            required
          />
          {/* paso_identificador: auto en creación, readonly en edición */}
          {modoEdicion ? (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              ID: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{formData.paso_identificador}</code>
            </p>
          ) : (
            formData.paso_identificador ? (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                ID auto: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{formData.paso_identificador}</code>
              </p>
            ) : null
          )}
        </div>

        {/* ── DESCRIPCIÓN ── */}
        <div>
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

        {/* ── NIVEL DE VALIDACIÓN ── */}
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

        {/* ── OPCIONES AVANZADAS (acordeón) ── */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setOpcAvanzadasOpen((o) => !o)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span>Opciones avanzadas</span>
            <motion.span
              animate={{ rotate: opcAvanzadasOpen ? 180 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.span>
          </button>
          <AnimatePresence>
            {opcAvanzadasOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                  {/* Instrucciones */}
                  <div>
                    <label className={styles.form.label}>Instrucciones para el usuario</label>
                    <textarea
                      name="instrucciones"
                      value={formData.instrucciones}
                      onChange={handleChange}
                      placeholder="Instrucciones detalladas de qué debe subir"
                      rows={2}
                      className={styles.form.textarea}
                    />
                  </div>
                  {/* Categoría */}
                  <div>
                    <label className={styles.form.label}>Categoría de documento</label>
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
              </motion.div>
            )}
          </AnimatePresence>
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

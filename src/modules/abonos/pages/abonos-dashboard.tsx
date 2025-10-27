'use client'

/**
 * 💰 DASHBOARD - MÓDULO DE ABONOS
 *
 * Página principal del sistema de gestión de abonos.
 *
 * ⭐ REFACTORIZADO: Usa componentes shared
 */

import { StatCard } from '@/shared/components/display'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle2,
    CreditCard,
    DollarSign,
    FileText,
    Plus,
    RefreshCw,
    TrendingUp,
    X,
} from 'lucide-react'
import { useState } from 'react'
import { useAbonos } from '../hooks/useAbonos'
import { useRegistrarAbono } from '../hooks/useRegistrarAbono'
import { METODOS_PAGO_OPTIONS, TIPO_FUENTE_LABELS } from '../types'

export function AbonosDashboard() {
  const {
    negociaciones,
    negociacionSeleccionada,
    negociacionActual,
    fuentesPago,
    historial,
    isLoading,
    isSubmitting,
    error: errorAbonos,
    seleccionarNegociacion,
    crearAbono,
    refrescar,
    estadisticas,
  } = useAbonos();

  const {
    formData,
    errors: errorsForm,
    actualizarCampo,
    validarFormulario,
    resetear,
    prepararDTO,
  } = useRegistrarAbono();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [exitoModal, setExitoModal] = useState(false);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleAbrirModal = () => {
    if (!negociacionSeleccionada) {
      alert('Debe seleccionar una negociación primero');
      return;
    }
    resetear();
    setErrorModal(null);
    setExitoModal(false);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    resetear();
    setErrorModal(null);
    setExitoModal(false);
  };

  const handleSubmitAbono = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    if (!negociacionSeleccionada) {
      setErrorModal('Debe seleccionar una negociación');
      return;
    }

    try {
      setErrorModal(null);
      const dto = prepararDTO(negociacionSeleccionada);
      await crearAbono(dto);

      setExitoModal(true);
      setTimeout(() => {
        handleCerrarModal();
      }, 2000);
    } catch (err: any) {
      setErrorModal(err.message || 'Error al registrar el abono');
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (isLoading && negociaciones.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando negociaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Abonos</h1>
            <p className="text-gray-600 mt-1">Registre y consulte los abonos de las negociaciones activas</p>
          </div>
          <button
            onClick={refrescar}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Error Global */}
      {errorAbonos && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600 mt-1">{errorAbonos}</p>
          </div>
        </motion.div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={FileText}
          label="Negociaciones Activas"
          value={estadisticas.totalNegociaciones}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Abonos"
          value={estadisticas.totalAbonos}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="Monto Total Abonado"
          value={`$${estadisticas.montoTotalAbonado.toLocaleString('es-CO')}`}
          color="purple"
        />
        <StatCard
          icon={CreditCard}
          label="Promedio por Abono"
          value={`$${Math.round(estadisticas.promedioAbono).toLocaleString('es-CO')}`}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Selector de Negociación */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Negociación</h2>

            {negociaciones.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No hay negociaciones activas</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {negociaciones.map((negociacion) => (
                  <button
                    key={negociacion.id}
                    onClick={() => seleccionarNegociacion(negociacion.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      negociacionSeleccionada === negociacion.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {negociacion.cliente.nombres} {negociacion.cliente.apellidos}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {negociacion.proyecto?.nombre || 'Cargando proyecto...'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Vivienda {negociacion.vivienda.numero}
                        </p>
                      </div>
                      {negociacionSeleccionada === negociacion.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Valor Total</span>
                        <span className="font-semibold text-gray-900">
                          ${(negociacion.valor_total || 0).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-gray-600">Abonado</span>
                        <span className="font-semibold text-green-600">
                          ${(negociacion.total_abonado || 0).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-gray-600">Saldo</span>
                        <span className="font-semibold text-orange-600">
                          ${(negociacion.saldo_pendiente || 0).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Fuentes de Pago e Historial */}
        <div className="lg:col-span-2 space-y-6">
          {!negociacionSeleccionada ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Seleccione una negociación para ver los detalles</p>
            </div>
          ) : (
            <>
              {/* Fuentes de Pago */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Fuentes de Pago</h2>
                  <button
                    onClick={handleAbrirModal}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Abono
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fuentesPago.map((fuente) => (
                    <div
                      key={fuente.id}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {TIPO_FUENTE_LABELS[fuente.tipo]}
                          </p>
                          {fuente.entidad && (
                            <p className="text-xs text-gray-600 mt-1">{fuente.entidad}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            fuente.porcentaje_completado >= 100
                              ? 'bg-green-100 text-green-700'
                              : fuente.porcentaje_completado > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {fuente.porcentaje_completado.toFixed(0)}%
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Aprobado</span>
                          <span className="font-medium text-gray-900">
                            ${fuente.monto_aprobado.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recibido</span>
                          <span className="font-medium text-green-600">
                            ${fuente.monto_recibido.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saldo</span>
                          <span className="font-medium text-orange-600">
                            ${fuente.saldo_pendiente.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>

                      {/* Barra de Progreso */}
                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${Math.min(fuente.porcentaje_completado, 100)}%` }}
                        />
                      </div>

                      {fuente.abonos.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {fuente.abonos.length} abono{fuente.abonos.length !== 1 ? 's' : ''} registrado{fuente.abonos.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial de Abonos */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Abonos</h2>

                {historial.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">No hay abonos registrados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Fecha</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Fuente</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Monto</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Método</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Referencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map((abono) => {
                          const fuente = fuentesPago.find((f) => f.id === abono.fuente_pago_id);
                          return (
                            <tr key={abono.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-2 text-gray-900">
                                {new Date(abono.fecha_abono).toLocaleDateString('es-CO')}
                              </td>
                              <td className="py-3 px-2 text-gray-700">
                                {fuente ? TIPO_FUENTE_LABELS[fuente.tipo] : 'N/A'}
                              </td>
                              <td className="py-3 px-2 text-right font-semibold text-green-600">
                                ${abono.monto.toLocaleString('es-CO')}
                              </td>
                              <td className="py-3 px-2 text-gray-700">{abono.metodo_pago}</td>
                              <td className="py-3 px-2 text-gray-600 text-xs">
                                {abono.numero_referencia || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Registrar Abono */}
      <AnimatePresence>
        {modalAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleCerrarModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Registrar Abono</h3>
                <button
                  onClick={handleCerrarModal}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {exitoModal ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900">¡Abono registrado exitosamente!</p>
                  <p className="text-sm text-gray-600 mt-2">Los montos se actualizaron automáticamente</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitAbono} className="space-y-4">
                  {/* Fuente de Pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuente de Pago <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.fuente_pago_id}
                      onChange={(e) => actualizarCampo('fuente_pago_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione una fuente</option>
                      {fuentesPago.map((fuente) => (
                        <option key={fuente.id} value={fuente.id}>
                          {TIPO_FUENTE_LABELS[fuente.tipo]} - Saldo: ${fuente.saldo_pendiente.toLocaleString('es-CO')}
                        </option>
                      ))}
                    </select>
                    {errorsForm.fuente_pago_id && (
                      <p className="text-xs text-red-600 mt-1">{errorsForm.fuente_pago_id}</p>
                    )}
                  </div>

                  {/* Monto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.monto || ''}
                      onChange={(e) => actualizarCampo('monto', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                    {errorsForm.monto && (
                      <p className="text-xs text-red-600 mt-1">{errorsForm.monto}</p>
                    )}
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha del Abono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_abono}
                      onChange={(e) => actualizarCampo('fecha_abono', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errorsForm.fecha_abono && (
                      <p className="text-xs text-red-600 mt-1">{errorsForm.fecha_abono}</p>
                    )}
                  </div>

                  {/* Método de Pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de Pago <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.metodo_pago}
                      onChange={(e) => actualizarCampo('metodo_pago', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {METODOS_PAGO_OPTIONS.map((opcion) => (
                        <option key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Número de Referencia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Referencia
                    </label>
                    <input
                      type="text"
                      value={formData.numero_referencia}
                      onChange={(e) => actualizarCampo('numero_referencia', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: TRX-001"
                    />
                    {errorsForm.numero_referencia && (
                      <p className="text-xs text-yellow-600 mt-1">{errorsForm.numero_referencia}</p>
                    )}
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={formData.notas}
                      onChange={(e) => actualizarCampo('notas', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>

                  {/* Error */}
                  {errorModal && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{errorModal}</p>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCerrarModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Registrando...' : 'Registrar Abono'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

// =====================================================
// HOOK: useAbonos
// Hook principal para el módulo de abonos
// =====================================================

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    obtenerFuentesPagoConAbonos,
    obtenerHistorialAbonos,
    obtenerNegociacionesActivas,
    registrarAbono,
} from '../services/abonos.service';
import type {
    AbonoHistorial,
    CrearAbonoDTO,
    FuentePagoConAbonos,
    NegociacionConAbonos,
} from '../types';

export function useAbonos() {
  // Estado
  const [negociaciones, setNegociaciones] = useState<NegociacionConAbonos[]>([]);
  const [negociacionSeleccionada, setNegociacionSeleccionada] = useState<string | null>(null);
  const [fuentesPago, setFuentesPago] = useState<FuentePagoConAbonos[]>([]);
  const [historial, setHistorial] = useState<AbonoHistorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datosInicializados, setDatosInicializados] = useState(false);
  /** Solo Admin: muestra abonos anulados en la lista */
  const [mostrarAnulados, setMostrarAnulados] = useState(false);

  // Cargar negociaciones activas al montar (solo si no están inicializados)
  useEffect(() => {
    let cancelado = false

    if (!datosInicializados) {
      cargarNegociaciones().catch(error => {
        if (!cancelado) {
          console.error('💰 [ABONOS HOOK] Error en carga inicial:', error)
        }
      })
      if (!cancelado) {
        setDatosInicializados(true)
      }
    }

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datosInicializados])

  // Cargar fuentes e historial cuando se selecciona una negociación
  useEffect(() => {
    let cancelado = false

    if (negociacionSeleccionada) {
      cargarDatosNegociacion(negociacionSeleccionada).catch(error => {
        if (!cancelado) {
          console.error('💰 [ABONOS HOOK] Error cargando datos negociación:', error)
        }
      })
    } else {
      if (!cancelado) {
        setFuentesPago([])
        setHistorial([])
      }
    }

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negociacionSeleccionada])

  // =====================================================
  // FUNCIONES
  // =====================================================

  const cargarNegociaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await obtenerNegociacionesActivas();
      setNegociaciones(data);
    } catch (err: any) {
      console.error('❌ Hook: Error cargando negociaciones:', err);
      setError(err.message || 'Error al cargar negociaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarDatosNegociacion = useCallback(async (negociacionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar fuentes de pago con abonos
      const fuentes = await obtenerFuentesPagoConAbonos(negociacionId);
      setFuentesPago(fuentes);

      // Cargar historial completo
      const hist = await obtenerHistorialAbonos({ negociacion_id: negociacionId });
      setHistorial(hist);
    } catch (err: any) {
      console.error('❌ Error cargando datos de negociación:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const seleccionarNegociacion = useCallback((negociacionId: string | null) => {
    setNegociacionSeleccionada(negociacionId);
  }, []);

  const crearAbono = useCallback(
    async (datos: CrearAbonoDTO) => {
      if (!negociacionSeleccionada) {
        throw new Error('Debe seleccionar una negociación');
      }

      try {
        setIsSubmitting(true);
        setError(null);

        // Registrar abono
        await registrarAbono(datos);

        // Recargar datos
        await cargarDatosNegociacion(negociacionSeleccionada);

        return true;
      } catch (err: any) {
        console.error('❌ Error creando abono:', err);
        setError(err.message || 'Error al registrar abono');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [negociacionSeleccionada, cargarDatosNegociacion]
  );

  const refrescar = useCallback(async () => {
    await cargarNegociaciones();
    if (negociacionSeleccionada) {
      await cargarDatosNegociacion(negociacionSeleccionada);
    }
  }, [negociacionSeleccionada, cargarNegociaciones, cargarDatosNegociacion]);

  const toggleMostrarAnulados = useCallback(() => {
    setMostrarAnulados((v) => !v);
  }, []);

  // =====================================================
  // VALORES CALCULADOS
  // =====================================================

  const negociacionActual = negociaciones.find((n) => n.id === negociacionSeleccionada) || null;

  /** Historial filtrado según toggle (anulados ocultos por defecto) */
  const historialVisible = useMemo(
    () => (mostrarAnulados ? historial : historial.filter((a) => !a.estado || a.estado === 'Activo')),
    [historial, mostrarAnulados]
  );

  /** Abonos activos para cálculos financieros (siempre sin anulados) */
  const historialActivo = useMemo(
    () => historial.filter((a) => !a.estado || a.estado === 'Activo'),
    [historial]
  );

  const estadisticas = {
    totalNegociaciones: negociaciones.length,
    totalAbonos: historialActivo.length,
    montoTotalAbonado: historialActivo.reduce((sum, a) => sum + a.monto, 0),
    totalAbonado: negociaciones.reduce((sum, n) => sum + (n.total_abonado || 0), 0),
    totalVentas: negociaciones.reduce((sum, n) => sum + (n.valor_total || 0), 0),
    saldoPendiente: negociaciones.reduce((sum, n) => sum + (n.saldo_pendiente || 0), 0),
    promedioAbono: historialActivo.length > 0
      ? historialActivo.reduce((sum, a) => sum + a.monto, 0) / historialActivo.length
      : 0,
  };

  return {
    // Estado
    negociaciones,
    negociacionSeleccionada,
    negociacionActual,
    fuentesPago,
    historial,
    historialVisible,
    isLoading,
    isSubmitting,
    error,
    mostrarAnulados,

    // Funciones
    seleccionarNegociacion,
    crearAbono,
    refrescar,
    toggleMostrarAnulados,

    // Valores calculados
    estadisticas,
  };
}

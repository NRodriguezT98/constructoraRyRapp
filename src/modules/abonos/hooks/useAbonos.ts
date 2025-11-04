'use client';

// =====================================================
// HOOK: useAbonos
// Hook principal para el módulo de abonos
// =====================================================

import { useCallback, useEffect, useState } from 'react';
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
  const [datosInicializados, setDatosInicializados] = useState(false); // Flag para evitar cargas duplicadas

  // Cargar negociaciones activas al montar (solo si no están inicializados)
  useEffect(() => {
    if (!datosInicializados) {
      console.log('💰 [ABONOS HOOK] Cargando datos iniciales...')
      cargarNegociaciones();
      setDatosInicializados(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datosInicializados]);

  // Cargar fuentes e historial cuando se selecciona una negociación
  useEffect(() => {
    if (negociacionSeleccionada) {
      cargarDatosNegociacion(negociacionSeleccionada);
    } else {
      setFuentesPago([]);
      setHistorial([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negociacionSeleccionada]);

  // =====================================================
  // FUNCIONES
  // =====================================================

  const cargarNegociaciones = useCallback(async () => {
    try {
      console.log('🔄 Hook: Iniciando carga de negociaciones...');
      setIsLoading(true);
      setError(null);
      const data = await obtenerNegociacionesActivas();
      console.log('✅ Hook: Negociaciones cargadas:', data.length);
      setNegociaciones(data);
    } catch (err: any) {
      console.error('❌ Hook: Error cargando negociaciones:', err);
      setError(err.message || 'Error al cargar negociaciones');
    } finally {
      setIsLoading(false);
      console.log('🏁 Hook: Carga finalizada');
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

  // =====================================================
  // VALORES CALCULADOS
  // =====================================================

  const negociacionActual = negociaciones.find((n) => n.id === negociacionSeleccionada) || null;

  const estadisticas = {
    totalNegociaciones: negociaciones.length,
    totalAbonos: historial.length,
    montoTotalAbonado: historial.reduce((sum, a) => sum + a.monto, 0),
    totalAbonado: negociaciones.reduce((sum, n) => sum + (n.total_abonado || 0), 0),
    totalVentas: negociaciones.reduce((sum, n) => sum + (n.valor_total || 0), 0),
    saldoPendiente: negociaciones.reduce((sum, n) => sum + (n.saldo_pendiente || 0), 0),
    promedioAbono: historial.length > 0
      ? historial.reduce((sum, a) => sum + a.monto, 0) / historial.length
      : 0,
  };

  return {
    // Estado
    negociaciones,
    negociacionSeleccionada,
    negociacionActual,
    fuentesPago,
    historial,
    isLoading,
    isSubmitting,
    error,

    // Funciones
    seleccionarNegociacion,
    crearAbono,
    refrescar,

    // Valores calculados
    estadisticas,
  };
}

'use client';

// =====================================================
// HOOK: useRegistrarAbono
// Hook para formulario de registro de abonos
// =====================================================

import { formatDateToISO, getTodayDateString } from '@/lib/utils/date.utils';
import { useState } from 'react';
import type { CrearAbonoDTO, MetodoPago } from '../types';

interface FormData {
  fuente_pago_id: string;
  monto: number;
  fecha_abono: string;
  metodo_pago: MetodoPago;
  numero_referencia: string;
  notas: string;
}

const initialFormData: FormData = {
  fuente_pago_id: '',
  monto: 0,
  fecha_abono: getTodayDateString(), // ✅ Usar utilidad para evitar problema de timezone
  metodo_pago: 'Transferencia',
  numero_referencia: '',
  notas: '',
};

export function useRegistrarAbono() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // =====================================================
  // VALIDACIONES
  // =====================================================

  const validarFormulario = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fuente_pago_id) {
      newErrors.fuente_pago_id = 'Debe seleccionar una fuente de pago';
    }

    if (formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a cero';
    }

    if (!formData.fecha_abono) {
      newErrors.fecha_abono = 'Debe especificar la fecha del abono';
    }

    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'Debe seleccionar un método de pago';
    }

    // Número de referencia es opcional pero recomendado
    if (formData.metodo_pago !== 'Efectivo' && !formData.numero_referencia) {
      newErrors.numero_referencia = 'Se recomienda ingresar un número de referencia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // HANDLERS
  // =====================================================

  const actualizarCampo = <K extends keyof FormData>(campo: K, valor: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    // Limpiar error del campo al editarlo
    if (errors[campo]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[campo];
        return newErrors;
      });
    }
  };

  const resetear = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const prepararDTO = (negociacionId: string): CrearAbonoDTO => {
    return {
      negociacion_id: negociacionId,
      fuente_pago_id: formData.fuente_pago_id,
      monto: formData.monto,
      fecha_abono: formatDateToISO(formData.fecha_abono), // ✅ Pasar string directamente
      metodo_pago: formData.metodo_pago,
      numero_referencia: formData.numero_referencia || undefined,
      notas: formData.notas || undefined,
    };
  };

  return {
    formData,
    errors,
    actualizarCampo,
    validarFormulario,
    resetear,
    prepararDTO,
  };
}

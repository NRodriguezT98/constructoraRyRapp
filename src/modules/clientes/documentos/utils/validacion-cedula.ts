/**
 * 📋 HELPER: Validación de Cédula
 *
 * Consulta si el cliente tiene cédula subida usando el nuevo sistema
 * (tabla documentos_cliente con es_documento_identidad=true)
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Verifica si el cliente tiene documento de identidad subido
 * @param clienteId - ID del cliente
 * @returns true si tiene cédula, false si no
 */
export async function tieneDocumentoIdentidad(clienteId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('documentos_cliente')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('es_documento_identidad', true)
    .eq('estado', 'Activo')
    .limit(1)
    .single()

  if (error) {
    console.error('Error verificando documento identidad:', error)
    return false
  }

  return !!data
}

/**
 * Hook React para validar documento de identidad de forma reactiva
 */
import { useEffect, useState } from 'react'

export function useTieneDocumentoIdentidad(clienteId: string) {
  const [tieneCedula, setTieneCedula] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function verificar() {
      setCargando(true)
      const tiene = await tieneDocumentoIdentidad(clienteId)
      setTieneCedula(tiene)
      setCargando(false)
    }

    if (clienteId) {
      verificar()
    }
  }, [clienteId])

  return { tieneCedula, cargando }
}

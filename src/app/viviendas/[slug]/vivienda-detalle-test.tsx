'use client'

import { viviendasService } from '@/modules/viviendas/services/viviendas.service'
import { useQuery } from '@tanstack/react-query'

interface ViviendaDetalleTestProps {
  viviendaId: string
}

/**
 * 🧪 TEST PROGRESIVO - Fase 1: Solo Query
 * Si esto funciona → El error está en la UI
 * Si esto crashea → El error está en useViviendaQuery o formatters
 */
export default function ViviendaDetalleTest({ viviendaId }: ViviendaDetalleTestProps) {
  console.log('🧪 [TEST] Fase 1 - Iniciando con query')
  console.log('🧪 [TEST] viviendaId recibido:', viviendaId)

  const { data: vivienda, isLoading, error } = useQuery({
    queryKey: ['vivienda-test', viviendaId],
    queryFn: async () => {
      console.log('🧪 [TEST] Ejecutando queryFn con ID:', viviendaId)
      try {
        const result = await viviendasService.obtenerVivienda(viviendaId)
        console.log('🧪 [TEST] Resultado del service:', result)
        return result
      } catch (err) {
        console.error('🧪 [TEST] ❌ Error en queryFn:', err)
        throw err
      }
    },
    enabled: !!viviendaId,
  })

  console.log('🧪 [TEST] Estado query:', {
    hasData: !!vivienda,
    isLoading,
    hasError: !!error,
    viviendaId
  })

  if (isLoading) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fef3c7', color: '#78350f' }}>
        <h2>🧪 TEST - Fase 1: Query</h2>
        <p>⏳ Cargando datos...</p>
        <p>ID: {viviendaId}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
        <h2>🧪 TEST - Fase 1: Query</h2>
        <p>❌ Error: {(error as Error).message}</p>
        <pre style={{ fontSize: '12px', marginTop: '10px' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }

  if (!vivienda) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
        <h2>🧪 TEST - Fase 1: Query</h2>
        <p>❌ Vivienda no encontrada</p>
        <p>ID buscado: {viviendaId}</p>
        <p>Estado query: {isLoading ? 'Cargando' : 'Completado'}</p>
        <p>Tiene error: {error ? 'Sí' : 'No'}</p>
      </div>
    )
  }

  console.log('🧪 [TEST] ✅ Query exitoso, datos recibidos:', {
    numero: vivienda.numero,
    estado: vivienda.estado,
    manzana: vivienda.manzanas?.nombre
  })

  return (
    <div style={{ padding: '20px', backgroundColor: '#d1fae5', color: '#065f46' }}>
      <h2>🧪 TEST - Fase 1: Query ✅</h2>
      <ul>
        <li>✅ Query ejecutado exitosamente</li>
        <li>✅ Datos recibidos correctamente</li>
        <li>📦 Vivienda: {vivienda.numero}</li>
        <li>📊 Estado: {vivienda.estado}</li>
        <li>🏘️ Manzana: {vivienda.manzanas?.nombre || 'N/A'}</li>
      </ul>
      <details style={{ marginTop: '20px', fontSize: '12px' }}>
        <summary>Ver datos completos</summary>
        <pre>{JSON.stringify(vivienda, null, 2)}</pre>
      </details>
      <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.8 }}>
        ⚠️ Si ves este mensaje verde, el query funciona. El error está en la UI del componente completo.
      </p>
    </div>
  )
}

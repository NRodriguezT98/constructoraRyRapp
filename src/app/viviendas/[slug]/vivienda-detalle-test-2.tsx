'use client'

import { viviendasService } from '@/modules/viviendas/services/viviendas.service'
import { formatCurrency } from '@/modules/viviendas/utils'
import { formatArea } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'

interface ViviendaDetalleTest2Props {
  viviendaId: string
}

/**
 * 🧪 TEST FASE 2 - Query + Formatters
 * Probar si los formatters causan el crash
 */
export default function ViviendaDetalleTest2({ viviendaId }: ViviendaDetalleTest2Props) {
  console.log('🧪 [TEST 2] Fase 2 - Query + Formatters')

  const { data: vivienda, isLoading, error } = useQuery({
    queryKey: ['vivienda-test-2', viviendaId],
    queryFn: async () => {
      console.log('🧪 [TEST 2] Ejecutando query...')
      const result = await viviendasService.obtenerVivienda(viviendaId)
      console.log('🧪 [TEST 2] Resultado:', result)
      return result
    },
    enabled: !!viviendaId,
  })

  if (isLoading) {
    return <div style={{ padding: '20px', backgroundColor: '#fef3c7' }}>⏳ Cargando...</div>
  }

  if (error || !vivienda) {
    return <div style={{ padding: '20px', backgroundColor: '#fee2e2' }}>❌ Error</div>
  }

  console.log('🧪 [TEST 2] Probando formatters...')

  // 🧪 PROBAR FORMATTERS UNO POR UNO
  let areaFormateada = 'ERROR'
  let currencyFormateado = 'ERROR'

  try {
    console.log('🧪 [TEST 2] Formateando área:', vivienda.area)
    areaFormateada = formatArea(vivienda.area)
    console.log('🧪 [TEST 2] ✅ Área formateada:', areaFormateada)
  } catch (err) {
    console.error('🧪 [TEST 2] ❌ ERROR en formatArea:', err)
    areaFormateada = `ERROR: ${err}`
  }

  try {
    console.log('🧪 [TEST 2] Formateando currency:', vivienda.valor_base)
    currencyFormateado = formatCurrency(vivienda.valor_base)
    console.log('🧪 [TEST 2] ✅ Currency formateado:', currencyFormateado)
  } catch (err) {
    console.error('🧪 [TEST 2] ❌ ERROR en formatCurrency:', err)
    currencyFormateado = `ERROR: ${err}`
  }

  console.log('🧪 [TEST 2] ✅ Formatters completados sin crash')

  return (
    <div style={{ padding: '20px', backgroundColor: '#d1fae5', color: '#065f46' }}>
      <h2>🧪 TEST Fase 2: Formatters ✅</h2>
      <ul style={{ marginTop: '10px' }}>
        <li>✅ Query exitoso</li>
        <li>✅ formatArea ejecutado</li>
        <li>✅ formatCurrency ejecutado</li>
      </ul>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', color: 'black', borderRadius: '8px' }}>
        <p><strong>Vivienda:</strong> {vivienda.numero}</p>
        <p><strong>Estado:</strong> {vivienda.estado}</p>
        <p><strong>Manzana:</strong> {vivienda.manzanas?.nombre || 'N/A'}</p>
        <p><strong>Área:</strong> {areaFormateada}</p>
        <p><strong>Valor Base:</strong> {currencyFormateado}</p>
      </div>
      <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.8 }}>
        ⚠️ Si ves esto, los formatters funcionan. El problema está en los componentes de UI (framer-motion, tabs, etc.)
      </p>
    </div>
  )
}

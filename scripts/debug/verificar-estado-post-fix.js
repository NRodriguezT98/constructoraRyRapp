/**
 * ============================================
 * SCRIPT: Verificar Estado del Cliente Después de Fix
 * ============================================
 * Propósito: Confirmar que el cliente Pedrito tiene estado correcto
 * y que el nuevo estado "Renunció" está disponible
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouhfqwpvzbjtrzotssco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aGZxd3B2emJqdHJ6b3Rzc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyNjIxNjEsImV4cCI6MjA0MzgzODE2MX0.gqo_v_1gOWECjZQNPTHDqoSxLXCEb6-wR2PWaE_bIpo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarEstados() {
  console.log('============================================')
  console.log('🔍 VERIFICACIÓN DE ESTADOS POST-FIX')
  console.log('============================================\n')

  // 1. Verificar estado actual del cliente Pedrito
  console.log('1️⃣ Estado actual del cliente Pedrito:\n')

  const { data: cliente, error: errorCliente } = await supabase
    .from('clientes')
    .select('id, nombres, apellidos, numero_documento, estado')
    .eq('numero_documento', '1233333')
    .single()

  if (errorCliente) {
    console.error('❌ Error:', errorCliente.message)
  } else {
    console.log('👤 Nombre:', `${cliente.nombres} ${cliente.apellidos}`)
    console.log('📄 Documento:', cliente.numero_documento)
    console.log('📊 Estado:', cliente.estado)

    if (cliente.estado === 'Activo') {
      console.log('\n⚠️  TODAVÍA ACTIVO - Necesitas ejecutar la desvinculación de nuevo')
    } else if (cliente.estado === 'Renunció') {
      console.log('\n✅ PERFECTO - Estado actualizado correctamente a "Renunció"')
    } else {
      console.log('\n🔸 Estado actual:', cliente.estado)
    }
  }

  // 2. Verificar estado de la vivienda Casa 5
  console.log('\n2️⃣ Estado de Vivienda Casa 5:\n')

  const { data: viviendas, error: errorVivienda } = await supabase
    .from('viviendas')
    .select(`
      id,
      numero,
      estado,
      cliente_id,
      negociacion_id,
      manzanas!inner (nombre)
    `)
    .eq('numero', '5')
    .eq('manzanas.nombre', 'Manzana A')

  if (errorVivienda) {
    console.error('❌ Error:', errorVivienda.message)
  } else if (!viviendas || viviendas.length === 0) {
    console.log('⚠️  No se encontró vivienda Casa 5, Manzana A')
  } else {
    const vivienda = viviendas[0]
    console.log('🏠 Vivienda:', `Casa ${vivienda.numero}`)
    console.log('📊 Estado:', vivienda.estado)
    console.log('👤 Cliente ID:', vivienda.cliente_id || 'NULL ✅')
    console.log('📋 Negociación ID:', vivienda.negociacion_id || 'NULL ✅')

    if (vivienda.estado === 'Disponible' && !vivienda.cliente_id && !vivienda.negociacion_id) {
      console.log('\n✅ PERFECTO - Vivienda disponible sin vínculos')
    } else {
      console.log('\n⚠️  Vivienda aún vinculada - Ejecutar desvinculación de nuevo')
    }
  }

  console.log('\n============================================')
  console.log('🏁 FIN DE VERIFICACIÓN')
  console.log('============================================')
}

verificarEstados().catch(console.error)

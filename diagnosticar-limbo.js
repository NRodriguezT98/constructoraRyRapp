/**
 * ============================================
 * DIAGNÓSTICO: Estado de Limbo después de desvinculación fallida
 * ============================================
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouhfqwpvzbjtrzotssco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aGZxd3B2emJqdHJ6b3Rzc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyNjIxNjEsImV4cCI6MjA0MzgzODE2MX0.gqo_v_1gOWECjZQNPTHDqoSxLXCEb6-wR2PWaE_bIpo'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function diagnosticar() {
  console.log('\n============================================')
  console.log('🔍 DIAGNÓSTICO: Estado de Limbo')
  console.log('============================================\n')

  // 1. Cliente
  console.log('1️⃣ CLIENTE PEDRITO:\n')
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nombres, apellidos, numero_documento, estado')
    .eq('numero_documento', '1233333')
    .single()

  if (cliente) {
    console.log(`   ID: ${cliente.id}`)
    console.log(`   Nombre: ${cliente.nombres} ${cliente.apellidos}`)
    console.log(`   Estado: ${cliente.estado}`)
    console.log(`   ${cliente.estado === 'Activo' ? '❌ AÚN ACTIVO' : cliente.estado === 'Renunció' ? '✅ CORRECTO' : '🔸 ESTADO: ' + cliente.estado}`)
  }

  // 2. Vivienda
  console.log('\n2️⃣ VIVIENDA CASA 5:\n')
  const { data: viviendas } = await supabase
    .from('viviendas')
    .select('id, numero, estado, cliente_id, negociacion_id, manzanas!inner(nombre)')
    .eq('numero', '5')
    .eq('manzanas.nombre', 'Manzana A')

  if (viviendas && viviendas.length > 0) {
    const v = viviendas[0]
    console.log(`   ID: ${v.id}`)
    console.log(`   Número: Casa ${v.numero}`)
    console.log(`   Estado: ${v.estado}`)
    console.log(`   Cliente ID: ${v.cliente_id || 'NULL ✅'}`)
    console.log(`   Negociación ID: ${v.negociacion_id || 'NULL ✅'}`)

    if (v.estado === 'Disponible' && !v.cliente_id && !v.negociacion_id) {
      console.log(`   ✅ VIVIENDA DISPONIBLE (OK)`)
    } else {
      console.log(`   ❌ VIVIENDA EN LIMBO (tiene vínculos)`)
    }
  }

  // 3. Negociaciones
  console.log('\n3️⃣ NEGOCIACIONES DEL CLIENTE:\n')
  const { data: negociaciones } = await supabase
    .from('negociaciones')
    .select('id, cliente_id, vivienda_id, estado')
    .eq('cliente_id', cliente?.id || '')

  if (negociaciones && negociaciones.length > 0) {
    negociaciones.forEach((n, i) => {
      console.log(`   Negociación ${i + 1}:`)
      console.log(`     ID: ${n.id}`)
      console.log(`     Estado: ${n.estado}`)
      console.log(`     Vivienda ID: ${n.vivienda_id}`)
      console.log(`     ❌ NEGOCIACIÓN HUÉRFANA (debería eliminarse)`)
    })
  } else {
    console.log(`   ✅ Sin negociaciones (correcto después de desvinculación)`)
  }

  // 4. Fuentes de pago
  console.log('\n4️⃣ FUENTES DE PAGO:\n')
  if (negociaciones && negociaciones.length > 0) {
    const negIds = negociaciones.map(n => n.id)
    const { data: fuentes } = await supabase
      .from('fuentes_pago')
      .select('id, tipo, estado, monto_aprobado')
      .in('negociacion_id', negIds)

    if (fuentes && fuentes.length > 0) {
      console.log(`   ❌ ${fuentes.length} fuente(s) huérfana(s) encontrada(s):`)
      fuentes.forEach((f, i) => {
        console.log(`     ${i + 1}. ${f.tipo} - ${f.estado} - $${f.monto_aprobado}`)
      })
    } else {
      console.log(`   ✅ Sin fuentes huérfanas`)
    }
  }

  console.log('\n============================================')
  console.log('📊 RESUMEN:')
  console.log('============================================\n')

  const problemas = []

  if (cliente?.estado === 'Activo') {
    problemas.push('❌ Cliente aún en estado "Activo"')
  }

  if (viviendas?.[0]?.cliente_id || viviendas?.[0]?.negociacion_id) {
    problemas.push('❌ Vivienda aún vinculada')
  }

  if (negociaciones && negociaciones.length > 0) {
    problemas.push(`❌ ${negociaciones.length} negociación(es) huérfana(s)`)
  }

  if (problemas.length > 0) {
    console.log('🚨 PROBLEMAS ENCONTRADOS:\n')
    problemas.forEach(p => console.log(`   ${p}`))
    console.log('\n💡 SOLUCIÓN: Ejecutar script de limpieza manual')
  } else {
    console.log('✅ TODO CORRECTO - Sin problemas de limbo')
  }

  console.log('\n============================================\n')
}

diagnosticar().catch(console.error)

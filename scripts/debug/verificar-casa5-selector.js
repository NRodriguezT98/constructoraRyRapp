/**
 * Verificar estado exacto de Casa 5 para selector
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouhfqwpvzbjtrzotssco.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aGZxd3B2emJqdHJ6b3Rzc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyNjIxNjEsImV4cCI6MjA0MzgzODE2MX0.gqo_v_1gOWECjZQNPTHDqoSxLXCEb6-wR2PWaE_bIpo'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

async function verificar() {
  console.log('\n============================================')
  console.log('🔍 VERIFICAR: Estado de Casa 5 para Selector')
  console.log('============================================\n')

  // Buscar Casa 5 en Manzana A
  const { data: viviendas, error } = await supabase
    .from('viviendas')
    .select(
      `
      id,
      numero,
      estado,
      cliente_id,
      negociacion_id,
      manzanas!inner (nombre, proyecto_id, proyectos(nombre))
    `
    )
    .eq('numero', '5')
    .eq('manzanas.nombre', 'Manzana A')

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  if (!viviendas || viviendas.length === 0) {
    console.log('❌ No se encontró Casa 5 en Manzana A')
    return
  }

  const casa = viviendas[0]

  console.log('📋 DATOS DE LA VIVIENDA:\n')
  console.log(`   ID: ${casa.id}`)
  console.log(`   Número: Casa ${casa.numero}`)
  console.log(`   Manzana: ${casa.manzanas.nombre}`)
  console.log(`   Proyecto: ${casa.manzanas.proyectos?.nombre || 'N/A'}`)
  console.log(`   Estado: ${casa.estado}`)
  console.log(`   Cliente ID: ${casa.cliente_id || 'NULL ✅'}`)
  console.log(`   Negociación ID: ${casa.negociacion_id || 'NULL ✅'}`)

  console.log('\n🔍 ANÁLISIS PARA SELECTOR:\n')

  const problemas = []

  if (casa.estado !== 'Disponible') {
    problemas.push(`❌ Estado no es "Disponible" → actual: "${casa.estado}"`)
  }

  if (casa.cliente_id !== null) {
    problemas.push(`❌ Tiene cliente_id: ${casa.cliente_id}`)
  }

  if (casa.negociacion_id !== null) {
    problemas.push(`❌ Tiene negociacion_id: ${casa.negociacion_id}`)
  }

  if (problemas.length > 0) {
    console.log('🚨 PROBLEMAS ENCONTRADOS:\n')
    problemas.forEach(p => console.log(`   ${p}`))
    console.log(
      '\n💡 SOLUCIÓN: La vivienda NO aparecerá en el selector hasta que:'
    )
    console.log('   1. estado = "Disponible"')
    console.log('   2. cliente_id = NULL')
    console.log('   3. negociacion_id = NULL')
  } else {
    console.log('✅ TODO CORRECTO - La vivienda DEBE aparecer en el selector')
    console.log('\n🔍 Si no aparece, verificar:')
    console.log('   1. Proyecto ID correcto en el filtro del selector')
    console.log('   2. Cache de React Query (invalidar con F5)')
    console.log('   3. Console del navegador para errores')
  }

  console.log('\n============================================\n')
}

verificar().catch(console.error)

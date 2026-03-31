/**
 * Buscar cliente Pedrito sin filtro estricto
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouhfqwpvzbjtrzotssco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aGZxd3B2emJqdHJ6b3Rzc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyNjIxNjEsImV4cCI6MjA0MzgzODE2MX0.gqo_v_1gOWECjZQNPTHDqoSxLXCEb6-wR2PWaE_bIpo'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function buscar() {
  console.log('\n🔍 Buscando clientes con "Pedrito"...\n')

  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('id, nombres, apellidos, numero_documento, estado')
    .ilike('nombres', '%Pedrito%')

  if (error) {
    console.error('Error:', error.message)
    return
  }

  if (!clientes || clientes.length === 0) {
    console.log('❌ No se encontró ningún cliente con "Pedrito"')
    console.log('\n🔍 Buscando todas las viviendas Casa 5...\n')

    const { data: viviendas } = await supabase
      .from('viviendas')
      .select('id, numero, estado, cliente_id, negociacion_id, manzanas(nombre)')
      .eq('numero', '5')

    console.log('Viviendas encontradas:', viviendas?.length || 0)
    if (viviendas) {
      viviendas.forEach(v => {
        console.log(`\n  Casa ${v.numero}:`)
        console.log(`    Estado: ${v.estado}`)
        console.log(`    Cliente ID: ${v.cliente_id || 'NULL'}`)
        console.log(`    Negociación ID: ${v.negociacion_id || 'NULL'}`)
        console.log(`    Manzana: ${JSON.stringify(v.manzanas)}`)
      })
    }
  } else {
    console.log(`✅ Encontrado(s) ${clientes.length} cliente(s):\n`)
    clientes.forEach((c, i) => {
      console.log(`${i + 1}. ${c.nombres} ${c.apellidos}`)
      console.log(`   Documento: ${c.numero_documento}`)
      console.log(`   Estado: ${c.estado}`)
      console.log(`   ID: ${c.id}\n`)
    })
  }
}

buscar().catch(console.error)

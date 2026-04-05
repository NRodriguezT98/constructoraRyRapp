/**
 * Script para verificar viviendas asignadas
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarViviendas() {
  console.log('🔍 Verificando viviendas asignadas...\n')

  const { data: viviendas } = await supabase
    .from('viviendas')
    .select('*, clientes(nombres, apellidos, estado), manzanas(nombre)')
    .eq('estado', 'Asignada')
    .order('fecha_asignacion', { ascending: false })

  if (viviendas && viviendas.length > 0) {
    console.log(`🏠 VIVIENDAS ASIGNADAS (${viviendas.length}):\n`)
    viviendas.forEach((v, i) => {
      console.log(
        `${i + 1}. Vivienda ${v.manzanas?.nombre || 'N/A'}${v.numero}`
      )
      console.log(`   ID: ${v.id}`)
      console.log(`   Cliente: ${v.clientes?.nombres} ${v.clientes?.apellidos}`)
      console.log(`   Estado Cliente: ${v.clientes?.estado}`)
      console.log(`   Cliente ID: ${v.cliente_id}`)
      console.log(`   Negociación ID: ${v.negociacion_id || 'N/A'}`)
      console.log(`   Fecha asignación: ${v.fecha_asignacion}`)
      console.log('')
    })

    // Verificar si hay viviendas asignadas sin negociación
    const sinNegociacion = viviendas.filter(v => !v.negociacion_id)
    if (sinNegociacion.length > 0) {
      console.log(
        `⚠️ ${sinNegociacion.length} vivienda(s) asignada(s) SIN negociación_id:\n`
      )
      sinNegociacion.forEach(v => {
        console.log(
          `   - ${v.manzanas?.nombre}${v.numero} (Cliente: ${v.clientes?.nombres} ${v.clientes?.apellidos})`
        )
      })
    }
  } else {
    console.log('✅ No hay viviendas en estado "Asignada"')
  }
}

verificarViviendas()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

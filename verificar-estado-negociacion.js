/**
 * Script para verificar el estado de una negociación reciente
 * Muestra qué se creó exactamente en la BD
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verificarEstado() {
  console.log('🔍 Verificando estado de la base de datos...\n')

  // 1. Última negociación creada
  const { data: negociaciones } = await supabase
    .from('negociaciones')
    .select('*, clientes(nombres, apellidos), viviendas(numero, manzanas(nombre))')
    .order('fecha_creacion', { ascending: false })
    .limit(1)

  if (negociaciones && negociaciones.length > 0) {
    const neg = negociaciones[0]
    console.log('📋 ÚLTIMA NEGOCIACIÓN:')
    console.log(`   ID: ${neg.id}`)
    console.log(`   Cliente: ${neg.clientes?.nombres} ${neg.clientes?.apellidos}`)
    console.log(`   Vivienda: ${neg.viviendas?.manzanas?.nombre}${neg.viviendas?.numero}`)
    console.log(`   Estado: ${neg.estado}`)
    console.log(`   Fecha: ${neg.fecha_creacion}`)
    console.log('')

    // 2. Fuentes de pago de esta negociación
    const { data: fuentes } = await supabase
      .from('fuentes_pago')
      .select('*')
      .eq('negociacion_id', neg.id)

    console.log('💰 FUENTES DE PAGO CREADAS:')
    if (fuentes && fuentes.length > 0) {
      fuentes.forEach((f, i) => {
        console.log(`   ${i + 1}. ${f.tipo}`)
        console.log(`      ID: ${f.id}`)
        console.log(`      Entidad: ${f.entidad || 'N/A'}`)
        console.log(`      Monto: $${f.monto_aprobado.toLocaleString()}`)
      })
    } else {
      console.log('   ⚠️ No se encontraron fuentes de pago')
    }
    console.log('')

    // 3. Documentos pendientes del cliente
    const { data: pendientes } = await supabase
      .from('documentos_pendientes')
      .select('*')
      .eq('cliente_id', neg.cliente_id)

    console.log('📄 DOCUMENTOS PENDIENTES:')
    if (pendientes && pendientes.length > 0) {
      pendientes.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.tipo_documento}`)
        console.log(`      ID: ${p.id}`)
        console.log(`      Fuente Pago ID: ${p.fuente_pago_id}`)
        console.log(`      Metadata: ${JSON.stringify(p.metadata, null, 2)}`)
      })
    } else {
      console.log('   ⚠️ No se encontraron documentos pendientes')
    }
    console.log('')

    // 4. Estado de la vivienda
    const { data: vivienda } = await supabase
      .from('viviendas')
      .select('*, clientes(nombres, apellidos)')
      .eq('id', neg.vivienda_id)
      .single()

    if (vivienda) {
      console.log('🏠 ESTADO DE LA VIVIENDA:')
      console.log(`   Estado: ${vivienda.estado}`)
      console.log(`   Cliente asignado: ${vivienda.clientes?.nombres} ${vivienda.clientes?.apellidos}`)
      console.log(`   Negociación ID: ${vivienda.negociacion_id}`)
      console.log(`   Fecha asignación: ${vivienda.fecha_asignacion}`)
    }
    console.log('')

    // 5. Estado del cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('nombres, apellidos, estado')
      .eq('id', neg.cliente_id)
      .single()

    if (cliente) {
      console.log('👤 ESTADO DEL CLIENTE:')
      console.log(`   Nombre: ${cliente.nombres} ${cliente.apellidos}`)
      console.log(`   Estado: ${cliente.estado}`)
    }

  } else {
    console.log('⚠️ No se encontraron negociaciones')
  }
}

verificarEstado()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

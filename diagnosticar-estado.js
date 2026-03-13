/**
 * Script para diagnosticar estado de Casa 5 y cliente Pedrito
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnosticar() {
  console.log('\n🔍 DIAGNÓSTICO: Estado de Casa 5 y Pedrito\n')

  // 1. Verificar vivienda
  console.log('1️⃣ Estado de Vivienda Casa 5:')
  const { data: viviendas, error: errorV } = await supabase
    .from('viviendas')
    .select(`
      id,
      numero,
      estado,
      cliente_id,
      negociacion_id,
      manzanas!inner (
        nombre
      )
    `)
    .eq('numero', '5')
    .eq('manzanas.nombre', 'Manzana A')
    .single()

  if (errorV) {
    console.log('   ❌ Error:', errorV.message)
  } else {
    console.log('   📋 Datos:', JSON.stringify(viviendas, null, 2))
    console.log('   ✅ Estado:', viviendas.estado)
    console.log('   👤 cliente_id:', viviendas.cliente_id || 'NULL ✅')
    console.log('   📄 negociacion_id:', viviendas.negociacion_id || 'NULL ✅')

    const disponible = viviendas.estado === 'Disponible' &&
                       !viviendas.cliente_id &&
                       !viviendas.negociacion_id
    console.log(`   ${disponible ? '✅' : '❌'} ${disponible ? 'DISPONIBLE CORRECTAMENTE' : 'NO DISPONIBLE - HAY PROBLEMA'}`)
  }

  // 2. Verificar cliente
  console.log('\n2️⃣ Estado del Cliente Pedrito:')
  const { data: cliente, error: errorC } = await supabase
    .from('clientes')
    .select('id, nombre_completo, numero_documento, estado')
    .eq('numero_documento', '1233333')
    .single()

  if (errorC) {
    console.log('   ❌ Error:', errorC.message)
  } else {
    console.log('   👤 Nombre:', cliente.nombre_completo)
    console.log('   📄 Documento:', cliente.numero_documento)
    console.log('   📊 Estado:', cliente.estado)
    console.log(`   ${cliente.estado === 'Prospecto' ? '✅' : '❌'} ${cliente.estado === 'Prospecto' ? 'CORRECTO' : 'INCORRECTO - Debería ser Prospecto'}`)
  }

  // 3. Verificar negociaciones huérfanas
  console.log('\n3️⃣ Verificando negociaciones huérfanas:')
  if (viviendas?.id) {
    const { data: negociaciones, error: errorN } = await supabase
      .from('negociaciones')
      .select('id, cliente_id, vivienda_id, estado')
      .eq('vivienda_id', viviendas.id)

    if (errorN) {
      console.log('   ❌ Error:', errorN.message)
    } else if (negociaciones.length === 0) {
      console.log('   ✅ No hay negociaciones (correcto)')
    } else {
      console.log('   ❌ PROBLEMA: Hay', negociaciones.length, 'negociaciones huérfanas:')
      console.log(JSON.stringify(negociaciones, null, 2))
    }
  }

  console.log('\n')
}

diagnosticar().catch(console.error)

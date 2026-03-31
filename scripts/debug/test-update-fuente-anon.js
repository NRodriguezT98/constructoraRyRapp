const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function probarUpdate() {
  console.log('\n====== PRUEBA DE UPDATE A FUENTE ======\n')

  // 1. Buscar fuente "Subsidio Mi Casa Ya"
  const { data: fuente, error: errorBuscar } = await supabase
    .from('fuentes_pago')
    .select('id, tipo, estado_fuente, monto_aprobado')
    .eq('negociacion_id', '105f3121-8d56-4b29-adac-380cebdc1faf')
    .eq('tipo', 'Subsidio Mi Casa Ya')
    .eq('estado_fuente', 'activa')
    .single()

  if (errorBuscar) {
    console.error('❌ Error buscando fuente:', errorBuscar)
    return
  }

  console.log('✅ Fuente encontrada:', fuente)
  console.log('')

  // 2. Intentar UPDATE
  console.log('🔄 Intentando marcar como inactiva...\n')

  const { data: resultado, error: errorUpdate, count, status, statusText } = await supabase
    .from('fuentes_pago')
    .update({
      estado_fuente: 'inactiva',
      razon_inactivacion: 'PRUEBA - Test de inactivación desde script',
      fecha_inactivacion: new Date().toISOString(),
    })
    .eq('id', fuente.id)

  if (errorUpdate) {
    console.error('❌ ERROR AL ACTUALIZAR:')
    console.error(JSON.stringify(errorUpdate, null, 2))
    console.log('\nDetalles adicionales:')
    console.log('- Code:', errorUpdate.code)
    console.log('- Message:', errorUpdate.message)
    console.log('- Details:', errorUpdate.details)
    console.log('- Hint:', errorUpdate.hint)
    console.log('- Status:', status)
    console.log('- StatusText:', statusText)
  } else {
    console.log('✅ UPDATE EXITOSO')
    console.log('Resultado:', resultado)
    console.log('Count:', count)

    // Revertir cambio
    console.log('\n🔄 Revirtiendo cambio...')
    const { error: errorRevertir } = await supabase
      .from('fuentes_pago')
      .update({
        estado_fuente: 'activa',
        razon_inactivacion: null,
        fecha_inactivacion: null,
      })
      .eq('id', fuente.id)

    if (errorRevertir) {
      console.error('❌ Error revirtiendo:', errorRevertir)
    } else {
      console.log('✅ Cambio revertido exitosamente')
    }
  }
}

require('dotenv').config({ path: '.env.local' })
probarUpdate().catch(console.error)

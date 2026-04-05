const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificar() {
  console.log('\n====== VERIFICACIÓN DE NEGOCIACIONES ACTIVAS ======\n')

  const { data, error } = await supabase
    .from('negociaciones')
    .select(
      `
      id,
      estado,
      valor_negociado,
      descuento_aplicado,
      valor_total,
      valor_total_pagar,
      saldo_pendiente,
      total_abonado,
      viviendas!negociaciones_vivienda_id_fkey (
        valor_base,
        valor_total,
        gastos_notariales,
        recargo_esquinera,
        es_esquinera
      )
    `
    )
    .eq('estado', 'Activa')
    .order('fecha_negociacion', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  let tieneError = false
  for (const n of data) {
    const v = n.viviendas
    const gastosEfectivos =
      (v.gastos_notariales || 0) +
      (v.es_esquinera ? v.recargo_esquinera || 0 : 0)
    const totalEsperado = n.valor_negociado + gastosEfectivos
    const dobleConteo =
      n.valor_negociado === v.valor_total && v.valor_base < v.valor_total

    console.log(`ID: ${n.id.substring(0, 8)}...`)
    console.log(
      `  valor_negociado:    $${n.valor_negociado?.toLocaleString('es-CO')}`
    )
    console.log(
      `  vivienda.valor_base: $${v.valor_base?.toLocaleString('es-CO')}`
    )
    console.log(
      `  vivienda.valor_total: $${v.valor_total?.toLocaleString('es-CO')}`
    )
    console.log(
      `  gastos_notariales:  $${v.gastos_notariales?.toLocaleString('es-CO')}`
    )
    console.log(
      `  recargo_esquinera:  $${v.recargo_esquinera?.toLocaleString('es-CO')}`
    )
    console.log(
      `  valor_total_pagar:  $${n.valor_total_pagar?.toLocaleString('es-CO')}`
    )
    console.log(
      `  total_esperado:     $${totalEsperado?.toLocaleString('es-CO')}`
    )
    console.log(
      `  saldo_pendiente:    $${n.saldo_pendiente?.toLocaleString('es-CO')}`
    )

    if (Math.abs(n.valor_total_pagar - totalEsperado) > 1) {
      console.log(
        `  ❌ DESINCRONIZACIÓN: valor_total_pagar debería ser $${totalEsperado.toLocaleString('es-CO')} pero es $${n.valor_total_pagar?.toLocaleString('es-CO')}`
      )
      tieneError = true
    } else {
      console.log(`  ✅ Valores correctos`)
    }

    if (dobleConteo) {
      console.log(
        `  ⚠️  DOBLE CONTEO DETECTADO: valor_negociado == vivienda.valor_total`
      )
    }
    console.log('')
  }

  if (!tieneError) {
    console.log(
      '\n✅ TODAS LAS NEGOCIACIONES ACTIVAS TIENEN VALORES CORRECTOS\n'
    )
  } else {
    console.log(
      '\n❌ HAY NEGOCIACIONES CON DOBLE CONTEO — REVISAR MANUALMENTE\n'
    )
  }
}

verificar().catch(console.error)

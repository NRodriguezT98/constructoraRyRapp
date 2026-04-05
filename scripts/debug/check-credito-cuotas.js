const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data: fuentes } = await supabase
    .from('fuentes_pago')
    .select(
      'id, tipo, monto_aprobado, capital_para_cierre, created_at, negociacion_id'
    )
    .ilike('tipo', '%constructora%')
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('=== Fuentes crédito constructora (más recientes) ===')
  if (!fuentes?.length) {
    console.log('(ninguna)')
    return
  }

  fuentes.forEach(f => {
    console.log(
      'fuente:',
      f.id.slice(0, 8),
      '| monto:',
      f.monto_aprobado,
      '| capital_para_cierre:',
      f.capital_para_cierre,
      '| created:',
      f.created_at.slice(0, 19)
    )
  })

  const ids = fuentes.map(f => f.id)

  const { data: creditos } = await supabase
    .from('creditos_constructora')
    .select('fuente_pago_id, capital, num_cuotas, created_at')
    .in('fuente_pago_id', ids)

  console.log('\n=== creditos_constructora ===')
  if (!creditos?.length) {
    console.log(
      '(ninguno) — estas fuentes son ANTERIORES a la implementacion de hoy'
    )
  } else {
    creditos.forEach(c =>
      console.log(
        'fuente:',
        String(c.fuente_pago_id).slice(0, 8),
        '| capital:',
        c.capital,
        '| num_cuotas:',
        c.num_cuotas
      )
    )
  }

  const { data: cuotas } = await supabase
    .from('cuotas_credito')
    .select('fuente_pago_id')
    .in('fuente_pago_id', ids)

  console.log('\n=== cuotas_credito ===')
  console.log('total filas:', cuotas?.length ?? 0)
}

check().catch(console.error)

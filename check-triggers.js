require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

async function main() {
  const cl = new Client({ connectionString: process.env.DATABASE_URL })
  await cl.connect()

  // Triggers en abonos_historial
  const r1 = await cl.query(`
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE event_object_table = 'abonos_historial'
    ORDER BY trigger_name
  `)
  console.log('=== TRIGGERS en abonos_historial ===')
  r1.rows.forEach(r => console.log(`  ${r.trigger_name} [${r.event_manipulation}] → ${r.action_statement}`))

  // Triggers en fuentes_pago
  const r2 = await cl.query(`
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE event_object_table = 'fuentes_pago'
    ORDER BY trigger_name
  `)
  console.log('\n=== TRIGGERS en fuentes_pago ===')
  r2.rows.forEach(r => console.log(`  ${r.trigger_name} [${r.event_manipulation}] → ${r.action_statement}`))

  // Funciones de triggers
  const r3 = await cl.query(`
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_type = 'FUNCTION'
      AND routine_name LIKE '%recalcular%'
    ORDER BY routine_name
  `)
  console.log('\n=== FUNCIONES recalcular* ===')
  r3.rows.forEach(r => console.log(`  ${r.routine_name}`))

  await cl.end()
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1) })

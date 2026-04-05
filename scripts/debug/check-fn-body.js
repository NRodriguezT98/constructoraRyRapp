require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

async function main() {
  const cl = new Client({ connectionString: process.env.DATABASE_URL })
  await cl.connect()

  const r = await cl.query(`
    SELECT prosrc
    FROM pg_proc
    WHERE proname = 'actualizar_monto_recibido_fuente'
  `)
  console.log('=== actualizar_monto_recibido_fuente() ===')
  console.log(r.rows[0]?.prosrc || 'NOT FOUND')

  await cl.end()
}

main().catch(e => {
  console.error('ERR:', e.message)
  process.exit(1)
})

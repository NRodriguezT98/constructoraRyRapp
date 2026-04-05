require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

async function main() {
  const cl = new Client({ connectionString: process.env.DATABASE_URL })
  await cl.connect()
  const r = await cl.query(`
    SELECT table_name, column_name, generation_expression
    FROM information_schema.columns
    WHERE table_name IN ('fuentes_pago','negociaciones')
      AND is_generated = 'ALWAYS'
    ORDER BY table_name, column_name
  `)
  console.log(JSON.stringify(r.rows, null, 2))
  await cl.end()
}

main().catch(e => {
  console.error('ERR:', e.message)
  process.exit(1)
})

require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

async function check() {
  const client = new Client(process.env.DATABASE_URL)
  await client.connect()

  const res = await client.query("SELECT pg_get_viewdef('v_renuncias_completas', true)")
  console.log(res.rows[0].pg_get_viewdef)

  await client.end()
}

check()

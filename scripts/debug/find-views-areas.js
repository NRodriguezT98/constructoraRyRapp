const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })
const c = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
})
c.connect()
  .then(() =>
    c.query(`
  SELECT view_definition
  FROM information_schema.views
  WHERE table_name = 'vista_viviendas_completas'
`)
  )
  .then(r => {
    console.log(r.rows[0]?.view_definition)
    c.end()
  })
  .catch(e => {
    console.error(e.message)
    c.end()
  })

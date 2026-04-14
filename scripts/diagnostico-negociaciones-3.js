#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
})

client
  .connect()
  .then(async () => {
    const r = await client.query(`
    SELECT
      id,
      fecha_evento,
      accion,
      datos_nuevos->>'descuento_aplicado' AS desc_aplicado,
      (datos_nuevos ? 'descuento_aplicado') AS tiene_clave_desc,
      left(datos_nuevos::text, 150) AS datos_preview
    FROM audit_log
    WHERE tabla = 'negociaciones'
    ORDER BY fecha_evento DESC
  `)
    console.log('\n=== TODOS LOS EVENTOS DE NEGOCIACIONES ===')
    console.table(r.rows)
    await client.end()
  })
  .catch(e => {
    console.error(e.message)
    client.end()
  })

#!/usr/bin/env node
// Verificar si el backfill aparece correctamente
require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
})

const STEFANY_CLIENTE_ID = '9b56aae7-a46d-41f4-8a15-3200cd233aa4'

client
  .connect()
  .then(async () => {
    const r = await client.query(
      `
    SELECT
      id,
      fecha_evento,
      datos_nuevos->>'descuento_aplicado' AS desc_en_datos_nuevos,
      cambios_especificos->>'descuento_aplicado' AS desc_en_cambios,
      metadata->>'backfill' AS es_backfill,
      metadata->>'cliente_id' AS cliente_id
    FROM audit_log
    WHERE tabla = 'negociaciones'
      AND metadata @> $1
    ORDER BY fecha_evento DESC
    LIMIT 15
  `,
      [JSON.stringify({ cliente_id: STEFANY_CLIENTE_ID })]
    )

    console.log('\n=== TODOS LOS EVENTOS DE STEFANY (con descuento info) ===')
    console.table(r.rows)
    await client.end()
  })
  .catch(e => {
    console.error(e.message)
    client.end()
  })

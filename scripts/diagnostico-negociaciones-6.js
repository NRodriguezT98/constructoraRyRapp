#!/usr/bin/env node
// Verificar que la query del historial service encuentra el evento
require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
})

const STEFANY_CLIENTE_ID = '9b56aae7-a46d-41f4-8a15-3200cd233aa4'

client
  .connect()
  .then(async () => {
    // Simular la query exacta del historial service
    const r = await client.query(
      `
    SELECT
      id,
      fecha_evento,
      accion,
      tabla,
      cambios_especificos->>'descuento_aplicado' AS cambio_descuento,
      metadata->>'cliente_id' AS cliente_id,
      metadata->>'backfill' AS es_backfill
    FROM audit_log
    WHERE tabla = 'negociaciones'
      AND metadata @> $1
    ORDER BY fecha_evento DESC
    LIMIT 10
  `,
      [JSON.stringify({ cliente_id: STEFANY_CLIENTE_ID })]
    )

    console.log(
      '\n=== QUERY HISTORIAL (simula .contains(metadata, {cliente_id})) ==='
    )
    console.table(r.rows)
    console.log(`Total eventos visibles para Stefany: ${r.rows.length}`)
    await client.end()
  })
  .catch(e => {
    console.error(e.message)
    client.end()
  })

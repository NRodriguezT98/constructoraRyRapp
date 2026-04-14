#!/usr/bin/env node
// Ver el estado actual de Stefany y los 9 eventos nuevos de hoy
require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
})

const STEFANY_CLIENTE_ID = '9b56aae7-a46d-41f4-8a15-3200cd233aa4'

client
  .connect()
  .then(async () => {
    // Estado actual de la negociación
    const r1 = await client.query(
      `
    SELECT id, descuento_aplicado, tipo_descuento, motivo_descuento, estado
    FROM negociaciones
    WHERE cliente_id = $1
  `,
      [STEFANY_CLIENTE_ID]
    )
    console.log('\n=== ESTADO ACTUAL NEGOCIACION STEFANY ===')
    console.table(r1.rows)

    // Ver los 9 eventos de hoy con más detalle
    const r2 = await client.query(
      `
    SELECT
      id,
      fecha_evento,
      cambios_especificos->>'descuento_aplicado' AS cambio_desc,
      datos_nuevos->>'descuento_aplicado' AS desc_nuevo,
      datos_nuevos->>'estado' AS estado_nuevo,
      left(cambios_especificos::text, 100) AS cambios_preview
    FROM audit_log
    WHERE tabla = 'negociaciones'
      AND metadata @> $1
      AND fecha_evento > '2026-04-14'
    ORDER BY fecha_evento ASC
  `,
      [JSON.stringify({ cliente_id: STEFANY_CLIENTE_ID })]
    )
    console.log('\n=== EVENTOS DE HOY (April 14) ===')
    console.table(r2.rows)

    await client.end()
  })
  .catch(e => {
    console.error(e.message)
    client.end()
  })

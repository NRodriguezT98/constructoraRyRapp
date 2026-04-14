#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
})

client
  .connect()
  .then(async () => {
    // Ver las claves de datos_nuevos en las filas del 11-abril
    const r1 = await client.query(`
    SELECT id, fecha_evento,
      datos_nuevos->>'descuento_aplicado' AS descuento_nuevo,
      datos_nuevos->>'cliente_id'         AS cliente_id_en_datos,
      (datos_nuevos ? 'descuento_aplicado') AS tiene_clave_desc,
      left(datos_nuevos::text, 300)        AS datos_nuevos_preview
    FROM audit_log
    WHERE tabla = 'negociaciones'
      AND fecha_evento >= '2026-04-11'
    ORDER BY fecha_evento DESC
  `)
    console.log('\n=== Filas del 11-abr: datos_nuevos ===')
    console.table(r1.rows)

    // Ver también cambios_especificos de esas filas
    const r2 = await client.query(`
    SELECT id, fecha_evento,
      (cambios_especificos ? 'descuento_aplicado') AS cambios_tiene_desc,
      left(cambios_especificos::text, 300) AS cambios_preview
    FROM audit_log
    WHERE tabla = 'negociaciones'
      AND fecha_evento >= '2026-04-11'
    ORDER BY fecha_evento DESC
  `)
    console.log('\n=== Filas del 11-abr: cambios_especificos ===')
    console.table(r2.rows)

    await client.end()
  })
  .catch(e => {
    console.error(e.message)
    client.end()
  })

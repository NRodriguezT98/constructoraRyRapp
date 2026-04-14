#!/usr/bin/env node
// Verificar si Stefany Pazos tiene descuento activo, y cuándo se actualizó
require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
})

client
  .connect()
  .then(async () => {
    // Buscar la negociación de Stefany Pazos
    const r1 = await client.query(`
    SELECT
      n.id,
      n.descuento_aplicado,
      n.tipo_descuento,
      n.motivo_descuento,
      n.estado,
      n.fecha_actualizacion,
      n.cliente_id,
      c.nombres || ' ' || c.apellidos AS cliente_nombre
    FROM negociaciones n
    JOIN clientes c ON c.id = n.cliente_id
    WHERE c.nombres ILIKE '%Stefany%' OR c.nombres ILIKE '%Stephanie%'
       OR c.apellidos ILIKE '%Pazos%'
    ORDER BY n.fecha_actualizacion DESC
  `)
    console.log('\n=== NEGOCIACIONES DE STEFANY PAZOS ===')
    console.table(r1.rows)

    // También ver si el trigger nuevo fue creado y está activo
    const r2 = await client.query(`
    SELECT t.tgname, p.proname, t.tgenabled, t.tgtype
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE c.relname = 'negociaciones'
      AND t.tgname = 'negociaciones_audit_trigger'
  `)
    console.log('\n=== TRIGGER ESTADO ===')
    console.table(r2.rows)

    // Ver la función del trigger nuevo - si tiene exception handler
    const r3 = await client.query(`
    SELECT prosrc
    FROM pg_proc
    WHERE proname = 'negociaciones_audit_trigger_func'
  `)
    if (r3.rows.length > 0) {
      console.log('\n=== FUNCIÓN DEL TRIGGER (primeras 800 chars) ===')
      console.log(r3.rows[0].prosrc.substring(0, 800))
    }

    await client.end()
  })
  .catch(e => {
    console.error(e.message)
    client.end()
  })

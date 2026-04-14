#!/usr/bin/env node
// Ver el source completo del trigger de negociaciones
require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
})

client
  .connect()
  .then(async () => {
    const r = await client.query(`
    SELECT prosrc
    FROM pg_proc
    WHERE proname = 'negociaciones_audit_trigger_func'
  `)
    if (r.rows.length > 0) {
      console.log('=== FUNCIÓN COMPLETA DEL TRIGGER ===')
      console.log(r.rows[0].prosrc)
    }

    // También verificar si existe audit_trigger_func y cuántas tablas la usan
    const r2 = await client.query(`
    SELECT c.relname AS tabla, t.tgname, p.proname AS funcion
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE p.proname IN ('audit_trigger_func', 'negociaciones_audit_trigger_func')
      AND NOT t.tgisinternal
    ORDER BY c.relname
  `)
    console.log('\n=== TABLAS CON TRIGGER DE AUDITORÍA ===')
    console.table(r2.rows)

    await client.end()
  })
  .catch(e => {
    console.error(e.message)
    client.end()
  })

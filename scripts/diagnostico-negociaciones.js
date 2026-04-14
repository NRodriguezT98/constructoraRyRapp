#!/usr/bin/env node
/**
 * Diagnóstico de audit_log para negociaciones
 * Corre queries individuales y muestra los resultados directamente
 */

require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

const DB_URL = process.env.DATABASE_URL || process.env.DIRECT_URL

if (!DB_URL) {
  console.error('❌ No se encontró DATABASE_URL ni DIRECT_URL en .env.local')
  process.exit(1)
}

const client = new Client({ connectionString: DB_URL })

async function run(label, sql, params = []) {
  console.log(`\n📋 ${label}`)
  const result = await client.query(sql, params)
  if (result.rows.length === 0) {
    console.log('  (sin resultados)')
  } else {
    console.table(result.rows)
  }
}

;(async () => {
  await client.connect()
  console.log('✓ Conectado\n')

  // 1. Conteos generales
  await run(
    'Total filas negociaciones en audit_log',
    `SELECT
       COUNT(*) FILTER (WHERE tabla = 'negociaciones') AS total_negociaciones,
       COUNT(*) FILTER (WHERE tabla = 'negociaciones' AND metadata->>'cliente_id' IS NOT NULL) AS con_cliente_id,
       COUNT(*) FILTER (WHERE tabla = 'negociaciones' AND (metadata IS NULL OR metadata = '{}'::jsonb OR metadata->>'cliente_id' IS NULL)) AS sin_cliente_id
     FROM audit_log`
  )

  // 2. Últimas 10 filas de negociaciones
  await run(
    'Últimas 10 filas de negociaciones en audit_log',
    `SELECT
       id,
       fecha_evento,
       accion,
       COALESCE(usuario_email, 'anon') AS usuario,
       metadata->>'cliente_id' AS cliente_id,
       metadata->>'vivienda_id' AS vivienda_id
     FROM audit_log
     WHERE tabla = 'negociaciones'
     ORDER BY fecha_evento DESC
     LIMIT 10`
  )

  // 3. Eventos de descuento
  await run(
    'Eventos con descuento_aplicado en datos_nuevos (últimos 10)',
    `SELECT
       id,
       fecha_evento,
       COALESCE(usuario_email, 'anon') AS usuario,
       metadata->>'cliente_id' AS cliente_id,
       datos_anteriores->>'descuento_aplicado' AS desc_ant,
       datos_nuevos->>'descuento_aplicado' AS desc_nuevo,
       datos_nuevos->>'tipo_descuento' AS tipo,
       datos_nuevos->>'motivo_descuento' AS motivo
     FROM audit_log
     WHERE tabla = 'negociaciones'
       AND (datos_nuevos ? 'descuento_aplicado' OR cambios_especificos ? 'descuento_aplicado')
     ORDER BY fecha_evento DESC
     LIMIT 10`
  )

  // 4. Verificar trigger
  await run(
    'Triggers de negociaciones',
    `SELECT t.tgname, p.proname AS funcion, t.tgenabled
     FROM pg_trigger t
     JOIN pg_proc p ON p.oid = t.tgfoid
     JOIN pg_class c ON c.oid = t.tgrelid
     WHERE c.relname = 'negociaciones' AND NOT t.tgisinternal`
  )

  await client.end()
  console.log('\n✓ Diagnóstico completado')
})().catch(err => {
  console.error('Error:', err.message)
  client.end()
  process.exit(1)
})

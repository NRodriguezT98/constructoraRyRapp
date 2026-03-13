#!/usr/bin/env node
const { Client } = require('pg')
const fs = require('fs')

const dbConfig = {
  user: 'postgres.zhqecllcqwfdmmfthfwq',
  password: '6x4LBDQaQZtCGMr9',
  host: 'db.zhqecllcqwfdmmfthfwq.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
}

const NEG_ID = '105f3121-8d56-4b29-adac-380cebdc1faf'

async function capturarANTES() {
  const client = new Client(dbConfig)
  await client.connect()

  console.log('\n📊 ESTADO ANTES DE MODIFICAR\n')

  try {
    // Versión actual
    const { rows: neg } = await client.query(
      'SELECT version_actual, version_lock FROM negociaciones WHERE id = $1',
      [NEG_ID]
    )

    console.log('✅ Negociación encontrada:', neg.length > 0 ? 'SÍ' : 'NO')
    if (neg[0]) {
      console.log(`   Versión actual: ${neg[0].version_actual}`)
      console.log(`   Lock: ${neg[0].version_lock}`)
    }

    // Últimas 5 versiones
    const { rows: versiones } = await client.query(
      `SELECT version, tipo_cambio, LEFT(razon_cambio, 50) as razon
       FROM negociaciones_historial
       WHERE negociacion_id = $1
       ORDER BY version DESC
       LIMIT 5`,
      [NEG_ID]
    )

    console.log(`\n📜 Últimas 5 versiones (total: ${versiones.length}):`)
    versiones.forEach(v => {
      console.log(`   v${v.version}: ${v.tipo_cambio} - ${v.razon || '(sin razón)'}`)
    })

    // Fuentes activas
    const { rows: fuentes } = await client.query(
      `SELECT COUNT(*) as activas
       FROM fuentes_pago
       WHERE negociacion_id = $1
         AND estado_fuente = 'activa'`,
      [NEG_ID]
    )

    console.log(`\n💰 Fuentes activas: ${fuentes[0].activas}`)

    // Total versiones
    const { rows: total } = await client.query(
      `SELECT COUNT(*) as total, MAX(version) as max_version
       FROM negociaciones_historial
       WHERE negociacion_id = $1`,
      [NEG_ID]
    )

    console.log(`📦 Total versiones: ${total[0].total} (última: v${total[0].max_version})`)

    console.log('\n✅ Estado capturado')
    console.log('👉 Ahora MODIFICA las fuentes en la UI (agregar, editar o eliminar)')
    console.log('👉 Luego ejecuta: node capturar-DESPUES-directo.js\n')

  } finally {
    await client.end()
  }
}

capturarANTES().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})

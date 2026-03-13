const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

function parseConnectionString(connectionString) {
  // postgresql://user:password@host:port/database
  const match = connectionString.match(
    /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  )

  if (!match) {
    throw new Error('Formato de DATABASE_URL inválido')
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    ssl: {
      rejectUnauthorized: false,
    },
  }
}async function consultarFuentes() {
  const env = {}
  const envPath = require('path').join(process.cwd(), '.env.local')
  const fs = require('fs')

  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#][^=]*)\s*=\s*(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
  })

  const dbConfig = parseConnectionString(env.DATABASE_URL)
  const client = new Client(dbConfig)

  try {
    await client.connect()

    // Query 1: Fuentes activas
    console.log('\n🏦 FUENTES DE PAGO (TODAS):\n')
    const fuentesResult = await client.query(`
      SELECT
        fp.tipo,
        fp.entidad,
        fp.monto_aprobado::numeric,
        fp.estado_fuente,
        CASE
          WHEN fp.carta_aprobacion_url IS NOT NULL THEN 'SI'
          ELSE 'NO'
        END as tiene_carta,
        CASE
          WHEN fp.estado_fuente = 'activa' THEN 'VISIBLE'
          ELSE 'OCULTA'
        END as visibilidad_ui,
        fp.id::text as fuente_id
      FROM fuentes_pago fp
      JOIN negociaciones n ON n.id = fp.negociacion_id
      WHERE n.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
        AND n.estado = 'Activa'
      ORDER BY fp.fecha_creacion
    `)

    if (fuentesResult.rows.length === 0) {
      console.log('  ❌ No hay fuentes activas')
    } else {
      fuentesResult.rows.forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.tipo} - ${row.entidad || 'Sin entidad'}`)
        console.log(`     Monto: $${parseInt(row.monto_aprobado).toLocaleString()}`)
        console.log(`     Carta: ${row.tiene_carta}`)
        console.log(`     Estado: ${row.estado_fuente}`)
        console.log(`     UI: ${row.visibilidad_ui}`)
        console.log(`     ID: ${row.fuente_id}\n`)
      })
    }

    // Query 2: Documentos pendientes
    console.log('\n📄 DOCUMENTOS PENDIENTES:\n')
    const pendientesResult = await client.query(`
      SELECT
        dp.tipo_documento,
        dp.metadata->>'tipo_fuente' as tipo_fuente,
        dp.fuente_pago_id::text,
        CASE
          WHEN fp.id IS NULL THEN 'HUERFANO'
          ELSE 'VALIDO'
        END as estado
      FROM documentos_pendientes dp
      LEFT JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
      WHERE dp.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
        AND dp.estado = 'Pendiente'
    `)

    if (pendientesResult.rows.length === 0) {
      console.log('  ✅ No hay documentos pendientes')
    } else {
      pendientesResult.rows.forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.tipo_documento}`)
        console.log(`     Fuente: ${row.tipo_fuente}`)
        console.log(`     Estado: ${row.estado}`)
        console.log(`     Fuente ID: ${row.fuente_pago_id}\n`)
      })
    }

  } finally {
    await client.end()
  }
}

consultarFuentes().catch(console.error)

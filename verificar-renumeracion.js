require('dotenv').config()
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local no encontrado')
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}

  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#][^=]*)\s*=\s*(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
  })

  return env
}

function parseConnectionString(connectionString) {
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
    ssl: { rejectUnauthorized: false },
  }
}

const NEG_ID = '105f3121-8d56-4b29-adac-380cebdc1faf'

async function verificarRenumeracion() {
  const env = await loadEnv()
  const dbConfig = parseConnectionString(env.DATABASE_URL)

  const client = new Client(dbConfig)
  await client.connect()

  console.log('\n✅ VERIFICACIÓN DE RENUMERACIÓN DE VERSIONES\n')

  try {
    // Versión actual de la negociación
    const { rows: neg } = await client.query(
      'SELECT version_actual FROM negociaciones WHERE id = $1',
      [NEG_ID]
    )

    const versionActual = neg[0]?.version_actual || 0

    // Todas las versiones (ordenadas de más antigua a más reciente)
    const { rows: versiones } = await client.query(
      `SELECT
        version,
        tipo_cambio,
        razon_cambio,
        TO_CHAR(fecha_cambio, 'YYYY-MM-DD HH24:MI:SS') as fecha
       FROM negociaciones_historial
       WHERE negociacion_id = $1
       ORDER BY version ASC`,
      [NEG_ID]
    )

    console.log(`📊 Versión actual en tabla: v${versionActual}`)
    console.log(`📦 Total de versiones: ${versiones.length}`)
    console.log(`\n${'='.repeat(80)}`)
    console.log('HISTORIAL COMPLETO (orden cronológico):\n')

    versiones.forEach((v, i) => {
      const esActual = v.version === versionActual
      const marca = esActual ? '👉' : '  '
      console.log(`${marca} v${v.version} | ${v.fecha} | ${v.tipo_cambio}`)
      console.log(`      ${v.razon_cambio.substring(0, 70)}`)

      if (i < versiones.length - 1) {
        console.log('')
      }
    })

    console.log(`\n${'='.repeat(80)}`)

    // Validar secuencia
    let secuenciaCorrecta = true
    for (let i = 0; i < versiones.length; i++) {
      if (versiones[i].version !== i + 1) {
        console.log(`❌ ERROR: Versión ${versiones[i].version} debería ser ${i + 1}`)
        secuenciaCorrecta = false
      }
    }

    if (secuenciaCorrecta) {
      console.log('\n✅ ÉXITO: Secuencia de versiones correcta (1, 2, 3...)')
      console.log(`✅ La última versión es v${versiones[versiones.length - 1].version} (coincide con total de ${versiones.length})`)
    } else {
      console.log('\n❌ HAY PROBLEMAS en la secuencia de versiones')
    }

  } finally {
    await client.end()
  }

  console.log('\n')
}

verificarRenumeracion().catch(err => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})

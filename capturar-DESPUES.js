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

async function capturarDespues() {
  const env = await loadEnv()
  const dbConfig = parseConnectionString(env.DATABASE_URL)

  const client = new Client(dbConfig)
  await client.connect()

  console.log('\n🔍 CAPTURANDO ESTADO DESPUÉS DE EDICIÓN\n')

  try {
    // 1. Versión actual
    const { rows: neg } = await client.query(
      'SELECT version_actual FROM negociaciones WHERE id = $1',
      [NEG_ID]
    )

    console.log(`✅ Versión actual: ${neg[0]?.version_actual}`)

    // 2. Versiones creadas en último minuto
    const { rows: nuevas } = await client.query(
      `SELECT
        version,
        tipo_cambio,
        razon_cambio,
        TO_CHAR(fecha_cambio, 'HH24:MI:SS.MS') as timestamp,
        ROUND(EXTRACT(EPOCH FROM (NOW() - fecha_cambio))) as segundos_atras
       FROM negociaciones_historial
       WHERE negociacion_id = $1
         AND fecha_cambio > NOW() - INTERVAL '1 minute'
       ORDER BY version DESC`,
      [NEG_ID]
    )

    console.log(`\n🆕 VERSIONES CREADAS (último minuto): ${nuevas.length}`)

    if (nuevas.length > 0) {
      nuevas.forEach((v, i) => {
        console.log(`\n  ${i + 1}. Versión ${v.version} (hace ${v.segundos_atras}s)`)
        console.log(`     Tipo: ${v.tipo_cambio}`)
        console.log(`     Razón: ${(v.razon_cambio || '(sin razón)').substring(0, 80)}`)
        console.log(`     Timestamp: ${v.timestamp}`)
      })

      // Detectar duplicados por timestamp
      const porSegundo = {}
      nuevas.forEach(v => {
        const segundo = v.timestamp.substring(0, 8) // HH:MI:SS
        if (!porSegundo[segundo]) porSegundo[segundo] = []
        porSegundo[segundo].push(v.version)
      })

      const duplicados = Object.entries(porSegundo).filter(([_, vers]) => vers.length > 1)

      console.log('\n' + '='.repeat(60))
      if (duplicados.length > 0) {
        console.log('⚠️  DUPLICADOS DETECTADOS (mismo segundo):')
        duplicados.forEach(([segundo, versiones]) => {
          console.log(`   ${segundo}: versiones ${versiones.join(', ')} ❌`)
        })
        console.log('\n❌ PRUEBA FALLIDA: Aún hay duplicación')
      } else {
        console.log('✅ NO HAY DUPLICADOS')
        console.log(`✅ Se creó exactamente ${nuevas.length} versión(es) como esperado`)
        console.log('\n✅ PRUEBA EXITOSA: Trigger desactivado correctamente')
      }
      console.log('='.repeat(60))
    } else {
      console.log('\n⚠️  No se detectaron versiones nuevas en el último minuto')
      console.log('   Asegúrate de haber modificado las fuentes DESPUÉS de ejecutar este script')
    }

    // 3. Fuentes activas
    const { rows: fuentes } = await client.query(
      'SELECT COUNT(*) as activas FROM fuentes_pago WHERE negociacion_id = $1 AND estado_fuente = $2',
      [NEG_ID, 'activa']
    )

    console.log(`\n💰 Fuentes activas ahora: ${fuentes[0].activas}`)

  } finally {
    await client.end()
  }

  console.log('\n')
}

capturarDespues().catch(err => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})

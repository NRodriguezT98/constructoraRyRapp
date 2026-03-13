require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: false
})

async function monitorearANTES() {
  const client = await pool.connect()

  try {
    console.log('\n' + '='.repeat(70))
    console.log('📊 ESTADO INICIAL (ANTES DE MODIFICAR FUENTES)')
    console.log('='.repeat(70) + '\n')

    // 1. Versión actual
    const version = await client.query(`
      SELECT
        version_actual,
        version_lock,
        TO_CHAR(fecha_ultima_modificacion, 'YYYY-MM-DD HH24:MI:SS') as ultima_modificacion
      FROM negociaciones
      WHERE id = '105f3121-8d56-4b29-adac-380cebdc1faf'
    `)
    console.log('1️⃣  VERSIÓN ACTUAL DE LA NEGOCIACIÓN:')
    console.table(version.rows)

    // 2. Últimas versiones
    const ultimas = await client.query(`
      SELECT
        version,
        tipo_cambio,
        LEFT(razon_cambio, 50) as razon,
        TO_CHAR(fecha_cambio, 'HH24:MI:SS') as hora
      FROM negociaciones_historial
      WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
      ORDER BY version DESC
      LIMIT 5
    `)
    console.log('\n2️⃣  ÚLTIMAS 5 VERSIONES EN HISTORIAL:')
    console.table(ultimas.rows)

    // 3. Fuentes activas
    const fuentes = await client.query(`
      SELECT
        tipo,
        monto_aprobado,
        estado_fuente
      FROM fuentes_pago
      WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
        AND estado_fuente = 'activa'
      ORDER BY tipo
    `)
    console.log('\n3️⃣  FUENTES DE PAGO ACTIVAS:')
    console.table(fuentes.rows)

    // 4. Total
    const total = await client.query(`
      SELECT
        COUNT(*) as total_versiones,
        MAX(version) as version_maxima
      FROM negociaciones_historial
      WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
    `)
    console.log('\n4️⃣  RESUMEN:')
    console.table(total.rows)

    console.log('\n' + '='.repeat(70))
    console.log('✅ Estado inicial capturado')
    console.log('⏳ Ahora MODIFICA las fuentes de pago en la UI...')
    console.log('='.repeat(70) + '\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

monitorearANTES()

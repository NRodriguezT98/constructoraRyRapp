require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: false,
})

async function monitorearDESPUES() {
  const client = await pool.connect()

  try {
    console.log('\n' + '='.repeat(70))
    console.log('🔍 ANÁLISIS DESPUÉS DE MODIFICAR FUENTES')
    console.log('='.repeat(70) + '\n')

    // 1. Nueva versión
    const version = await client.query(`
      SELECT
        version_actual,
        version_lock,
        TO_CHAR(fecha_ultima_modificacion, 'YYYY-MM-DD HH24:MI:SS') as ultima_modificacion
      FROM negociaciones
      WHERE id = '105f3121-8d56-4b29-adac-380cebdc1faf'
    `)
    console.log('1️⃣  NUEVA VERSIÓN:')
    console.table(version.rows)

    // 2. CRÍTICO: Versiones creadas recientemente
    const recientes = await client.query(`
      SELECT
        version,
        tipo_cambio,
        LEFT(razon_cambio, 60) as razon,
        TO_CHAR(fecha_cambio, 'HH24:MI:SS.MS') as timestamp,
        EXTRACT(EPOCH FROM (NOW() - fecha_cambio)) as segundos_atras,
        jsonb_array_length(fuentes_pago_snapshot) as fuentes_en_snapshot
      FROM negociaciones_historial
      WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
        AND fecha_cambio > NOW() - INTERVAL '1 minute'
      ORDER BY version DESC
    `)
    console.log('\n2️⃣  ⚠️  VERSIONES CREADAS EN EL ÚLTIMO MINUTO:')
    console.table(recientes.rows)

    // 3. Detectar duplicados por timestamp
    const duplicados = await client.query(`
      SELECT
        DATE_TRUNC('second', fecha_cambio) as mismo_segundo,
        COUNT(*) as versiones_simultaneas,
        STRING_AGG(version::text, ', ') as versiones
      FROM negociaciones_historial
      WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
        AND fecha_cambio > NOW() - INTERVAL '1 minute'
      GROUP BY DATE_TRUNC('second', fecha_cambio)
      HAVING COUNT(*) > 1
    `)

    if (duplicados.rows.length > 0) {
      console.log('\n⚠️  PROBLEMA: VERSIONES DUPLICADAS EN EL MISMO SEGUNDO:')
      console.table(duplicados.rows)
    } else {
      console.log(
        '\n✅ Sin duplicados detectados (cada versión en timestamp diferente)'
      )
    }

    // 4. Fuentes después del cambio
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
    console.log('\n3️⃣  FUENTES ACTIVAS DESPUÉS:')
    console.table(fuentes.rows)

    // 5. Fuentes inactivadas
    const inactivadas = await client.query(`
      SELECT
        tipo,
        monto_aprobado,
        LEFT(razon_inactivacion, 40) as razon
      FROM fuentes_pago
      WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
        AND estado_fuente = 'inactiva'
        AND fecha_inactivacion > NOW() - INTERVAL '1 minute'
    `)

    if (inactivadas.rows.length > 0) {
      console.log('\n4️⃣  FUENTES INACTIVADAS:')
      console.table(inactivadas.rows)
    }

    // 6. Resumen
    const resumen = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM negociaciones_historial
         WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
           AND fecha_cambio > NOW() - INTERVAL '1 minute') as versiones_nuevas,
        (SELECT COUNT(*) FROM fuentes_pago
         WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
           AND estado_fuente = 'activa') as fuentes_activas,
        (SELECT COUNT(*) FROM fuentes_pago
         WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
           AND estado_fuente = 'inactiva'
           AND fecha_inactivacion > NOW() - INTERVAL '1 minute') as fuentes_eliminadas
    `)
    console.log('\n5️⃣  RESUMEN DEL CAMBIO:')
    console.table(resumen.rows)

    console.log('\n' + '='.repeat(70))
    const versionesNuevas = parseInt(resumen.rows[0].versiones_nuevas)
    if (versionesNuevas > 1) {
      console.log(
        `❌ PROBLEMA: Se crearon ${versionesNuevas} versiones para 1 solo cambio`
      )
      console.log('🔧 Hay triggers duplicados disparándose')
    } else if (versionesNuevas === 1) {
      console.log('✅ CORRECTO: Solo 1 versión creada')
    } else {
      console.log('⚠️  No se detectaron versiones nuevas (¿cambio muy viejo?)')
    }
    console.log('='.repeat(70) + '\n')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

monitorearDESPUES()

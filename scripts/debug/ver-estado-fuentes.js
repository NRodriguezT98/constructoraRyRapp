require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: false, // ✅ Sin SSL para pooler
})

async function diagnosticar() {
  const client = await pool.connect()

  try {
    console.log('\n====== 1. TRIGGERS ACTIVOS EN fuentes_pago ======\n')
    const triggers = await client.query(`
      SELECT
          trigger_name,
          event_manipulation AS evento,
          action_timing AS cuando
      FROM information_schema.triggers
      WHERE event_object_table = 'fuentes_pago'
      ORDER BY trigger_name
    `)
    console.table(triggers.rows)

    console.log('\n====== 2. FUENTES DE LA NEGOCIACIÓN PROBLEMÁTICA ======\n')
    const fuentes = await client.query(`
      SELECT
          id,
          tipo,
          monto_aprobado,
          monto_recibido,
          estado_fuente,
          fecha_inactivacion,
          substring(razon_inactivacion, 1, 40) as razon,
          reemplazada_por
      FROM fuentes_pago
      WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
      ORDER BY
          CASE estado_fuente WHEN 'activa' THEN 1 ELSE 2 END,
          tipo
    `)
    console.table(fuentes.rows)

    console.log('\n====== 3. POLÍTICAS RLS EN fuentes_pago ======\n')
    const policies = await client.query(`
      SELECT
          policyname AS politica,
          cmd AS comando
      FROM pg_policies
      WHERE tablename = 'fuentes_pago'
      ORDER BY policyname
    `)
    console.table(policies.rows)

    console.log('\n====== 4. INTENTAR UPDATE DIRECTO (SIMULACIÓN) ======\n')
    const testUpdate = await client.query(`
      SELECT
          id,
          tipo,
          estado_fuente,
          monto_recibido
      FROM fuentes_pago
      WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
        AND estado_fuente = 'inactiva'
      LIMIT 1
    `)

    if (testUpdate.rows.length > 0) {
      console.log('Fuente inactiva encontrada:', testUpdate.rows[0])
      console.log('✅ Esta fuente YA está marcada como inactiva')
    } else {
      console.log('⚠️ No hay fuentes inactivas en esta negociación')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

diagnosticar()

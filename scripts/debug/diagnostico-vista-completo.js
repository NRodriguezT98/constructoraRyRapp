/**
 * Diagnóstico completo de la vista de documentos pendientes
 */
import pkg from 'pg'
const { Client } = pkg

const client = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.ndnqpfjnxqfwjqjcnjwz',
  password: 'RyR2025@constructora',
  ssl: { rejectUnauthorized: false }
})

async function diagnosticar() {
  try {
    await client.connect()
    console.log('✅ Conectado a Supabase\n')

    // 1. ¿Hay fuentes activas?
    console.log('1️⃣ FUENTES ACTIVAS:')
    const fuentes = await client.query(`
      SELECT COUNT(*) as total, tipo, estado
      FROM fuentes_pago
      GROUP BY tipo, estado
      ORDER BY estado DESC, total DESC
    `)
    console.table(fuentes.rows)

    // 2. ¿Hay requisitos configurados?
    console.log('\n2️⃣ REQUISITOS CONFIGURADOS:')
    const requisitos = await client.query(`
      SELECT tipo_fuente, COUNT(*) as total, activo
      FROM requisitos_fuentes_pago_config
      GROUP BY tipo_fuente, activo
      ORDER BY tipo_fuente, activo DESC
    `)
    console.table(requisitos.rows)

    // 3. Tipos que coinciden
    console.log('\n3️⃣ MATCH DE TIPOS (fuentes vs requisitos):')
    const match = await client.query(`
      SELECT
        fp.tipo as tipo_fuente_pago,
        COUNT(DISTINCT fp.id) as fuentes_activas,
        COUNT(DISTINCT rfc.id) as requisitos_activos,
        CASE
          WHEN COUNT(DISTINCT rfc.id) > 0 THEN '✅ Match'
          ELSE '❌ Sin match'
        END as status
      FROM fuentes_pago fp
      LEFT JOIN requisitos_fuentes_pago_config rfc
        ON rfc.tipo_fuente = fp.tipo AND rfc.activo = true
      WHERE fp.estado = 'Activa'
      GROUP BY fp.tipo
      ORDER BY requisitos_activos DESC
    `)
    console.table(match.rows)

    // 4. Ejemplo de fuente + documentos subidos
    console.log('\n4️⃣ EJEMPLO: Fuente activa con documentos:')
    const ejemplo = await client.query(`
      SELECT
        fp.id as fuente_id,
        fp.tipo,
        fp.entidad,
        COUNT(dc.id) as docs_subidos
      FROM fuentes_pago fp
      LEFT JOIN documentos_cliente dc ON dc.fuente_pago_relacionada = fp.id
      WHERE fp.estado = 'Activa'
      GROUP BY fp.id, fp.tipo, fp.entidad
      ORDER BY docs_subidos DESC
      LIMIT 3
    `)
    console.table(ejemplo.rows)

    // 5. ¿Por qué no aparecen pendientes?
    console.log('\n5️⃣ RAZÓN DE VISTA VACÍA:')
    const razon = await client.query(`
      SELECT
        CASE
          WHEN COUNT(fp.*) = 0 THEN '❌ No hay fuentes activas'
          WHEN COUNT(rfc.*) = 0 THEN '❌ No hay requisitos activos'
          WHEN COUNT(dc.*) > 0 THEN '✅ Ya subieron todos los documentos'
          ELSE '⚠️ Otro problema (tipos no coinciden?)'
        END as diagnostico,
        COUNT(DISTINCT fp.id) as fuentes_activas,
        COUNT(DISTINCT rfc.id) as requisitos_activos,
        COUNT(dc.id) as documentos_subidos
      FROM fuentes_pago fp
      LEFT JOIN requisitos_fuentes_pago_config rfc
        ON rfc.tipo_fuente = fp.tipo AND rfc.activo = true
      LEFT JOIN documentos_cliente dc
        ON dc.fuente_pago_relacionada = fp.id
      WHERE fp.estado = 'Activa'
    `)
    console.table(razon.rows)

    // 6. Vista real
    console.log('\n6️⃣ CONTENIDO DE LA VISTA:')
    const vista = await client.query(`
      SELECT * FROM vista_documentos_pendientes_fuentes LIMIT 5
    `)
    if (vista.rows.length === 0) {
      console.log('❌ Vista vacía - No hay documentos pendientes según criterios')
    } else {
      console.table(vista.rows)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

diagnosticar()

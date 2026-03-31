// ============================================
// VERIFICACIÓN: Fechas de documentos
// ============================================

import pg from 'pg'
const { Client } = pg

const client = new Client({
  host: 'db.swyjhwgvkfcfdtemkyad.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Wx8EwiZFhsPcHzAr',
})

async function verificar() {
  try {
    await client.connect()
    console.log('✓ Conectado a Supabase\n')

    // Ver documentos con sus fechas
    console.log('📄 DOCUMENTOS CON FECHAS:\n')
    const docs = await client.query(`
      SELECT
        id,
        titulo,
        fecha_documento,
        fecha_vencimiento,
        fecha_creacion,
        subido_por
      FROM documentos_proyecto
      WHERE estado = 'activo'
      ORDER BY fecha_creacion DESC
      LIMIT 5
    `)

    console.table(docs.rows)

    // Contar documentos sin fecha_documento
    const sinFecha = await client.query(`
      SELECT COUNT(*) as total
      FROM documentos_proyecto
      WHERE estado = 'activo' AND fecha_documento IS NULL
    `)

    console.log(`\n⚠️  Documentos SIN fecha_documento: ${sinFecha.rows[0].total}`)

    // Contar documentos con fecha_documento
    const conFecha = await client.query(`
      SELECT COUNT(*) as total
      FROM documentos_proyecto
      WHERE estado = 'activo' AND fecha_documento IS NOT NULL
    `)

    console.log(`✅ Documentos CON fecha_documento: ${conFecha.rows[0].total}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

verificar()

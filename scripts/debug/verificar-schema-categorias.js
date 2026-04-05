require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

async function verificarSchema() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
  })

  try {
    await client.connect()
    console.log('✓ Conectado a BD\n')

    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'categorias_documento'
      ORDER BY ordinal_position
    `)

    console.log('📋 Columnas de categorias_documento:\n')
    result.rows.forEach(col => {
      console.log(
        `  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`
      )
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

verificarSchema()

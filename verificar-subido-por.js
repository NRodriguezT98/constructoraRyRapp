// ============================================
// VERIFICACIÓN: Campo subido_por
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

    // 1. Tipo de dato
    console.log('📋 TIPO DE DATO DEL CAMPO subido_por:\n')
    const tipoDato = await client.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'documentos_proyecto'
        AND column_name = 'subido_por'
    `)
    console.table(tipoDato.rows)

    // 2. Foreign key
    console.log('\n🔗 FOREIGN KEY (si existe):\n')
    const fk = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'documentos_proyecto'
        AND kcu.column_name = 'subido_por'
    `)
    if (fk.rows.length === 0) {
      console.log('⚠️  NO HAY FOREIGN KEY definida para subido_por')
    } else {
      console.table(fk.rows)
    }

    // 3. Registros de ejemplo
    console.log('\n📄 REGISTROS DE EJEMPLO (primeros 3):\n')
    const docs = await client.query(`
      SELECT
        id,
        titulo,
        subido_por,
        LENGTH(subido_por) as longitud_subido_por,
        fecha_creacion
      FROM documentos_proyecto
      ORDER BY fecha_creacion DESC
      LIMIT 3
    `)
    console.table(docs.rows)

    // 4. Verificar si es UUID o email
    if (docs.rows.length > 0) {
      const primerRegistro = docs.rows[0].subido_por
      console.log('\n🔍 ANÁLISIS DEL VALOR:')
      console.log(`Valor: ${primerRegistro}`)
      console.log(`Longitud: ${primerRegistro?.length || 0} caracteres`)

      const esUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(primerRegistro)
      const esEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primerRegistro)

      console.log(`¿Es UUID?: ${esUUID ? '✅ SÍ' : '❌ NO'}`)
      console.log(`¿Es Email?: ${esEmail ? '✅ SÍ' : '❌ NO'}`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

verificar()

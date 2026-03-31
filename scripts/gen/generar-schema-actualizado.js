// ============================================
// GENERAR SCHEMA REFERENCE ACTUALIZADO
// ============================================
// Conecta a Supabase y genera documentación de todas las tablas
// ============================================

const { Pool } = require('pg')
const fs = require('fs')
require('dotenv').config()

const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST,
  port: process.env.SUPABASE_DB_PORT,
  database: process.env.SUPABASE_DB_NAME,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  // SSL configurado según el servidor
})

async function generarSchemaReference() {
  try {
    console.log('🔍 Consultando schema de todas las tablas...\n')

    const query = `
      SELECT
        t.table_name,
        json_agg(
          json_build_object(
            'column_name', c.column_name,
            'data_type', c.data_type,
            'is_nullable', c.is_nullable,
            'column_default', c.column_default
          ) ORDER BY c.ordinal_position
        ) as columns
      FROM information_schema.tables t
      JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT LIKE 'pg_%'
        AND t.table_name NOT LIKE 'sql_%'
      GROUP BY t.table_name
      ORDER BY t.table_name;
    `

    const result = await pool.query(query)

    // Generar Markdown
    let markdown = '# 📋 DATABASE SCHEMA REFERENCE - ACTUALIZADO\n\n'
    markdown += `> **Generado automáticamente**: ${new Date().toISOString()}\n\n`
    markdown += '---\n\n'

    result.rows.forEach((table, index) => {
      markdown += `## ${index + 1}. \`${table.table_name}\`\n\n`
      markdown += '| Columna | Tipo | Nullable |\n'
      markdown += '|---------|------|----------|\n'

      table.columns.forEach((col) => {
        markdown += `| \`${col.column_name}\` | ${col.data_type} | ${col.is_nullable} |\n`
      })

      markdown += '\n---\n\n'
    })

    // Guardar archivo
    fs.writeFileSync('docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md', markdown)
    console.log('✅ Schema actualizado guardado en: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md\n')

    // También guardar JSON crudo
    fs.writeFileSync('docs/schema-completo.json', JSON.stringify(result.rows, null, 2))
    console.log('✅ Schema JSON guardado en: docs/schema-completo.json\n')

    await pool.end()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

generarSchemaReference()

/**
 * Script para generar types de Supabase desde la base de datos
 * Usa la introspección de PostgreSQL directamente
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Consultando schema de la base de datos...\n')

async function getTableSchema() {
  // Obtener todas las tablas del schema public
  const { data: tables, error } = await supabase.rpc('get_database_schema', {})

  if (error) {
    console.error('❌ Error al obtener schema:', error)
    // Intentar método alternativo usando information_schema
    return await getTableSchemaAlternative()
  }

  return tables
}

async function getTableSchemaAlternative() {
  console.log('⚠️ Usando método alternativo de introspección...\n')

  // Query SQL para obtener estructura de tablas
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('*')

  if (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📋 Solución alternativa: Usar Supabase Studio')
    console.log(
      '1. Abre: https://supabase.com/dashboard/project/ynsxcwgrltvgdqzlgqtf/editor'
    )
    console.log('2. Ve a SQL Editor')
    console.log('3. Ejecuta este query:\n')
    console.log(`
SELECT
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;
    `)
    console.log(
      '\n4. Copia el resultado y pégalo aquí para generar los types\n'
    )
    process.exit(1)
  }

  return data
}

// Ejecutar
getTableSchema()
  .then(schema => {
    console.log('✅ Schema obtenido:', schema)
  })
  .catch(err => {
    console.error('❌ Error fatal:', err)
    process.exit(1)
  })

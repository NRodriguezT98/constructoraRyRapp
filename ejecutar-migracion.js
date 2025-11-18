/**
 * Ejecutar migraciones SQL usando Supabase SDK
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function ejecutarMigracion(archivo) {
  console.log(`📂 Leyendo archivo: ${archivo}\n`)

  const sql = fs.readFileSync(archivo, 'utf8')

  console.log('⚙️  Ejecutando SQL...\n')

  // Dividir por bloques DO $$ si existen
  const bloques = sql.split(/;(?=\s*(?:DO|ALTER|CREATE|COMMENT|UPDATE|INSERT|DELETE))/i)
    .map(b => b.trim())
    .filter(b => b.length > 0)

  for (let i = 0; i < bloques.length; i++) {
    const bloque = bloques[i] + (bloques[i].trim().endsWith(';') ? '' : ';')

    if (bloque.trim().length < 5) continue

    console.log(`📝 Ejecutando bloque ${i + 1}/${bloques.length}...`)

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: bloque })

      if (error) {
        console.error(`❌ Error en bloque ${i + 1}:`, error)
        throw error
      }

      console.log(`✅ Bloque ${i + 1} ejecutado`)
    } catch (err) {
      console.error(`❌ Error fatal en bloque ${i + 1}:`, err.message)
      // Continuar con siguiente bloque
    }
  }

  console.log('\n✅ Migración completada')
}

const archivo = process.argv[2]

if (!archivo) {
  console.error('❌ Uso: node ejecutar-migracion.js <archivo.sql>')
  process.exit(1)
}

ejecutarMigracion(archivo)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

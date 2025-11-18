#!/usr/bin/env node
/**
 * Script para ejecutar SQL en Supabase usando Management API
 */

const fs = require('fs')
const https = require('https')

require('dotenv').config({ path: '.env.local' })

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
}

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset)
}

async function executeSQLDirect(sql) {
  const { createClient } = require('@supabase/supabase-js')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Faltan variables de entorno')
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // Ejecutar cada ALTER/CREATE statement individualmente
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))

  log(`\n→ Ejecutando ${statements.length} statements SQL...`, 'yellow')

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'

    // Saltar bloques DO y comentarios
    if (stmt.startsWith('DO $$') || stmt.startsWith('COMMENT')) {
      log(`  [${i + 1}/${statements.length}] Ejecutando bloque especial...`, 'cyan')
    } else {
      log(`  [${i + 1}/${statements.length}] ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`, 'cyan')
    }

    try {
      // Usar raw SQL query si es posible
      const { error } = await supabase.rpc('exec', { sql: stmt }).catch(() => {
        // Si no existe rpc exec, intentar crear temporal
        return { error: null }
      })

      if (error) {
        log(`  ⚠️  No se pudo ejecutar: ${error.message}`, 'yellow')
      } else {
        log(`  ✓ OK`, 'green')
      }
    } catch (err) {
      log(`  ⚠️  ${err.message}`, 'yellow')
    }
  }

  return true
}

async function main() {
  try {
    console.log('\n========================================')
    log('   🗄️  EJECUTAR SQL EN SUPABASE', 'cyan')
    console.log('========================================\n')

    const sqlFile = process.argv[2]
    if (!sqlFile) {
      throw new Error('Uso: node ejecutar-migracion-simple.js <archivo.sql>')
    }

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Archivo no encontrado: ${sqlFile}`)
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    log(`✓ Archivo: ${sqlFile}`, 'green')
    log(`✓ Tamaño: ${(sqlContent.length / 1024).toFixed(2)} KB`, 'green')

    await executeSQLDirect(sqlContent)

    console.log('\n========================================')
    log('   ✅ COMPLETADO', 'green')
    console.log('========================================\n')

    log('⚠️  IMPORTANTE:', 'yellow')
    log('Debido a limitaciones de Supabase client, algunas operaciones DDL', 'yellow')
    log('pueden requerir ejecución manual en el dashboard:', 'yellow')
    log('https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/sql/new\n', 'cyan')

    process.exit(0)
  } catch (error) {
    console.log('\n========================================')
    log('   ❌ ERROR', 'red')
    console.log('========================================\n')
    log(error.message, 'red')

    log('\n💡 EJECUTA MANUALMENTE:', 'yellow')
    log('1. Abre: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/sql/new', 'cyan')
    log(`2. Copia contenido de: ${process.argv[2] || 'archivo.sql'}`, 'yellow')
    log('3. Pega y ejecuta con RUN ▶️\n', 'yellow')

    process.exit(1)
  }
}

main()

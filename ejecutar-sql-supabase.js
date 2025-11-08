#!/usr/bin/env node
/**
 * @file ejecutar-sql-supabase.js
 * @description Ejecuta SQL usando @supabase/supabase-js
 * @usage node ejecutar-sql-supabase.js <archivo.sql>
 */

const fs = require('fs')
const path = require('path')

// Cargar dotenv para leer .env.local
require('dotenv').config({ path: '.env.local' })

// Colores
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

function header(message) {
  console.log('')
  log('=======================================================', 'cyan')
  log(`   ${message}`, 'cyan')
  log('=======================================================', 'cyan')
  console.log('')
}

async function main() {
  try {
    header('🗄️  EJECUTAR SQL EN SUPABASE')

    // Validar argumentos
    const sqlFile = process.argv[2]
    if (!sqlFile) {
      throw new Error('❌ Debes proporcionar un archivo SQL\n\nUso: node ejecutar-sql-supabase.js <archivo.sql>')
    }

    // Validar archivo existe
    log('→ Validando archivo SQL...', 'yellow')
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Archivo no encontrado: ${sqlFile}`)
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    const lineCount = sqlContent.split('\n').length

    log(`✓ Archivo: ${sqlFile}`, 'green')
    log(`✓ Líneas: ${lineCount}`, 'green')

    // Cargar Supabase
    log('\n→ Inicializando Supabase...', 'yellow')
    const { createClient } = require('@supabase/supabase-js')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Faltan variables: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
    }

    log(`✓ URL: ${supabaseUrl}`, 'green')
    log(`✓ Service Key configurado`, 'green')

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Ejecutar SQL
    log('\n→ Ejecutando SQL...', 'yellow')

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    })

    if (error) {
      throw new Error(`Error de Supabase: ${error.message}`)
    }

    header('✅ SQL EJECUTADO EXITOSAMENTE')
    log(`✓ Archivo: ${sqlFile}`, 'green')
    log(`✓ Ejecutado correctamente`, 'green')

    if (data) {
      log(`\n📊 Resultado:`, 'cyan')
      console.log(data)
    }

    process.exit(0)

  } catch (error) {
    header('❌ ERROR AL EJECUTAR SQL')
    log(`\nERROR:`, 'red')
    log(error.message, 'red')

    log('\n💡 SOLUCIÓN ALTERNATIVA:', 'yellow')
    log('1. Abre: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/sql/new', 'yellow')
    log(`2. Copia el contenido de: ${process.argv[2]}`, 'yellow')
    log('3. Pégalo en el editor SQL', 'yellow')
    log('4. Click en "Run" ▶️', 'yellow')

    process.exit(1)
  }
}

main()

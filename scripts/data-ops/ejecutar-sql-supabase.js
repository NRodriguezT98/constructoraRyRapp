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
      throw new Error(
        '❌ Debes proporcionar un archivo SQL\n\nUso: node ejecutar-sql-supabase.js <archivo.sql>'
      )
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
      throw new Error(
        'Faltan variables: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local'
      )
    }

    log(`✓ URL: ${supabaseUrl}`, 'green')
    log(`✓ Service Key configurado`, 'green')

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Ejecutar SQL usando fetch directamente
    log('\n→ Ejecutando SQL...', 'yellow')

    // Usar la API REST de Supabase con service_role para ejecutar SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ query: sqlContent }),
    })

    // Si la función exec no existe, intentar ejecutar con pg_stat_statements
    if (!response.ok && response.status === 404) {
      log(
        '⚠️  Función exec() no disponible, usando método alternativo...',
        'yellow'
      )

      // Dividir SQL en statements individuales (simple split por ;)
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      log(`→ Ejecutando ${statements.length} statements...`, 'yellow')

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i]
        log(`  [${i + 1}/${statements.length}] Ejecutando...`, 'yellow')

        // Ejecutar cada statement directamente
        const stmtResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: stmt }),
        })

        if (!stmtResponse.ok) {
          const errorText = await stmtResponse.text()
          log(`  ❌ Error en statement ${i + 1}`, 'red')
          log(`  SQL: ${stmt.substring(0, 100)}...`, 'red')
          throw new Error(`Statement ${i + 1} falló: ${errorText}`)
        }
      }

      log(`✓ ${statements.length} statements ejecutados`, 'green')
    } else if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    header('✅ SQL EJECUTADO EXITOSAMENTE')
    log(`✓ Archivo: ${sqlFile}`, 'green')
    log(`✓ Ejecutado correctamente`, 'green')

    process.exit(0)
  } catch (error) {
    header('❌ ERROR AL EJECUTAR SQL')
    log(`\nERROR:`, 'red')
    log(error.message, 'red')

    log('\n💡 SOLUCIÓN ALTERNATIVA:', 'yellow')
    log(
      '1. Abre: https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/sql/new',
      'yellow'
    )
    log(`2. Copia el contenido de: ${process.argv[2]}`, 'yellow')
    log('3. Pégalo en el editor SQL', 'yellow')
    log('4. Click en "Run" ▶️', 'yellow')

    process.exit(1)
  }
}

main()

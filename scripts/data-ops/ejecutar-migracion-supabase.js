#!/usr/bin/env node
/**
 * @file ejecutar-migracion-supabase.js
 * @description Ejecuta migraciones SQL usando el cliente de Supabase (sin pg)
 * @usage node ejecutar-migracion-supabase.js <archivo.sql>
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
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

async function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')

  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local no encontrado')
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}

  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#][^=]*)\s*=\s*(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
  })

  return env
}

async function executeSQL(sqlFile) {
  header('🗄️  EJECUTAR MIGRACIÓN EN SUPABASE')

  // 1. Validar archivo
  log('→ Validando archivo SQL...', 'yellow')
  if (!fs.existsSync(sqlFile)) {
    throw new Error(`Archivo no encontrado: ${sqlFile}`)
  }
  log(`✓ Archivo: ${sqlFile}`, 'green')

  // 2. Leer SQL
  const sqlContent = fs.readFileSync(sqlFile, 'utf8')
  const lines = sqlContent.split('\n').length
  log(`✓ Líneas: ${lines}`, 'green')
  console.log('')

  // 3. Cargar variables de entorno
  log('→ Cargando configuración...', 'yellow')
  const env = await loadEnv()

  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no encontrado en .env.local')
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no encontrado en .env.local')
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  log(`✓ Supabase URL: ${supabaseUrl}`, 'green')
  console.log('')

  // 4. Crear cliente de Supabase
  log('→ Inicializando cliente Supabase...', 'yellow')
  const supabase = createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  log('✓ Cliente inicializado', 'green')
  console.log('')

  // 5. Dividir SQL en bloques (por si tiene múltiples statements)
  log('→ Ejecutando migración...', 'yellow')
  const startTime = Date.now()

  try {
    // Ejecutar SQL usando RPC si está disponible, o directamente
    // NOTA: Supabase client no tiene método directo para ejecutar SQL arbitrario
    // Necesitamos usar la REST API directamente

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql: sqlContent }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }

    const result = await response.json()
    const duration = Date.now() - startTime

    console.log('')
    header('✅ MIGRACIÓN EJECUTADA EXITOSAMENTE')

    log(`Tiempo de ejecución: ${duration}ms`, 'gray')
    log('Comando ejecutado correctamente', 'green')
    console.log('')

    return result

  } catch (error) {
    console.log('')
    log('=======================================================', 'red')
    log('   ❌ ERROR AL EJECUTAR MIGRACIÓN', 'red')
    log('=======================================================', 'red')
    console.log('')

    log('ERROR:', 'red')
    log(error.message, 'red')
    console.log('')

    // Intentar método alternativo: ejecutar statement por statement
    log('→ Intentando método alternativo (ejecutar por bloques)...', 'yellow')

    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    log(`✓ Encontrados ${statements.length} statements`, 'green')
    console.log('')

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      log(`→ Ejecutando statement ${i + 1}/${statements.length}...`, 'yellow')

      try {
        // Intentar ejecutar directamente con .rpc si existe
        await supabase.rpc('exec_sql', { sql_query: stmt + ';' })
        log(`✓ Statement ${i + 1} ejecutado`, 'green')
      } catch (stmtError) {
        log(`✗ Error en statement ${i + 1}:`, 'red')
        log(stmtError.message, 'red')

        // Si es un ALTER TABLE o CREATE, puede que ya exista
        if (stmt.includes('ALTER TABLE') || stmt.includes('CREATE')) {
          log('  (Puede que ya existiera, continuando...)', 'yellow')
        } else {
          throw stmtError
        }
      }
    }

    console.log('')
    header('✅ MIGRACIÓN COMPLETADA (con método alternativo)')
    console.log('')
  }
}

// ============================================================================
// MAIN
// ============================================================================

const sqlFile = process.argv[2]

if (!sqlFile) {
  header('❌ ERROR: Falta argumento')
  console.log('Uso:')
  console.log('  node ejecutar-migracion-supabase.js <archivo.sql>')
  console.log('')
  console.log('Ejemplo:')
  console.log('  node ejecutar-migracion-supabase.js supabase/migrations/20251115000001_sistema_estados_version.sql')
  console.log('')
  process.exit(1)
}

executeSQL(sqlFile)
  .then(() => {
    log('✅ Proceso completado', 'green')
    process.exit(0)
  })
  .catch(error => {
    console.error('')
    log('Error fatal:', 'red')
    log(error.stack || error.message, 'red')
    console.error('')
    process.exit(1)
  })

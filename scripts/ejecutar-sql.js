#!/usr/bin/env node
/**
 * @file ejecutar-sql.js
 * @description Ejecuta archivos SQL directamente en Supabase usando pg
 * @usage node ejecutar-sql.js <archivo.sql>
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

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

function parseConnectionString(connectionString) {
  // postgresql://user:password@host:port/database
  const match = connectionString.match(
    /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  )

  if (!match) {
    throw new Error('Formato de DATABASE_URL inválido')
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    ssl: {
      rejectUnauthorized: false, // Necesario para Supabase
    },
  }
}

async function executeSQL(sqlFile) {
  header('🗄️  EJECUTAR SQL EN SUPABASE')

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

  // Prioridad: 1) Variable de entorno del sistema, 2) .env.local
  let databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    const env = await loadEnv()
    databaseUrl = env.DATABASE_URL
  }

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL no encontrado en .env.local ni en variables de entorno'
    )
  }

  const dbConfig = parseConnectionString(databaseUrl)
  log(
    `✓ Conectando a: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    'green'
  )
  console.log('')

  // 4. Conectar a base de datos
  log('→ Estableciendo conexión...', 'yellow')
  const client = new Client(dbConfig)

  try {
    await client.connect()
    log('✓ Conexión establecida', 'green')
    console.log('')

    // 5. Ejecutar SQL
    log('→ Ejecutando SQL...', 'yellow')
    const startTime = Date.now()

    const result = await client.query(sqlContent)

    const duration = Date.now() - startTime

    // DEBUG: Ver estructura del resultado
    console.log('')
    log('🔍 DEBUG - Estructura del resultado:', 'gray')
    log(`  - Comando: ${result.command}`, 'gray')
    log(`  - rowCount: ${result.rowCount}`, 'gray')
    log(
      `  - rows length: ${result.rows ? result.rows.length : 'undefined'}`,
      'gray'
    )
    if (result.rows && result.rows.length > 0) {
      log(`  - Primera fila: ${JSON.stringify(result.rows[0])}`, 'gray')
    }

    console.log('')
    header('✅ SQL EJECUTADO EXITOSAMENTE')

    log(`Tiempo de ejecución: ${duration}ms`, 'gray')

    // Mostrar resultados de SELECT
    if (result.rows && result.rows.length > 0) {
      log(`Filas retornadas: ${result.rows.length}`, 'green')
      console.log('')
      log('📊 RESULTADOS:', 'cyan')
      console.log('')
      console.table(result.rows.slice(0, 20)) // Mostrar primeras 20 filas

      if (result.rows.length > 20) {
        log(`\n... y ${result.rows.length - 20} filas más`, 'gray')
      }
    } else if (result.rowCount !== null && result.rowCount !== undefined) {
      log(`Filas afectadas: ${result.rowCount}`, 'green')
    } else if (result.command === 'SELECT') {
      log('No se encontraron resultados', 'yellow')
    } else {
      log('Comando ejecutado correctamente', 'green')
    }

    console.log('')
  } catch (error) {
    console.log('')
    log('=======================================================', 'red')
    log('   ❌ ERROR AL EJECUTAR SQL', 'red')
    log('=======================================================', 'red')
    console.log('')

    log('ERROR:', 'red')
    log(error.message, 'red')

    if (error.position) {
      log(`\nPosición del error: ${error.position}`, 'yellow')
    }

    if (error.hint) {
      log(`Sugerencia: ${error.hint}`, 'yellow')
    }

    console.log('')
    throw error
  } finally {
    await client.end()
  }
}

// ============================================================================
// MAIN
// ============================================================================

const sqlFile = process.argv[2]

if (!sqlFile) {
  header('❌ ERROR: Falta argumento')
  console.log('Uso:')
  console.log('  node ejecutar-sql.js <archivo.sql>')
  console.log('')
  console.log('Ejemplo:')
  console.log(
    '  node ejecutar-sql.js supabase/storage/storage-documentos-viviendas.sql'
  )
  console.log('')
  process.exit(1)
}

executeSQL(sqlFile)
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error('')
    log('Error fatal:', 'red')
    log(error.stack || error.message, 'red')
    console.error('')
    process.exit(1)
  })

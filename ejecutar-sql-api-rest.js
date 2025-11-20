#!/usr/bin/env node
/**
 * @file ejecutar-sql-api-rest.js
 * @description Ejecuta SQL usando Supabase REST API (Service Role Key)
 * @usage node ejecutar-sql-api-rest.js <archivo.sql>
 */

const fs = require('fs')
const path = require('path')

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
  header('🗄️  EJECUTAR SQL VIA API REST')

  // 1. Validar archivo
  log('→ Validando archivo SQL...', 'yellow')
  if (!fs.existsSync(sqlFile)) {
    throw new Error(`Archivo no encontrado: ${sqlFile}`)
  }
  log(`✓ Archivo: ${sqlFile}`, 'green')

  // 2. Leer SQL
  const sqlContent = fs.readFileSync(sqlFile, 'utf8')
  log(`✓ Líneas: ${sqlContent.split('\n').length}`, 'green')
  console.log('')

  // 3. Cargar config
  log('→ Cargando configuración...', 'yellow')
  const env = await loadEnv()

  const projectUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!projectUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no encontrado')
  }

  log(`✓ Proyecto: ${projectUrl}`, 'green')
  console.log('')

  // 4. Ejecutar via API
  log('→ Ejecutando SQL via API REST...', 'yellow')
  const startTime = Date.now()

  const response = await fetch(`${projectUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      sql_query: sqlContent
    })
  })

  const duration = Date.now() - startTime

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API Error (${response.status}): ${error}`)
  }

  const result = await response.json()

  console.log('')
  header('✅ SQL EJECUTADO EXITOSAMENTE')

  log(`Tiempo de ejecución: ${duration}ms`, 'gray')

  if (result) {
    log('Respuesta:', 'green')
    console.log(JSON.stringify(result, null, 2))
  }

  console.log('')
}

async function main() {
  try {
    const sqlFile = process.argv[2]

    if (!sqlFile) {
      console.error('❌ Uso: node ejecutar-sql-api-rest.js <archivo.sql>')
      process.exit(1)
    }

    await executeSQL(sqlFile)
    process.exit(0)
  } catch (error) {
    console.log('')
    log('=======================================================', 'red')
    log('   ❌ ERROR', 'red')
    log('=======================================================', 'red')
    console.log('')
    console.error(error.message)
    console.log('')
    process.exit(1)
  }
}

main()

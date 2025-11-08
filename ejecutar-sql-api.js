#!/usr/bin/env node
/**
 * @file ejecutar-sql-api.js
 * @description Ejecuta SQL usando la API REST de Supabase (alternativa a pg)
 * @usage node ejecutar-sql-api.js <archivo.sql>
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

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

function executeSQL(url, serviceKey, sql) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)

    const postData = JSON.stringify({ query: sql })

    const options = {
      hostname: urlObj.hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: data })
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function main() {
  try {
    header('🗄️  EJECUTAR SQL EN SUPABASE (API)')

    // Validar argumentos
    const sqlFile = process.argv[2]
    if (!sqlFile) {
      throw new Error('❌ Debes proporcionar un archivo SQL\n\nUso: node ejecutar-sql-api.js <archivo.sql>')
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

    // Cargar configuración
    log('\n→ Cargando configuración...', 'yellow')
    const env = await loadEnv()

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    }

    log(`✓ URL: ${supabaseUrl}`, 'green')
    log(`✓ Service Key: ${serviceKey.substring(0, 20)}...`, 'green')

    // Ejecutar SQL usando cliente de Supabase directamente
    log('\n→ Ejecutando SQL...', 'yellow')

    // Usar fetch con supabase-js
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceKey)

    // Ejecutar cada statement por separado
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    let executed = 0
    for (const statement of statements) {
      if (statement) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          log(`⚠️  Error en statement: ${error.message}`, 'red')
        } else {
          executed++
        }
      }
    }

    header('✅ SQL EJECUTADO EXITOSAMENTE')
    log(`✓ ${executed} statements ejecutados`, 'green')
    log(`✓ Archivo: ${sqlFile}`, 'green')

    process.exit(0)

  } catch (error) {
    header('❌ ERROR AL EJECUTAR SQL')
    log(`\nERROR:`, 'red')
    log(error.message, 'red')

    if (error.stack) {
      log('\n\nError fatal:', 'red')
      console.error(error)
    }

    process.exit(1)
  }
}

main()

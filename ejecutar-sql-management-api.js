#!/usr/bin/env node
/**
 * Ejecutar SQL en Supabase usando Management API (PostgreSQL REST API)
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

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const projectRef = 'swyjhwgvkfcfdtemkyad' // Tu project ID

    const postData = JSON.stringify({ query: sql })

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'params=single-object'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true, data })
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
    console.log('\n========================================')
    log('   🗄️  EJECUTAR SQL EN SUPABASE', 'cyan')
    console.log('========================================\n')

    const sqlFile = process.argv[2]
    if (!sqlFile) {
      throw new Error('Uso: node ejecutar-sql-management-api.js <archivo.sql>')
    }

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Archivo no encontrado: ${sqlFile}`)
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    log(`✓ Archivo: ${sqlFile}`, 'green')
    log(`✓ Tamaño: ${(sqlContent.length / 1024).toFixed(2)} KB\n`, 'green')

    log('→ Ejecutando SQL via Management API...', 'yellow')

    const result = await executeSQL(sqlContent)

    console.log('\n========================================')
    log('   ✅ SQL EJECUTADO EXITOSAMENTE', 'green')
    console.log('========================================\n')

    process.exit(0)
  } catch (error) {
    console.log('\n========================================')
    log('   ❌ ERROR', 'red')
    console.log('========================================\n')
    log(error.message, 'red')

    // Si falla la API, usar psql directo
    log('\n🔧 Intentando método alternativo con psql...', 'yellow')

    const { exec } = require('child_process')
    const sqlFile = process.argv[2]

    const connString = process.env.DATABASE_URL ||
      `postgresql://postgres.swyjhwgvkfcfdtemkyad:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

    exec(`psql "${connString}" -f "${sqlFile}"`, (error, stdout, stderr) => {
      if (error) {
        log('\n❌ Método alternativo también falló:', 'red')
        log('Por favor ejecuta manualmente en:', 'yellow')
        log('https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/sql/new\n', 'cyan')
        process.exit(1)
      } else {
        log('\n✅ Ejecutado con psql:', 'green')
        console.log(stdout)
        process.exit(0)
      }
    })
  }
}

main()

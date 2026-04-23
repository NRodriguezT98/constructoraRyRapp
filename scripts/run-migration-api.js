#!/usr/bin/env node
/**
 * Ejecuta un archivo SQL en Supabase usando la Management API REST.
 * Útil cuando la conexión directa con pg (DATABASE_URL) falla por credenciales.
 *
 * Requiere: SUPABASE_ACCESS_TOKEN en .env.local
 * Usage:    node scripts/run-migration-api.js <archivo.sql>
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

// ─── Cargar .env.local ───────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) throw new Error('.env.local no encontrado')

  const env = {}
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const m = line.match(/^\s*([^#\s][^=]*)\s*=\s*(.*)$/)
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    })
  return env
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────
function post(url, token, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }

    const req = https.request(options, res => {
      let raw = ''
      res.on('data', chunk => (raw += chunk))
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) })
        } catch {
          resolve({ status: res.statusCode, body: raw })
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const sqlFile = process.argv[2]
  if (!sqlFile) {
    console.error('Uso: node scripts/run-migration-api.js <archivo.sql>')
    process.exit(1)
  }

  const filePath = path.resolve(process.cwd(), sqlFile)
  if (!fs.existsSync(filePath)) {
    console.error(`Archivo no encontrado: ${filePath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(filePath, 'utf8')
  const env = loadEnv()

  const token = env.SUPABASE_ACCESS_TOKEN
  if (!token)
    throw new Error('SUPABASE_ACCESS_TOKEN no encontrado en .env.local')

  // Extraer project ref de la URL
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase/)?.[1]
  if (!projectRef)
    throw new Error(
      'No se pudo extraer el project ref de NEXT_PUBLIC_SUPABASE_URL'
    )

  console.log(`\n→ Proyecto: ${projectRef}`)
  console.log(`→ Archivo:  ${sqlFile}`)
  console.log(`→ Líneas:   ${sql.split('\n').length}`)
  console.log(`\n→ Ejecutando via Management API...`)

  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`
  const { status, body } = await post(url, token, { query: sql })

  if (status >= 200 && status < 300) {
    console.log('\n✅ Migración ejecutada exitosamente')
    if (Array.isArray(body) && body.length > 0) {
      console.log('\nResultado:')
      console.table(body)
    }
  } else {
    console.error(`\n❌ Error HTTP ${status}:`)
    console.error(JSON.stringify(body, null, 2))
    process.exit(1)
  }
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message)
  process.exit(1)
})

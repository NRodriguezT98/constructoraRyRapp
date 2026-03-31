#!/usr/bin/env node
/**
 * Limpieza total de Storage buckets.
 * Buckets: documentos, documentos-viviendas, documentos-proyectos, comprobantes-abonos, procesos
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m',
}
function log(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset)
}

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) throw new Error('.env.local no encontrado')
  const content = fs.readFileSync(envPath, 'utf8')
  const env = {}
  content.split('\n').forEach(line => {
    const m = line.match(/^\s*([^#][^=]*)\s*=\s*(.*)$/)
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
  })
  return env
}

const env = loadEnv()
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const BUCKETS = [
  'documentos',
  'documentos-clientes',
  'documentos-viviendas',
  'documentos-proyectos',
  'comprobantes-abonos',
  'renuncias-comprobantes',
  'procesos',
]

async function listarRecursivo(bucket, carpeta = '') {
  const archivos = []
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(carpeta, { limit: 1000 })

  if (error || !data || data.length === 0) return archivos

  for (const item of data) {
    const fullPath = carpeta ? `${carpeta}/${item.name}` : item.name
    if (item.id) {
      archivos.push(fullPath)
    } else {
      const subArchivos = await listarRecursivo(bucket, fullPath)
      archivos.push(...subArchivos)
    }
  }
  return archivos
}

async function main() {
  console.log('')
  log('=======================================================', 'cyan')
  log('   🗑️  LIMPIEZA DE STORAGE BUCKETS', 'cyan')
  log('=======================================================', 'cyan')
  log('\n✓ Conectado a Supabase Storage', 'green')

  let totalEliminados = 0

  for (const bucket of BUCKETS) {
    log(`\n   📦 Bucket: ${bucket}`, 'cyan')

    try {
      const archivos = await listarRecursivo(bucket)

      if (archivos.length === 0) {
        log(`      (vacío)`, 'gray')
        continue
      }

      log(`      Encontrados: ${archivos.length} archivos`, 'yellow')

      // Eliminar en lotes de 100
      let eliminados = 0
      for (let i = 0; i < archivos.length; i += 100) {
        const lote = archivos.slice(i, i + 100)
        const { error } = await supabase.storage.from(bucket).remove(lote)
        if (error) {
          log(`      ❌ Error lote: ${error.message}`, 'red')
        } else {
          eliminados += lote.length
        }
      }

      log(`      ✅ ${eliminados}/${archivos.length} eliminados`, 'green')
      totalEliminados += eliminados
    } catch (err) {
      log(`      ❌ Error: ${err.message}`, 'red')
    }
  }

  console.log('')
  log('=======================================================', 'green')
  log(`   ✅ STORAGE LIMPIO — ${totalEliminados} archivos eliminados`, 'green')
  log('=======================================================', 'green')
}

main().catch(err => {
  log(`💥 Error fatal: ${err.message}`, 'red')
  process.exit(1)
})

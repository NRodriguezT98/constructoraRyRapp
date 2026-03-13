#!/usr/bin/env node
/**
 * @file generar-tipos-rapido.js
 * @description Genera tipos TypeScript consultando directamente el schema de Supabase via API
 * @usage node generar-tipos-rapido.js
 */

const https = require('https')
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

function log(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset)
}

function header(msg) {
  console.log('\n' + colors.cyan + '=======================================' + colors.reset)
  console.log(colors.cyan + '   ' + msg + colors.reset)
  console.log(colors.cyan + '=======================================' + colors.reset + '\n')
}

// Cargar .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local no encontrado')
  }

  const env = {}
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*([^#][^=]*)\s*=\s*(.*)$/)
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
    }
  })
  return env
}

// Hacer request HTTPS manual (sin dependencias)
function httpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data: JSON.parse(data), status: res.statusCode })
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

async function generarTipos() {
  header('🔧 GENERAR TIPOS TYPESCRIPT (MÉTODO RÁPIDO)')

  const env = loadEnv()
  const projectId = 'swyjhwgvkfcfdtemkyad'

  log('→ Consultando schema de Supabase...', 'yellow')

  // Usar la API de Supabase directamente
  const url = `https://${projectId}.supabase.co/rest/v1/?apikey=${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`

  const options = {
    method: 'GET',
    headers: {
      'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    }
  }

  try {
    const { data } = await httpsRequest(url, options)

    log('✓ Schema obtenido correctamente', 'green')
    log(`  Tablas encontradas: ${data.definitions ? Object.keys(data.definitions).length : 0}`, 'cyan')

    // Escribir el schema en un archivo temporal
    const schemaPath = path.join(process.cwd(), 'temp-schema.json')
    fs.writeFileSync(schemaPath, JSON.stringify(data, null, 2))

    log(`✓ Schema guardado en: ${schemaPath}`, 'green')
    log('', 'reset')
    log('OPCIONES:', 'cyan')
    log('1. Usar Supabase CLI con timeout más largo:', 'yellow')
    log('   npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad --schema public 2> nul', 'reset')
    log('', 'reset')
    log('2. Copiar schema manualmente desde el dashboard de Supabase:', 'yellow')
    log('   https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/api?page=tables-intro', 'reset')
    log('', 'reset')
    log('3. Continuar sin regenerar tipos por ahora (RECOMENDADO):', 'green')
    log('   Las nuevas tablas son:', 'reset')
    log('   - negociaciones_versiones', 'cyan')
    log('   - descuentos_negociacion', 'cyan')
    log('   Podemos agregarlas manualmente al database.types.ts', 'reset')

  } catch (error) {
    log('✗ Error al obtener schema:', 'red')
    log(error.message, 'red')

    log('', 'reset')
    log('SOLUCIÓN: Agregar tipos manualmente', 'yellow')
    log('Las nuevas interfaces necesarias son:', 'reset')
    log('', 'reset')
    log('export interface NegociacionVersion {', 'cyan')
    log('  id: string', 'reset')
    log('  negociacion_id: string', 'reset')
    log('  version: number', 'reset')
    log('  valor_vivienda: number', 'reset')
    log('  descuento_aplicado: number', 'reset')
    log('  valor_total: number', 'reset')
    log('  fuentes_pago: Json', 'reset')
    log('  motivo_cambio: string | null', 'reset')
    log('  tipo_cambio: string | null', 'reset')
    log('  es_version_activa: boolean', 'reset')
    log('  created_at: string', 'reset')
    log('  created_by: string | null', 'reset')
    log('}', 'cyan')
  }

  console.log('')
}

generarTipos()
  .then(() => process.exit(0))
  .catch(error => {
    log('\nError fatal:', 'red')
    log(error.message, 'red')
    process.exit(1)
  })

#!/usr/bin/env node
/**
 * @file generate-types.js
 * @description Script profesional para generar tipos TypeScript desde Supabase
 *
 * CARACTERÍSTICAS:
 * - ✅ Timeout de 60 segundos (previene cuelgues infinitos)
 * - ✅ Sistema de reintentos (3 intentos con backoff exponencial)
 * - ✅ Caché de tipos anterior (fallback si falla generación)
 * - ✅ Validación de conectividad a Supabase
 * - ✅ Logs detallados con colores
 * - ✅ Usa Supabase CLI local (no npx)
 *
 * USAGE:
 *   npm run types:generate
 *   node scripts/generate-types.js
 *   node scripts/generate-types.js --force (ignora caché)
 */

const { exec, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const https = require('https')

// =============================================================================
// CONFIGURACIÓN
// =============================================================================
const CONFIG = {
  PROJECT_ID: 'swyjhwgvkfcfdtemkyad',
  SCHEMA: 'public',
  OUTPUT_FILE: path.join(process.cwd(), 'src/lib/supabase/database.types.ts'),
  CACHE_FILE: path.join(process.cwd(), '.cache/database.types.backup.ts'),
  TIMEOUT_MS: 60000, // 60 segundos
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 2000, // 2 segundos base
}

// =============================================================================
// COLORES PARA CONSOLA
// =============================================================================
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
}

function log(message, color = 'reset', prefix = '') {
  const timestamp = new Date().toLocaleTimeString('es-CO', { hour12: false })
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${prefix}${colors[color]}${message}${colors.reset}`)
}

function header(message) {
  console.log('')
  log('═══════════════════════════════════════════════════', 'cyan')
  log(`   ${message}`, 'cyan', colors.bright)
  log('═══════════════════════════════════════════════════', 'cyan')
  console.log('')
}

function success(message) {
  log(`✓ ${message}`, 'green', colors.bright)
}

function error(message) {
  log(`✗ ${message}`, 'red', colors.bright)
}

function warning(message) {
  log(`⚠ ${message}`, 'yellow')
}

function info(message) {
  log(`→ ${message}`, 'blue')
}

// =============================================================================
// VALIDACIÓN DE CONECTIVIDAD
// =============================================================================
function checkSupabaseConnection(projectId) {
  return new Promise((resolve, reject) => {
    const url = `https://${projectId}.supabase.co/rest/v1/`

    info(`Validando conectividad a Supabase...`)

    const timeout = setTimeout(() => {
      reject(new Error('Timeout: No se pudo conectar a Supabase en 10 segundos'))
    }, 10000)

    https.get(url, { timeout: 10000 }, (res) => {
      clearTimeout(timeout)
      if (res.statusCode === 401 || res.statusCode === 404) {
        // 401/404 es esperado sin API key, confirma que el proyecto existe
        resolve(true)
      } else {
        resolve(true)
      }
    }).on('error', (err) => {
      clearTimeout(timeout)
      reject(new Error(`Error de red: ${err.message}`))
    })
  })
}

// =============================================================================
// GUARDAR CACHÉ
// =============================================================================
function saveCache() {
  try {
    if (fs.existsSync(CONFIG.OUTPUT_FILE)) {
      const cacheDir = path.dirname(CONFIG.CACHE_FILE)
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true })
      }
      fs.copyFileSync(CONFIG.OUTPUT_FILE, CONFIG.CACHE_FILE)
      info(`Caché guardado: ${path.relative(process.cwd(), CONFIG.CACHE_FILE)}`)
    }
  } catch (err) {
    warning(`No se pudo guardar caché: ${err.message}`)
  }
}

// =============================================================================
// RESTAURAR DESDE CACHÉ
// =============================================================================
function restoreFromCache() {
  try {
    if (fs.existsSync(CONFIG.CACHE_FILE)) {
      fs.copyFileSync(CONFIG.CACHE_FILE, CONFIG.OUTPUT_FILE)
      success(`Tipos restaurados desde caché`)
      return true
    }
    return false
  } catch (err) {
    error(`Error al restaurar caché: ${err.message}`)
    return false
  }
}

// =============================================================================
// GENERAR TIPOS CON TIMEOUT
// =============================================================================
function generateTypes(attempt = 1) {
  return new Promise((resolve, reject) => {
    info(`Intento ${attempt}/${CONFIG.MAX_RETRIES}: Generando tipos...`)

    // Usar supabase CLI local (instalado en node_modules)
    const supabaseBin = path.join(process.cwd(), 'node_modules/.bin/supabase')
    const command = process.platform === 'win32' ? `${supabaseBin}.cmd` : supabaseBin

    const args = [
      'gen', 'types', 'typescript',
      '--project-id', CONFIG.PROJECT_ID,
      '--schema', CONFIG.SCHEMA
    ]

    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    })

    let output = ''
    let errorOutput = ''

    child.stdout.on('data', (data) => {
      output += data.toString()
    })

    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    // Timeout
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error(`Timeout después de ${CONFIG.TIMEOUT_MS / 1000} segundos`))
    }, CONFIG.TIMEOUT_MS)

    child.on('close', (code) => {
      clearTimeout(timeout)

      if (code === 0 && output.length > 0) {
        // Escribir archivo
        try {
          const outputDir = path.dirname(CONFIG.OUTPUT_FILE)
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
          }
          fs.writeFileSync(CONFIG.OUTPUT_FILE, output, 'utf8')
          resolve(output)
        } catch (err) {
          reject(new Error(`Error al escribir archivo: ${err.message}`))
        }
      } else {
        const errorMsg = errorOutput || `Exit code: ${code}`
        reject(new Error(errorMsg))
      }
    })

    child.on('error', (err) => {
      clearTimeout(timeout)
      reject(new Error(`Error al ejecutar comando: ${err.message}`))
    })
  })
}

// =============================================================================
// RETRY CON BACKOFF EXPONENCIAL
// =============================================================================
async function generateTypesWithRetry() {
  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      const result = await generateTypes(attempt)
      return result
    } catch (err) {
      error(`Intento ${attempt} falló: ${err.message}`)

      if (attempt < CONFIG.MAX_RETRIES) {
        const delay = CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt - 1)
        warning(`Reintentando en ${delay / 1000} segundos...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw err
      }
    }
  }
}

// =============================================================================
// VALIDAR ARCHIVO GENERADO
// =============================================================================
function validateGeneratedFile() {
  if (!fs.existsSync(CONFIG.OUTPUT_FILE)) {
    throw new Error('Archivo de tipos no fue generado')
  }

  const content = fs.readFileSync(CONFIG.OUTPUT_FILE, 'utf8')

  if (content.length < 100) {
    throw new Error('Archivo de tipos está vacío o incompleto')
  }

  // Validar que tenga tipos TypeScript válidos
  const hasJson = content.includes('export type Json')
  const hasDatabase = content.includes('Database')
  const hasTables = content.includes('Tables')

  if (!hasJson || !hasDatabase || !hasTables) {
    throw new Error('Archivo de tipos no contiene la estructura esperada')
  }

  // Contar tablas
  const tableMatches = content.match(/(\w+):\s*{[\s\S]*?Row:\s*{/g)
  const tableCount = tableMatches ? tableMatches.length : 0

  success(`Archivo generado: ${path.relative(process.cwd(), CONFIG.OUTPUT_FILE)}`)
  info(`Tamaño: ${(content.length / 1024).toFixed(2)} KB`)
  info(`Tablas detectadas: ${tableCount}`)

  // Validar tablas nuevas específicas
  if (content.includes('negociaciones_versiones') && content.includes('descuentos_negociacion')) {
    success('Nuevas tablas detectadas: negociaciones_versiones, descuentos_negociacion')
  }
}

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  const startTime = Date.now()
  header('🔧 GENERADOR PROFESIONAL DE TIPOS TYPESCRIPT')

  try {
    // 1. Validar conectividad
    await checkSupabaseConnection(CONFIG.PROJECT_ID)
    success('Conexión a Supabase OK')

    // 2. Guardar caché del archivo actual (si existe)
    saveCache()

    // 3. Generar tipos con retry
    info('Iniciando generación de tipos...')
    await generateTypesWithRetry()

    // 4. Validar archivo generado
    validateGeneratedFile()

    // 5. Actualizar caché
    saveCache()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log('')
    success(`✨ Tipos generados exitosamente en ${duration}s`)
    console.log('')

    process.exit(0)

  } catch (err) {
    console.log('')
    error(`❌ Error al generar tipos: ${err.message}`)
    console.log('')

    // Intentar restaurar desde caché
    warning('Intentando restaurar desde caché...')
    if (restoreFromCache()) {
      console.log('')
      warning('⚠️  Usando tipos desde caché (pueden estar desactualizados)')
      warning('   Revisa tu conexión a internet y vuelve a intentar')
      console.log('')
      process.exit(0)
    } else {
      console.log('')
      error('❌ No hay caché disponible')
      error('   Soluciones:')
      error('   1. Verifica tu conexión a internet')
      error('   2. Verifica que Supabase CLI esté instalado: npm install')
      error('   3. Intenta con el comando directo: npm run types:generate:direct')
      console.log('')
      process.exit(1)
    }
  }
}

// Ejecutar
main()

#!/usr/bin/env node
/**
 * Limpieza total de datos transaccionales.
 * Mantiene: usuarios, permisos_rol, tipos_fuentes_pago, entidades_financieras,
 *           fuentes_entidades, categorias_documento
 * Elimina: TODO lo demás (proyectos, manzanas, viviendas, clientes, negociaciones, etc.)
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset)
}

// Tablas a limpiar EN ORDEN (hijos antes que padres)
const TABLAS_LIMPIAR = [
  'cuotas_credito',
  'abonos_historial',
  'pasos_fuente_pago',
  'documentos_pendientes',
  'fuentes_pago',
  'negociaciones_historial',
  'documentos_cliente',
  'documentos_vivienda',
  'documentos_proyecto',
  'negociaciones',
  'intereses',
  'clientes',
  'viviendas',
  'manzanas',
  'proyectos',
  'audit_log',
]

async function loadEnv() {
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

function parseConnectionString(cs) {
  const m = cs.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (!m) throw new Error('DATABASE_URL inválido')
  return { user: m[1], password: m[2], host: m[3], port: +m[4], database: m[5], ssl: { rejectUnauthorized: false } }
}

async function main() {
  console.log('')
  log('=======================================================', 'cyan')
  log('   🧹 LIMPIEZA TOTAL DE DATOS TRANSACCIONALES', 'cyan')
  log('=======================================================', 'cyan')
  console.log('')

  const env = await loadEnv()
  const dbUrl = process.env.DATABASE_URL || env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL no encontrado')

  const client = new Client(parseConnectionString(dbUrl))
  await client.connect()
  log('✓ Conectado a la base de datos', 'green')
  console.log('')

  // Conteo ANTES
  log('📊 ESTADO ANTES DE LIMPIEZA:', 'yellow')
  for (const tabla of TABLAS_LIMPIAR) {
    try {
      const r = await client.query(`SELECT count(*) as total FROM ${tabla}`)
      const count = r.rows[0].total
      if (count > 0) {
        log(`   ${tabla}: ${count} registros`, 'yellow')
      } else {
        log(`   ${tabla}: 0`, 'gray')
      }
    } catch {
      log(`   ${tabla}: (no existe)`, 'gray')
    }
  }

  console.log('')
  log('🗑️  EJECUTANDO LIMPIEZA...', 'cyan')
  console.log('')

  let errores = 0
  for (const tabla of TABLAS_LIMPIAR) {
    try {
      await client.query(`TRUNCATE TABLE ${tabla} CASCADE`)
      log(`   ✅ ${tabla} — limpio`, 'green')
    } catch (err) {
      if (err.message.includes('does not exist')) {
        log(`   ⏭️  ${tabla} — no existe, omitida`, 'gray')
      } else {
        log(`   ❌ ${tabla} — ERROR: ${err.message}`, 'red')
        errores++
      }
    }
  }

  console.log('')

  // Conteo DESPUÉS
  log('📊 ESTADO DESPUÉS DE LIMPIEZA:', 'yellow')
  for (const tabla of TABLAS_LIMPIAR) {
    try {
      const r = await client.query(`SELECT count(*) as total FROM ${tabla}`)
      log(`   ${tabla}: ${r.rows[0].total}`, r.rows[0].total === '0' ? 'green' : 'red')
    } catch {
      // tabla no existe
    }
  }

  // Verificar que las tablas de configuración siguen intactas
  console.log('')
  log('🔒 TABLAS DE CONFIGURACIÓN (intactas):', 'cyan')
  const tablas_config = ['tipos_fuentes_pago', 'entidades_financieras', 'categorias_documento', 'usuarios', 'permisos_rol']
  for (const tabla of tablas_config) {
    try {
      const r = await client.query(`SELECT count(*) as total FROM ${tabla}`)
      log(`   ${tabla}: ${r.rows[0].total} registros`, 'green')
    } catch {
      log(`   ${tabla}: (no existe)`, 'gray')
    }
  }

  await client.end()

  console.log('')
  if (errores === 0) {
    log('=======================================================', 'green')
    log('   ✅ LIMPIEZA COMPLETADA SIN ERRORES', 'green')
    log('=======================================================', 'green')
  } else {
    log('=======================================================', 'red')
    log(`   ⚠️  LIMPIEZA COMPLETADA CON ${errores} ERROR(ES)`, 'red')
    log('=======================================================', 'red')
  }
}

main().catch(err => {
  log(`💥 Error fatal: ${err.message}`, 'red')
  process.exit(1)
})

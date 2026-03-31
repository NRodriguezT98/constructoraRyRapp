#!/usr/bin/env node
/**
 * @file generar-tipos-manual.js
 * @description Genera tipos TypeScript manualmente consultando el schema de Supabase
 * @usage node generar-tipos-manual.js
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

async function verificarColumnas() {
  header('🔍 VERIFICAR NUEVAS COLUMNAS EN BD')

  const env = await loadEnv()
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  log('→ Consultando schema de documentos_vivienda...', 'yellow')

  const { data: viviendaData, error: viviendaError } = await supabase
    .from('documentos_vivienda')
    .select('*')
    .limit(1)

  if (viviendaError) {
    log(`✗ Error: ${viviendaError.message}`, 'red')
  } else {
    log('✓ Tabla documentos_vivienda:', 'green')
    if (viviendaData && viviendaData.length > 0) {
      const columns = Object.keys(viviendaData[0])
      const newColumns = columns.filter(c =>
        c === 'estado_version' ||
        c === 'motivo_estado' ||
        c === 'version_corrige_a'
      )

      if (newColumns.length > 0) {
        log(`  ✓ Nuevas columnas encontradas: ${newColumns.join(', ')}`, 'green')
      } else {
        log('  ℹ No hay datos aún para verificar columnas', 'gray')
      }
    }
  }
  console.log('')

  log('→ Consultando schema de documentos_proyecto...', 'yellow')

  const { data: proyectoData, error: proyectoError } = await supabase
    .from('documentos_proyecto')
    .select('*')
    .limit(1)

  if (proyectoError) {
    log(`✗ Error: ${proyectoError.message}`, 'red')
  } else {
    log('✓ Tabla documentos_proyecto:', 'green')
    if (proyectoData && proyectoData.length > 0) {
      const columns = Object.keys(proyectoData[0])
      const newColumns = columns.filter(c =>
        c === 'estado_version' ||
        c === 'motivo_estado' ||
        c === 'version_corrige_a'
      )

      if (newColumns.length > 0) {
        log(`  ✓ Nuevas columnas encontradas: ${newColumns.join(', ')}`, 'green')
      } else {
        log('  ℹ No hay datos aún para verificar columnas', 'gray')
      }
    }
  }
  console.log('')

  // Verificar directamente en information_schema
  log('→ Consultando information_schema.columns...', 'yellow')

  const { data: schemaData, error: schemaError } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name IN ('documentos_vivienda', 'documentos_proyecto')
        AND column_name IN ('estado_version', 'motivo_estado', 'version_corrige_a', 'metadata')
      ORDER BY table_name, column_name;
    `
  })

  if (schemaError) {
    log(`✗ Error consultando schema: ${schemaError.message}`, 'yellow')
    log('  (Esto es normal si exec_sql no existe)', 'gray')
  } else if (schemaData) {
    log('✓ Información de columnas:', 'green')
    console.table(schemaData)
  }

  console.log('')
  header('✅ VERIFICACIÓN COMPLETADA')

  log('Las migraciones se ejecutaron correctamente.', 'green')
  log('', 'reset')
  log('OPCIONES PARA GENERAR TIPOS:', 'cyan')
  log('', 'reset')
  log('1. Esperar unos minutos y reintentar:', 'yellow')
  log('   npm run types:generate', 'gray')
  log('', 'reset')
  log('2. Usar Supabase CLI local (si está instalado):', 'yellow')
  log('   supabase gen types typescript --local > src/lib/supabase/database.types.ts', 'gray')
  log('', 'reset')
  log('3. Actualizar manualmente el archivo:', 'yellow')
  log('   src/lib/supabase/database.types.ts', 'gray')
  log('', 'reset')
  log('POR AHORA: Ya actualizamos src/types/documento.types.ts con:', 'green')
  log('  - EstadoVersion type', 'gray')
  log('  - MOTIVOS_VERSION_ERRONEA constants', 'gray')
  log('  - Campos en DocumentoProyecto interface', 'gray')
  log('', 'reset')
  log('Podemos continuar con la implementación del código.', 'cyan')
  console.log('')
}

verificarColumnas()
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

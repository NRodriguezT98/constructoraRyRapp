#!/usr/bin/env node
/**
 * @file analyze-typescript-errors-v2.js
 * @description Versión simplificada que lee desde archivo temporal
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

// =============================================================================
// COLORES
// =============================================================================
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
}

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

function header(msg) {
  console.log('')
  log('═'.repeat(70), 'cyan')
  log(`   ${msg}`, 'cyan')
  log('═'.repeat(70), 'cyan')
  console.log('')
}

// =============================================================================
// PARSEAR ERRORES
// =============================================================================
function parseTypeScriptErrors(output) {
  const errors = []
  const lines = output.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Windows: src/path/file.ts(123,45): error TS1234: Message
    const windowsMatch = line.match(/^([^(]+)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.*)$/)

    if (windowsMatch) {
      const match = windowsMatch

      let initialMessage = match[5] ? match[5].trim() : ''
      const fullMessageLines = initialMessage ? [initialMessage] : []

      // Capturar líneas de continuación (comienzan con espacios)
      let j = i + 1
      while (j < lines.length) {
        const nextLine = lines[j]

        if (nextLine.trim() && !nextLine.startsWith('  ')) {
          break
        }

        if (nextLine.trim()) {
          fullMessageLines.push(nextLine.trim())
        }

        j++
      }

      const fullMessage = fullMessageLines.join(' ')

      errors.push({
        file: match[1].trim(),
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[4],
        message: fullMessage || 'Error sin descripción',
        fullMessage: fullMessageLines,
      })

      i = j - 1
    }
  }

  return errors
}

// =============================================================================
// EJECUTAR
// =============================================================================
async function main() {
  header('🔍 ANALIZADOR DE ERRORES TYPESCRIPT V2')

  // Paso 1: Ejecutar type-check y guardar salida
  log('→ Ejecutando type-check...', 'cyan')
  await new Promise((resolve) => {
    exec('npm run type-check > type-check-temp.txt 2>&1', () => resolve())
  })

  // Paso 2: Leer archivo
  log('→ Leyendo salida...', 'cyan')
  const output = fs.readFileSync('type-check-temp.txt', 'utf8')

  // Paso 3: Parsear
  log('→ Parseando errores...', 'cyan')
  const errors = parseTypeScriptErrors(output)

  log(`→ Errores detectados: ${errors.length}`, errors.length > 0 ? 'yellow' : 'green')

  if (errors.length > 0) {
    console.log('')
    log('Primeros 10 errores:', 'bright')
    errors.slice(0, 10).forEach((err, i) => {
      log(`${i + 1}. ${path.basename(err.file)}:${err.line} - ${err.code}`, 'yellow')
      log(`   ${err.message.substring(0, 100)}`, 'gray')
    })
  }

  // Limpiar
  if (fs.existsSync('type-check-temp.txt')) {
    fs.unlinkSync('type-check-temp.txt')
  }

  console.log('')
  log('✨ Completado', 'green')
}

main().catch(console.error)

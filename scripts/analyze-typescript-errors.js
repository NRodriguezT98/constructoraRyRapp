#!/usr/bin/env node
/**
 * @file analyze-typescript-errors.js
 * @description Analiza errores de TypeScript y genera reporte organizado
 *
 * CARACTERÍSTICAS:
 * - Agrupa errores por tipo y archivo
 * - Identifica errores críticos vs warnings
 * - Genera estadísticas y prioridades
 * - Exporta reporte en JSON/Markdown
 *
 * USAGE:
 *   npm run errors:analyze
 *   node scripts/analyze-typescript-errors.js
 *   node scripts/analyze-typescript-errors.js --fix-auto (intenta fixes automáticos)
 */

const { spawn, exec } = require('child_process')
const fs = require('fs')
const path = require('path') // =============================================================================
// CONFIGURACIÓN
// =============================================================================
const CONFIG = {
  OUTPUT_DIR: path.join(process.cwd(), '.reports'),
  IGNORE_PATTERNS: [
    /\.OLD\./, // Archivos .OLD
    /\.ejemplo\./, // Archivos de ejemplo
    /\.test\./, // Archivos de test
    /node_modules/, // node_modules
  ],
  CRITICAL_ERRORS: [
    'TS2304', // Cannot find name
    'TS2305', // Module has no exported member
    'TS2307', // Cannot find module
    'TS2339', // Property does not exist
  ],
}

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
// EJECUTAR TYPE-CHECK Y CAPTURAR ERRORES
// =============================================================================
async function runTypeCheck() {
  // WORKAROUND para Windows PowerShell + Node.js child_process issue
  // El problema: npx tsc cuando se ejecuta desde Node.js no retorna su output
  // Solución: Usuario debe generar el archivo manualmente primero

  const outputFile = path.join(process.cwd(), 'type-check-output-raw.txt')

  // Verificar si existe el archivo pre-generado
  if (fs.existsSync(outputFile)) {
    const stats = fs.statSync(outputFile)
    const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60

    // Si el archivo tiene menos de 5 minutos, usarlo
    if (ageMinutes < 5) {
      // IMPORTANTE: PowerShell guarda archivos en UTF-16LE por defecto con BOM
      // Leer como buffer y convertir correctamente
      const buffer = fs.readFileSync(outputFile)
      let output = buffer.toString('utf16le')

      // Limpiar BOM si existe
      output = output.replace(/^\uFEFF/, '')

      if (output.length > 100) {
        log(
          `✓ Usando archivo: type-check-output-raw.txt (${Math.round(ageMinutes)}m antiguo)`,
          'green'
        )
        return output
      }
    }
  }

  // Si no existe o es muy viejo, mostrar instrucciones
  console.log('')
  log('═'.repeat(70), 'yellow')
  log('   ⚠️  ARCHIVO DE ERRORES NO ENCONTRADO O DESACTUALIZADO', 'yellow')
  log('═'.repeat(70), 'yellow')
  console.log('')
  log(
    'Debido a limitaciones de Windows PowerShell con Node.js child_process,',
    'yellow'
  )
  log('necesitas generar el archivo de errores manualmente.', 'yellow')
  console.log('')
  log('Ejecuta este comando en la terminal:', 'cyan')
  console.log('')
  log('  npm run type-check > type-check-output-raw.txt 2>&1', 'bright')
  console.log('')
  log('Luego vuelve a ejecutar:', 'cyan')
  console.log('')
  log('  npm run errors:analyze', 'bright')
  console.log('')
  log('═'.repeat(70), 'yellow')
  console.log('')

  process.exit(1)
}

// =============================================================================
// PARSEAR ERRORES DE TYPESCRIPT
// =============================================================================
function parseTypeScriptErrors(output) {
  const errors = []
  // Split por line breaks Windows (\r\n) o Unix (\n)
  const lines = output.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detectar línea de error con múltiples formatos:
    // Windows PowerShell: src/path/file.ts(123,45): error TS1234: Message (resto en una línea)
    // Linux/Mac: src/path/file.ts:123:45 - error TS1234: Message
    const windowsMatch = line.match(
      /^([^(]+)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.*)$/
    )
    const linuxMatch = line.match(
      /^(.+?):(\d+):(\d+)\s*-\s*error\s+(TS\d+):\s*(.+)$/
    )

    if (windowsMatch || linuxMatch) {
      const match = windowsMatch || linuxMatch

      // Capturar el mensaje inicial (puede ser toda la línea)
      let initialMessage = match[5] ? match[5].trim() : ''
      const fullMessageLines = initialMessage ? [initialMessage] : []

      // Capturar líneas siguientes que son continuación (comienzan con espacios)
      let j = i + 1
      while (j < lines.length) {
        const nextLine = lines[j]

        // Si la línea siguiente no comienza con espacios, es un nuevo error
        if (
          nextLine.trim() &&
          !nextLine.startsWith('  ') &&
          !nextLine.startsWith('\t')
        ) {
          break
        }

        // Si está vacía o comienza con espacios, es continuación
        if (nextLine.trim()) {
          fullMessageLines.push(nextLine.trim())
        }

        j++
      }

      // Combinar todas las líneas del mensaje
      const fullMessage = fullMessageLines.join(' ')

      errors.push({
        file: match[1].trim(),
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[4],
        message: fullMessage || 'Error sin descripción',
        fullMessage: fullMessageLines,
      })

      // Saltar las líneas que ya procesamos
      i = j - 1
    }
  }

  // Si no se encontraron errores con los patterns anteriores, intentar extraer del resumen final
  if (errors.length === 0) {
    const summaryMatch = output.match(/Found (\d+) errors? in (\d+) files?/)
    if (summaryMatch) {
      console.log('')
      log(
        `⚠️  Detectados ${summaryMatch[1]} errores en ${summaryMatch[2]} archivos`,
        'yellow'
      )
      log('   Pero no se pudo parsear el formato. Posibles causas:', 'yellow')
      log('   - Formato de salida de TypeScript no reconocido', 'gray')
      log('   - Codificación de caracteres especiales', 'gray')
      log('', 'reset')
      log('   Revisa manualmente: npm run type-check', 'cyan')
      console.log('')
    }
  }

  return errors
} // =============================================================================
// FILTRAR ERRORES
// =============================================================================
function filterErrors(errors) {
  return errors.filter(error => {
    // Ignorar patrones configurados
    return !CONFIG.IGNORE_PATTERNS.some(pattern => pattern.test(error.file))
  })
}

// =============================================================================
// AGRUPAR ERRORES
// =============================================================================
function groupErrors(errors) {
  const byFile = {}
  const byCode = {}
  const byModule = {}

  errors.forEach(error => {
    // Por archivo
    if (!byFile[error.file]) {
      byFile[error.file] = []
    }
    byFile[error.file].push(error)

    // Por código de error
    if (!byCode[error.code]) {
      byCode[error.code] = []
    }
    byCode[error.code].push(error)

    // Por módulo
    const moduleMatch = error.file.match(/src[\/\\]modules[\/\\]([^\/\\]+)/)
    const moduleName = moduleMatch ? moduleMatch[1] : 'otros'
    if (!byModule[moduleName]) {
      byModule[moduleName] = []
    }
    byModule[moduleName].push(error)
  })

  return { byFile, byCode, byModule }
}

// =============================================================================
// GENERAR ESTADÍSTICAS
// =============================================================================
function generateStats(errors, grouped) {
  const totalErrors = errors.length
  const criticalErrors = errors.filter(e =>
    CONFIG.CRITICAL_ERRORS.includes(e.code)
  ).length

  const topFiles = Object.entries(grouped.byFile)
    .map(([file, errs]) => ({ file, count: errs.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topCodes = Object.entries(grouped.byCode)
    .map(([code, errs]) => ({
      code,
      count: errs.length,
      critical: CONFIG.CRITICAL_ERRORS.includes(code),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topModules = Object.entries(grouped.byModule)
    .map(([module, errs]) => ({ module, count: errs.length }))
    .sort((a, b) => b.count - a.count)

  return {
    totalErrors,
    criticalErrors,
    warningErrors: totalErrors - criticalErrors,
    topFiles,
    topCodes,
    topModules,
    filesAffected: Object.keys(grouped.byFile).length,
  }
}

// =============================================================================
// MOSTRAR REPORTE EN CONSOLA
// =============================================================================
function displayReport(stats, grouped) {
  header('📊 ANÁLISIS DE ERRORES TYPESCRIPT')

  // Resumen general
  log('RESUMEN GENERAL:', 'bright')
  log(
    `  Total de errores: ${stats.totalErrors}`,
    stats.totalErrors > 100 ? 'red' : 'yellow'
  )
  log(
    `  Errores críticos: ${stats.criticalErrors}`,
    stats.criticalErrors > 0 ? 'red' : 'green'
  )
  log(`  Archivos afectados: ${stats.filesAffected}`, 'cyan')
  console.log('')

  // Top 10 archivos con más errores
  log('TOP 10 ARCHIVOS CON MÁS ERRORES:', 'bright')
  stats.topFiles.forEach((item, i) => {
    const fileName = path.basename(item.file)
    const relativePath = path.relative(process.cwd(), item.file)
    log(
      `  ${i + 1}. ${fileName} (${item.count} errores)`,
      item.count > 10 ? 'red' : 'yellow'
    )
    log(`     ${relativePath}`, 'gray')
  })
  console.log('')

  // Top errores por código
  log('TOP ERRORES POR CÓDIGO:', 'bright')
  stats.topCodes.forEach((item, i) => {
    const color = item.critical ? 'red' : 'yellow'
    const badge = item.critical ? '🔴 CRÍTICO' : '⚠️'
    log(`  ${i + 1}. ${item.code}: ${item.count} ocurrencias ${badge}`, color)
  })
  console.log('')

  // Errores por módulo
  log('ERRORES POR MÓDULO:', 'bright')
  stats.topModules.forEach(item => {
    log(
      `  ${item.module}: ${item.count} errores`,
      item.count > 20 ? 'red' : 'yellow'
    )
  })
  console.log('')
}

// =============================================================================
// GENERAR REPORTE MARKDOWN
// =============================================================================
function generateMarkdownReport(stats, grouped, errors) {
  let md = `# 📊 Reporte de Errores TypeScript

**Fecha:** ${new Date().toLocaleString('es-CO')}
**Total de errores:** ${stats.totalErrors}
**Errores críticos:** ${stats.criticalErrors}
**Archivos afectados:** ${stats.filesAffected}

---

## 🔴 Errores Críticos (${stats.criticalErrors})

Los siguientes tipos de errores son críticos y deben corregirse con prioridad:

${stats.topCodes
  .filter(c => c.critical)
  .map(c => `- **${c.code}**: ${c.count} ocurrencias`)
  .join('\n')}

---

## 📁 Top 10 Archivos con Más Errores

| # | Archivo | Errores |
|---|---------|---------|
${stats.topFiles
  .map(
    (item, i) =>
      `| ${i + 1} | \`${path.basename(item.file)}\` | ${item.count} |`
  )
  .join('\n')}

---

## 🏗️ Errores por Módulo

| Módulo | Cantidad |
|--------|----------|
${stats.topModules.map(item => `| ${item.module} | ${item.count} |`).join('\n')}

---

## 📋 Detalles por Archivo

${Object.entries(grouped.byFile)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20)
  .map(([file, errs]) => {
    const fileName = path.basename(file)
    const relativePath = path.relative(process.cwd(), file)
    return `### \`${fileName}\` (${errs.length} errores)

**Ruta:** \`${relativePath}\`

${errs
  .slice(0, 5)
  .map(err => `- **Línea ${err.line}:** ${err.code} - ${err.message}`)
  .join('\n')}

${errs.length > 5 ? `... y ${errs.length - 5} más\n` : ''}`
  })
  .join('\n\n')}

---

## 🎯 Recomendaciones

### Prioridad ALTA (Críticos)
- Resolver errores **TS2304** (Cannot find name): ${grouped.byCode['TS2304']?.length || 0}
- Resolver errores **TS2305** (Module no exporta): ${grouped.byCode['TS2305']?.length || 0}
- Resolver errores **TS2307** (Cannot find module): ${grouped.byCode['TS2307']?.length || 0}

### Prioridad MEDIA
- Revisar archivos con más de 10 errores
- Actualizar imports desactualizados

### Prioridad BAJA
- Archivos .OLD (${errors.filter(e => /\.OLD\./.test(e.file)).length} errores) - Considerar eliminar
- Archivos de ejemplo (${errors.filter(e => /\.ejemplo\./.test(e.file)).length} errores)

---

**Generado automáticamente por:** \`scripts/analyze-typescript-errors.js\`
`

  return md
}

// =============================================================================
// EXPORTAR REPORTES
// =============================================================================
function exportReports(stats, grouped, errors) {
  // Crear directorio de reportes
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]

  // Exportar JSON
  const jsonPath = path.join(
    CONFIG.OUTPUT_DIR,
    `typescript-errors-${timestamp}.json`
  )
  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ stats, grouped, errors }, null, 2)
  )
  log(
    `✓ Reporte JSON guardado: ${path.relative(process.cwd(), jsonPath)}`,
    'green'
  )

  // Exportar Markdown
  const mdPath = path.join(
    CONFIG.OUTPUT_DIR,
    `typescript-errors-${timestamp}.md`
  )
  const markdown = generateMarkdownReport(stats, grouped, errors)
  fs.writeFileSync(mdPath, markdown)
  log(
    `✓ Reporte Markdown guardado: ${path.relative(process.cwd(), mdPath)}`,
    'green'
  )

  // Exportar resumen simple
  const summaryPath = path.join(
    CONFIG.OUTPUT_DIR,
    'typescript-errors-summary.txt'
  )
  const summary = `RESUMEN - ${new Date().toLocaleString('es-CO')}
Total: ${stats.totalErrors} errores
Críticos: ${stats.criticalErrors}
Archivos: ${stats.filesAffected}

Top 5 archivos:
${stats.topFiles
  .slice(0, 5)
  .map((f, i) => `${i + 1}. ${path.basename(f.file)}: ${f.count}`)
  .join('\n')}
`
  fs.writeFileSync(summaryPath, summary)
  log(
    `✓ Resumen guardado: ${path.relative(process.cwd(), summaryPath)}`,
    'green'
  )
}

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  const startTime = Date.now()

  header('🔍 ANALIZADOR DE ERRORES TYPESCRIPT')

  try {
    // 1. Ejecutar type-check
    log('→ Ejecutando type-check...', 'cyan')
    const output = await runTypeCheck()

    // 2. Parsear errores
    log('→ Parseando errores...', 'cyan')
    const allErrors = parseTypeScriptErrors(output)

    // 3. Filtrar errores
    log('→ Filtrando errores...', 'cyan')
    const errors = filterErrors(allErrors)

    // 4. Agrupar errores
    log('→ Agrupando errores...', 'cyan')
    const grouped = groupErrors(errors)

    // 5. Generar estadísticas
    log('→ Generando estadísticas...', 'cyan')
    const stats = generateStats(errors, grouped)

    // 6. Mostrar reporte
    displayReport(stats, grouped)

    // 7. Exportar reportes
    log('→ Exportando reportes...', 'cyan')
    exportReports(stats, grouped, errors)

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log('')
    log(`✨ Análisis completado en ${duration}s`, 'green')
    log(
      `📁 Reportes guardados en: ${path.relative(process.cwd(), CONFIG.OUTPUT_DIR)}`,
      'cyan'
    )
    console.log('')
  } catch (err) {
    console.log('')
    log(`❌ Error: ${err.message}`, 'red')
    console.log('')
    process.exit(1)
  }
}

// Ejecutar
main()

#!/usr/bin/env node
/**
 * @file fix-typescript-errors.js
 * @description Intenta correcciones automáticas de errores TypeScript comunes
 *
 * CARACTERÍSTICAS:
 * - Detecta y corrige errores comunes automáticamente
 * - Modo dry-run para preview de cambios
 * - Backup automático antes de modificar archivos
 * - Reporta qué se corrigió y qué requiere intervención manual
 *
 * USAGE:
 *   npm run errors:fix             # Modo dry-run (solo muestra qué haría)
 *   npm run errors:fix --apply     # Aplica las correcciones
 *   node scripts/fix-typescript-errors.js --filter=documentos  # Solo módulo específico
 */

const fs = require('fs')
const path = require('path')

// =============================================================================
// CONFIGURACIÓN
// =============================================================================
const CONFIG = {
  DRY_RUN: !process.argv.includes('--apply'),
  FILTER_MODULE: process.argv.find(arg => arg.startsWith('--filter='))?.split('=')[1],
  BACKUP_DIR: path.join(process.cwd(), '.backups', new Date().toISOString().split('T')[0]),
  FIXES: {
    // Imports faltantes comunes
    MISSING_IMPORTS: {
      'Database': "import type { Database } from '@/lib/supabase/database.types'",
      'Proyecto': "import type { Proyecto } from '@/types'",
      'Vivienda': "import type { Vivienda } from '@/types'",
      'Cliente': "import type { Cliente } from '@/types'",
      'Negociacion': "import type { Negociacion } from '@/types'",
    },

    // Properties faltantes (agregar como opcionales)
    MISSING_PROPERTIES: [
      { prop: 'id', type: 'string' },
      { prop: 'created_at', type: 'string' },
      { prop: 'updated_at', type: 'string' },
    ],
  },
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
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

// =============================================================================
// LEER REPORTES EXISTENTES
// =============================================================================
function loadLatestReport() {
  const reportsDir = path.join(process.cwd(), '.reports')

  if (!fs.existsSync(reportsDir)) {
    throw new Error('No se encontraron reportes. Ejecuta: npm run errors:analyze')
  }

  const files = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith('typescript-errors-') && f.endsWith('.json'))
    .sort()
    .reverse()

  if (files.length === 0) {
    throw new Error('No se encontraron reportes JSON')
  }

  const latestReport = path.join(reportsDir, files[0])
  log(`→ Cargando reporte: ${files[0]}`, 'cyan')

  return JSON.parse(fs.readFileSync(latestReport, 'utf8'))
}

// =============================================================================
// CREAR BACKUP
// =============================================================================
function createBackup(filePath) {
  if (CONFIG.DRY_RUN) return

  if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
    fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true })
  }

  const relativePath = path.relative(process.cwd(), filePath)
  const backupPath = path.join(CONFIG.BACKUP_DIR, relativePath)

  const backupDir = path.dirname(backupPath)
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  fs.copyFileSync(filePath, backupPath)
}

// =============================================================================
// FIX: AGREGAR IMPORTS FALTANTES
// =============================================================================
function fixMissingImports(errors) {
  const fixes = []

  errors.forEach(error => {
    // Detectar: TS2304: Cannot find name 'Database'
    if (error.code === 'TS2304') {
      const match = error.message.match(/Cannot find name '(\w+)'/)
      if (match) {
        const typeName = match[1]
        const importStatement = CONFIG.FIXES.MISSING_IMPORTS[typeName]

        if (importStatement) {
          fixes.push({
            type: 'ADD_IMPORT',
            file: error.file,
            line: error.line,
            import: importStatement,
            typeName,
          })
        }
      }
    }
  })

  return fixes
}

// =============================================================================
// FIX: AGREGAR PROPERTIES FALTANTES
// =============================================================================
function fixMissingProperties(errors) {
  const fixes = []

  errors.forEach(error => {
    // Detectar: TS2339: Property 'id' does not exist on type 'X'
    if (error.code === 'TS2339') {
      const match = error.message.match(/Property '(\w+)' does not exist/)
      if (match) {
        const propName = match[1]
        const knownProp = CONFIG.FIXES.MISSING_PROPERTIES.find(p => p.prop === propName)

        if (knownProp) {
          fixes.push({
            type: 'ADD_PROPERTY',
            file: error.file,
            line: error.line,
            property: propName,
            propertyType: knownProp.type,
          })
        }
      }
    }
  })

  return fixes
}

// =============================================================================
// APLICAR FIX: AGREGAR IMPORT
// =============================================================================
function applyAddImport(fix) {
  const filePath = fix.file
  let content = fs.readFileSync(filePath, 'utf8')

  // Verificar si el import ya existe
  if (content.includes(fix.import)) {
    return false
  }

  // Encontrar la última línea de imports
  const lines = content.split('\n')
  let lastImportIndex = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i
    }
  }

  if (lastImportIndex === -1) {
    // No hay imports, agregar al inicio
    content = fix.import + '\n\n' + content
  } else {
    // Agregar después del último import
    lines.splice(lastImportIndex + 1, 0, fix.import)
    content = lines.join('\n')
  }

  if (!CONFIG.DRY_RUN) {
    createBackup(filePath)
    fs.writeFileSync(filePath, content, 'utf8')
  }

  return true
}

// =============================================================================
// APLICAR TODOS LOS FIXES
// =============================================================================
function applyFixes(fixes) {
  const results = {
    applied: 0,
    skipped: 0,
    failed: 0,
  }

  const groupedByFile = {}
  fixes.forEach(fix => {
    if (!groupedByFile[fix.file]) {
      groupedByFile[fix.file] = []
    }
    groupedByFile[fix.file].push(fix)
  })

  Object.entries(groupedByFile).forEach(([file, fileFixes]) => {
    const fileName = path.basename(file)
    log(`\n  📄 ${fileName}`, 'cyan')

    fileFixes.forEach(fix => {
      try {
        let applied = false

        if (fix.type === 'ADD_IMPORT') {
          applied = applyAddImport(fix)
          if (applied) {
            const action = CONFIG.DRY_RUN ? 'Se agregaría' : 'Agregado'
            log(`     ✓ ${action}: ${fix.import}`, CONFIG.DRY_RUN ? 'yellow' : 'green')
            results.applied++
          } else {
            log(`     - Ya existe: import ${fix.typeName}`, 'gray')
            results.skipped++
          }
        }
      } catch (err) {
        log(`     ✗ Error: ${err.message}`, 'red')
        results.failed++
      }
    })
  })

  return results
}

// =============================================================================
// GENERAR REPORTE DE FIXES
// =============================================================================
function generateFixReport(allFixes, results) {
  const report = `# 🔧 Reporte de Correcciones Automáticas

**Fecha:** ${new Date().toLocaleString('es-CO')}
**Modo:** ${CONFIG.DRY_RUN ? '🔍 DRY-RUN (preview)' : '✅ APLICADO'}

## 📊 Resumen

- **Correcciones aplicadas:** ${results.applied}
- **Omitidas (ya corregidas):** ${results.skipped}
- **Fallidas:** ${results.failed}
- **Total procesadas:** ${allFixes.length}

## 📋 Tipos de Correcciones

### Imports Faltantes (${allFixes.filter(f => f.type === 'ADD_IMPORT').length})

${allFixes.filter(f => f.type === 'ADD_IMPORT')
  .slice(0, 20)
  .map(f => `- \`${path.basename(f.file)}\`: Agregar import de \`${f.typeName}\``)
  .join('\n')}

### Properties Faltantes (${allFixes.filter(f => f.type === 'ADD_PROPERTY').length})

${allFixes.filter(f => f.type === 'ADD_PROPERTY')
  .slice(0, 20)
  .map(f => `- \`${path.basename(f.file)}\`: Agregar property \`${f.property}\``)
  .join('\n')}

---

${CONFIG.DRY_RUN ? `
## ⚠️ PRÓXIMOS PASOS

Este fue un **preview**. Para aplicar las correcciones:

\`\`\`bash
npm run errors:fix --apply
\`\`\`
` : `
## ✅ APLICADO

Las correcciones se aplicaron exitosamente.
**Backups guardados en:** \`.backups/${path.basename(CONFIG.BACKUP_DIR)}\`

**Verifica los cambios:**
\`\`\`bash
npm run type-check
\`\`\`
`}

**Generado por:** \`scripts/fix-typescript-errors.js\`
`

  return report
}

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  log('\n═══════════════════════════════════════════════════════════════════', 'cyan')
  log('   🔧 CORRECTOR AUTOMÁTICO DE ERRORES TYPESCRIPT', 'cyan')
  log('═══════════════════════════════════════════════════════════════════\n', 'cyan')

  if (CONFIG.DRY_RUN) {
    log('ℹ️  Modo DRY-RUN: Solo se mostrarán los cambios (no se aplicarán)', 'yellow')
    log('   Para aplicar: npm run errors:fix --apply\n', 'yellow')
  }

  try {
    // 1. Cargar reporte
    const report = loadLatestReport()
    let errors = report.errors

    // 2. Filtrar por módulo si se especificó
    if (CONFIG.FILTER_MODULE) {
      log(`→ Filtrando errores del módulo: ${CONFIG.FILTER_MODULE}`, 'cyan')
      errors = errors.filter(e => e.file.includes(`/modules/${CONFIG.FILTER_MODULE}/`))
    }

    log(`→ Errores a procesar: ${errors.length}\n`, 'cyan')

    // 3. Detectar posibles fixes
    log('→ Detectando correcciones automáticas...', 'cyan')
    const importFixes = fixMissingImports(errors)
    const propertyFixes = fixMissingProperties(errors)

    const allFixes = [...importFixes, ...propertyFixes]

    log(`   - Imports faltantes: ${importFixes.length}`, 'yellow')
    log(`   - Properties faltantes: ${propertyFixes.length}`, 'yellow')
    log(`   - Total correcciones detectadas: ${allFixes.length}\n`, 'bright')

    if (allFixes.length === 0) {
      log('ℹ️  No se detectaron correcciones automáticas disponibles', 'yellow')
      log('   Los errores restantes requieren corrección manual.\n', 'yellow')
      return
    }

    // 4. Aplicar fixes
    log('→ Aplicando correcciones...', 'cyan')
    const results = applyFixes(allFixes)

    // 5. Mostrar resumen
    log('\n═══════════════════════════════════════════════════════════════════', 'cyan')
    log(`   📊 RESUMEN`, 'bright')
    log('═══════════════════════════════════════════════════════════════════\n', 'cyan')
    log(`   Aplicadas:  ${results.applied}`, results.applied > 0 ? 'green' : 'gray')
    log(`   Omitidas:   ${results.skipped}`, 'gray')
    log(`   Fallidas:   ${results.failed}`, results.failed > 0 ? 'red' : 'gray')
    log(`   Total:      ${allFixes.length}\n`, 'bright')

    // 6. Guardar reporte
    const reportsDir = path.join(process.cwd(), '.reports')
    const reportPath = path.join(reportsDir, `fix-report-${new Date().toISOString().split('T')[0]}.md`)
    const markdownReport = generateFixReport(allFixes, results)
    fs.writeFileSync(reportPath, markdownReport)
    log(`✓ Reporte guardado: ${path.relative(process.cwd(), reportPath)}`, 'green')

    if (!CONFIG.DRY_RUN && results.applied > 0) {
      log(`✓ Backups guardados en: ${path.relative(process.cwd(), CONFIG.BACKUP_DIR)}`, 'green')
    }

    log('\n✨ Proceso completado\n', 'green')

  } catch (err) {
    log(`\n❌ Error: ${err.message}\n`, 'red')
    if (err.stack) {
      log(err.stack, 'gray')
    }
    process.exit(1)
  }
}

// Ejecutar
main()
